import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute, standardFlags, prompt } from '../utils/index.js';

export default class Openapi extends Command {
  static override description = 'generate openapi based apis.';
  static override args = {
    url: Args.string({ description: 'URL or file path of the OpenAPI spec. Type: String. Required: false.', }),
  };
  static override flags = {
    ...standardFlags,
    url: Flags.string({ description: 'URL or file path of the OpenAPI spec.' }),
    validate: Flags.boolean({ default: false, description: 'Validate the OpenAPI spec.' }),
    ['promote-anonymous-schemas']: Flags.boolean({ default: false, description: 'Promote anonymous schemas as models classes.' }),
    client: Flags.boolean({ default: false, description: 'Generate client-side service proxies and controllers with implementation for the OpenAPI spec.' }),
    datasource: Flags.string({ description: 'A valid datasource name.' }),
    positional: Flags.boolean({ default: true, description: 'A flag to control if service methods use positional parameters or an object with named properties.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Openapi);
    if (!parsed.flags.config) return prompt('openapi', parsed.flags);
    let options = processOptions(parsed.flags);
    let configs = '';
    if (Object.keys(options).length) {
      configs = ` --config='${JSON.stringify(options)}' `;
    }
    let argument = '';
    if (parsed.args.url) { argument = ` ${parsed.args.url}`; }
    const command = `lb4 openapi${argument}${configs}--yes`;
    const executed: any = await execute(command, 'generating service.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
  }
}
