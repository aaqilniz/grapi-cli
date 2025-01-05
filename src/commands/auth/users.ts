import path from 'path';
import fs from 'fs';
import { Command, Flags } from '@oclif/core'
import chalk from 'chalk';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

import { execute, processOptions } from '../../utils/index.js';
import { JsxNamespacedName, Project } from 'ts-morph';

export default class Auth extends Command {

  static override description = 'adding auth to loopback 4 application.'

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    users: Flags.string({ char: 'i', description: 'users list.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Auth);
    let options = processOptions(parsed.flags);
    const users = options;
    if (!users || !users.length) {
      console.log(chalk.bold(chalk.red('No users provided.')));
      process.exit
    }
    const project = new Project({});
    const invokedFrom = process.cwd();

    project.addSourceFilesAtPaths(`${invokedFrom}/src/**/*.ts`);

    const applicationPath = `${invokedFrom}/src/application.ts`;
    const applicationFile = project.getSourceFile(applicationPath);
    const appClass = applicationFile?.getClasses()[0];
    const applicationName = appClass!.getName()!;
    const appClassConstructor = appClass?.getConstructors()[0];
    let dsName = '';
    appClassConstructor?.getStatements()
      .forEach((statement) => {
        if (statement.getText().includes(`, UserServiceBindings.DATASOURCE_NAME`)) {
          const dsStatement = statement.getText();
          const match = dsStatement.match(/this\.dataSource\(([^,]+)/);
          if (match) {
            dsName = match[1].trim();
          }
        }
      });
    if (!dsName) {
      console.log(chalk.bold(chalk.red('No auth datasource bound.')));
      process.exit
    }
    console.log(chalk.bold(chalk.green('generating users.')));
    if (!fs.existsSync('./src/seed.ts')) {
      await this.createSeedScript(project, applicationName, dsName, users);
    }
    const packageJsonPath = './package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.dependencies.bcryptjs) {
      await execute(`npm install bcryptjs`, 'installing bcryptjs.')
    }
    packageJson.scripts['seed:data'] = 'node ./dist/seed.js';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    await execute(`npm install bcryptjs && npm run build && npm run seed:data`, 'creating users.')
    process.exit(0);
  }

  private async createSeedScript(
    project: Project,
    appName: string,
    datasourceName: string,
    users: any[]
  ): Promise<void> {
    if (!users.length) {
      users = [{
        username: 'grpl',
        email: 'grpl@grapple-solutions.com',
        password: 'grpl',
      }]
    }
    // Create a new seed file
    const seedFile = project.createSourceFile('src/seed.ts', '', {
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
        namedImports: ['UserRepository', 'UserCredentialsRepository'],
        moduleSpecifier: './repositories',
      },
      {
        defaultImport: '* as bcrypt',
        moduleSpecifier: 'bcryptjs',
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
        const userRepo = new UserRepository(ds, async () => userCredRepo);
        const userCredRepo = new UserCredentialsRepository(ds);
        const users = ${JSON.stringify(users)};
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const userCreated = await userRepo.create({
                username: user.username,
                email: user.email,
                emailVerified: 1
            });
            await userCredRepo.create({
                userId: userCreated.id,
                password: await bcrypt.hash(user.password, await bcrypt.genSalt()),
            });
        }
        console.log('Data seeded successfully!');
        await app.stop();
        process.exit(0);
      `,
    });

    // Execute condition
    seedFile.addStatements(`
      if (require.main === module) {
        seedData().catch(err => {
          console.error('Error seeding data:', err);
          process.exit(1);
        });
      }
    `);

    seedFile.formatText();
    // Save the generated file
    project.saveSync();
  }
}
