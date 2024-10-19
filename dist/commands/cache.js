import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { Project, Scope, SyntaxKind } from 'ts-morph';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { processOptions, execute, getFiles, addDecoratorToMethod, isLoopBackApp, toKebabCase, addImport, toPascalCase, } from '../utils/index.js';
export default class Cache extends Command {
    static description = 'creating cache for endpoints';
    static flags = {
        config: Flags.string({ char: 'c', description: 'Config JSON object' }),
        redisDS: Flags.string({ description: 'redisDS' }),
        cacheTTL: Flags.string({ description: 'cacheTTL' }),
        prefix: Flags.string({ description: 'prefix to append to endpoints.' }),
        exclude: Flags.string({ description: 'exclude controllers' }),
        include: Flags.string({ description: 'include controllers' }),
    };
    async run() {
        const parsed = await this.parse(Cache);
        let options = processOptions(parsed.flags);
        let { exclude, include } = options;
        const { redisDS, cacheTTL, prefix } = options;
        const invokedFrom = process.cwd();
        console.log(chalk.blue('Confirming if this is a LoopBack 4 project.'));
        let packageJson = fs.readFileSync(`${invokedFrom}/package.json`, { encoding: 'utf8' });
        packageJson = JSON.parse(packageJson);
        if (!isLoopBackApp(packageJson))
            throw Error('Not a loopback project');
        console.log(chalk.bold(chalk.green('OK.')));
        if (exclude && include)
            throw Error('We cannot have include and exclude at the same time.');
        const datasource = toKebabCase(redisDS);
        console.log(chalk.blue('Confirming if datasource is generated...'));
        const datasourcePath = `${invokedFrom}/src/datasources/${datasource}.datasource.ts`;
        if (!fs.existsSync(datasourcePath)) {
            throw Error('Please generate the datasource first.');
        }
        console.log(chalk.bold(chalk.green('OK.')));
        if (include && exclude) {
            throw new Error('Cannot have include and exclude at the same time.');
        }
        let includings = [];
        let excludings = [];
        if (include) {
            includings = include.split(',');
        }
        if (exclude) {
            excludings = exclude.split(',');
        }
        const project = new Project({
            tsConfigFilePath: 'tsconfig.json',
            compilerOptions: { allowJs: true, checkJs: true }
        });
        const __filename = fileURLToPath(import.meta.url); // manually get __filename
        const __dirname = path.dirname(__filename); // manually get __dirname
        const deps = packageJson.dependencies;
        const pkg = '@aaqilniz/rest-cache';
        if (!deps[pkg]) {
            await execute(`npm i ${pkg}`, `Installing ${pkg}`);
        }
        const modelPath = `${invokedFrom}/src/models/cache.model.ts`;
        if (!fs.existsSync(modelPath)) {
            const modelConfigs = fs.readFileSync(path.join(__dirname, `../files/model-config.json`), { encoding: 'utf8' });
            await execute(`lb4 model -c '${modelConfigs}' --yes`, 'Creating cache model');
        }
        const repoPath = `${invokedFrom}/src/repositories/cache.repository.ts`;
        if (!fs.existsSync(repoPath)) {
            await execute(`lb4 repository -c '{"name":"Cache", "datasource":"${redisDS}", "model":"Cache", "repositoryBaseClass":"DefaultKeyValueRepository"}' --yes`, 'Creating cache repository');
        }
        const providerDir = `${invokedFrom}/src/providers`;
        if (!fs.existsSync(providerDir))
            fs.mkdirSync(providerDir);
        const providerPath = `${invokedFrom}/src/providers/cache-strategy.provider.ts`;
        if (!fs.existsSync(providerPath)) {
            console.log(chalk.blue('Creating cache provider.'));
            fs.copyFileSync(path.join(__dirname, '../files/cache-strategy.provider.txt'), providerPath);
            console.log(chalk.bold(chalk.green('OK.')));
        }
        const providerSourceFile = project.addSourceFileAtPath(providerPath);
        addImport(providerSourceFile, `${toPascalCase(redisDS)}DataSource`, '../datasources');
        const cacheProviderClass = providerSourceFile.getClass('CacheStrategyProvider');
        // datasource assignment
        const valueMethod = cacheProviderClass?.getMembers()[1];
        let valueMethodText = valueMethod?.getText();
        valueMethodText = valueMethodText
            ?.replace('/* datasource-check-and-assignment */', `if (this.${redisDS.toLowerCase()}.name === this.metadata.datasource) {
        customRepo = new CustomRepo(this.${redisDS.toLowerCase()});
      }`);
        if (valueMethodText)
            valueMethod?.replaceWithText(valueMethodText);
        const providerClassConstructors = cacheProviderClass?.getConstructors();
        if (providerClassConstructors?.length) {
            const providerClassConstructor = providerClassConstructors[0];
            if (!providerClassConstructor.getParameter(redisDS.toLowerCase())) {
                providerClassConstructor.addParameter({
                    name: redisDS.toLowerCase(),
                    type: `${toPascalCase(redisDS)}DataSource`,
                    scope: Scope.Private,
                    decorators: [{ name: 'inject', arguments: [`'datasources.${redisDS}'`] }]
                });
            }
        }
        providerSourceFile.formatText();
        const middlewareDir = `${invokedFrom}/src/middleware`;
        if (!fs.existsSync(middlewareDir))
            fs.mkdirSync(middlewareDir);
        const middlewarePath = `${invokedFrom}/src/middleware/cache.middleware.ts`;
        if (!fs.existsSync(middlewarePath)) {
            console.log(chalk.blue('Creating cache middleware.'));
            fs.copyFileSync(path.join(__dirname, '../files/cache.middleware.txt'), middlewarePath);
            console.log(chalk.bold(chalk.green('OK.')));
        }
        const applicationFilePath = `${invokedFrom}/src/application.ts`;
        const applicationFile = project.getSourceFile(applicationFilePath);
        addImport(applicationFile, 'CacheBindings, CacheComponent', '@aaqilniz/rest-cache');
        addImport(applicationFile, 'CacheStrategyProvider', './providers/cache-strategy.provider');
        addImport(applicationFile, 'CacheMiddlewareProvider', './middleware/cache.middleware');
        const applicationClasses = applicationFile?.getClasses();
        if (applicationClasses?.length) {
            const statementPosition = 2;
            const cacheStatements = [
                'this.component(CacheComponent);',
                'this.bind(CacheBindings.CACHE_STRATEGY).toProvider(CacheStrategyProvider);',
                'this.middleware(CacheMiddlewareProvider);',
            ];
            const appClassConstructor = applicationClasses[0].getConstructors()[0];
            this.addStatements(appClassConstructor, statementPosition, cacheStatements);
        }
        applicationFile?.formatText();
        // fetch and iterate through all model-endpoints files to add auth options
        const excludingObjects = {};
        const includingObjects = {};
        const modelEndpointFiles = getFiles(`./src/model-endpoints`);
        for (let i = 0; i < modelEndpointFiles.length; i++) {
            const filePath = modelEndpointFiles[i];
            const file = project.getSourceFile(filePath);
            const variables = file?.getVariableDeclarations() || [];
            for (let j = 0; j < variables.length; j++) {
                const variable = variables[j];
                const initializer = variable.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
                const properties = initializer?.getProperties() || [];
                for (let k = 0; k < properties.length; k++) {
                    const prop = properties[k];
                    if (prop.getKind() === SyntaxKind.PropertyAssignment) {
                        const propertyAssignment = prop;
                        const name = propertyAssignment.getName();
                        let value = propertyAssignment.getInitializer().getText();
                        value = value.replace(/^'|'$/g, ''); // Remove single quotes
                        if (value && prefix) {
                            value = value.replaceAll(`/${prefix}`, '');
                        }
                        if (value.startsWith('\''))
                            value = value.substring(1, value.length);
                        if (value.endsWith('\''))
                            value = value.substring(0, value.length - 1);
                        if (name === 'basePath') {
                            if (excludings.length && !excludingObjects[value]) {
                                excludingObjects[value] = { initializer };
                            }
                            if (!includings.length && !includingObjects[value]) {
                                includingObjects[value] = { initializer };
                            }
                            if (includings.length && !excludings.length) {
                                includingObjects[value] = { initializer };
                            }
                            for (let l = 0; l < includings.length; l++) {
                                let including = includings[l];
                                let includeRegex = this.constructRegex(including);
                                if (includeRegex.test(value)) {
                                    includingObjects[value]['including'] = including;
                                }
                            }
                            for (let m = 0; m < excludings.length; m++) {
                                let excluding = excludings[m];
                                const excludingRegex = this.constructRegex(excluding);
                                if (excludingRegex.test(value)) {
                                    excludingObjects[value]['excluding'] = excluding;
                                }
                            }
                        }
                    }
                }
            }
            file?.formatText();
        }
        Object.keys(excludingObjects).forEach(path => {
            const { excluding, initializer } = excludingObjects[path];
            let apiMethods = ['get', 'getById', 'count'];
            if (excluding && excluding.endsWith('count')) {
                apiMethods = apiMethods.filter(item => item !== 'count');
            }
            if (excluding && excluding.endsWith('*')) {
                apiMethods = apiMethods.filter(item => item !== 'get');
                apiMethods = apiMethods.filter(item => item !== 'count');
                apiMethods = apiMethods.filter(item => item !== 'getById');
            }
            if (excluding && excluding.endsWith('{id}')) {
                apiMethods = apiMethods.filter(item => item !== 'getById');
            }
            if (excluding &&
                !excluding.endsWith('count') &&
                !excluding.endsWith('*') &&
                !excluding.endsWith('{id}')) {
                apiMethods = apiMethods.filter(item => item !== 'get');
            }
            if (apiMethods.length) {
                this.addCacheProperty(project, initializer, apiMethods, cacheTTL, redisDS);
            }
        });
        Object.keys(includingObjects).forEach(path => {
            const { initializer, including } = includingObjects[path];
            let apiMethods = [];
            if (!including) {
                apiMethods = ['count', 'get', 'getById'];
            }
            else {
                if (including.includes('count')) {
                    apiMethods.push('count');
                }
                if (including.includes('{id}')) {
                    apiMethods.push('getById');
                }
                if (including.includes('*')) {
                    apiMethods.push('get', 'getById', 'count');
                }
                if (!including.endsWith('count') &&
                    !including.endsWith('*') &&
                    !including.endsWith('{id}')) {
                    apiMethods.push('get');
                }
            }
            if (apiMethods.length) {
                this.addCacheProperty(project, initializer, apiMethods, cacheTTL, redisDS);
            }
        });
        // fetch and iterate through all controller files to add auth decorators
        const controllerFiles = getFiles(`./src/controllers`);
        for (let i = 0; i < controllerFiles.length; i++) {
            const filePath = controllerFiles[i];
            if (filePath.includes('README') ||
                filePath.includes('index.ts') ||
                filePath.includes('ping.controller')) {
                continue;
            }
            const file = project.getSourceFile(filePath);
            addImport(file, 'cache', '@aaqilniz/rest-cache');
            let methods = file?.getClasses()[0]?.getMethods() || [];
            for (let j = 0; j < methods.length; j++) {
                const method = methods[j];
                const text = method.getText();
                if (this.isValidMethod(text)) {
                    methods.forEach(method => {
                        const operationDecorator = method.getDecorator('operation');
                        const getDecorator = method.getDecorator('get');
                        let value = '';
                        if (operationDecorator) {
                            value = operationDecorator.getArguments()[1].getText();
                        }
                        if (getDecorator) {
                            value = getDecorator.getArguments()[0].getText();
                        }
                        if (value && prefix) {
                            value = value.replaceAll(`/${prefix}`, '');
                        }
                        if (value.startsWith('\''))
                            value = value.substring(1, value.length);
                        if (value.endsWith('\''))
                            value = value.substring(0, value.length - 1);
                        let includeMatched = false;
                        let excludeMatched = false;
                        for (let j = 0; j < includings.length; j++) {
                            let including = includings[j];
                            if (including.includes('*')) {
                                including = including.replaceAll('*', '.*');
                            }
                            const includeRegex = new RegExp(`${including}\/?$`);
                            if (includeRegex.test(value)) {
                                includeMatched = true;
                            }
                        }
                        if (includeMatched) {
                            this.addCacheDecorator(method, [`'${redisDS}'`, `${cacheTTL || 60 * 1000}`]);
                        }
                        for (let j = 0; j < excludings.length; j++) {
                            let excluding = excludings[j];
                            if (excluding.includes('*')) {
                                excluding = excluding.replaceAll('*', '.*');
                            }
                            const excludingRegex = new RegExp(`${excluding}\/?$`);
                            if (!excludingRegex.test(value)) {
                                excludeMatched = true;
                            }
                        }
                        if (excludeMatched) {
                            this.addCacheDecorator(method, [`'${redisDS}'`, `${cacheTTL || 60 * 1000}`]);
                        }
                        if (!excludings.length && !includings.length) {
                            this.addCacheDecorator(method, [`'${redisDS}'`, `${cacheTTL || 60 * 1000}`]);
                        }
                    });
                }
            }
            file?.formatText();
        }
        await project.save();
    }
    addCacheDecorator(addDecoratorTo, args) {
        addDecoratorToMethod(addDecoratorTo, 'cache', args);
    }
    addStatements(addStatementsTo, statementsPosition, statements) {
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (!addStatementsTo.getText().includes(statement)) {
                addStatementsTo.insertStatements(statementsPosition, statement);
            }
        }
    }
    isValidMethod(text) {
        const items = [
            'get',
            `operation('get')`,
        ];
        let valid = false;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (text.includes(item)) {
                valid = true;
            }
        }
        return valid;
    }
    addCacheProperty(project, initializer, names, cacheTTL, dsName) {
        const cacheProperty = initializer?.getProperty('cache');
        const cacheTTLProperty = initializer?.getProperty('cacheTTL');
        const dsNameProperty = initializer?.getProperty('dsName');
        if (!cacheProperty) {
            const cacheObject = project.createSourceFile('temp.ts', `const cache = {};`, { overwrite: true })
                .getVariableDeclarationOrThrow('cache')
                .getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
            names.forEach(name => {
                cacheObject?.addPropertyAssignment({ name, initializer: 'true' });
            });
            initializer?.addPropertyAssignment({ name: 'cache', initializer: cacheObject.getText() });
        }
        if (!cacheTTLProperty) {
            initializer?.addPropertyAssignment({ name: 'cacheTTL', initializer: `${cacheTTL || 60 * 1000}` });
        }
        if (!dsNameProperty) {
            initializer?.addPropertyAssignment({ name: 'dsName', initializer: `'${dsName}'` });
        }
    }
    constructRegex(input) {
        let regexString = '';
        if (input.includes('count')) {
            regexString = input.split('count')[0];
        }
        else if (input.includes('{id}')) {
            regexString = input.split('{id}')[0];
        }
        else {
            regexString = input;
        }
        if (input.includes('*')) {
            regexString = regexString.replaceAll('/*', '*');
            regexString = regexString.replaceAll('*', '.*');
        }
        if (regexString.endsWith('/')) {
            regexString = regexString.substring(0, regexString.length - 1);
        }
        return new RegExp(`${regexString}\/?$`);
    }
}
