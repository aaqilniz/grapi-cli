import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute, standardFlags } from '../utils/index.js';

export default class Interceptor extends Command {
  static override description = 'generate interceptor.';
  static override args = {
    name: Args.string({ description: 'Required name of the observer to create as an argument to the command.', required: true }),
  };

  static override flags = {
    ...standardFlags,
    global: Flags.boolean({ default: true, description: 'Optional flag to indicate a global interceptor (default to true). Use --no-global to set it to false.' }),
    ['no-global']: Flags.boolean({ description: 'set global to false' }),
    group: Flags.string({ description: 'Optional name of the interceptor group to sort the execution of global interceptors by group. This option is only supported for global interceptors.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Interceptor);
    let options = processOptions(parsed.flags);
    let configs = '';
    if (Object.keys(options).length) {
      configs = ` --config='${JSON.stringify(options)}' `;
    }
    let argument = '';
    if (parsed.args.name) { argument = ` ${parsed.args.name}`; }
    const command = `lb4 interceptor${argument}${configs}--yes`;
    const executed: any = await execute(command, 'generating interceptor.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
  }
}
