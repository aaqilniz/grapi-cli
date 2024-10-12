import { Patch } from '../types/index.js';

export const patches: Patch = {
    showRelationInformation: {
        addToDescription: {
            searchString: 'schemaOptions:/);',
            replacement: `schemaOptions:/);\nif (result.description) {const relationMatched = result.description.match(/\\{"relationships".*$/s);if (relationMatched) {const stringifiedRelation = relationMatched[0].replace(/foreignKey/g, 'x-foreign-key').replace(/relationType/g, 'x-relation-type').replace(/sourceModel/g, 'x-source-model').replace(/targetModel/g, 'x-target-model').replace(/includeRelations/g, 'x-include-relations').replace(/through/g, 'x-through-model');if (stringifiedRelation) {result['x-relationships'] =JSON.parse(stringifiedRelation)['relationships'];result.description = result.description.replace(/\\{"relationships".*$/s,'',);}}}`,
            path: './node_modules/@loopback/openapi-v3/dist/json-to-schema.js'
        },
        removeStatements: {
            searchString: '/if\s*\(relMeta\.keyFrom\)\s*\{\s*\n[^}]*}/',
            replacement: '',
            path: './node_modules/@loopback/repository-json-schema/dist/build-schema.js'
        },
        appendRelationInfoToOAS: {
            searchString: 'includeReferencedSchema(targetSchema.title, targetSchema);',
            replacement: "const foreignKey = {}; let relationships = {}; relationships = {}; if (\!relationships[relMeta.name]) { relationships[relMeta.name] = {}; } if (relMeta.type === 'belongsTo') { let keyFrom = relMeta.keyFrom; if (\!keyFrom) { keyFrom = targetType.name.toLowerCase() + 'Id'; } foreignKey[keyFrom] = targetType.name; relationships[relMeta.name].description = \`\${relMeta.source.name} belongs to \${targetType.name}.\`; relationships[relMeta.name].type = 'object'; relationships[relMeta.name].\$ref = \`#/definitions/\${targetSchema.title}\`; } if (relMeta.type === 'hasMany') { if (relMeta.through) { relationships = {}; if (\!relationships[relMeta.name]) { relationships[relMeta.name] = {}; } let keyTo = relMeta.through.keyTo; let keyFrom = relMeta.through.keyFrom; if (\!keyTo) { keyTo = targetType.name.toLowerCase() + 'Id'; } if (\!keyFrom) { keyFrom = relMeta.source.name.toLowerCase() + 'Id'; } foreignKey[keyTo] = targetType.name; foreignKey[keyFrom] = relMeta.source.name; relationships[relMeta.name].description = \`\${relMeta.source.name} have many \${targetType.name}.\`; relationships[relMeta.name].type = 'object'; relationships[relMeta.name].\$ref = \`#/definitions/\${targetSchema.title}\`; } else { let keyFrom = relMeta.keyFrom; if (\!keyFrom) { keyFrom = relMeta.source.name.toLowerCase() + 'Id'; } foreignKey[keyFrom] = relMeta.source.name; relationships[relMeta.name].description = \`\${relMeta.source.name} have many \${targetType.name}.\`; relationships[relMeta.name].type = 'array'; relationships[relMeta.name].items = { \$ref: \`#/definitions/\${targetSchema.title}\`, }; } } if (relMeta.type === 'hasOne') { relationships = {}; if (\!relationships[relMeta.name]) { relationships[relMeta.name] = {}; } let keyTo = relMeta.keyTo; if (\!keyTo) { keyTo = relMeta.source.name.toLowerCase() + 'Id'; } foreignKey[keyTo] = relMeta.source.name; relationships[relMeta.name].description = \`\${relMeta.source.name} have one \${targetType.name}.\`; relationships[relMeta.name].type = 'object'; relationships[relMeta.name].\$ref = \`#/definitions/\${targetSchema.title}\`; } if (relMeta.type === 'referencesMany') { let keyFrom = relMeta.keyFrom; if (\!keyFrom) { keyFrom = targetType.name.toLowerCase() + 'Ids'; } foreignKey[keyFrom] = targetType.name; relationships[relMeta.name].description = \`\${relMeta.source.name} references many \${targetType.name}.\`; relationships[relMeta.name].type = 'array'; relationships[relMeta.name].items = { \$ref: \`#/definitions/\${targetSchema.title}\`, }; } relationships[relMeta.name].foreignKeys = foreignKey;relationships[relMeta.name].sourceModel = relMeta.source.name;relationships[relMeta.name].targetModel = targetType.name;relationships[relMeta.name].includeRelations = targetOptions.includeRelations; relationships[relMeta.name]['x-relation-type'] = relMeta.type;if (relMeta.through) {const throughModel = relMeta.through.model();relationships[relMeta.name].through = throughModel.definition.name;} if (result.description) { if (result.description.includes('relationships')) { const relationMatched = result.description.match(/\{\"relationships\".*\$/s); if (relationMatched) { const { relationships: existingRelation } = JSON.parse(relationMatched[0]); existingRelation[Object.keys(relationships)[0]] = { ...relationships }; result.description = result.description.replace(/\{\"relationships\".*\$/s, ''); result.description = result.description + \`, \${JSON.stringify({ relationships: existingRelation })}\`; } } else { result.description = result.description + \`, \${JSON.stringify({ relationships })}\`;}}\nincludeReferencedSchema(targetSchema.title, targetSchema);",
            path: './node_modules/@loopback/repository-json-schema/dist/build-schema.js'
        }
    },
    showIfPropertyIsGenerated: {
        addAssignment: {
            searchString: 'const wrappedType = stringTypeToWrapper(propertyType);',
            replacement: `if (meta.generated) {result.readOnly = true}\nconst wrappedType = stringTypeToWrapper(propertyType);`,
            path: './node_modules/@loopback/repository-json-schema/dist/build-schema.js',
        },
    },
    addAuthDecorator: {
        addRequireStatement: {
            searchString: 'require("assert"));',
            replacement: `require("assert"));\nconst authentication_1 = require("@loopback/authentication");`,
            path: './node_modules/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
        addConditionalDecoratorGet: {
            searchString: '(0, rest_1.get)(\'/\', {',
            replacement: `authenticatedMethod(options.auth ? options.auth.get : false),\n(0, rest_1.get)('/', {`,
            path: './node_modules/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
        addConditionalDecoratorCount: {
            searchString: '(0, rest_1.get)(\'/count\', {',
            replacement: `authenticatedMethod(options.auth ? options.auth.count : false),\n(0, rest_1.get)('/count', {`,
            path: './node_modules/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
        addConditionalDecoratorPost: {
            searchString: '(0, rest_1.post)(\'/\', {',
            replacement: `authenticatedMethod(options.auth ? options.auth.post : false),\n(0, rest_1.post)('/', {`,
            path: './node_modules/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
        addConditionalDecoratorPatch: {
            searchString: '(0, rest_1.patch)(\'/\', {',
            replacement: `authenticatedMethod(options.auth ? options.auth.patch : false),\n(0, rest_1.patch)('/', {`,
            path: './node_modules/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
        addConditionalDecoratorPatchById: {
            searchString: '(0, rest_1.patch)(\'/{id}\', {',
            replacement: `authenticatedMethod(options.auth ? options.auth.patchById : false),\n(0, rest_1.patch)('/{id}', {`,
            path: './node_modules/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
        addConditionalDecoratorPutById: {
            searchString: '(0, rest_1.put)(\'/{id}\', {',
            replacement: `authenticatedMethod(options.auth ? options.auth.patchById : false),\n(0, rest_1.patch)('/{id}', {`,
            path: './node_modules/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
        addConditionalDecoratorDeleteById: {
            searchString: '(0, rest_1.del)(\'/{id}\', {',
            replacement: `authenticatedMethod(options.auth ? options.auth.deleteById : false),\n(0, rest_1.del)('/{id}', {`,
            path: './node_modules/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
        addConditionalDecoratorMethod: {
            searchString: '})(response || (response = {}));',
            replacement: `})(response || (response = {}));\nfunction authenticatedMethod(applyAuth) { return applyAuth ? (0, authentication_1.authenticate)('jwt') : (target, key, descriptor) => { }; }`,
            path: './node_modules/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
    },
    enableAuthByUsername: {
        updateErrorMessage: {
            searchString: 'Invalid email or password.',
            replacement: `Invalid username/email or password.`,
            path: './node_modules/@loopback/authentication-jwt/dist/services/user.service.js',
        },
        addUsernameValidation: {
            searchString: 'Invalid username/email or password.\'',
            replacement: `Invalid username/email or password.';\nif (\!credentials.email \&\& \!credentials.username) {throw new rest_1.HttpErrors.Unauthorized('please provide either username or email.');}const whereFilter = {};if (credentials.email){whereFilter.email = credentials.email;}if (credentials.username) {whereFilter.username = credentials.username;}`,
            path: './node_modules/@loopback/authentication-jwt/dist/services/user.service.js',
        },
        addWhereFilter: {
            searchString: '{ email: credentials.email }',
            replacement: `whereFilter`,
            path: './node_modules/@loopback/authentication-jwt/dist/services/user.service.js',
        },
        addUsernameAndMakeEmailOptional: {
            searchString: 'email: string;',
            replacement: `email?: string;username?: string;`,
            path: './node_modules/@loopback/authentication-jwt/dist/services/user.service.d.ts',
        },
    },
    baseUrlToServersField: {
        retrieveBaseUrl: {
            searchString: 'client = await SwaggerClient(req);',
            replacement: `let baseURL, baseURLObject;if (req.spec.openapi) {try {baseURLObject = new URL(self.settings.spec); baseURL = \`\${baseURLObject.protocol}//\${baseURLObject.host}\`;} catch (error) {debug('Not a valid URL: %s', error);}}if (baseURL) {if (\!req.spec.servers || \!req.spec.servers.length) {req.spec.servers = [{url: baseURL}];} else {req.spec.servers.forEach(function({url}, index) {try {new URL(url);} catch (error) {if (url.startsWith('//')) {url = \`\${baseURLObject.protocol}:\${url}\`;} else {url = url === '/' ? baseURL : baseURL + url;}} req.spec.servers[index].url = url;});}}\nclient = await SwaggerClient(req);`,
            path: './node_modules/loopback-connector-openapi/lib/openapi-connector.js',
        },
    },
    supportGroupBy: {
        addBuildGroupByQuery: {
            searchString: 'SQLConnector.prototype.buildFields =',
            replacement: `SQLConnector.prototype.buildGroupBy = function(groupBy) { const groupByColumns = Object.keys(groupBy); return 'GROUP BY ' + groupByColumns.join(','); };\nSQLConnector.prototype.buildFields =`,
            path: './node_modules/loopback-connector/lib/sql.js',
        },
        addExtraQuery: {
            searchString: `let selectStmt = new ParameterizedSQL('SELECT ' +`,
            replacement: `let extraSelect = '';  if (filter.sum) { extraSelect = \`SUM(\${filter.sum}) as sumOf\${filter.sum}, \`; } if (filter.count) { extraSelect += \`COUNT(\${filter.count}) as countOf\${filter.count}, \`; } if (filter.avg) { extraSelect += \`AVG(\${filter.avg}) as avgOf\${filter.avg}, \`; } if (filter.min) { extraSelect += \`MIN(\${filter.min}) as minOf\${filter.min}, \`; } if (filter.max) { extraSelect += \`MAX(\${filter.max}) as maxOf\${filter.max}, \`;}\nlet selectStmt = new ParameterizedSQL('SELECT ' + extraSelect + `,
            path: './node_modules/loopback-connector/lib/sql.js',
        },
        applyBuildGroupBy: {
            searchString: `if (filter.order) {`,
            replacement: `if (filter.groupBy) {selectStmt.merge(this.buildGroupBy(filter.groupBy));}\nif (filter.order) {`,
            path: './node_modules/loopback-connector/lib/sql.js',
        },
        addAgregateOps: {
            searchString: `return self.fromRow(model, obj);`,
            replacement: `const object = self.fromRow(model, obj); if (obj\[\`sumOf\${filter.sum}\`\]) { object\[\`sumOf\${filter.sum}\`\] = obj\[\`sumOf\${filter.sum}\`\]; } if (obj\[\`countOf\${filter.count}\`\]) { object\[\`countOf\${filter.count}\`\] = obj\[\`countOf\${filter.count}\`\]; } if (obj\[\`avgOf\${filter.avg}\`\]) { object\[\`avgOf\${filter.avg}\`\] = obj\[\`avgOf\${filter.avg}\`\]; } if (obj\[\`minOf\${filter.min}\`\]) { object\[\`minOf\${filter.min}\`\] = obj\[\`minOf\${filter.min}\`\]; } if (obj\[\`maxOf\${filter.max}\`\]) { object\[\`maxOf\${filter.max}\`\] = obj\[\`maxOf\${filter.max}\`\];} return object;`,
            path: './node_modules/loopback-connector/lib/sql.js',
        },
        addData: {
            searchString: `callback(null, obj);`,
            replacement: `const keys = Object.keys(data);\nkeys.forEach(key => { if ( key.includes('sumOf') || key.includes('countOf') || key.includes('avgOf') || key.includes('minOf') || key.includes('maxOf') ) { obj.__data[key] = data[key]; } });\ncallback(null, obj);`,
            path: './node_modules/loopback-datasource-juggler/lib/dao.js',
        },
        exportGroupBy: {
            searchString: `exports.applyParentProperty = applyParentProperty;`,
            replacement: `exports.applyParentProperty = applyParentProperty;\nexports.groupBy = groupBy;`,
            path: './node_modules/loopback-datasource-juggler/lib/utils.js',
        },
        createGroupByUtil: {
            searchString: `function applyParentProperty(element, parent) {`,
            replacement: `function groupBy(items, key) {return items.reduce((result, item) => ({...result,[item[key]]: [...(result[item[key]] || []),item,],}),{},);}\nfunction applyParentProperty(element, parent) {`,
            path: './node_modules/loopback-datasource-juggler/lib/utils.js',
        },
        addAggregateToFilterSchema: {
            searchString: `const properties = {`,
            replacement: `const properties = {\nsum: { type: 'string', examples: [\"column1\"], },  min: { type: 'string', examples: [\"column1\"], }, max: { type: 'string', examples: [\"column1\"], }, avg: { type: 'string', examples: [\"column1\"], }, count: { type: 'string', examples: [\"column1\"], },`,
            path: './node_modules/@loopback/repository-json-schema/dist/filter-json-schema.js',
        },
        addToWriter: {
            searchString: `result = JSON.stringify(result);`,
            replacement: `let customResult = result;let org = {};if (result && typeof result === 'object') {if (Array.isArray(result)) {customResult = [];result.forEach((item) => {org = {};if (typeof item === 'object') {Object.keys(item).forEach(key => {org[key] = item[key];});customResult.push(org);} else {customResult.push(item);}});} else {org = {};Object.keys(result).forEach(key => {org[key] = result[key];});customResult = org;}}\nresult = JSON.stringify(customResult);`,
            path: './node_modules/@loopback/rest/dist/writer.js',
        },
    },
    stringifyAfter: {
        addAssignment: {
            searchString: 'after,',
            replacement: `after: JSON.stringify(after),`,
            path: './node_modules/@sourceloop/audit-log/dist/mixins/audit.mixin.js',
        },
    },
    makeAuditAPIsReadonly: {
        replaceFalseToTrue: {
            searchString: 'readonly: false',
            replacement: `readonly: true`,
            path: './src/model-endpoints/audit-log.rest-config.ts',
        },
    },
};
