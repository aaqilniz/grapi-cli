import fs from 'fs';
import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { Project, SyntaxKind } from 'ts-morph';
import { execute, processOptions, toPascalCase } from '../../utils/index.js';

export default class AuthorizationPolicy extends Command {
  static override description = 'add authorization policies';

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    policies: Flags.string({ char: 'i', description: 'users list.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(AuthorizationPolicy);
    const possibleActions = [
      'view-all',
      'view-single',
      'view-count',
      'create',
      'update-all',
      'update-single',
      'replace-single',
      'delete-single',
    ];
    let options = processOptions(parsed.flags);
    const { policies } = options;
    if (!policies || !policies.length) {
      console.log(chalk.bold(chalk.red('No policies provided.')));
      process.exit();
    }
    let invalidAction = { exits: false, action: '' };
    for (let i = 0; i < policies.length; i++) {
      const { actions } = policies[i];
      for (let j = 0; j < actions.length; j++) {
        const action = actions[j];
        if (!possibleActions.includes(action)) {
          invalidAction.exits = true;
          invalidAction.action = action;
        }
      }
    }
    if (invalidAction.exits) {
      throw Error(`Invalid action ${invalidAction.action}. Action must be one of: ${possibleActions.toString()}`);
    }
    const project = new Project({});
    const invokedFrom = process.cwd();

    project.addSourceFilesAtPaths(`${invokedFrom}/src/**/*.ts`);

    const applicationPath = `${invokedFrom}/src/application.ts`;
    const applicationFile = project.getSourceFile(applicationPath);
    const appClass = applicationFile?.getClasses()[0];
    const applicationName = appClass!.getName()!;

    const sourceFile = project.getSourceFileOrThrow('./src/repositories/casbin-policy.repository.ts');

    const constructorDecorators = sourceFile
      .getDescendantsOfKind(SyntaxKind.Decorator)
      .filter(decorator => {
        const callExpression = decorator.getCallExpression();
        if (!callExpression) return false;

        const identifier = callExpression.getExpression();
        return identifier.getText() === 'inject';
      });

    // Extract the datasource string from the first matching decorator
    const fullDatasourceName = constructorDecorators[0]
      ?.getCallExpression()
      ?.getArguments()[0]
      ?.getText()
      ?.replace(/['"]/g, '');
    const dsName = fullDatasourceName?.split('.')[1];

    if (!dsName) {
      console.log(chalk.bold(chalk.red('No auth datasource bound.')));
      process.exit();
    }
    const datasourceClassName = `${toPascalCase(dsName)}DataSource`;

    if (!fs.existsSync('./src/seed-policies.ts')) {
      await this.createPolicySeedScript(project, applicationName, datasourceClassName, policies);
    }

    const packageJsonPath = './package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.scripts['create:policies'] = 'node ./dist/seed-policies.js';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    await execute('npm run build && npm run create:policies', 'creating policies.')
    //remove seed file
    if (fs.existsSync('./dist/seed-policies.js')) {
      fs.unlinkSync('./dist/seed-policies.js');
    }
    if (fs.existsSync('./src/seed-policies.ts')) {
      fs.unlinkSync('./src/seed-policies.ts');
    }
    console.log('successfully added policies');
    process.exit(0);
  }

  private async createPolicySeedScript(
    project: Project,
    appName: string,
    datasourceName: string,
    policies: any[]
  ): Promise<void> {
    // Create a new seed file
    const seedFile = project.createSourceFile('src/seed-policies.ts', '', {
      overwrite: true,
    });
    const dsBinding = datasourceName.split('DataSource')[0].toLocaleLowerCase();

    // Import statements
    seedFile.addImportDeclarations([
      {
        namedImports: [appName],
        moduleSpecifier: './application',
      },
      {
        namedImports: [datasourceName],
        moduleSpecifier: './datasources',
      },
      {
        namedImports: ['CasbinPolicyRepository'],
        moduleSpecifier: './repositories',
      },
    ]);

    // Seed function
    seedFile.addFunction({
      name: 'seedData',
      isAsync: true,
      statements: `
        const app = new ${appName}();
        await app.boot();
        await app.start();

        const ds = await app.get<${datasourceName}>('datasources.${dsBinding}');
        const casbinPolicyRepository = new CasbinPolicyRepository(ds);
        const policies: any[] = ${JSON.stringify(policies)};
        const policiesToCreate: any[] = [];
        const existingPolicies = await casbinPolicyRepository.find({ where: { policyType: 'p' } });
        const isPolicyDuplicate = (newPolicy: any, existingPolicies: any[]) => {
          return existingPolicies.some(existing =>
            existing.policyType === newPolicy.policyType &&
            existing.role === newPolicy.role &&
            existing.object === newPolicy.object &&
            existing.action === newPolicy.action
          );
        };
        for (let policyIndex = 0; policyIndex < policies.length; policyIndex++) {
          const { actions, object, restrictedFields, role } = policies[policyIndex];
          for (let actionIndex = 0; actionIndex < actions.length; actionIndex++) {
            const policy: any = {
              policyType: 'p',
              role,
              object,
              action: actions[actionIndex],
              restrictedFields: restrictedFields || '',
            };
            if (!isPolicyDuplicate(policy, existingPolicies)) {
              policiesToCreate.push(policy);
            }
          }
        }
        if (policiesToCreate.length > 0) {
          await casbinPolicyRepository.createAll(policiesToCreate);
          console.log(\`Created \${policiesToCreate.length} new policies\`);
        } else {
          console.log('No new policies to create');
        }
        await app.stop();
        process.exit(0);
      `,
    });

    // Execute condition
    seedFile.addStatements(`
      if (require.main === module) {
        seedData().catch(err => {
          console.error('Error seeding policies data:', err);
          process.exit(1);
        });
      }
    `);

    seedFile.formatText();
    // Save the generated file
    project.saveSync();
  }
}
