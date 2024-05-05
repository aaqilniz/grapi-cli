import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute, standardFlags } from '../utils/index.js';

export default class Extension extends Command {
  static override description = 'generate extension.';
  static override args = {
    name: Args.string({ description: 'Optional name of the extension given as an argument to the command.', }),
  };

  static override flags = {
    ...standardFlags,
    description: Flags.string({ description: 'project root directory for the extension.' }),
    outDir: Flags.string({ description: 'Project root directory for the extension.' }),
    eslint: Flags.boolean({ description: 'Add ESLint to LoopBack4 extension project.' }),
    prettier: Flags.boolean({ description: 'Add Prettier to LoopBack4 extension project.' }),
    mocha: Flags.boolean({ description: 'Add Mocha to LoopBack4 extension projectAdd @loopback/build module’s script set to LoopBack4 extension project.' }),
    loopbackBuild: Flags.boolean({ description: 'Add @loopback/build module’s script set to LoopBack4 extension project.' }),
    vscode: Flags.boolean({ description: 'Add VSCode config files to LoopBack4 application project.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Extension);
    let options = processOptions(parsed.flags);
    let configs = '';
    if (Object.keys(options).length) {
      configs = ` --config='${JSON.stringify(options)}' `;
    }
    let argument = '';
    if (parsed.args.name) { argument = ` ${parsed.args.name}`; }
    const command = `lb4 extension${argument}${configs}--yes`;
    const executed: any = await execute(command, 'generating extension.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
  }
}
