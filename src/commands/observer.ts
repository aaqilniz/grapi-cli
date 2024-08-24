import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute, standardFlags, prompt } from '../utils/index.js';

export default class Observer extends Command {
  static override description = 'generate observer.';
  static override args = {
    name: Args.string({ description: 'Required name of the observer to create as an argument to the command.', required: true }),
  };

  static override flags = {
    ...standardFlags,
    group: Flags.string({ description: 'Optional name of the observer group to sort the execution of observers by group.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Observer);
    if (!parsed.flags.config) return prompt('observer', parsed.flags);
    let options = processOptions(parsed.flags);
    let configs = '';
    if (Object.keys(options).length) {
      configs = ` --config='${JSON.stringify(options)}' `;
    }
    let argument = '';
    if (parsed.args.name) { argument = ` ${parsed.args.name}`; }
    const command = `lb4 observer${argument}${configs}--yes`;
    const executed: any = await execute(command, 'generating observer.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
  }
}
