import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { processOptions, execute, standardFlags, prompt } from '../utils/index.js';
export default class Update extends Command {
    static description = 'update application dependencies.';
    static flags = {
        ...standardFlags,
        semver: Flags.string({ description: 'Use semver semantics to check version compatibility for project dependencies of LoopBack modules.' }),
    };
    async run() {
        const parsed = await this.parse(Update);
        if (!parsed.flags.config)
            return prompt('update', parsed.flags);
        let options = processOptions(parsed.flags);
        let configs = '';
        if (Object.keys(options).length) {
            configs = ` --config='${JSON.stringify(options)}' `;
        }
        const command = `lb4 update${configs}--yes`;
        const executed = await execute(command, 'updating the application dependencies.');
        if (executed.stderr)
            console.log(chalk.bold(chalk.green(executed.stderr)));
        if (executed.stdout)
            console.log(chalk.bold(chalk.green(executed.stdout)));
    }
}
