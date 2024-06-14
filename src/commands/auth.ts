import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Command, Flags } from '@oclif/core'
import chalk from 'chalk';
import { Project, SyntaxKind, PropertyAssignment, ObjectLiteralExpression, MethodDeclaration, Decorator, SourceFile, ImportDeclaration } from "ts-morph";
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import pluralize from 'pluralize';

import { processOptions, execute, getFiles } from '../utils/index.js';

export default class Auth extends Command {

  static override description = 'adding auth to loopback 4 application.'

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    include: Flags.string({ char: 'i', description: 'include auth to the apis.' }),
    exclude: Flags.string({ char: 'e', description: 'exclude auth to the apis.' }),
    readonly: Flags.string({ char: 'r', description: 'auth to readonly apis.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Auth);
    let options = processOptions(parsed.flags);
    const {
      users,
      include,
      exclude,
      readonly } = options;
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    if (include && exclude) {
      throw new Error('Cannot have include and exclude at the same time.');
    }
    let includings = [];
    let excludings = [];
    if (include) { includings = include.split(','); }
    if (exclude) { excludings = exclude.split(','); }

    if (includings) {
      includings = includings.map((including: string) => pluralize.singular(including));
    }
    if (excludings) {
      excludings = excludings.map((excluding: string) => pluralize.singular(excluding));
    }

    const __filename = fileURLToPath(import.meta.url); // manually get __filename
    const __dirname = path.dirname(__filename); // manually get __dirname

    fs.copyFileSync(path.join(__dirname, `../files/auth.json`), `./auth.json`); // default users copied

    // create new users if provided in configs.
    if (users && users.length) {
      console.log(chalk.bold(chalk.green('generating users.')));
      const authUsers: any = {
        ids: { User: 0, UserCredentials: 0 },
        models: { User: {}, UserCredentials: {}, }
      };

      for (let i = 0; i < users.length; i++) {
        const userId = uuid();
        const userCredsId = uuid();
        const userProfile = users[i];
        const { username, email, password, realm } = userProfile;

        ++authUsers.ids.User;
        ++authUsers.ids.UserCredentials;

        authUsers.models.User[userId] = {
          id: userId,
          username,
          email,
          realm,
          emailVerified: true
        };

        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt());
        authUsers.models.UserCredentials[userCredsId] = {
          id: userCredsId,
          password: hashedPassword,
          userId,
        }
        fs.writeFileSync(path.join('./auth.json'), JSON.stringify({ ...authUsers }), { encoding: 'utf8' })
      }
    }

    // install deps if not already installed
    let pkgToInstall = '';
    if (!pkg.dependencies['@loopback/rest-crud']) pkgToInstall += '@loopback/rest-crud ';
    if (!pkg.dependencies['@loopback/metrics']) pkgToInstall += '@loopback/metrics ';
    if (!pkg.dependencies['@loopback/authentication']) pkgToInstall += '@loopback/authentication ';
    if (!pkg.dependencies['@loopback/authentication-jwt']) pkgToInstall += '@loopback/authentication-jwt ';

    let promises = [];
    if (pkgToInstall) {
      promises.push(execute(`npm i ${pkgToInstall}`, 'installing dep.'));
    }

    const project = new Project({});
    const invokedFrom = process.cwd();

    project.addSourceFilesAtPaths(`${invokedFrom}/node_modules/**/*.ts`);

    const authDS = fs.existsSync('./src/datasources/auth.datasource.ts');
    if (!authDS) {
      promises.push(execute(`lb4 datasource auth -c '{ "name": "auth", "connector": "memory", "file": "./auth.json", "localStorage": "auth" }' --yes`, 'generating datasource for auth.'));
    }

    //executing all the promises    
    (await Promise.all(promises)).forEach(({ stderr, stdout }: any) => {
      if (stderr) console.log(chalk.bold(chalk.green(stderr)));
      if (stdout) console.log(chalk.bold(chalk.green(stdout)));
    });
    promises = [];

    const runBuild: any = await execute('yarn build', 'building the files.')
    if (runBuild.stderr) console.log(chalk.bold(chalk.green(runBuild.stderr)));
    if (runBuild.stdout) console.log(chalk.bold(chalk.green(runBuild.stdout)));

    // manipulate application file to include auth
    project.addSourceFilesAtPaths(`${invokedFrom}/src/**/*.ts`);

    const applicationPath = `${invokedFrom}/src/application.ts`;
    const applicationFile = project.getSourceFile(applicationPath);

    this.addImport(applicationFile, '{MetricsComponent}', '@loopback/metrics')
    this.addImport(applicationFile, '{AuthenticationComponent}', '@loopback/authentication')
    this.addImport(
      applicationFile,
      '{JWTAuthenticationComponent, SECURITY_SCHEME_SPEC, UserServiceBindings}',
      '@loopback/authentication-jwt'
    );
    this.addImport(applicationFile, '{AuthDataSource}', './datasources')

    const appClass = applicationFile?.getClasses()[0];
    const appClassConstructor = appClass?.getConstructors()[0];

    let appStatementsExist = false;
    let appStatIndex: number = 0;

    appClassConstructor?.getStatements()
      .forEach((statement, index) => {
        if (statement.getText().includes('AuthDataSource, UserServiceBindings.DATASOURCE_NAME')) {
          appStatementsExist = true;
        }
        if (statement.getText().includes('this.component(CrudRestComponent);')) {
          appStatIndex = index + 1;
        }
      });
    if (appStatIndex && !appStatementsExist) {
      appClassConstructor?.insertStatements(appStatIndex,
        `
          this.component(MetricsComponent);
          this.component(AuthenticationComponent);
          this.component(JWTAuthenticationComponent);
          this.dataSource(AuthDataSource, UserServiceBindings.DATASOURCE_NAME);
        `);
    }
    applicationFile?.formatText();

    // generate auth controller if not present
    if (!fs.existsSync(`./src/controllers/auth.controller.ts`)) {
      promises.push(execute(`lb4 controller --config '{ "name": "auth", "controllerType": "Empty Controller" }' --yes`, 'generating empty controller.'))
      fs.copyFileSync(path.join(__dirname, `../files/auth.controller.txt`), `./src/controllers/auth.controller.ts`);
    }

    // fetch and iterate through all model-endpoints files to add auth options
    const modelEndpointFiles = getFiles(`./src/model-endpoints`);
    const all = ['post', 'patch', 'patchById', 'putById', 'deleteById', 'get', 'getById', 'count'];
    const allButReadOnly = ['post', 'patch', 'patchById', 'putById', 'deleteById'];
    const readOnly = ['get', 'getById', 'count'];

    for (let i = 0; i < modelEndpointFiles.length; i++) {
      const filePath = modelEndpointFiles[i];
      const file = project.getSourceFile(filePath);
      const variables = file?.getVariableDeclarations() || [];

      for (let j = 0; j < variables.length; j++) {
        const variable = variables[j];
        const initializer = variable.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
        const authProperty = initializer?.getProperty('auth');

        if (!authProperty) {
          const properties = initializer?.getProperties() || [];

          for (let k = 0; k < properties.length; k++) {
            const prop = properties[k];

            if (prop.getKind() === SyntaxKind.PropertyAssignment) {
              const propertyAssignment = prop as PropertyAssignment;
              const name = propertyAssignment.getName();
              let value = propertyAssignment.getInitializer()!.getText();
              value = value.replace(/^'|'$/g, ''); // Remove single quotes
              value = pluralize.singular(value);

              if (name === 'basePath') {
                let items = readonly ? readOnly : allButReadOnly;
                let includingMatched = false;

                for (let l = 0; l < includings.length; l++) {
                  const includingRegex = new RegExp(includings[l]);
                  if (includingRegex.test(value)) {
                    includingMatched = true;
                    break;
                  }
                }

                let excludingMatched = false;

                for (let m = 0; m < excludings.length; m++) {
                  const excludingRegex = new RegExp(excludings[m]);
                  if (excludingRegex.test(value)) {
                    excludingMatched = true;
                    break;
                  }
                }

                if (includingMatched) {
                  this.addAuthProperty(project, initializer, items);
                } else if (excludings.length && !excludingMatched) {
                  this.addAuthProperty(project, initializer, items);
                } else if (
                  readonly &&
                  includings.length === 0 &&
                  excludings.length === 0
                ) {
                  this.addAuthProperty(project, initializer, readOnly);
                } else if (
                  !readonly &&
                  includings.length === 0 &&
                  excludings.length === 0
                ) {
                  this.addAuthProperty(project, initializer, all);
                }
              }
            }
          }
        }
      }

      file?.formatText();
    }


    // fetch and iterate through all controller files to add auth decorators
    const controllerFiles = getFiles(`./src/controllers`);
    for (let i = 0; i < controllerFiles.length; i++) {
      const filePath = controllerFiles[i];
      if (
        !(filePath.includes('index.ts') ||
          filePath.includes('auth.controller.ts') ||
          filePath.includes('user.controller.ts') ||
          filePath.includes('ping.controller.ts'))
      ) {
        const file = project.getSourceFile(filePath);
        this.addImport(file, '{authenticate}', '@loopback/authentication')

        let methods = file?.getClasses()[0]?.getMethods() || [];

        for (let j = 0; j < methods.length; j++) {
          const method = methods[j];
          const text = method.getText();
          if (this.isValidMethod(text)) {
            const decorators = method?.getDecorators();
            for (let k = 0; k < decorators.length; k++) {
              const decorator = decorators[k];
              const text = decorator.getText();

              let includingMatched = false;
              for (let l = 0; l < includings.length; l++) {
                const includingRegex = new RegExp(includings[l]);
                if (includingRegex.test(text)) {
                  includingMatched = true;
                  break;
                }
              }

              let excludingMatched = false;
              for (let m = 0; m < excludings.length; m++) {
                const excludingRegex = new RegExp(excludings[m]);
                if (excludingRegex.test(text)) {
                  excludingMatched = true;
                  break;
                }
              }

              if (includingMatched) {
                if (readonly) {
                  if (text.includes('@get') || text.includes(`operation('get')`)) {
                    this.addAuthDecorator(method);
                  }
                } else {
                  if (!text.includes('@get') && text.includes(`operation('get')`)) {
                    this.addAuthDecorator(method);
                  }
                }
              }

              if (excludings.length && !excludingMatched) {
                if (readonly) {
                  if (text.includes('@get') || text.includes(`operation('get')`)) {
                    this.addAuthDecorator(method);
                  }
                } else {
                  if (!text.includes('@get') && !text.includes(`operation('get')`)) {
                    this.addAuthDecorator(method);
                  }
                }
              }

              if (
                excludings.length === 0 &&
                includings.length === 0 &&
                readonly
              ) {
                if (text.includes('@get') || text.includes(`operation('get')`)) {
                  this.addAuthDecorator(method);
                }
              }

              if (
                excludings.length === 0 &&
                includings.length === 0 &&
                !readonly
              ) {
                this.addAuthDecorator(method);
              }
            }
          }
        }
        file?.formatText();
      }
    }

    const tempFile = project.getSourceFile('temp.ts');
    if (tempFile) project.removeSourceFile(tempFile);

    await project.save();

    let { stderr, stdout }: any = await execute(`cd ./node_modules/@loopback/rest-crud && npm run build`, 'building rest-crud.');
    if (stderr) console.log(chalk.bold(chalk.green(stderr)));
    if (stdout) console.log(chalk.bold(chalk.green(stdout)));

    let build: any = await execute(`npm run build`, 'building the app.');
    if (build.stderr) console.log(chalk.bold(chalk.green(build.stderr)));
    if (build.stdout) console.log(chalk.bold(chalk.green(build.stdout)));

    process.exit(0);
  }

  private addAuthProperty(
    project: Project,
    initializer: ObjectLiteralExpression | undefined,
    names: string[]
  ): void {
    const authObject: ObjectLiteralExpression = project.createSourceFile('temp.ts', `const auth = {};`, { overwrite: true })
      .getVariableDeclarationOrThrow('auth')
      .getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
    names.forEach(name => {
      authObject?.addPropertyAssignment({ name, initializer: 'true' });
    });
    initializer?.addPropertyAssignment({ name: 'auth', initializer: authObject.getText() });
  }

  private addAuthDecorator(addDecoratorTo: MethodDeclaration): void {
    const authDecorator = addDecoratorTo?.getDecorator('authenticate');
    if (!authDecorator) {
      addDecoratorTo?.addDecorator({
        name: 'authenticate',
        arguments: [`'jwt'`],
      });
    }
  }

  private isValidMethod(text: string): Boolean {
    const items = [
      'get',
      'post',
      'put',
      'patch',
      'delete',
      `operation('get')`,
      `operation('post')`,
      `operation('put')`,
      `operation('patch')`,
      `operation('delete')`,
    ];
    let valid = false;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (text.includes(item)) { valid = true; }
    }
    return valid
  }

  private addImport(
    addImportTo: SourceFile | undefined,
    defaultImport: string,
    moduleSpecifier: string
  ): void {
    if (!addImportTo?.getImportDeclaration(moduleSpecifier)) {
      addImportTo?.addImportDeclaration({ defaultImport, moduleSpecifier });
    }
  }
}
