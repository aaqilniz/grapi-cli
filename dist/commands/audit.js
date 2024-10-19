import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { processOptions, execute, standardFlags, toPascalCase, addImport, getFiles } from '../utils/index.js';
import { Project, Scope, SyntaxKind, VariableDeclarationKind } from 'ts-morph';
import fs from 'fs';
export default class Audit extends Command {
    static description = 'generate audit artifacts.';
    static args = {
        name: Args.string({ description: 'name of the datasource.' }),
    };
    static flags = {
        ...standardFlags,
        connector: Flags.string({ description: 'Name of datasource connector.' }),
    };
    async run() {
        const parsed = await this.parse(Audit);
        let options = processOptions(parsed.flags);
        const ds = options.name;
        let configs = '';
        if (Object.keys(options).length) {
            configs = ` --config='${JSON.stringify(options)}' `;
        }
        let argument = '';
        if (parsed.args.name) {
            argument = ` ${parsed.args.name}`;
        }
        const command = `lb4 datasource${argument}${configs}--yes && npm run build`;
        const auditDS = fs.existsSync(`./src/datasources/${ds}.datasource.ts`);
        if (!auditDS) {
            const executed = await execute(command, 'generating audit datasource.');
            if (executed.stderr)
                console.log(chalk.bold(chalk.green(executed.stderr)));
            if (executed.stdout)
                console.log(chalk.bold(chalk.green(executed.stdout)));
        }
        const project = new Project({});
        const invokedFrom = process.cwd();
        project.addSourceFilesAtPaths(`${invokedFrom}/src/**/*.ts`);
        const dsPath = `${invokedFrom}/src/datasources/${ds}.datasource.ts`;
        const dsFile = project.getSourceFile(dsPath);
        const dsClass = dsFile?.getClass(`${toPascalCase(ds)}DataSource`);
        const dataSourceName = dsClass.getStaticMember('dataSourceName');
        const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        if (!pkg.dependencies['@sourceloop/audit-log']) {
            const executed = await execute('npm i @sourceloop/audit-log', 'installing dep.');
            if (executed.stderr) {
                console.log(chalk.bold(chalk.green(executed.stderr)));
            }
            if (executed.stdout) {
                console.log(chalk.bold(chalk.green(executed.stdout)));
            }
        }
        addImport(dsFile, 'AuditDbSourceName', '@sourceloop/audit-log');
        if (dataSourceName && dataSourceName.getKind() === SyntaxKind.PropertyDeclaration) {
            const propertyDeclaration = dataSourceName.asKindOrThrow(SyntaxKind.PropertyDeclaration);
            propertyDeclaration.setInitializer(`AuditDbSourceName`); // Set new value
        }
        dsFile?.formatText();
        dsFile?.saveSync();
        const auditModel = fs.existsSync(`./src/models/audit-log.model.ts`);
        if (!auditModel) {
            const discoverAuditModel = `lb4 discover --config '{"models":"audit_log","schema":"audit"}' --yes`;
            console.log(discoverAuditModel);
            const executed = await execute(discoverAuditModel, 'discovering audit model.');
            if (executed.stderr)
                console.log(chalk.bold(chalk.green(executed.stderr)));
            if (executed.stdout)
                console.log(chalk.bold(chalk.green(executed.stdout)));
            const auditModelPath = `${invokedFrom}/src/models/audit-log.model.ts`;
            project.addSourceFilesAtPaths(`${invokedFrom}/src/**/*.ts`);
            const auditModelFile = project.getSourceFile(auditModelPath);
            const auditModeClass = auditModelFile?.getClass('AuditLog');
            const property = auditModeClass?.getMember('action');
            if (property && property.getKind() === SyntaxKind.PropertyDeclaration) {
                const propertyDeclaration = property.asKindOrThrow(SyntaxKind.PropertyDeclaration);
                propertyDeclaration.setType('Action');
            }
            addImport(auditModelFile, 'Action', '@sourceloop/audit-log');
            auditModelFile?.formatText();
            auditModelFile?.saveSync();
        }
        const auditRepo = fs.existsSync(`./src/repositories/audit-log.repository.ts`);
        if (!auditRepo) {
            const repoCommand = `lb4 repository -c '{"model":"audit_log","repositoryBaseClass":"DefaultCrudRepository", "datasource": "audit"}' --yes`;
            const executed = await execute(repoCommand, 'generating audit repo.');
            if (executed.stderr)
                console.log(chalk.bold(chalk.green(executed.stderr)));
            if (executed.stdout)
                console.log(chalk.bold(chalk.green(executed.stdout)));
            const auditRepoPath = `${invokedFrom}/src/repositories/audit-log.repository.ts`;
            project.addSourceFilesAtPaths(`${invokedFrom}/src/**/*.ts`);
            const auditRepoFile = project.getSourceFile(auditRepoPath);
            const auditRepoClass = auditRepoFile?.getClass('AuditLogRepository');
            const constructor = auditRepoClass?.getConstructors()[0];
            const parameters = constructor?.getParameters();
            parameters?.forEach(param => {
                const injectDecorator = param.getDecorator('inject');
                if (injectDecorator) {
                    const argument = injectDecorator.getArguments()[0];
                    if (argument && argument.getKind() === SyntaxKind.StringLiteral && argument.getText() === `'datasources.audit'`) {
                        argument.replaceWithText('`datasources.${AuditDbSourceName}`');
                    }
                }
            });
            addImport(auditRepoFile, 'AuditDbSourceName', '@sourceloop/audit-log');
            auditRepoFile?.formatText();
            auditRepoFile?.saveSync();
        }
        const repositoryFiles = getFiles(`./src/repositories`);
        for (let i = 0; i < repositoryFiles.length; i++) {
            const filePath = repositoryFiles[i];
            if (!filePath.includes('index.ts') &&
                !filePath.includes('audit-log.repository.ts')) {
                const file = project.getSourceFile(filePath);
                const repoClass = file?.getClasses()[0];
                const extendings = repoClass?.getExtends();
                const constructor = repoClass?.getConstructors()[0];
                if (extendings) {
                    const typeArguments = extendings.getTypeArguments();
                    const modelType = typeArguments[0]?.getText();
                    const idType = typeArguments[1]?.getText();
                    const relationsType = typeArguments[2]?.getText();
                    constructor?.getStatements()[0].replaceWithText(`super(${modelType}, dataSource, getCurrentUser);`);
                    const existingInterface = file?.getInterface('IAuthUser');
                    if (!existingInterface) {
                        file?.insertInterface(4, {
                            name: 'IAuthUser',
                            properties: [
                                {
                                    name: 'id',
                                    type: 'number | string',
                                    hasQuestionToken: true,
                                },
                                {
                                    name: 'username',
                                    type: 'string',
                                    hasQuestionToken: false,
                                },
                                {
                                    name: 'password',
                                    type: 'string',
                                    hasQuestionToken: true,
                                },
                            ]
                        });
                    }
                    const existingVar = file?.getVariableDeclaration('archivedRapportAuditOpts');
                    if (!existingVar) {
                        file?.insertVariableStatement(5, {
                            declarationKind: VariableDeclarationKind.Const,
                            declarations: [
                                {
                                    name: 'options',
                                    initializer: `{
                  actionKey: '${modelType}_Log',
                } as IAuditMixinOptions`,
                                },
                            ],
                        });
                    }
                    repoClass?.setExtends(`
          AuditRepositoryMixin<
            ${modelType},
            ${idType},
            ${relationsType},
            string | number,
            Constructor<DefaultCrudRepository<${modelType},${idType},${relationsType}>>
            >(DefaultCrudRepository, options)
          `);
                }
                addImport(file, 'AuditRepositoryMixin, IAuditMixinOptions, AuditLogRepository', '@sourceloop/audit-log');
                addImport(file, 'Constructor, Getter', '@loopback/core', true);
                addImport(file, 'repository', '@loopback/repository', true);
                constructor?.addParameters([
                    {
                        scope: Scope.Public,
                        name: 'getCurrentUser',
                        type: `Getter<IAuthUser>`,
                        decorators: [
                            {
                                name: 'inject.getter',
                                arguments: [`'security.user'`],
                            },
                        ],
                    },
                    {
                        scope: Scope.Public,
                        name: 'getAuditLogRepository',
                        type: `Getter<AuditLogRepository>`,
                        decorators: [
                            {
                                name: 'repository.getter',
                                arguments: [`'AuditLogRepository'`],
                            },
                        ],
                    },
                ]);
                file?.formatText();
                file?.saveSync();
            }
        }
    }
}
