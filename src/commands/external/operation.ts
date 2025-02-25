import { Command, Flags } from '@oclif/core'
import chalk from 'chalk';
import fs from 'fs';

import { processOptions, toPascalCase, toKebabCase, execute, addImport } from '../../utils/index.js';
import { Project, SyntaxKind, PropertyAssignment, ObjectLiteralExpression, ArrayLiteralExpression, OptionalKind, ParameterDeclarationStructure, EnumMember } from 'ts-morph';

export default class ExternalOperation extends Command {

  static override description = 'creating rest endpoints based on configs only.'

  static override flags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    ds: Flags.string({ description: 'datasource name to attach APIs to.' }),
    controller: Flags.string({ description: 'controller under which the API should reside.' }),
    method: Flags.string({ description: 'api method type.' }),
    url: Flags.string({ description: 'url of the external api.' }),
    bodyParams: Flags.string({ description: 'Stringified JSON Object for request body.' }),
    createModel: Flags.boolean({ description: 'generate the model.' }),
    additionalProperties: Flags.string({ description: 'stringified additional model properties.' }),
    apiFunction: Flags.string({ description: 'api function name.' }),
    pathParams: Flags.string({ description: 'Stringified JSON Object for path parameter.' }),
    queryParams: Flags.string({ description: 'Stringified JSON Object for query parameters.' }),
    headers: Flags.string({ description: 'Stringified JSON Object for headers.' }),
    apiUri: Flags.string({ description: 'uri of the controller.' }),
    responses: Flags.string({ description: 'Stringified JSON Object for responses.' }),
    description: Flags.string({ description: 'Description of request.' }),
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
        createModel,
        additionalProperties,
        apiFunction,
        headers,
      } = options;
      let {
        method,
        controller,
        modelName,
        requestModelName,
        pathParams,
        bodyParams,
        queryParams,
        apiUri,
        responses,
        spliter,
        description,
      } = options;

      if (!method) method = 'get';
      method = method.toLowerCase();

      const project = new Project({});
      const invokedFrom = process.cwd();
      project.addSourceFilesAtPaths(`${invokedFrom}/src/**/*.ts`);

      const dsPath = `${invokedFrom}/src/datasources/${ds}.datasource.ts`;

      const restBasedDS = fs.existsSync(dsPath);
      if (!restBasedDS) throw new Error(`the ${ds} doesn't exist.`);

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

      if (!spliter && !apiUri) spliter = 'v1';
      if (spliter) apiUri = url.split(spliter)[1];

      if (!pathParams) pathParams = {};

      const pathKey = Object.keys(pathParams)[0];
      let queryParamList: string[] = [];
      let bodyParamList: string[] = [];
      let serviceName = toPascalCase(controller);

      modelName = toPascalCase(modelName);
      controller = toPascalCase(controller);

      if (!description) {

        switch (method) {
          case 'get':
            description = `fetch${pathKey ? '' : ' all'} ${toPascalCase(modelName)}.`
            break;
          case 'post':
            description = `create ${toPascalCase(modelName)}.`
            break;
          case 'patch':
            description = `update ${toPascalCase(modelName)}.`
            break;
          case 'put':
            description = `replace ${toPascalCase(modelName)}.`
            break;
          case 'del':
            description = `delete ${toPascalCase(modelName)}`;
            break;
          default:
            break;
        }
      }

      if (!queryParams) queryParams = {}; // prevents checking existing queryParams in the future too.
      Object.keys(queryParams).forEach(key => { queryParamList.push(key) })

      if (!bodyParams) bodyParams = { properties: {} }; // prevents checking existing queryParams in the future too.
      Object.keys(bodyParams.properties).forEach((key) => { bodyParamList.push(key); });

      let query = '';
      let body = '';
      let path = '';
      let functionParams = '';

      queryParamList.forEach((key: string) => {
        query += `${key}: '{${key}}', `;
        functionParams += `'${key}',`;
      });
      bodyParamList.forEach((key: string) => {
        body += `${key}: '{${key}}', `;
        functionParams += `'${key}',`;
      });
      Object.keys(pathParams).forEach((key: string) => { functionParams += `'${key}',`; });

      if (pathKey) path = `${pathKey}: '{${pathKey}}'`;

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
          type: pathParams[pathKey]['type'],
          decorators: [{
            name: `param.path.${pathParams[pathKey]['type']}`,
            arguments: [`'${pathKey}'`]
          }]
        })
      }
      Object.keys(queryParams).forEach((key) => {
        const type = queryParams[key]['type'];
        parameters.push({
          name: key,
          type,
          decorators: [{
            name: `param.query.${type}`,
            arguments: [`'${key}'`]
          }]
        });
        serviceParams += `${key}: ${type},`;
      });

      const controllerFilePath = `${invokedFrom}/src/controllers/${toKebabCase(controller)}.controller.ts`;
      let controllerFile = project.getSourceFile(controllerFilePath);
      const model = fs.existsSync(`./src/models/${toKebabCase(requestModelName || modelName)}.model.ts`);
      if (model) addImport(controllerFile, requestModelName || modelName, '../models', true);

      if (body) {
        let name = `requestBody({content: {'application/json': {schema: getModelSchemaRef(${requestModelName || modelName})}}})`;
        if (bodyParams.type === 'array') {
          name = `requestBody({content: {'application/json': {schema: {type: 'array', items: getModelSchemaRef(${requestModelName || modelName})}}}})`;
        }
        const properties: { [x: string]: object } = {};
        const parameter = {
          name: 'body',
          type: 'any',
          decorators: [{
            name
          }]
        }

        parameters.push(parameter);

        Object.keys(bodyParams.properties).forEach((key: any) => {
          const property: { [x: string]: string | object } = {};
          property.type = bodyParams.properties[key]['type'];
          property.required = bodyParams.properties[key]['required'] || false;
          let type = property.type;

          const enumValues = bodyParams.properties[key]['enum'];

          if (enumValues && enumValues.length) {
            property.jsonSchema = { enum: enumValues }
          }
          properties[key] = property;
          if (!property.required) { type += ' | undefined'; }
          serviceParams += `${key}: ${type},`;
        });
        if (additionalProperties) {
          Object.keys(additionalProperties).forEach(key => {
            properties[key] = additionalProperties[key];
          });
        }

        if (!model && createModel) {
          const configs = {
            base: 'Entity',
            name: requestModelName || modelName,
            properties
          };
          const stringifiedConfigs = JSON.stringify(configs);
          let command = `lb4 model --config='${stringifiedConfigs}' --yes`;
          let executed: any = await execute(command, 'generating models.');
          if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
          if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
          addImport(controllerFile, requestModelName || modelName, '../models', true);
        }

      }
      if (pathKey) {
        serviceParams += `${pathKey}: ${pathParams[pathKey]['type']}`;
      }

      const existingController = fs.existsSync(`./src/controllers/${toKebabCase(controller)}.controller.ts`);
      if (!existingController) {
        let command = `lb4 controller --config='{"name": "${controller.toLowerCase()}"}' --yes`;
        let executed: any = await execute(command, 'generating controller.');
        if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
        if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
      }

      controllerFile = project.getSourceFile(controllerFilePath);

      if (controllerFile) {
        addImport(controllerFile, `${method}`, '@loopback/rest', true);
        addImport(controllerFile, `requestBody, getModelSchemaRef, param`, '@loopback/rest', true);
        addImport(controllerFile, 'inject', '@loopback/core');
        addImport(controllerFile, `${serviceName} as ${serviceName}Service`, '../services');

        type ResponseType = {
          description?: string;
          content?: { [x: string]: object };
        }
        // Find all class declarations within the source file
        const classDeclaration = controllerFile?.getClass(`${toPascalCase(controller)}Controller`);
        const classConstructors = classDeclaration?.getConstructors() || [];
        let apiMethod = classDeclaration?.getMethod(apiFunction);
        let constructedResponses: { [x: string]: ResponseType } = {};
        let finalResponses = {};
        Object.keys(responses).forEach(responseCode => {
          constructedResponses[responseCode] = {};
          const response = responses[responseCode];
          constructedResponses[responseCode]['description'] = response.description || description;
          let schema: string | { [x: string]: string | object } = {};
          schema.type = response.schema.type;
          if (response.schema.model) {
            if (schema.type === 'array') {
              schema.items = `getModelSchemaRef(${modelName})`;
            } else {
              schema = `getModelSchemaRef(${modelName})`;
            }
          }
          if (response.schema.properties) {
            schema = { properties: response.schema.properties };
          }
          constructedResponses[responseCode]['content'] = { 'application/json': { schema } };
          finalResponses = { responses: constructedResponses };
        });
        if (!apiMethod) {
          let methodParameters = queryParamList.toString();
          if (body) {
            if (
              methodParameters &&
              !methodParameters.endsWith(',')) {
              methodParameters += ','
            }
            bodyParamList.forEach(bodyParam => {
              methodParameters += `body.${bodyParam},`;
            });
          }
          if (pathKey) {
            if (
              methodParameters &&
              !methodParameters.endsWith(',')) {
              methodParameters += ','
            }
            methodParameters += `${pathKey}`;
          }
          let temp = JSON.stringify(finalResponses);
          temp = temp.replaceAll(`"getModelSchemaRef(${modelName})"`, `getModelSchemaRef(${modelName})`)
          let methodStructure = {
            name: apiFunction,
            parameters,
            statements: [`return this.service.${apiFunction}(${methodParameters});`],
            isAsync: true,
            decorators: [
              {
                name: (method).toLowerCase(),
                arguments: [`'${apiUri}'`, temp]
              }
            ],
            returnType: `Promise<any>`
          }
          classDeclaration?.addMethod(methodStructure);
        }

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