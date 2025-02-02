import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk';
import { AppGeneratorFlags } from '../types/app.types.js';

import { processOptions, execute, standardFlags, prompt } from '../utils/index.js';
import { ObjectLiteralExpression, Project, Scope, SyntaxKind, VariableDeclarationKind } from 'ts-morph';
import { exists, existsSync, mkdirSync, unlinkSync } from 'fs';

export default class App extends Command {
  static override description = 'generate application.'
  static override args = {
    name: Args.string({ description: 'name of the application.' }), //the argument shouldn't be required here!!!!
  };

  static override flags = {
    ...standardFlags,
    name: Flags.string({ description: 'Application class name.' }),
    description: Flags.string({ description: 'Description of the application.' }),
    outdir: Flags.string({ description: 'Project root directory for the application.' }),
    eslint: Flags.boolean({ description: 'Add ESLint to LoopBack4 application project.' }),
    prettier: Flags.boolean({ description: 'Add Prettier to LoopBack4 application project.' }),
    mocha: Flags.boolean({ description: 'Add Mocha to LoopBack4 application project.' }),
    loopbackBuild: Flags.boolean({ description: 'Add @loopback/build module’s script set to LoopBack4 application project.' }),
    vscode: Flags.boolean({ description: 'Add VSCode config files to LoopBack4 application project' }),
    docker: Flags.boolean({ description: 'Generate Dockerfile and add npm scripts to build/run the project in a docker container.' }),
    repositories: Flags.boolean({ description: 'include repository imports and RepositoryMixin.' }),
    services: Flags.boolean({ description: 'include service-proxy imports and ServiceMixin.' }),
    controllerDirs: Flags.boolean({ description: 'a comma seperated list of directory names to use as controller directories.' }),
    apiconnect: Flags.boolean({ description: 'Include ApiConnectComponent.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(App);
    if (!parsed.flags.config) return prompt('app', parsed.flags, parsed.args);

    let options: AppGeneratorFlags = processOptions(parsed.flags);
    if (!options.name && parsed.args.name) {
      options.name = parsed.args.name;
    }
    let configs = '';
    if (Object.keys(options).length) {
      configs = ` --config='${JSON.stringify(options)}' `;
    }
    let argument = '';
    if (parsed.args.name) { argument = ` ${parsed.args.name}`; }
    const command = `lb4${argument}${configs}--yes`;

    const executed: any = await execute(command, 'generating application.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
    if (!options.controllerDirs) return;

    const controllerDirs = options.controllerDirs.split(',');
    const project = new Project({});
    const invokedFrom = process.cwd();

    project.addSourceFilesAtPaths(`${invokedFrom}/${options.name}/src/**/*.ts`);
    const applicationPath = `${invokedFrom}/${options.name}/src/application.ts`;
    const applicationFile = project.getSourceFileOrThrow(applicationPath);
    const applicationClass = applicationFile.getClasses()[0];

    const constructor = applicationClass.getConstructors()[0];
    const staticCall = constructor.getStatements().find(statement =>
      statement.getText().includes(`this.bootOptions`)
    );
    const sourceFile = project.createSourceFile('temp.ts', staticCall?.getText());
    const objectLiteral = sourceFile.getFirstDescendant(
      node => node.getKind() === SyntaxKind.ObjectLiteralExpression
    ) as ObjectLiteralExpression;

    const dirsProperty = objectLiteral
      .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
      .find(prop => prop.getName() === 'dirs');

    if (dirsProperty) {
      const arrayLiteral = dirsProperty.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
      if (arrayLiteral) {
        controllerDirs.forEach(dir => {
          arrayLiteral.addElement(`'${dir}'`);
        });
      }
    }
    if (staticCall) {
      staticCall.replaceWithText(sourceFile.getText());
    }
    applicationFile.saveSync();
  }
}
