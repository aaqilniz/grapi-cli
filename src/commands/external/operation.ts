import { Command, Flags } from '@oclif/core'
import chalk from 'chalk';
import fs, { stat, Stats } from 'fs';

import { processOptions, toPascalCase, toKebabCase, execute, addImport } from '../../utils/index.js';
import { Project, SyntaxKind, PropertyAssignment, ObjectLiteralExpression, ArrayLiteralExpression, OptionalKind, ParameterDeclarationStructure, EnumMember, SourceFile } from 'ts-morph';

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
        count,
        replaceById,
        singleFetchMethodName,
        fetchMethodName,
        updateAll
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

      let addFilters = false;
      if (!queryParams) queryParams = {}; // prevents checking existing queryParams in the future too.
      Object.keys(queryParams).forEach(key => {
        queryParamList.push(key);
        if (key === 'where') {
          addFilters = true;
        }
      })

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
      if (pathKey) {
        serviceParams += `${pathKey}: ${pathParams[pathKey]['type']}`;
      }
      if (serviceParams !== '' && !serviceParams.endsWith(',')) {
        serviceParams += ',';
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
        serviceParams += `${key}?: ${type},`;
      });

      const controllerFilePath = `${invokedFrom}/src/controllers/${toKebabCase(controller)}.controller.ts`;
      let controllerFile = project.getSourceFile(controllerFilePath);
      const model = fs.existsSync(`./src/models/${toKebabCase(requestModelName || modelName)}.model.ts`);
      if (model) addImport(controllerFile, requestModelName || modelName, '../models', true);

      let name = `requestBody({content: {'application/json': {schema: getModelSchemaRef(${requestModelName || modelName})}}})`;
      if (body) {
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
          if (serviceParams !== '' && !serviceParams.endsWith(',')) {
            serviceParams += ',';
          }
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

      const existingController = fs.existsSync(`./src/controllers/${toKebabCase(controller)}.controller.ts`);
      if (!existingController) {
        let command = `lb4 controller --config='{"name": "${controller.toLowerCase()}"}' --yes`;
        let executed: any = await execute(command, 'generating controller.');
        if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
        if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
      }
      project.addSourceFilesAtPaths(`${invokedFrom}/src/**/*.ts`);
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
        this.addFilterCode(controllerFile);
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
          let methodParameters = '';
          let replaceByIdParameters = '';
          if (pathKey) {
            methodParameters = `${pathKey}`;
            replaceByIdParameters = `${pathKey},`;
          }
          if (
            methodParameters &&
            !methodParameters.endsWith(',')) {
            methodParameters += ','
          }
          methodParameters += queryParamList.toString();
          if (body) {
            if (
              methodParameters &&
              !methodParameters.endsWith(',')) {
              methodParameters += ','
            }
            if (
              replaceByIdParameters &&
              !replaceByIdParameters.endsWith(',')) {
              replaceByIdParameters += ','
            }
            bodyParamList.forEach(bodyParam => {
              methodParameters += `body.${bodyParam},`;
              replaceByIdParameters += `newItem.${bodyParam},`;
            });
          }
          let temp = JSON.stringify(finalResponses);
          temp = temp.replaceAll(`"getModelSchemaRef(${modelName})"`, `getModelSchemaRef(${modelName})`);
          const statements = [];
          queryParams
          if (addFilters) {
            statements.push(`let items = (await this.service.${apiFunction}(${methodParameters})) as any[];`)
            statements.push(`if (where) items = applyWhereFilter(items, where);`);
            statements.push(`return items;`);
          } else {
            statements.push(`return this.service.${apiFunction}(${methodParameters});`);
          }
          let methodStructure = {
            name: apiFunction,
            parameters,
            statements,
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
          // add count method based on findAll method
          if (count) {
            let methodStructure = {
              name: `count${modelName}`,
              parameters: [
                {
                  name: 'where',
                  type: 'object',
                  decorators: [{
                    name: `param.query.object`,
                    arguments: [`'where'`]
                  }]
                }
              ],
              statements: [`
                    let items = (await this.service.${apiFunction}(${methodParameters})) as any[];
                    if (where) items = applyWhereFilter(items, where);
                    return { count: items.length };
                `],
              isAsync: true,
              decorators: [
                {
                  name: 'get',
                  arguments: [
                    `'${apiUri}/count'`,
                    `{"responses":{"200":{"description":"Contact count","content":{"application/json":{"schema":{"properties":{"count":{"type":"number"}}}}}}}}`
                  ]
                }
              ],
              returnType: `Promise<any>`
            };
            classDeclaration?.addMethod(methodStructure);
          }
          // add replaceById by fetching the single record and updating it
          if (replaceById) {
            let methodStructure = {
              name: `replace${modelName}ById`,
              parameters: [
                {
                  name: 'id',
                  type: 'number',
                  decorators: [{
                    name: `param.path.number`,
                    arguments: [`'id'`]
                  }]
                },
                {
                  name: 'body',
                  type: 'any',
                  decorators: [{ name }]
                }
              ],
              statements: [`
                    const item = (await this.service.${singleFetchMethodName}(id)) as any[];
                    const newItem: any = {};
                    Object.keys(item).forEach(key => { newItem[key] = body[key] || null; });
                    return this.service.${apiFunction}(${replaceByIdParameters});
                `],
              isAsync: true,
              decorators: [
                {
                  name: 'put',
                  arguments: [
                    `'${apiUri}'`,
                    `{"responses":{"200":{"description":"repalce contact","content":{"application/json":{"schema":{"properties":{"count":{"type":"number"}}}}}}}}`
                  ]
                }
              ],
              returnType: `Promise<any>`
            };
            addImport(controllerFile, 'put', '@loopback/rest', true);
            classDeclaration?.addMethod(methodStructure);
          }
          // add update all by fetching all records and updating them
          if (updateAll) {
            if (pathKey) {
              if (methodParameters.includes(`${pathKey},`)) {
                methodParameters = methodParameters.replace(`${pathKey},`, '');
              } else if (methodParameters.includes(`${pathKey}`)) {
                methodParameters = methodParameters.replace(`${pathKey}`, '');
              }
            }
            name = name.replace(`getModelSchemaRef(${requestModelName || modelName}`, `getModelSchemaRef(${requestModelName || modelName}, {partial: true}`)
            let methodStructure = {
              name: `updateAll${modelName}`,
              parameters: [
                {
                  name: 'body',
                  type: 'any',
                  decorators: [{ name }]
                },
                {
                  name: 'where',
                  type: 'object',
                  decorators: [{
                    name: `param.query.object`,
                    arguments: [`'where'`]
                  }]
                }
              ],
              statements: [`
                    let items = (await this.service.${fetchMethodName}(where)) as any[];
                    if (where) items = applyWhereFilter(items, where);
                    const newItems: any = {};
                    const primaryKey = getPrimaryKeyFromModel(${modelName});
                    items.forEach((item: any) => {
                        newItems[item[primaryKey]] = { ...item }
                        delete newItems[item[primaryKey]][primaryKey];
                        Object.keys(body).forEach(bodyKey => {
                            newItems[item[primaryKey]][bodyKey] = body[bodyKey];
                        });
                    });
                    const promises: any[] = [];
                    Object.keys(newItems).forEach(id => {
                        promises.push(this.service.${apiFunction}(parseInt(id),${methodParameters}));
                    });
                    try {
                        await Promise.all(promises);
                    } catch (error) {
                        throw error;
                    }
                    return Object.keys(newItems).length;
                `],
              isAsync: true,
              decorators: [
                {
                  name: 'patch',
                  arguments: [
                    `'${apiUri.split('/{')[0]}'`,
                    `{"responses":{"200":{"description":"update contacts","content":{"application/json":{"schema":{"properties":{"count":{"type":"number"}}}}}}}}`
                  ]
                }
              ],
              returnType: `Promise<any>`
            };
            classDeclaration?.addMethod(methodStructure);
          }
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
      serviceInterface?.addMember(`${apiFunction}(${serviceParams}): Promise<object | object[]>;`);
      serviceFile?.formatText();
      serviceFile?.saveSync();
      dsFile?.saveSync();
    }
  }
  addFilterCode(controllerFile: SourceFile): void {
    // Define the functions to add
    const functionsToAdd = `
    interface WhereFilter {
        [key: string]: any;
    }
    function getPrimaryKeyFromModel(model: any) {
        // Get the model definition
        const modelDefinition = model.definition;

        // Directly check for ID properties
        const idProperties = [];

        for (const property in modelDefinition.properties) {
            if (modelDefinition.properties[property].id) {
                idProperties.push(property);
            }
        }
        // Return the first ID property or default to 'id'
        return idProperties.length > 0 ? idProperties[0] : 'id';
    }

    function applyWhereFilter<T>(items: T[], where: WhereFilter): T[] {
        return items.filter(item => evaluateCondition(item, where));
    }

    function evaluateCondition<T>(item: T, condition: WhereFilter): boolean {
        // Handle empty condition
        if (!condition || Object.keys(condition).length === 0) {
            return true;
        }

        // Check each condition
        return Object.entries(condition).every(([key, value]) => {
            // Handle special operators
            if (key === 'and' && Array.isArray(value)) {
                return value.every(subCondition => evaluateCondition(item, subCondition));
            }

            if (key === 'or' && Array.isArray(value)) {
                return value.some(subCondition => evaluateCondition(item, subCondition));
            }

            if (key === 'nor' && Array.isArray(value)) {
                return !value.some(subCondition => evaluateCondition(item, subCondition));
            }

            // Regular field comparison
            const itemValue = getNestedProperty(item, key);

            // Handle different types of value conditions
            if (value === null) {
                return itemValue === null;
            } else if (typeof value === 'object' && !Array.isArray(value)) {
                return evaluateOperators(itemValue, value);
            } else if (value instanceof RegExp) {
                return value.test(String(itemValue));
            } else {
                return itemValue === value;
            }
        });
    }

    /**
     * Get a potentially nested property from an object using dot notation
     */
    function getNestedProperty<T>(obj: T, path: string): any {
        return path.split('.').reduce((current: any, part) => {
            return current && current[part] !== undefined ? current[part] : null;
        }, obj);
    }
    /**
     * Evaluate the comparison operators (gt, lt, gte, lte, neq, etc.)
     */
    function evaluateOperators(itemValue: any, operators: Record<string, any>): boolean {
        return Object.entries(operators).every(([operator, operatorValue]) => {
            switch (operator) {
                case 'eq':
                    return itemValue === operatorValue;
                case 'neq':
                    return itemValue !== operatorValue;
                case 'gt':
                    return itemValue > operatorValue;
                case 'gte':
                    return itemValue >= operatorValue;
                case 'lt':
                    return itemValue < operatorValue;
                case 'lte':
                    return itemValue <= operatorValue;
                case 'inq':
                    return Array.isArray(operatorValue) && operatorValue.includes(itemValue);
                case 'nin':
                    return Array.isArray(operatorValue) && !operatorValue.includes(itemValue);
                case 'between':
                    return Array.isArray(operatorValue) &&
                        operatorValue.length >= 2 &&
                        itemValue >= operatorValue[0] &&
                        itemValue <= operatorValue[1];
                case 'like':
                    return typeof itemValue === 'string' &&
                        new RegExp(String(operatorValue).replace(/%/g, '.*')).test(itemValue);
                case 'nlike':
                    return typeof itemValue === 'string' &&
                        !new RegExp(String(operatorValue).replace(/%/g, '.*')).test(itemValue);
                case 'regexp':
                    const regex = operatorValue instanceof RegExp ?
                        operatorValue :
                        new RegExp(operatorValue);
                    return regex.test(String(itemValue));
                default:
                    return false;
            }
        });
    }
    `;
    const fileText = controllerFile.getFullText();
    const functionSignatures = [
      'function applyWhereFilter<T>',
      'function evaluateCondition<T>',
      'function getNestedProperty<T>',
      'function evaluateOperators'
    ];

    // Check if at least one of these function signatures exists in the file
    const functionsExist = functionSignatures.some(signature => fileText.includes(signature));

    if (!functionsExist) {
      const classDeclaration1 = controllerFile.getFirstDescendantByKind(SyntaxKind.ClassDeclaration);
      if (classDeclaration1) {
        // Find suitable position after imports but before class
        let insertPosition = 0;

        // Get all imports to find the last one
        const importDeclarations = controllerFile.getImportDeclarations();
        if (importDeclarations.length > 0) {
          const lastImport = importDeclarations[importDeclarations.length - 1];
          insertPosition = lastImport.getEnd() + 1; // Position after the last import
        }

        // Check if there are comments after imports (like the "Uncomment these imports" comment)
        const comments = controllerFile.getDescendantsOfKind(SyntaxKind.SingleLineCommentTrivia);
        for (const comment of comments) {
          const commentPos = comment.getEnd();
          if (commentPos > insertPosition && commentPos < classDeclaration1.getStart()) {
            // Find the end of the comment block
            const commentText = comment.getText();
            if (commentText.includes("Uncomment these imports") ||
              commentText.includes("cool features")) {
              insertPosition = commentPos + 1;
            }
          }
        }

        // Add a newline before insertion if needed
        const textToInsert = insertPosition > 0 ? '\n\n' + functionsToAdd : functionsToAdd;

        // Insert the functions
        controllerFile.insertText(insertPosition, textToInsert);

        // Save the changes
        controllerFile.saveSync();

        console.log("Functions added successfully to the controller file.");
      } else {
        console.error("Could not find the class declaration in the file.");
      }
    }
  }
}
