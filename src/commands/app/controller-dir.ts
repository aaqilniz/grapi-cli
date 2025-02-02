import { Command, Flags } from '@oclif/core'
import { processOptions, prompt, standardFlags } from '../../utils/index.js';
import { ObjectLiteralExpression, Project, SyntaxKind } from 'ts-morph';

export default class AppControllerDir extends Command {

  static override flags = {
    config: standardFlags.config,
    controllerDirs: Flags.boolean({ description: 'a comma seperated list of directory names to use as controller directories.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(AppControllerDir)
    if (!parsed.flags.config) return prompt('app:controller-dir', parsed.flags);
    let options = processOptions(parsed.flags);

    if (!options.controllerDirs) throw ('controllerDirs is required.');
    const controllerDirs: string[] = options.controllerDirs.split(',');
    const project = new Project({});
    const invokedFrom = process.cwd();

    project.addSourceFilesAtPaths(`${invokedFrom}/src/**/*.ts`);
    const applicationPath = `${invokedFrom}/src/application.ts`;
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
