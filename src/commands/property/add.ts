import { Command, Flags } from '@oclif/core'
import { Project } from 'ts-morph';
import chalk from 'chalk';

import { processOptions, toKebabCase, execute } from '../../utils/index.js';


export default class PropertyAdd extends Command {

  static override description = 'enable adding property to loopoback 4 models'

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    model: Flags.string({ char: 'n', description: 'name of the argument' }),
    properties: Flags.string({ char: 't', description: 'JSON object of properties to add' }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(PropertyAdd);
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
    const classProperties: any[] = [];
    const modelClass = modelClasses[0];

    Object.keys(properties).forEach(key => {
      if (modelClass.getProperty(key)) {
        throw new Error(`the ${key} property already exist.`);
      }
      const property = properties[key];
      let type = property['type'];
      if (type === 'date') { type = 'string'; }
      let argument = `type: '${property['type']}',`;

      if (property['id']) { argument += `\id: '${property['id']}',`; }
      if (property['generated']) { argument += `\generated: '${property['generated']}',`; }
      if (property['required']) { argument += `\nrequired: '${property['required']}',`; }
      if (property['default']) { argument += `\ndefault: '${property['default']}',`; }
      if (property['defaultFn']) { argument += `\ndefaultFn: '${property['defaultFn']}',`; }
      if (property['description']) { argument += `\ndescription: '${property['description']}',`; }
      if (property['doc']) { argument += `\ndoc: '${property['doc']}',`; }
      if (property['hidden']) { argument += `\nhidden: '${property['hidden']}',`; }
      if (property['index']) { argument += `\nindex: '${property['index']}',`; }

      const classProperty = {
        decorators: [{
          name: 'property',
          arguments: [`{${argument}}`]
        }],
        name: key,
        type,
        hasQuestionToken: true
      };

      if (property['required']) {
        classProperty.hasQuestionToken = false;
      }

      classProperties.push(classProperty);
    });

    modelClass.addProperties(classProperties);
    modelClass.formatText();

    console.log(chalk.bold(chalk.blue('adding property.')))

    project.save();

    const command = 'npm run build && npm run migrate';
    let executed: any = await execute(command, 'building the project and migrating the newly created property.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
    console.log(chalk.bold(chalk.green('successfully migrated the newly created property.')))
  }
}
