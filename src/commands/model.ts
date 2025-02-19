import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute, standardFlags, prompt } from '../utils/index.js';


export default class Model extends Command {

  static override description = 'generate model.'
  static override args = {
    name: Args.string({ description: 'name of the model.' }),
  };

  static override flags = {
    ...standardFlags,
    base: Flags.string({ description: 'a valid model already created in src/models or any of the core based class models Entity or Model. Your new model will extend this selected base model class' }),
    dataSource: Flags.string({ description: 'The name of the dataSource which contains this model and suppots model discovery' }),
    table: Flags.string({ description: 'If discovering a model from a dataSource, specify the name of its table/view' }),
    schema: Flags.string({ description: 'If discovering a model from a dataSource, specify the schema which contains it' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Model);
    if (!parsed.flags.config) return prompt('model', parsed.flags);
    let options = processOptions(parsed.flags);
    const { force } = options;
    delete options.force;
    let configs = '';
    if (Object.keys(options).length) {
      configs = ` --config='${JSON.stringify(options)}' `;
    }
    let argument = '';
    if (parsed.args.name) { argument = ` ${parsed.args.name}`; }
    const command = `lb4 model${argument}${configs}--yes${force ? ' --force' : ''}`;
    const executed: any = await execute(command, 'generating model.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
  }
}
