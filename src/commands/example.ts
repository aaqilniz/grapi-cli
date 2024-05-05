import { Args, Command } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute, standardFlags } from '../utils/index.js';

export default class Example extends Command {
  static override description = 'download examples.';
  static override args = {
    ['example-name']: Args.string({ description: 'Optional name of the example to clone. If provided, the tool will skip the example-name prompt and run in a non-interactive mode.', }),
  };

  static override flags = {
    ...standardFlags
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Example);
    let options = processOptions(parsed.flags);
    let configs = '';
    if (Object.keys(options).length) {
      configs = ` --config='${JSON.stringify(options)}' `;
    }
    let argument = '';
    if (parsed.args['example-name']) { argument = ` ${parsed.args['example-name']}`; }
    const command = `lb4 example${argument}${configs}--yes`;
    const executed: any = await execute(command, 'downloading example.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
  }
}
