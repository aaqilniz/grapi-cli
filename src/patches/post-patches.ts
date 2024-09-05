import { Patch } from '../types/index.js';

export const patches: Patch = {
    showRelationInformation: {
        addToDescription: {
            searchString: 'schemaOptions:/);',
            replacement: `schemaOptions:/);\nif (result.description) {const relationMatched = result.description.match(/\\{"relationships".*$/s);if (relationMatched) {const stringifiedRelation = relationMatched[0].replace(/foreignKey/g, 'x-foreign-key').replace(/relationType/g, 'x-relation-type');if (stringifiedRelation) {result['x-relationships'] =JSON.parse(stringifiedRelation)['relationships'];result.description = result.description.replace(/\\{"relationships".*$/s,'',);}}}`,
            path: '/@loopback/openapi-v3/dist/json-to-schema.js'
        },
        removeStatements: {
            searchString: '/if\s*\(relMeta\.keyFrom\)\s*\{\s*\n[^}]*}/',
            replacement: '',
            path: '/@loopback/repository-json-schema/dist/build-schema.js'
        },
        appendRelationInfoToOAS: {
            searchString: 'includeReferencedSchema(targetSchema.title, targetSchema);',
            replacement: "const foreignKey = {}; let relationships = {}; relationships = {}; if (\!relationships[relMeta.name]) { relationships[relMeta.name] = {}; } if (relMeta.type === 'belongsTo') { let keyFrom = relMeta.keyFrom; if (\!keyFrom) { keyFrom = targetType.name.toLowerCase() + 'Id'; } foreignKey[keyFrom] = targetType.name; relationships[relMeta.name].description = \`\${relMeta.source.name} belongs to \${targetType.name}.\`; relationships[relMeta.name].type = 'object'; relationships[relMeta.name].\$ref = \`#/definitions/\${targetSchema.title}\`; } if (relMeta.type === 'hasMany') { if (relMeta.through) { relationships = {}; if (\!relationships[relMeta.name]) { relationships[relMeta.name] = {}; } let keyTo = relMeta.through.keyTo; let keyFrom = relMeta.through.keyFrom; if (\!keyTo) { keyTo = targetType.name.toLowerCase() + 'Id'; } if (\!keyFrom) { keyFrom = relMeta.source.name.toLowerCase() + 'Id'; } foreignKey[keyTo] = targetType.name; foreignKey[keyFrom] = relMeta.source.name; relationships[relMeta.name].description = \`\${relMeta.source.name} have many \${targetType.name}.\`; relationships[relMeta.name].type = 'object'; relationships[relMeta.name].\$ref = \`#/definitions/\${targetSchema.title}\`; } else { let keyFrom = relMeta.keyFrom; if (\!keyFrom) { keyFrom = relMeta.source.name.toLowerCase() + 'Id'; } foreignKey[keyFrom] = relMeta.source.name; relationships[relMeta.name].description = \`\${relMeta.source.name} have many \${targetType.name}.\`; relationships[relMeta.name].type = 'array'; relationships[relMeta.name].items = { \$ref: \`#/definitions/\${targetSchema.title}\`, }; } } if (relMeta.type === 'hasOne') { relationships = {}; if (\!relationships[relMeta.name]) { relationships[relMeta.name] = {}; } let keyTo = relMeta.keyTo; if (\!keyTo) { keyTo = relMeta.source.name.toLowerCase() + 'Id'; } foreignKey[keyTo] = relMeta.source.name; relationships[relMeta.name].description = \`\${relMeta.source.name} have one \${targetType.name}.\`; relationships[relMeta.name].type = 'object'; relationships[relMeta.name].\$ref = \`#/definitions/\${targetSchema.title}\`; } if (relMeta.type === 'referencesMany') { let keyFrom = relMeta.keyFrom; if (\!keyFrom) { keyFrom = targetType.name.toLowerCase() + 'Ids'; } foreignKey[keyFrom] = targetType.name; relationships[relMeta.name].description = \`\${relMeta.source.name} references many \${targetType.name}.\`; relationships[relMeta.name].type = 'array'; relationships[relMeta.name].items = { \$ref: \`#/definitions/\${targetSchema.title}\`, }; } relationships[relMeta.name].foreignKeys = foreignKey; relationships[relMeta.name]['x-relation-type'] = relMeta.type; if (result.description) { if (result.description.includes('relationships')) { const relationMatched = result.description.match(/\{\"relationships\".*\$/s); if (relationMatched) { const { relationships: existingRelation } = JSON.parse(relationMatched[0]); existingRelation[Object.keys(relationships)[0]] = { ...relationships }; result.description = result.description.replace(/\{\"relationships\".*\$/s, ''); result.description = result.description + \`, \${JSON.stringify({ relationships: existingRelation })}\`; } } else { result.description = result.description + \`, \${JSON.stringify({ relationships })}\`;}}\nincludeReferencedSchema(targetSchema.title, targetSchema);",
            path: '/@loopback/repository-json-schema/dist/build-schema.js'
        }
    },
    showIfPropertyIsGenerated: {
        addAssignment: {
            searchString: 'const wrappedType = stringTypeToWrapper(propertyType);',
            replacement: `if (meta.generated) {result.readOnly = true}\nconst wrappedType = stringTypeToWrapper(propertyType);`,
            path: '/@loopback/repository-json-schema/dist/build-schema.js',
        },
    },
    addAuthDecorator: {
        addRequireStatement: {
            searchString: 'require("assert"));',
            replacement: `require("assert"));\nconst authentication_1 = require("@loopback/authentication");`,
            path: '/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
        addConditionalDecoratorGet: {
            searchString: '(0, rest_1.get)(\'/\', {',
            replacement: `authenticatedMethod(options.auth ? options.auth.get : false),\n(0, rest_1.get)('/', {`,
            path: '/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
        addConditionalDecoratorCount: {
            searchString: '(0, rest_1.get)(\'/count\', {',
            replacement: `authenticatedMethod(options.auth ? options.auth.count : false),\n(0, rest_1.get)('/count', {`,
            path: '/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
        addConditionalDecoratorPost: {
            searchString: '(0, rest_1.post)(\'/\', {',
            replacement: `authenticatedMethod(options.auth ? options.auth.post : false),\n(0, rest_1.post)('/', {`,
            path: '/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
        addConditionalDecoratorPatch: {
            searchString: '(0, rest_1.patch)(\'/\', {',
            replacement: `authenticatedMethod(options.auth ? options.auth.patch : false),\n(0, rest_1.patch)('/', {`,
            path: '/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
        addConditionalDecoratorPatchById: {
            searchString: '(0, rest_1.patch)(\'/{id}\', {',
            replacement: `authenticatedMethod(options.auth ? options.auth.patchById : false),\n(0, rest_1.patch)('/{id}', {`,
            path: '/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
        addConditionalDecoratorPutById: {
            searchString: '(0, rest_1.put)(\'/{id}\', {',
            replacement: `authenticatedMethod(options.auth ? options.auth.patchById : false),\n(0, rest_1.patch)('/{id}', {`,
            path: '/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
        addConditionalDecoratorDeleteById: {
            searchString: '(0, rest_1.del)(\'/{id}\', {',
            replacement: `authenticatedMethod(options.auth ? options.auth.deleteById : false),\n(0, rest_1.del)('/{id}', {`,
            path: '/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
        addConditionalDecoratorMethod: {
            searchString: '})(response || (response = {}));',
            replacement: `})(response || (response = {}));\nfunction authenticatedMethod(applyAuth) { return applyAuth ? (0, authentication_1.authenticate)('jwt') : (target, key, descriptor) => { }; }`,
            path: '/@loopback/rest-crud/dist/crud-rest.controller.js',
        },
    },
    enableAuthByUsername: {
        updateErrorMessage: {
            searchString: 'Invalid email or password.',
            replacement: `Invalid username/email or password.`,
            path: '/@loopback/authentication-jwt/dist/services/user.service.js',
        },
        addUsernameValidation: {
            searchString: 'Invalid username/email or password.\'',
            replacement: `Invalid username/email or password.';\nif (\!credentials.email \&\& \!credentials.username) {throw new rest_1.HttpErrors.Unauthorized('please provide either username or email.');}const whereFilter = {};if (credentials.email){whereFilter.email = credentials.email;}if (credentials.username) {whereFilter.username = credentials.username;}`,
            path: '/@loopback/authentication-jwt/dist/services/user.service.js',
        },
        addWhereFilter: {
            searchString: '{ email: credentials.email }',
            replacement: `whereFilter`,
            path: '/@loopback/authentication-jwt/dist/services/user.service.js',
        },
        addUsernameAndMakeEmailOptional: {
            searchString: 'email: string;',
            replacement: `email?: string;username?: string;`,
            path: '/@loopback/authentication-jwt/dist/services/user.service.d.ts',
        },
    },
};
