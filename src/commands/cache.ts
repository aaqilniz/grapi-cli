import { Command, Flags } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute } from '../utils/index.js';

export default class Cache extends Command {

  static override description = 'creating cache for endpoints';

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    redisDS: Flags.string({ description: 'redisDS' }),
    cacheTTL: Flags.string({ description: 'cacheTTL' }),
    specURL: Flags.string({ description: 'specURL name' }),
    prefix: Flags.string({ description: 'prefix to append to endpoints.' }),
    openapi: Flags.string({ description: 'openapi' }),
    exclude: Flags.string({ description: 'exclude controllers' }),
    include: Flags.string({ description: 'include controllers' }),
    readonly: Flags.string({ description: 'readonly controllers' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Cache);
    let options = processOptions(parsed.flags);
    options = JSON.stringify(options);
    const executed: any = await execute(`lb4-cache --config='${options}'`, 'executing cache');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
  }
}
