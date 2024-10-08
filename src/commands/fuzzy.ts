import { Command, Flags } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute, prompt } from '../utils/index.js';

export default class Fuzzy extends Command {

  static override description = 'generate fuzzy endpoints for lb4 based controllers'

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    fuzzy: Flags.string({ description: 'fuzzy' }),
    centralFuzzy: Flags.string({ description: 'central Fuzzy' }),
    datasource: Flags.string({ alias: 'ds', description: 'datasource name' }),
    appName: Flags.string({ description: 'name of the application' }),
    exclude: Flags.string({ description: 'exclude controllers' }),
    include: Flags.string({ description: 'include controllers' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Fuzzy);
    let options = processOptions(parsed.flags);
    options = JSON.stringify(options);
    const executed: any = await execute(`lb4-fuzzy --config='${options}'`, 'executing fuzzy');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
  }
}
