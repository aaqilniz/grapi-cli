import { Command, Flags } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute, standardFlags } from '../utils/index.js';

export default class Copyright extends Command {
  static override description = 'add/update copyright'

  static override flags = {
    ...standardFlags,
    owner: Flags.string({ description: 'The owner of the copyright, such as IBM Corp. and LoopBack contributors.' }),
    license: Flags.string({ description: 'The name of the license, such as MIT.' }),
    gitOnly: Flags.string({ description: ' A flag to control if only git tracked files are updated. Default to true.' }),
    updateLicense: Flags.string({ description: 'A flag to control if package.json and LICENSE files should be updated to reflect the selected license id.' }),
    exclude: Flags.string({ description: 'One or more glob patterns with , delimiter to exclude files that match the patterns from being updated.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Copyright);
    let options = processOptions(parsed.flags);
    let configs = '';
    if (Object.keys(options).length) {
      configs = `--config='${JSON.stringify(options)}' `;
    }
    const command = `lb4 copyright ${configs}--yes`;
    const executed: any = await execute(command, 'adding/updating copyright.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
  }
}
