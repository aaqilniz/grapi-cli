import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute, standardFlags, prompt } from '../utils/index.js';

export default class RestCrud extends Command {
  static override description = 'generate rest crud apis.';

  static override flags = {
    ...standardFlags,
    datasource: Flags.string({ description: 'name of a valid datasource already created in src/datasources.' }),
    model: Flags.string({ description: 'name of a valid model already created in src/models.' }),
    basePath: Flags.string({ description: 'base path of the model endpoint.' }),
    readonly: Flags.string({ description: 'create readonly APIs e.g find and count.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(RestCrud);
    if (!parsed.flags.config) return prompt('rest-crud', parsed.flags);
    let options = processOptions(parsed.flags);
    let configs = '';
    if (Object.keys(options).length) {
      configs = `--config='${JSON.stringify(options)}' `;
    }
    const command = `lb4 rest-crud ${configs}--yes`;
    const executed: any = await execute(command, 'generated crud apis.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
  }
}
