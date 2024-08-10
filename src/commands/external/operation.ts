import { Command, Flags } from '@oclif/core'
import chalk from 'chalk';
import fs from 'fs';

import { processOptions, toPascalCase, toKebabCase, execute, addImport } from '../../utils/index.js';
import { Project, SyntaxKind, PropertyAssignment, ObjectLiteralExpression, ArrayLiteralExpression, SourceFile, ClassDeclaration, MethodDeclaration, ParameterDeclaration, OptionalKind, ParameterDeclarationStructure } from 'ts-morph';
import pluralize from 'pluralize';

export default class ExternalOperation extends Command {

  static override description = 'adding auth to loopback 4 application.'

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    ds: Flags.string({ description: 'datasource name to attach APIs to.' }),
    method: Flags.string({ description: 'api method type.' }),
    bodyParams: Flags.string({ description: 'Stringified JSON Object for request body.' }),
    pathParams: Flags.string({ description: 'Stringified JSON Object for path parameter.' }),
    url: Flags.string({ description: 'url of the external api.' }),
    headers: Flags.string({ description: 'Stringified JSON Object for headers.' }),
    query: Flags.string({ description: 'Stringified JSON Object for query parameters.' }),
    apiFunction: Flags.string({ description: 'api function name.' }),
    name: Flags.string({ description: 'name of the artifacts.' }),
    apiUri: Flags.string({ description: 'uri of the controller.' }),
    type: Flags.string({ description: 'type of return data.' }),
    controller: Flags.string({ description: 'controller under which the API should reside.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(ExternalOperation);
    let optionsArray = processOptions(parsed.flags);
    if (!Array.isArray(optionsArray)) { optionsArray = [optionsArray]; };

    for (let i = 0; i < optionsArray.length; i++) {
      const options = optionsArray[i];

      const {
        ds,
        url,
        headers,
        apiFunction,
        type,
        controller,
        apiUri
      } = options;
      let {
        method,
        pathParams,
        bodyParams,
        queryParams,
        name,
      } = options;

      if (!pathParams) pathParams = {};

      let functionName = name;
      let artifactName = functionName;

      const pathKey = Object.keys(pathParams)[0];

      let queryParamList: string[] = [];
      let bodyParamList: string[] = [];
      // let functionName = apiFunction.toLowerCase();
      let serviceName = toPascalCase(controller);
      let modelName = toPascalCase(artifactName);
      let controllerName = toPascalCase(controller);
      // let modelName = toPascalCase(apiFunction);
      let description = '';

      if (!method) method = 'get';
      switch (method.toLowerCase()) {
        case 'get':
          // functionName = `fetch${toPascalCase(functionName)}`;
          description = `fetch${pathKey ? '' : ' all'} ${toPascalCase(functionName)}.`
          break;
        case 'post':
          // functionName = `create${toPascalCase(functionName)}`;
          description = `create ${toPascalCase(functionName)}.`
          break;
        case 'patch':
          // functionName = `update${toPascalCase(functionName)}`;
          description = `update ${toPascalCase(functionName)}.`
          break;
        case 'put':
          // functionName = `replace${toPascalCase(functionName)}`;
          description = `replace ${toPascalCase(functionName)}.`
          break;
        case 'del':
          // functionName = `delete${toPascalCase(functionName)}`;
          description = `delete ${toPascalCase(functionName)}`;
          break;
        default:
          break;
      }
      // if (pathKey) functionName += 'ById';
      if (!queryParams) { queryParams = []; }
      queryParams.forEach((eachParam: any) => {
        Object.keys(eachParam).forEach(key => { queryParamList.push(key); });
      });
      if (bodyParams) {
        bodyParams.forEach((eachParam: any) => {
          Object.keys(eachParam).forEach(key => { bodyParamList.push(key); });
        });
      }

      const project = new Project({});
      const invokedFrom = process.cwd();

      project.addSourceFilesAtPaths(`${invokedFrom}/src/**/*.ts`);
      const restBasedDS = fs.existsSync(`./src/datasources/${ds}.datasource.ts`);

      if (!restBasedDS) {
        throw new Error(`the ${ds} doesn't exist.`);
      }
      const dsPath = `${invokedFrom}/src/datasources/${ds}.datasource.ts`;
      const dsFile = project.getSourceFile(dsPath);
      const configVariable = dsFile?.getVariableDeclarationOrThrow('config')!;
      const initializer = configVariable.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression) as ObjectLiteralExpression;

      const connectorProperty = initializer?.getProperty('connector')!;
      if (!connectorProperty.getText().includes('\'rest\'')) {
        throw new Error(`the ${ds} is not a rest based datasource.`);
      }

      const operationsProperty = initializer.getPropertyOrThrow('operations') as PropertyAssignment;
      const operationsArray = operationsProperty.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression) as ArrayLiteralExpression;
      let operationExists = false;
      operationsArray.getElements().forEach(element => {
        if (element.getText().includes(method) && element.getText().includes(url)) {
          operationExists = true;
        }
      });

      if (operationExists) {
        throw new Error(`operation ${method} ${url} already exists.`);
      }

      let query = '';
      let body = '';
      let path = '';
      let functionParams = '';

      queryParamList.forEach((key: string) => { query += `${key}: '{${key}}', `; });
      // if (bodyParamList.length) body = `body: '{body}', `;
      bodyParamList.forEach((key: string) => { body += `${key}: '{${key}}', `; });

      if (pathKey) path = `${pathKey}: '{${pathKey}}'`;

      queryParamList.forEach((key: string) => { functionParams += `'${key}',`; });

      if (bodyParamList.length) {
        bodyParamList.forEach((key: string) => { functionParams += `'${key}',`; });
      }
      Object.keys(pathParams).forEach((key: string) => { functionParams += `'${key}',`; });

      let operation = `{
        template: {
          method: '${method === 'del' ? 'delete' : method}',
          url: '${url}',
          ${headers ? `options: {headers: ${headers}},` : ''}
          ${query ? `query: {${query}},` : ''}
          ${body ? `body: {${body}},` : ''}
          ${path ? `path: {${path}},` : ''}
        },
        functions: {${apiFunction}: [${functionParams}]}
      }`;

      let lines = operation.split('\n').filter(line => line.trim() !== '');
      operation = lines.join('\n');

      operationsArray.addElement(operation);
      dsFile?.formatText();

      let serviceParams = '';

      let parameters: OptionalKind<ParameterDeclarationStructure>[] = [];
      if (pathKey) {
        parameters.push({
          name: pathKey,
          type: pathParams[pathKey],
          decorators: [{
            name: `param.path.${pathParams[pathKey]}`,
            arguments: [`'${pathKey}'`]
          }]
        })
      }
      queryParams.forEach((param: any) => {
        Object.keys(param).forEach(key => {
          parameters.push({
            name: key,
            type: param[key],
            decorators: [{
              name: `param.query.${param[key]}`,
              arguments: [`'${key}'`]
            }]
          });
          serviceParams += `${key}: ${param[key]},`;
        });
      });


      const controllerFilePath = `${invokedFrom}/src/controllers/${toKebabCase(controllerName)}.controller.ts`;
      let controllerFile = project.getSourceFile(controllerFilePath);
      const model = fs.existsSync(`./src/models/${toKebabCase(modelName)}.model.ts`);

      if (body) {
        const properties: { [x: string]: object } = {};
        const parameter = {
          name: 'body',
          type: 'any',
          decorators: [{
            name: 'requestBody()',
          }]
        }
        if (type) parameter.type = type;

        parameters.push(parameter);

        addImport(controllerFile, modelName, '../models', true);

        if (!bodyParams) bodyParams = [];

        bodyParams.forEach((bodyParam: any) => {
          Object.keys(bodyParam).forEach(key => {
            properties[key] = { type: bodyParam[key] }
            serviceParams += `${key}: ${bodyParam[key]} | undefined,`;
          });
        });


        if (!model) {
          const configs = {
            base: 'Entity',
            name: modelName,
            properties
          };
          const stringifiedConfigs = JSON.stringify(configs);
          let command = `lb4 model --config='${stringifiedConfigs}' --yes`;
          let executed: any = await execute(command, 'generating models.');
          if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
          if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
        }

      }

      if (pathKey) {
        serviceParams += `${pathKey}: ${pathParams[pathKey]}`;
      }

      const existingController = fs.existsSync(`./src/controllers/${toKebabCase(controllerName)}.controller.ts`);
      if (!existingController) {
        let command = `lb4 controller --config='{"name": "${controllerName}"}' --yes`;
        let executed: any = await execute(command, 'generating controller.');
        if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
        if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
      }

      project.addSourceFilesAtPaths(`${invokedFrom}/src/**/*.ts`);

      controllerFile = project.getSourceFile(controllerFilePath);
      if (controllerFile) {
        addImport(controllerFile, `${(method).toLowerCase()}`, '@loopback/rest', true);
        addImport(controllerFile, `requestBody, getModelSchemaRef, param`, '@loopback/rest', true);
        addImport(controllerFile, 'inject', '@loopback/core');
        addImport(controllerFile, `${serviceName} as ${serviceName}Service`, '../services');

        // Find all class declarations within the source file
        const classDeclaration = controllerFile?.getClass(`${toPascalCase(controllerName)}Controller`);
        const classConstructors = classDeclaration?.getConstructors() || [];
        let apiMethod = classDeclaration?.getMethod(functionName.toLowerCase());
        if (!apiMethod) {
          let responses = `{
            responses: {
              '200': {
                description: '${description}',
                content: {'application/json': {schema: ${model ? `{type: 'array', items: getModelSchemaRef(${modelName})}` : '{}'}}},
              },
            },
          }`;
          let methodParameters = queryParamList.toString();
          if (body) {
            bodyParamList.forEach(bodyParam => {
              methodParameters += `body.${bodyParam},`;
            });
            // methodParameters = bodyParamList.toString();
          }
          if (pathKey) {
            if (
              methodParameters &&
              !methodParameters.endsWith(',')) {
              methodParameters += ','
            }
            methodParameters += `${pathKey}`;
          }

          let methodStructure = {
            name: apiFunction,
            parameters,
            statements: [`return this.service.${apiFunction}(${methodParameters});`],
            isAsync: true,
            decorators: [
              {
                name: (method).toLowerCase(),
                arguments: [`'${apiUri}'`, responses]
              }
            ],
            returnType: `Promise<any>`
          }

          classDeclaration?.addMethod(methodStructure);
        }
        apiMethod = classDeclaration?.getMethod(functionName.toLowerCase());

        if (!classConstructors[0].getParameter('service')) {
          classConstructors[0].insertParameter(0, {
            name: `protected service`,
            type: `${serviceName}Service`,
            decorators: [
              {
                name: 'inject',
                arguments: [`'services.${serviceName}'`]
              }
            ]
          });
        }
      }
      controllerFile?.formatText();
      controllerFile?.saveSync();

      const service = fs.existsSync(`./src/services/${toKebabCase(serviceName)}.service.ts`);

      if (!service) {
        let command = `lb4 service --config='{"type":"proxy", "name": "${serviceName}"}' --yes`;
        let executed: any = await execute(command, 'generating service.');
        if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
        if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
      }

      project.addSourceFilesAtPaths(`${invokedFrom}/src/**/*.ts`);
      const serviceFilePath = `${invokedFrom}/src/services/${toKebabCase(serviceName)}.service.ts`;
      let serviceFile = project.getSourceFile(serviceFilePath);
      const serviceInterface = serviceFile?.getInterface(serviceName);
      serviceInterface?.addMember(`${apiFunction}(${serviceParams}): Promise<object>;`);
      serviceFile?.formatText();
      serviceFile?.saveSync();
      dsFile?.saveSync();
    }

  }
}