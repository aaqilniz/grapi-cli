import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute, standardFlags, prompt } from '../utils/index.js';

export default class Controller extends Command {
  static override description = 'generate controllers'

  static override args = {
    name: Args.string({ description: 'name of controller.' }),
  };

  static override flags = {
    ...standardFlags,
    controllerType: Flags.string({ options: ['REST', 'BASIC'], description: ' Type of the controller. Valid types are BASIC and REST. BASIC corresponds to an empty controller, whereas REST corresponds to REST controller with CRUD methods.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Controller);
    if (!parsed.flags.config) return prompt('controller', parsed.flags);
    let options = processOptions(parsed.flags);
    let configs = '';
    if (Object.keys(options).length) {
      configs = ` --config='${JSON.stringify(options)}' `;
    }
    const command = `lb4 controller${configs}--yes`;
    const executed: any = await execute(command, 'generating application.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
  }
}
