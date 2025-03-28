import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute, standardFlags, prompt } from '../utils/index.js';
import { applyPostDSPatches } from '../patches/post-ds-patches.js';


export default class Datasource extends Command {

  static override description = 'generate datasource.'
  static override args = {
    name: Args.string({ description: 'name of the datasource.' }),
  };

  static override flags = {
    ...standardFlags,
    connector: Flags.string({ description: 'Name of datasource connector.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Datasource);
    if (!parsed.flags.config) return prompt('datasource', parsed.flags);
    let options = processOptions(parsed.flags);
    let configs = '';
    if (Object.keys(options).length) {
      configs = ` --config='${JSON.stringify(options)}' `;
    }
    let argument = '';
    if (parsed.args.name) { argument = ` ${parsed.args.name}`; }
    const command = `lb4 datasource${argument}${configs}--yes`;
    const executed: any = await execute(command, 'generating datasource.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
    let extraPatches = ''
    if (options.connector === 'postgresql') {
      extraPatches = ` --config '{"patches": ["buildQueryUniqueKeys"]}'`;
    }
    await execute(
      `grapi-cli patch${extraPatches}`,
      'applying default patches after datasource creation.'
    );
  }
}
