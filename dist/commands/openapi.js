import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { processOptions, execute, standardFlags, prompt } from '../utils/index.js';
import Cache from './cache.js';
import Datasource from './datasource.js';
export default class Openapi extends Command {
    static description = 'generate openapi based apis.';
    static args = {
        url: Args.string({ description: 'URL or file path of the OpenAPI spec. Type: String. Required: false.', }),
    };
    static flags = {
        ...standardFlags,
        url: Flags.string({ description: 'URL or file path of the OpenAPI spec.' }),
        validate: Flags.boolean({ default: false, description: 'Validate the OpenAPI spec.' }),
        ['promote-anonymous-schemas']: Flags.boolean({ default: false, description: 'Promote anonymous schemas as models classes.' }),
        client: Flags.boolean({ default: false, description: 'Generate client-side service proxies and controllers with implementation for the OpenAPI spec.' }),
        datasource: Flags.string({ description: 'A valid datasource name.' }),
        redisDS: Flags.string({ description: 'Stringified object of redis DS configs.' }),
        cache: Flags.string({ description: 'Stringified object of cache configs.' }),
        positional: Flags.boolean({ default: true, description: 'A flag to control if service methods use positional parameters or an object with named properties.' }),
    };
    async run() {
        const parsed = await this.parse(Openapi);
        if (!parsed.flags.config)
            return prompt('openapi', parsed.flags);
        let options = processOptions(parsed.flags);
        const { redisDS, cache } = options;
        delete options.redisDS;
        delete options.cache;
        let configs = '';
        if (Object.keys(options).length) {
            configs = ` --config='${JSON.stringify(options)}' `;
        }
        let argument = '';
        if (parsed.args.url) {
            argument = ` ${parsed.args.url}`;
        }
        const command = `lb4 openapi${argument}${configs}--yes`;
        const executed = await execute(command, 'generating service.');
        if (executed.stderr)
            console.log(chalk.bold(chalk.green(executed.stderr)));
        if (executed.stdout)
            console.log(chalk.bold(chalk.green(executed.stdout)));
        // generate redis datasource
        if (redisDS) {
            if (executed.stdout)
                console.log(chalk.bold(chalk.blue('generating cache datasources')));
            await Datasource.run([
                `--config=${JSON.stringify(redisDS)}`
            ]);
            console.log(chalk.bold(chalk.blue('generated cache datasources')));
        }
        if (executed.stdout)
            console.log(chalk.bold(chalk.blue('generating cache generator')));
        // generate cache artifacts
        if (cache) {
            cache.redisDS = redisDS.name;
            if (options.prefix) {
                cache.prefix = options.prefix;
            }
            await Cache.run([`--config=${JSON.stringify(cache)}`]);
            console.log(chalk.bold(chalk.blue('generated cache generator')));
        }
    }
}
