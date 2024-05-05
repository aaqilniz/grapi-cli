import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk';
import { AppGeneratorFlags } from '../types/app.types.js';

import { processOptions, execute, standardFlags } from '../utils/index.js';

export default class App extends Command {
  static override description = 'generate application.'
  static override args = {
    name: Args.string({ description: 'name of the application.', required: true }),
  };

  static override flags = {
    ...standardFlags,
    applicationName: Flags.string({ description: 'Application class name.' }),
    description: Flags.string({ description: 'Description of the application.' }),
    outdir: Flags.string({ description: 'Project root directory for the application.' }),
    eslint: Flags.boolean({ description: 'Add ESLint to LoopBack4 application project.' }),
    prettier: Flags.boolean({ description: 'Add Prettier to LoopBack4 application project.' }),
    mocha: Flags.boolean({ description: 'Add Mocha to LoopBack4 application project.' }),
    loopbackBuild: Flags.boolean({ description: 'Add @loopback/build module’s script set to LoopBack4 application project.' }),
    vscode: Flags.boolean({ description: 'Add VSCode config files to LoopBack4 application project' }),
    docker: Flags.boolean({ description: 'Generate Dockerfile and add npm scripts to build/run the project in a docker container.' }),
    repositories: Flags.boolean({ description: 'include repository imports and RepositoryMixin.' }),
    services: Flags.boolean({ description: 'include service-proxy imports and ServiceMixin.' }),
    apiconnect: Flags.boolean({ description: 'Include ApiConnectComponent.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(App);
    let options: AppGeneratorFlags = processOptions(parsed.flags);
    if (!options.applicationName) {
      options.applicationName = parsed.args.name;
    }
    let configs = '';
    if (Object.keys(options).length) {
      configs = `--config='${JSON.stringify(options)}' `;
    }
    const command = `lb4 ${parsed.args.name} ${configs}--yes`;
    const executed: any = await execute(command, 'generating application.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
  }
}
