import fs from 'fs';
import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { processOptions } from '../../utils/parseOptions.js';
import { execute, toPascalCase } from '../../utils/index.js';
import { Project, SyntaxKind } from 'ts-morph';

export default class AuthorizationAssignRole extends Command {
  static override description = 'add authorization roles';

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    roles: Flags.string({ char: 'i', description: 'users list.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(AuthorizationAssignRole);
    let options = processOptions(parsed.flags);

    const { roles } = options;

    if (!roles || !roles.length) {
      console.log(chalk.bold(chalk.red('No roles provided.')));
      process.exit();
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
    if (!fs.existsSync('./src/seed-roles.ts')) {
      await this.createPolicySeedScript(project, applicationName, datasourceClassName, roles);
    }

    const packageJsonPath = './package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.scripts['create:roles'] = 'node ./dist/seed-roles.js';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    await execute('npm run build && npm run create:roles', 'creating roles.');
    // remove seed file
    fs.unlinkSync('./dist/seed-roles.js');
    fs.unlinkSync('./src/seed-roles.ts');
    console.log('successfully added roles');
    process.exit(0);
  }

  private async createPolicySeedScript(
    project: Project,
    appName: string,
    datasourceName: string,
    roles: any[]
  ): Promise<void> {
    // Create a new seed file
    const seedFile = project.createSourceFile('src/seed-roles.ts', '', {
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
        namedImports: ['CasbinPolicyRepository', 'UserRepository', 'UserCredentialsRepository'],
        moduleSpecifier: './repositories',
      },
      {
        namedImports: ['User'],
        moduleSpecifier: './models',
      },
      {
        namedImports: ['Getter'],
        moduleSpecifier: '@loopback/core',
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
        const userCredentialsRepositoryGetter = app.getSync<Getter<UserCredentialsRepository>>('repositories.UserCredentialsRepository');
        const userRepository = new UserRepository(ds, userCredentialsRepositoryGetter);
        const roles: any[] = ${JSON.stringify(roles)};
        const rolesToCreate: any[] = [];
        const existingRoles = await casbinPolicyRepository.find({ where: { policyType: 'g' } });
        const isPolicyDuplicate = (newPolicy: any, existingRoles: any[]) => {
            // if a user already exists with the role
            return existingRoles.some(existing => {
                return (existing.policyType === newPolicy.policyType && existing.role === newPolicy.role)
            }
            );
        };
        for (let policyIndex = 0; policyIndex < roles.length; policyIndex++) {
            const { username, email, role } = roles[policyIndex];
            const filter: { username?: string, email?: string } = {};
            if (username) filter.username = username;
            if (email) filter.email = email;
            const users: User[] = await userRepository.find({ where: filter });

            if (!users.length) throw Error('No user found.');
            for (let userIndex = 0; userIndex < users.length; userIndex++) {
                const user = users[userIndex];
                const userId = user.id;
                const policy = {
                    policyType: 'g',
                    role: \`u\${userId}\`,
                    object: role,
                }
                if (!isPolicyDuplicate(policy, existingRoles)) rolesToCreate.push(policy);
            }
        }
        if (!rolesToCreate.length) {
            console.log('No new roles to create');
            process.exit(0);
        }
        await casbinPolicyRepository.createAll(rolesToCreate);
        console.log(\`Created \${rolesToCreate.length} new roles\`);
        await app.stop();
        process.exit(0);
      `,
    });

    // Execute condition
    seedFile.addStatements(`
      if (require.main === module) {
        seedData().catch(err => {
          console.error('Error seeding roles data:', err);
          process.exit(1);
        });
      }
    `);

    seedFile.formatText();
    // Save the generated file
    project.saveSync();
  }
}
