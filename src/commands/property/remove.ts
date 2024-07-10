import { Command, Flags } from '@oclif/core'
import { Project } from 'ts-morph';
import chalk from 'chalk';

import { processOptions, toKebabCase, execute } from '../../utils/index.js';


export default class PropertyRemove extends Command {

  static override description = 'enable adding property to loopoback 4 models'

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    model: Flags.string({ char: 'n', description: 'name of the argument' }),
    property: Flags.string({ char: 't', description: 'name of the property to remove.' }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(PropertyRemove);
    const { property, model } = processOptions(flags);

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
    const classProperty = modelClass.getProperty(property);
    if (!classProperty) {
      throw new Error(`the ${property} property doesn't exists.`);
    }
    console.log(chalk.bold(chalk.blue('removing property.')))

    classProperty.remove();
    modelClass.formatText();

    project.save();

    const command = 'npm run build && npm run migrate';
    let executed: any = await execute(command, 'building the project and migrating models.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
    console.log(chalk.bold(chalk.green('successfully migrated the models.')))
  }
}
