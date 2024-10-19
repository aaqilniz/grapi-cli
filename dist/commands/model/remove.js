import { Command, Flags } from '@oclif/core';
import { Project } from 'ts-morph';
import chalk from 'chalk';
import fs from 'fs';
import { processOptions, toKebabCase, execute } from '../../utils/index.js';
export default class ModelRemove extends Command {
    static description = 'enable adding property to loopoback 4 models';
    static flags = {
        config: Flags.string({ char: 'c', description: 'Config JSON object' }),
        model: Flags.string({ char: 'n', description: 'name of the model to remove.' }),
    };
    async run() {
        const { flags } = await this.parse(ModelRemove);
        const { model } = processOptions(flags);
        const project = new Project({});
        const invokedFrom = process.cwd();
        project.addSourceFilesAtPaths(`${invokedFrom}/src/**/*.ts`);
        const modelIndexPath = `${invokedFrom}/src/models/index.ts`;
        const repoIndexPath = `${invokedFrom}/src/repositories/index.ts`;
        const modelIndexFile = project.getSourceFile(modelIndexPath);
        if (!modelIndexFile) {
            throw new Error('the model index file doesn\'t exist.');
        }
        const modelExports = modelIndexFile.getExportDeclarations();
        modelExports.forEach(modelExport => {
            if (modelExport.getText().includes(model.toLowerCase())) {
                modelExport.remove();
                fs.unlinkSync(`${invokedFrom}/src/models/${toKebabCase(model)}.model.ts`);
            }
        });
        const repoIndexFile = project.getSourceFile(repoIndexPath);
        if (!repoIndexFile) {
            throw new Error('the repo index file doesn\'t exist.');
        }
        const repoExports = repoIndexFile.getExportDeclarations();
        repoExports.forEach(repoExport => {
            if (repoExport.getText().includes(model.toLowerCase())) {
                repoExport.remove();
                fs.unlinkSync(`${invokedFrom}/src/repositories/${toKebabCase(model)}.repository.ts`);
            }
        });
        fs.unlinkSync(`${invokedFrom}/src/model-endpoints/${toKebabCase(model)}.rest-config.ts`);
        await project.save();
        let command = 'npm run rebuild && npm run migrate';
        let executed = await execute(command, 'building the project and migrating models');
        if (executed.stderr)
            console.log(chalk.bold(chalk.green(executed.stderr)));
        if (executed.stdout)
            console.log(chalk.bold(chalk.green(executed.stdout)));
        console.log(chalk.bold(chalk.green('successfully built the project and migrated models.')));
    }
}
