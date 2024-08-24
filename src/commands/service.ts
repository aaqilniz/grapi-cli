import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute, standardFlags, prompt } from '../utils/index.js';

export default class Service extends Command {
  static override description = 'generate a service.';
  static override args = {
    name: Args.string({ description: 'name of the service.', required: true }),
  };
  static override flags = {
    ...standardFlags,
    type: Flags.string({ description: 'service type: proxy, class, or provider.' }),
    datasource: Flags.string({ description: 'name of a valid REST or SOAP datasource already created in src/datasources.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Service);
    if (!parsed.flags.config) return prompt('service', parsed.flags);
    let options = processOptions(parsed.flags);
    let configs = '';
    if (Object.keys(options).length) {
      configs = ` --config='${JSON.stringify(options)}' `;
    }
    let argument = '';
    if (parsed.args.name) { argument = ` ${parsed.args.name}`; }
    const command = `lb4 service${argument}${configs}--yes`;
    const executed: any = await execute(command, 'generating service.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
  }
}
