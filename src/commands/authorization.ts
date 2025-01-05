import { Command, Flags } from '@oclif/core'
import { Project, SyntaxKind } from 'ts-morph';
import chalk from 'chalk';
import fs from 'fs';
import { execute, getFiles, isLoopBackApp, processOptions } from '../utils/index.js';

export default class Authorization extends Command {

  static override description = 'add authorization layer.';

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    datasrouce: Flags.string({ description: 'name of the datasource.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Authorization)
    let options = processOptions(parsed.flags);
    const { datasource } = options;
    if (!datasource) throw Error('Please provide the datasource');
    const invokedFrom = process.cwd();

    console.log(chalk.blue('Confirming if this is a LoopBack 4 project.'));
    let packageJson: any = fs.readFileSync(`${invokedFrom}/package.json`, { encoding: 'utf8' })
    packageJson = JSON.parse(packageJson);

    if (!isLoopBackApp(packageJson)) throw Error('Not a loopback project');
    console.log(chalk.bold(chalk.green('OK.')));

    const deps = packageJson.dependencies;
    const pkgs = ['@loopback/authorization', 'casbin-authorization'];
    for (let i = 0; i < pkgs.length; i++) {
      const pkg = pkgs[i];
      if (!deps[pkg]) { await execute(`npm i ${pkg}`, `Installing ${pkg}`); }
    }

    const project = new Project({
      tsConfigFilePath: 'tsconfig.json',
      compilerOptions: { allowJs: true, checkJs: true }
    });
    project.addSourceFilesAtPaths(`${invokedFrom}/src/**/*.ts`);

    const applicationPath = `${invokedFrom}/src/application.ts`;
    const applicationFile = project.getSourceFileOrThrow(applicationPath);
    const applicationClass = applicationFile.getClasses()[0];
    if (!applicationClass.getMethod('addSecuritySpec')) {
      // Add the method
      applicationClass.addMethod({
        name: 'addSecuritySpec',
        returnType: 'void',
        statements: `
            this.api({
                openapi: '3.0.0',
                info: {
                    title: 'authorization-app',
                    version: require('../package.json').version,
                },
                paths: {},
                components: { securitySchemes: SECURITY_SCHEME_SPEC },
                security: [
                    {
                        jwt: [],
                    },
                ],
                servers: [{ url: '/' }],
            });
          `
      });
      const constructor = applicationClass.getConstructors()[0];
      const staticCall = constructor.getStatements().find(statement =>
        statement.getText().includes(`this.static`)
      );
      if (staticCall) {
        constructor.insertStatements(staticCall.getChildIndex() + 1, 'this.addSecuritySpec();');
      }
      const dsBindingStatement = constructor.getStatements().find(statement =>
        statement.getText().includes(`UserServiceBindings.DATASOURCE_NAME`)
      );
      if (dsBindingStatement) {
        constructor.insertStatements(
          dsBindingStatement.getChildIndex() + 1,
          `
            this.component(AuthorizationComponent);
            this.component(CasbinAuthorizationComponent);
            this.bind(POLICY_REPO).toClass(CasbinPolicyRepository).inScope(BindingScope.SINGLETON);
          `);
      }
    }


    applicationFile.addImportDeclarations([
      {
        namedImports: ['BindingScope'],
        moduleSpecifier: '@loopback/core',
      },
      {
        namedImports: ['AuthorizationComponent'],
        moduleSpecifier: '@loopback/authorization',
      },
      {
        namedImports: ['CasbinAuthorizationComponent', 'POLICY_REPO'],
        moduleSpecifier: 'casbin-authorization',
      },
      {
        namedImports: ['CasbinPolicyRepository'],
        moduleSpecifier: './repositories',
      },
    ]);

    if (!fs.existsSync('./src/models/casbin-policy.model.ts')) {
      await execute(
        `lb4 model --config '{"yes":"true","base":"Entity","name":"CasbinPolicy","properties":{"action":{"type":"string"},"object":{"type":"string"},"policyType":{"type":"string"},"restrictedFields":{"type":"string"},"role":{"type":"string"},"id":{"generated":true,"id":true,"type":"number"}}}'`,
        'generating casbin-policy model.'
      );
    }
    if (!fs.existsSync('./src/repositories/casbin-policy.repository.ts')) {
      await execute(
        `lb4 repository -c '{"model":"CasbinPolicy","repositoryBaseClass":"DefaultCrudRepository", "datasource": "${datasource}"}' --yes`,
        'generating casbin-policy repository.'
      );
    }
    const authJsonFilePath = './auth.json'
    if (fs.existsSync(authJsonFilePath)) {
      let authFile: any = fs.readFileSync(authJsonFilePath, { encoding: 'utf8' })
      authFile = JSON.parse(authFile);
      authFile.ids['CasbinPolicy'] = 1;
      authFile.models['CasbinPolicy'] = {};
      fs.writeFileSync(authJsonFilePath, JSON.stringify(authFile, null, 2));
    }

    // fetch and iterate through all model-endpoints files to add authorization options
    const modelEndpointFiles = getFiles(`./src/model-endpoints`);
    for (let i = 0; i < modelEndpointFiles.length; i++) {
      const filePath = modelEndpointFiles[i];
      const file = project.getSourceFile(filePath);
      const variables = file?.getVariableDeclarations() || [];
      for (let j = 0; j < variables.length; j++) {
        const variable = variables[j];
        const initializer = variable.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
        const authorizationProperty = initializer?.getProperty('authorization');
        if (!authorizationProperty) {
          initializer?.addPropertyAssignment({ name: 'authorization', initializer: 'true' });
          file?.saveSync();
        }
      }
    }
    applicationFile.formatText();
    await project.save();
    await execute(
      `grapi-cli patch --config '{"patches": ["authorization"]}'`,
      'applying patches related to authorizaton.'
    );
  }
}



const sample = {
  policies: [
    {
      role: 'admin',
      permissions: [
        {
          object: '/gruppes',
          actions: ['create', 'view-single'],
          restrictedFields: 'gruppentyp,notizen'
        },
        {
          object: '/kundes',
          actions: ['create', 'view-single']
        }
      ],
    },
    {
      role: 'admin',
      object: '/gruppes',
      actions: ['create', 'view-single'],
      restrictedFields: 'gruppentyp,notizen'
    },
    {
      role: 'admin',
      object: '/kundes',
      actions: ['create', 'view-single']
    }
  ]
}