import { Command, Flags } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute, prompt } from '../utils/index.js';

export default class SqlController extends Command {
  static override description = 'describe the command here'

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    query: Flags.string({ description: 'sql query to generate controller for' }),
    path: Flags.string({ description: 'path for endpoint' }),
    repoName: Flags.string({ description: 'repository name' }),
    appName: Flags.string({ description: 'name of the application' }),
    controllerName: Flags.string({ description: 'name of the generated controller' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(SqlController);
    let options = processOptions(parsed.flags);
    options = JSON.stringify(options);
    const executed: any = await execute(`lb4-sql-controller --config='${options}'`, 'executing sql-controller');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
  }
}
