import { Command, Flags } from '@oclif/core'
import { Project, SyntaxKind } from 'ts-morph';
import chalk from 'chalk';

import { processOptions, toKebabCase, execute } from '../../utils/index.js';

export default class PropertyMarkHidden extends Command {
  static override description = 'enable adding property to loopoback 4 models'

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    model: Flags.string({ char: 'n', description: 'name of the model' }),
    properties: Flags.string({ char: 't', description: 'array of property names to mark hidden.' }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(PropertyMarkHidden);
    const { properties, model } = processOptions(flags);

    const project = new Project({});
    const invokedFrom = process.cwd();

    project.addSourceFilesAtPaths(`${invokedFrom}/src/**/*.ts`);
    const modelPath = `${invokedFrom}/src/models/${toKebabCase(model)}.model.ts`;

    const modelFile = project.getSourceFile(modelPath);
    if (!modelFile) {
      throw new Error(`the ${model} model doesn't exist.`);
    }

    const modelClasses = modelFile.getClasses();
    if (!modelClasses.length) {
      throw new Error(`the ${model} model doesn't exist.`);
    }
    const modelClass = modelClasses[0];
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const classProperty = modelClass.getProperty(property);
      if (!classProperty) {
        throw new Error(`the ${property} property doesn't exists.`);
      }
      const decorator = classProperty.getDecorator('property');
      const decoratorArgument = decorator?.getArguments()[0];
      if (decoratorArgument && decoratorArgument.getKind() === SyntaxKind.ObjectLiteralExpression) {
        const objectLiteral = decoratorArgument.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
        const hiddenProperty = objectLiteral.getProperty('hidden');
        if (!hiddenProperty) {
          objectLiteral.addPropertyAssignment({
            name: 'hidden',
            initializer: 'true'
          });
        }
      }
    }
    
    modelFile.formatText();
    modelFile.saveSync();
    project.save();

    const command = 'npm run build';
    let executed: any = await execute(command, 'building the project.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
    console.log(chalk.bold(chalk.green('successfully built the project.')))
  }
}
