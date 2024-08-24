import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute, standardFlags, prompt } from '../utils/index.js';

export default class ImportLb3Models extends Command {
  static override description = 'import lb3 models.';
  static override args = {
    lb3app: Args.string({ description: 'Path to the directory containing your LoopBack 3.x application.', }),
  };

  static override flags = {
    ...standardFlags,
    outDir: Flags.string({ default: 'src/models', description: 'Directory where to write the generated source file. Default: src/models.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(ImportLb3Models);
    if (!parsed.flags.config) return prompt('import-lb3-models', parsed.flags);
    let options = processOptions(parsed.flags);
    let configs = '';
    if (Object.keys(options).length) {
      configs = ` --config='${JSON.stringify(options)}' `;
    }
    let argument = '';
    if (parsed.args.lb3app) { argument = ` ${parsed.args.lb3app}`; }
    const command = `lb4 import-lb3-models${argument}${configs}--yes`;
    const executed: any = await execute(command, 'importing lb3 models.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
  }
}