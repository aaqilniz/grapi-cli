import {Command, Flags} from '@oclif/core'
import { Project } from 'ts-morph';
import chalk from 'chalk';
import fs from 'fs';
import { execute, isLoopBackApp, processOptions } from '../utils/index.js';

export default class Authorization extends Command {

  static override description = 'add authorization layer.';

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    acls: Flags.string({ description: 'array of acls.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Authorization)
    let options = processOptions(parsed.flags);
    const { acls } = options;
    console.log(acls);
    const project = new Project({
      tsConfigFilePath: 'tsconfig.json',
      compilerOptions: { allowJs: true, checkJs: true }
    });
    const invokedFrom = process.cwd();

    console.log(chalk.blue('Confirming if this is a LoopBack 4 project.'));
    let packageJson: any = fs.readFileSync(`${invokedFrom}/package.json`, { encoding: 'utf8' })
    packageJson = JSON.parse(packageJson);

    if (!isLoopBackApp(packageJson)) throw Error('Not a loopback project');
    console.log(chalk.bold(chalk.green('OK.')));

    const deps = packageJson.dependencies;
    const pkg = '@loopbacl/authorization';
    if (!deps[pkg]) { await execute(`npm i ${pkg}`, `Installing ${pkg}`); }
  }
}
