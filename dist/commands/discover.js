import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { processOptions, execute, standardFlags, prompt } from '../utils/index.js';
export default class Discover extends Command {
    static description = 'discover models.';
    static args = {
        url: Args.string({ description: 'URL or file path of the OpenAPI spec. Type: String. Required: false.', }),
    };
    static flags = {
        ...standardFlags,
        dataSource: Flags.string({ description: 'Put a valid datasource name here to skip the datasource prompt.' }),
        views: Flags.boolean({ default: true, description: 'Choose whether to discover views.' }),
        relations: Flags.boolean({ default: false, description: 'Choose whether to create relations.' }),
        all: Flags.boolean({ default: false, description: 'Skips the model prompt and discovers all of them.' }),
        outDir: Flags.string({ default: undefined, description: 'Specify the directory into which the model.model.ts files will be placed. Default is src/models.' }),
        schema: Flags.string({ description: 'Specify the schema which the datasource will find the models to discover.' }),
        models: Flags.string({ description: 'Specify the models to be generated e.g:–models=table1,table2.' }),
        optionalId: Flags.boolean({ default: false, description: 'Specify if the Id property of generated models will be marked as not required.' }),
        connectorDiscoveryOptions: Flags.string({ description: 'Pass the options to the connectors.' }),
    };
    async run() {
        const parsed = await this.parse(Discover);
        if (!parsed.flags.config)
            return prompt('discover', parsed.flags);
        let options = processOptions(parsed.flags);
        let configs = '';
        if (Object.keys(options).length) {
            configs = ` --config='${JSON.stringify(options)}' `;
        }
        let argument = '';
        if (parsed.args.url) {
            argument = ` ${parsed.args.url}`;
        }
        const command = `lb4 discover${argument}${configs}--yes`;
        const executed = await execute(command, 'discovering models.');
        if (executed.stderr)
            console.log(chalk.bold(chalk.green(executed.stderr)));
        if (executed.stdout)
            console.log(chalk.bold(chalk.green(executed.stdout)));
    }
}
