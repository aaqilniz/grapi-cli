import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute, standardFlags, prompt } from '../utils/index.js';

export default class Repository extends Command {
  static override description = 'generate repositories.';
  static override args = {
    name: Args.string({ description: 'name of the repository.' }),
  };
  static override flags = {
    ...standardFlags,
    datasource: Flags.string({ description: 'name of a valid datasource already created in src/datasources.' }),
    model: Flags.string({ description: 'name of a valid model already created in src/models.' }),
    id: Flags.string({ description: 'name of the property serving as ID in the selected model. If you supply this value, the CLI will not try to infer this value from the selected model file.' }),
    repositoryBaseClass: Flags.string({ description: '(Default: DefaultCrudRepository) name of the base class the repository will inherit. If no value was supplied, DefaultCrudRepository will be used.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Repository);
    if (!parsed.flags.config) return prompt('repository', parsed.flags);
    let options = processOptions(parsed.flags);
    let configs = '';
    if (Object.keys(options).length) {
      configs = ` --config='${JSON.stringify(options)}' `;
    }
    let argument = '';
    if (parsed.args.name) { argument = ` ${parsed.args.name}`; }
    const command = `lb4 repository${argument}${configs}--yes`;
    const executed: any = await execute(command, 'generating repository.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
  }
}
