import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { processOptions, execute } from '../../utils/index.js';
export default class UpdateModel extends Command {
    static description = 'enable updating loopoback 4 models';
    static flags = {
        config: Flags.string({ char: 'c', description: 'Config JSON object' }),
        name: Flags.string({ char: 'n', description: 'name of the model' }),
        datasource: Flags.string({ description: 'name of the datasource' }),
        base: Flags.string({ description: 'base of the model.' }),
        properties: Flags.string({ description: 'stringigied object of model properties.' }),
    };
    async run() {
        const { flags } = await this.parse(UpdateModel);
        const { name, datasource, base, properties } = processOptions(flags);
        let modelConfigs = { name, base, properties };
        let repoConfigs = { datasource, model: name };
        let command = `lb4 model --config '${JSON.stringify(modelConfigs)}' --yes`;
        let executed = await execute(command, 'building models.');
        if (executed.stderr)
            console.log(chalk.bold(chalk.green(executed.stderr)));
        if (executed.stdout)
            console.log(chalk.bold(chalk.green(executed.stdout)));
        command = `lb4 repository --config '${JSON.stringify(repoConfigs)}' --yes && npm run migrate`;
        executed = await execute(command, 'generating repo and migrating the newly created model.');
        if (executed.stderr)
            console.log(chalk.bold(chalk.green(executed.stderr)));
        if (executed.stdout)
            console.log(chalk.bold(chalk.green(executed.stdout)));
        console.log(chalk.bold(chalk.green('successfully generated repo and migrated the newly created model.')));
        command = `lb4 rest-crud --config '${JSON.stringify(repoConfigs)}' --yes`;
        executed = await execute(command, 'generating crud apis for newly created model.');
        if (executed.stderr)
            console.log(chalk.bold(chalk.green(executed.stderr)));
        if (executed.stdout)
            console.log(chalk.bold(chalk.green(executed.stdout)));
        console.log(chalk.bold(chalk.green('successfully generated crud apis for newly created model.')));
    }
}
