import { Patch } from '../types/index.js';
import { existsSync } from 'fs';
import { applyPatches, getNpmGlobalDir } from '../utils/utils.js';
import { applyPrePatches } from './pre-patches.js';

const cliPath = await getNpmGlobalDir();
if (!existsSync(cliPath)) throw new Error('Loopback\'s CLI is not installed.');

const patches: Patch = {
    controllerTypeAssignment: {
        assignType: {
            searchString: 'async promptArtifactCrudVars() {',
            replacement: `async promptArtifactCrudVars() {\nif (this.options.controllerType === 'BASIC') { this.artifactInfo.controllerType = ControllerGenerator.BASIC; }
if (this.options.controllerType === 'REST') { this.artifactInfo.controllerType = ControllerGenerator.REST; }`,
            path: `${cliPath}/generators/controller/index.js`
        }
    },
    // supportReadonlyProperties: {
    //     requireRelationUtil: {
    //         searchString: `const utils = require('../../lib/utils');`,
    //         replacement: `const utils = require('../../lib/utils');\nconst relationUtils = require('../relation/utils.generator');`,
    //         path: `${cliPath}/generators/controller/index.js`
    //     },
    //     implementReadonly: {
    //         searchString: `const source = this.templatePath(path.join('src', 'controllers', template));`,
    //         replacement: `\n if(this.artifactInfo.controllerType === ControllerGenerator.REST) { this.artifactInfo.exclude = [];if (this.artifactInfo.idOmitted) {this.artifactInfo.exclude.push(this.artifactInfo.id);}const project = new relationUtils.AstLoopBackProject();const fileName = path.resolve(this.artifactInfo.modelDir,utils.getModelFileName(this.artifactInfo.modelName),);const modelFile = project.addSourceFileAtPath(fileName);const modelClass = modelFile.getClassOrThrow(this.artifactInfo.modelName);for (const classProperty of modelClass.getInstanceProperties()) { for (const decorator of classProperty.getDecorators()) { \nfor (const decoratorArg of decorator.getArguments()) { \nif (decoratorArg.getProperty) { const readOnlyProperty = decoratorArg.getProperty('readOnly'); \nif (readOnlyProperty) {const readOnlyValue = readOnlyProperty.getInitializerOrThrow().getText();\nif (readOnlyValue === '1' || readOnlyValue === 'true') {this.artifactInfo.exclude.push(classProperty.getName());}}}}}}} const source = this.templatePath(path.join('src', 'controllers', template));`,
    //         path: `${cliPath}/generators/controller/index.js`
    //     },
    //     updateControllerTemplate: {
    //         searchString: `<%if (idOmitted) {%>exclude: ['<%= id %>'],<% } %>`,
    //         replacement: `<%if (exclude.length) {%>exclude: [<% exclude.forEach(function(item,index){ %>'<%= item %>', <% }) %>],<% } %>`,
    //         path: `${cliPath}/generators/controller/templates/src/controllers/controller-rest-template.ts.ejs`
    //     },
    //     updateControllerTemplate1: {
    //         searchString: `<%= modelVariableName %>: <% if (!idOmitted) { -%><%= modelName %><% } else { -%>Omit<<%= modelName %>, '<%= id %>'><% } -%>,`,
    //         replacement: `<%= modelVariableName %>: <% if (!exclude.length) { -%><%= modelName %><% } else { -%>Omit<<%= modelName %>, '<%= exclude %>'><% } -%>,`,
    //         path: `${cliPath}/generators/controller/templates/src/controllers/controller-rest-template.ts.ejs`
    //     },
    //     updateHasMany: {
    //         searchString: 'const source = this.templatePath(CONTROLLER_TEMPLATE_PATH_HAS_MANY);',
    //         replacement: `const project = new relationUtils.AstLoopBackProject();const sourceFile = relationUtils.addFileToProject(project,this.artifactInfo.modelDir,options.sourceModel,);this.artifactInfo.exclude = [this.artifactInfo.targetModelPrimaryKey];const sourceClass = relationUtils.getClassObj(sourceFile,options.sourceModel,);for (const classProperty of sourceClass.getInstanceProperties()) {for (const decorator of classProperty.getDecorators()) {for (const decoratorArg of decorator.getArguments()) {if (decoratorArg.getProperty) {const readOnlyProperty = decoratorArg.getProperty('readOnly');if (readOnlyProperty) {const readOnlyValue = readOnlyProperty.getInitializerOrThrow().getText();if (readOnlyValue === '1' || readOnlyValue === 'true') { this.artifactInfo.exclude.push(classProperty.getName());}}}}}} const source = this.templatePath(CONTROLLER_TEMPLATE_PATH_HAS_MANY);`,
    //         path: `${cliPath}/generators/relation/has-many-relation.generator.js`
    //     },
    //     updateHasManyThrough: {
    //         searchString: 'const source = this.templatePath(CONTROLLER_TEMPLATE_PATH_HAS_MANY_THROUGH);',
    //         replacement: `const project = new relationUtils.AstLoopBackProject();const sourceFile = relationUtils.addFileToProject(project,this.artifactInfo.modelDir,options.sourceModel,);this.artifactInfo.exclude = [this.artifactInfo.targetModelPrimaryKey];const sourceClass = relationUtils.getClassObj(sourceFile,options.sourceModel,);for (const classProperty of sourceClass.getInstanceProperties()) {for (const decorator of classProperty.getDecorators()) {for (const decoratorArg of decorator.getArguments()) {if (decoratorArg.getProperty) {const readOnlyProperty = decoratorArg.getProperty('readOnly');if (readOnlyProperty) {const readOnlyValue = readOnlyProperty.getInitializerOrThrow().getText();if (readOnlyValue === '1' || readOnlyValue === 'true') {this.artifactInfo.exclude.push(classProperty.getName());}}}}}} \n const source = this.templatePath(CONTROLLER_TEMPLATE_PATH_HAS_MANY_THROUGH);`,
    //         path: `${cliPath}/generators/relation/has-many-through-relation.generator.js`
    //     },
    //     updateHasOne: {
    //         searchString: `utils.toFileName(this.artifactInfo.name) + '.controller.ts';`,
    //         replacement: `utils.toFileName(this.artifactInfo.name) + '.controller.ts';const project = new relationUtils.AstLoopBackProject();const sourceFile = relationUtils.addFileToProject(project,this.artifactInfo.modelDir,options.sourceModel,);this.artifactInfo.exclude = [this.artifactInfo.targetModelPrimaryKey];const sourceClass = relationUtils.getClassObj(sourceFile,options.sourceModel,);for (const classProperty of sourceClass.getInstanceProperties()) {for (const decorator of classProperty.getDecorators()) {for (const decoratorArg of decorator.getArguments()) {if (decoratorArg.getProperty) {const readOnlyProperty = decoratorArg.getProperty('readOnly');if (readOnlyProperty) {const readOnlyValue = readOnlyProperty.getInitializerOrThrow().getText();if (readOnlyValue === '1' || readOnlyValue === 'true') {this.artifactInfo.exclude.push(classProperty.getName());}}}}}}`,
    //         path: `${cliPath}/generators/relation/has-one-relation.generator.js`
    //     },
    //     updateHasOne1: {
    //         searchString: `const imports = relationUtils.getRequiredImports(targetModel, relationType);`,
    //         replacement: `const imports = relationUtils.getRequiredImports(targetModel, relationType, sourceModel, );`,
    //         path: `${cliPath}/generators/relation/has-one-relation.generator.js`
    //     },
    //     updateHasOne2: {
    //         searchString: `dstRepositoryClassName,`,
    //         replacement: `dstRepositoryClassName,this.artifactInfo.srcModelClass,`,
    //         path: `${cliPath}/generators/relation/has-one-relation.generator.js`
    //     },
    //     updateHasManyThroughTemplate: {
    //         searchString: `exclude: ['<%= targetModelPrimaryKey %>'],`,
    //         replacement: `exclude: [<% exclude.forEach(function(item,index){ %>'<%= item %>', <% }) %>],`,
    //         path: `${cliPath}/generators/relation/templates/controller-relation-template-has-many-through.ts.ejs`
    //     },
    //     updateHasManyTemplate: {
    //         searchString: `exclude: ['<%= targetModelPrimaryKey %>'],`,
    //         replacement: `exclude: [<% exclude.forEach(function(item,index){ %>'<%= item %>', <% }) %>],`,
    //         path: `${cliPath}/generators/relation/templates/controller-relation-template-has-many.ts.ejs`
    //     },
    //     updateHasManyThroughTemplate1: {
    //         searchString: `}) <%= targetModelRequestBody %>: Omit<<%= targetModelClassName %>, '<%= targetModelPrimaryKey %>'>,`,
    //         replacement: `exclude: [<% exclude.forEach(function(item,index){ %>'<%= item %>', <% }) %>],`,
    //         path: `${cliPath}/generators/relation/templates/controller-relation-template-has-many-through.ts.ejs`
    //     },
    //     updateHasManyTemplate1: {
    //         searchString: `}) <%= targetModelRequestBody %>: Omit<<%= targetModelClassName %>, '<%= targetModelPrimaryKey %>'>,`,
    //         replacement: `exclude: [<% exclude.forEach(function(item,index){ %>'<%= item %>', <% }) %>],`,
    //         path: `${cliPath}/generators/relation/templates/controller-relation-template-has-many.ts.ejs`
    //     },
    //     updateHasOneTemplate: {
    //         searchString: '<%= sourceModelClassName %>,',
    //         replacement: `<%if (sourceModelClassName != targetModelClassName) { %><%= sourceModelClassName %>,<% } %>`,
    //         path: `${cliPath}/generators/relation/templates/controller-relation-template-has-one.ts.ejs`
    //     },
    //     updateHasOneTemplate1: {
    //         searchString: `exclude: ['<%= targetModelPrimaryKey %>'],`,
    //         replacement: `exclude: [<% exclude.forEach(function(item,index){ %>'<%= item %>', <% }) %>],`,
    //         path: `${cliPath}/generators/relation/templates/controller-relation-template-has-one.ts.ejs`
    //     },
    //     updateHasOneTemplate2: {
    //         searchString: `}) <%= targetModelRequestBody %>: Omit<<%= targetModelClassName %>, '<%= targetModelPrimaryKey %>'>,`,
    //         replacement: `}) <%= targetModelRequestBody %>: Omit<<%= targetModelClassName %>, '<%= exclude %>'>,`,
    //         path: `${cliPath}/generators/relation/templates/controller-relation-template-has-one.ts.ejs`
    //     }
    // },
    addPrefix: {
        addOption: {
            searchString: 'return super._setupGenerator();',
            replacement: `this.option('prefix', {description: g.f('Provide prefix to avoid duplication'),required: false,type: String,});return super._setupGenerator();`,
            path: `${cliPath}/generators/openapi/index.js`
        },
        addPrompt: {
            searchString: 'async askForSpecUrlOrPath() {',
            replacement: `async askForPrefix() {if (this.shouldExit()) return; const prompts = [{name: 'prefix',message: g.f('Provide prefix to avoid duplication'),when: !this.options.prefix,default: 'openapi',},];const answers = await this.prompt(prompts);if (answers.prefix) {this.options.prefix = answers.prefix;}this.options.prefix = this.options.prefix.replace(/\w+/g,w => w[0].toUpperCase() + w.slice(1).toLowerCase(),);}async askForSpecUrlOrPath() {`,
            path: `${cliPath}/generators/openapi/index.js`
        },
        destructorPrefix: {
            searchString: `promoteAnonymousSchemas: this.options['promote-anonymous-schemas'],`,
            replacement: `promoteAnonymousSchemas: this.options['promote-anonymous-schemas'],prefix: this.options.prefix,`,
            path: `${cliPath}/generators/openapi/index.js`
        },
        appendPrefix: {
            searchString: `const choices = this.controllerSpecs.map(c => {`,
            replacement: `this.controllerSpecs = this.controllerSpecs.map(c => {if (c.tag.includes(this.options.prefix)) {let splited = c.tag.split(this.options.prefix);c.tag = splited.join('');} return c;});const choices = this.controllerSpecs.map(c => {`,
            path: `${cliPath}/generators/openapi/index.js`
        },
        appendPrefixToFileName: {
            searchString: `c.fileName = getControllerFileName(c.tag || c.className);`,
            replacement: `c.fileName = getControllerFileName(c.tag || c.className);c.fileName = this.options.prefix.toLowerCase() + '.' + c.fileName;`,
            path: `${cliPath}/generators/openapi/index.js`
        },
        destructorPrefixFromParam: {
            searchString: '{log, validate, promoteAnonymousSchemas} = {},',
            replacement: '{log, validate, promoteAnonymousSchemas, prefix} = {},',
            path: `${cliPath}/generators/openapi/spec-loader.js`
        },
        updateSpecification: {
            searchString: 'const apiSpec = await loadSpec(url, {log, validate});',
            replacement: `const jsonc = require('jsonc');\n let apiSpec = await loadSpec(url, {log, validate});\nconst {components, paths} = apiSpec;\nlet stringifiedApiSpecs = jsonc.stringify(apiSpec);\nstringifiedApiSpecs = stringifiedApiSpecs.replaceAll('WithRelations',\`\$\{prefix\}WithRelations\`,);if (paths) {Object.keys(paths).forEach(eachPath => {if (\!eachPath.includes('{id}') \&\& \!eachPath.includes('count')) {const updatedPath =eachPath.slice(0, 0) + '/' + prefix.toLowerCase() + '/' +eachPath.slice(1);stringifiedApiSpecs = stringifiedApiSpecs.replaceAll(eachPath,updatedPath,);}});}if (components) {const {schemas} = components;if (schemas) {Object.keys(schemas).forEach(item => {if (\!item.startsWith('loopback') \&\& \!item.startsWith('New') \&\& \!item.endsWith('Relations') \&\& \!item.endsWith('Partial') \&\& \!item.includes('Through') \&\& \!item.includes('.') \&\& \!item.includes('Ping')) {stringifiedApiSpecs = stringifiedApiSpecs.replaceAll(item,prefix + item,);}if (item.includes('Ping')) {stringifiedApiSpecs = stringifiedApiSpecs.replaceAll('Ping',prefix + 'Ping');}});}}\napiSpec = jsonc.parse(stringifiedApiSpecs);`,
            path: `${cliPath}/generators/openapi/spec-loader.js`
        },
    },
    limitOpenapi: {
        addOptions: {
            searchString: 'return super._setupGenerator();',
            replacement: `\nthis.option('readonly', { description: g.f('Generate only GET endpoints.'), required: false, type: Boolean, }); this.option('exclude', { description: g.f('Exclude endpoints with provided regex.'), required: false, type: String, }); this.option('include', { description: g.f('Only include endpoints with provided regex.'), required: false, type: String, }); return super._setupGenerator();`,
            path: `${cliPath}/generators/openapi/index.js`
        },
        addPromptsForOptions: {
            searchString: 'async askForSpecUrlOrPath() {',
            replacement: `\nasync askForReadonly() {if (this.shouldExit()) return;const prompts = [{name: 'readonly',message: g.f('Generate only GET endpoints.'),when: false,default: false,},];const answers = await this.prompt(prompts);if (answers.readonly && !this.options.readonly) {this.options.readonly = answers.readonly;}}async askForExclude() {if (this.shouldExit()) return;const prompts = [{name: 'exclude',message: g.f('Exclude endpoints with provided regex.'),when: false,default: false,},];const answers = await this.prompt(prompts);if (answers.exclude && !this.options.exclude) {const excludes = answers.exclude.split(',');this.excludings = [];excludes.forEach(exclude => {this.excludings.push(exclude);});}}async askForInclude() {if (this.shouldExit()) return;const prompts = [{name: 'include',message: g.f('Only include endpoints with provided regex.'),when: false,default: false,},];const answers = await this.prompt(prompts);if (answers.include && !this.options.include) {const includes = answers.include.split(',');this.includings = [];includes.forEach(include => {this.includings.push(include);});}}\nasync askForSpecUrlOrPath() {`,
            path: `${cliPath}/generators/openapi/index.js`
        },
        addImplementationForLimit: {
            searchString: 'const result = await loadAndBuildSpec(this.url, {',
            replacement: `let includings = []; let excludings = []; if (this.options.exclude) { excludings = this.options.exclude.split(','); } if (this.options.include) { includings = this.options.include.split(','); } if (!this.includings) this.includings = []; includings.forEach(including => { if (including.includes(':')) { const splitedInclude = including.split(':'); const temp = {}; if (splitedInclude[0] === '*') { temp[splitedInclude[1]] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']; this.includings.push(temp); } else { temp[splitedInclude[1]] = [splitedInclude[0]]; this.includings.push(temp); } } }); if (!this.excludings) this.excludings = []; excludings.forEach(excluding => { if (excluding.includes(':')) { const splitedExclude = excluding.split(':'); const temp = {}; if (splitedExclude[0] === '*') { temp[splitedExclude[1]] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']; this.excludings.push(temp); } else { temp[splitedExclude[1]] = [splitedExclude[0]]; this.excludings.push(temp);}}});\n\t\t\tconst result = await loadAndBuildSpec(this.url, {`,
            path: `${cliPath}/generators/openapi/index.js`
        },
        passOptions: {
            searchString: 'log: this.log,',
            replacement: `\n\tlog: this.log,\n\treadonly: this.options.readonly,\n\excludings: this.excludings,\n\includings: this.includings,`,
            path: `${cliPath}/generators/openapi/index.js`
        },
        requireOpenapiFilter: {
            searchString: `require('@apidevtools/json-schema-ref-parser');`,
            replacement: `require('@apidevtools/json-schema-ref-parser');\nconst openapiFilter = require('openapi-filter');`,
            path: `${cliPath}/generators/openapi/spec-loader.js`
        },
        destructLimitOptions: {
            searchString: `prefix}`,
            replacement: `readonly, excludings, includings, prefix}`,
            path: `${cliPath}/generators/openapi/spec-loader.js`
        },
        applyFilters: {
            searchString: `let stringifiedApiSpecs = jsonc.stringify(apiSpec);`,
            replacement: `let stringifiedApiSpecs = jsonc.stringify(apiSpec);\napiSpec = filterSpec(JSON.parse(stringifiedApiSpecs), readonly, excludings, includings);\n\t\t\tstringifiedApiSpecs=JSON.stringify(apiSpec);`,
            path: `${cliPath}/generators/openapi/spec-loader.js`
        },
        addHelpingMethods: {
            searchString: `module.exports = {`,
            replacement: `\nfunction getIndiciesOf(searchStr, str, caseSensitive) {const searchStrLen = searchStr.length;if (searchStrLen === 0) { return []; }; let startIndex = 0, index;const indices = [];if (!caseSensitive) { str = str.toLowerCase(); searchStr = searchStr.toLowerCase();}while ((index = str.indexOf(searchStr, startIndex)) > -1) { indices.push(index); startIndex = index + searchStrLen;}return indices;}\nfunction insertAtIndex(str, substring, index) {return str.slice(0, index) + substring + str.slice(index);}\nfunction applyFilters(specs, options) {const openapiComponent = specs.components;specs = openapiFilter.filter(specs, options);specs.components = openapiComponent;return specs;}\nfunction findIndexes(stringSpecs, regex) {let result;const indices = [];while ((result = regex.exec(stringSpecs))) { indices.push(result.index);}return indices;}\nfunction excludeOrIncludeSpec(specs, filter) {Object.keys(filter).forEach(filterKey => { const regex = new RegExp(filterKey, 'g'); const actions = filter[filterKey]; for (const key in specs.paths) { if (Object.hasOwnProperty.call(specs.paths, key)) { if (findIndexes(key, regex).length) { if (specs.paths[key]) { actions.forEach(action => { action = action.toLowerCase(); if (specs.paths[key][action]) { specs.paths[key][action]['x-filter'] = true; } }); } } } } }); return specs;}\nfunction readonlySpec(specs) {let stringifiedSpecs = JSON.stringify(specs);const excludeOps = ['\"post\":', '\"patch\":', '\"put\":', '\"delete\":'];excludeOps.forEach(operator => { let indices = getIndiciesOf(operator, stringifiedSpecs); let indiciesCount = 0; while (indiciesCount < indices.length) { indices = getIndiciesOf(operator, stringifiedSpecs); const index = indices[indiciesCount]; stringifiedSpecs = insertAtIndex( stringifiedSpecs, '\"x-filter\": true,', index + operator.length + 1, ); indiciesCount++;}});return JSON.parse(stringifiedSpecs);}function filterSpec(specs, readonly, excludings, includings) {const options = { valid: true, info: true, strip: true, flags: ['x-filter'], servers: true, inverse: false,};if (excludings \&\& excludings.length) { excludings.forEach(exclude => { specs = excludeOrIncludeSpec(specs, exclude); }); specs = applyFilters(specs, options);}if (includings \&\& includings.length) { includings.forEach(include => { specs = excludeOrIncludeSpec(specs, include); }); options.inverse = true; specs = applyFilters(specs, options);} if (readonly) { options.inverse = false; specs = applyFilters(readonlySpec(specs), options); } return specs;}\n\nmodule.exports = {`,
            path: `${cliPath}/generators/openapi/spec-loader.js`
        },

    },
    hasManyThroughNonPrimaryKey: {
        defineVariables: {
            searchString: 'const sourceKey = options.sourceKeyOnThrough;',
            replacement: 'const sourceKey = options.sourceKeyOnThrough; \nconst customSourceModelKey = options.customSourceModelKey; \n const customTargetModelKey = options.customTargetModelKey;',
            path: `${cliPath}/generators/relation/has-many-through-relation.generator.js`
        },
        variableAssignment: {
            searchString: 'const sourceKeyType = options.sourceModelPrimaryKeyType;',
            replacement: 'const sourceKeyType = \n options.customSourceModelKeyType || options.sourceModelPrimaryKeyType;',
            path: `${cliPath}/generators/relation/has-many-through-relation.generator.js`
        },
        variableAssignment1: {
            searchString: 'const targetKeyType = options.destinationModelPrimaryKeyType;',
            replacement: 'const targetKeyType = \noptions.customTargetModelKeyType || \n options.destinationModelPrimaryKeyType;',
            path: `${cliPath}/generators/relation/has-many-through-relation.generator.js`
        },
        emptyCustomReferenceKeys: {
            searchString: `let keyTo = '';`,
            replacement: `let keyTo = '';let customReferenceKeyFrom = '';let customReferenceKeyTo = '';`,
            path: `${cliPath}/generators/relation/has-many-through-relation.generator.js`
        },
        passKeysToGetHasManyThrough: {
            searchString: `getHasManyThrough(`,
            replacement: `getHasManyThrough(customSourceModelKey,customTargetModelKey,`,
            path: `${cliPath}/generators/relation/has-many-through-relation.generator.js`,
            replaceAll: true
        },
        constructKey: {
            searchString: 'const relationDecorator = [',
            replacement: `if (customSourceModelKey) { customReferenceKeyFrom = \`customReferenceKeyFrom:'\$\{customSourceModelKey\}',\`; } if (customTargetModelKey) { customReferenceKeyTo = \`customReferenceKeyTo:'\$\{customTargetModelKey\}',\`; }; const relationDecorator = [`,
            path: `${cliPath}/generators/relation/has-many-through-relation.generator.js`
        },
        addReference: {
            searchString: 'through: {model: ()',
            replacement: `\${customReferenceKeyFrom}\${customReferenceKeyTo}through: {model: ()`,
            path: `${cliPath}/generators/relation/has-many-through-relation.generator.js`
        },
        addOptions: {
            searchString: `this.option('destinationModel', {`,
            replacement: `this.option('customReferenceKeys', {type: String,required: false,description: g.f('Any Custom Reference Kyes'),});this.option('customSourceModelKey', {type: String,required: false,description: g.f('Custom Source model key'),});this.option('customTargetModelKey', {type: String,required: false,description: g.f('Custom Destination model'),});this.option('destinationModelKey', {type: String,required: false,description: g.f('Destination model key'),}); \n this.option('destinationModel', {`,
            path: `${cliPath}/generators/relation/index.js`
        },
        addPrompt: {
            searchString: `async promptForeignKey() {`,
            replacement: `async promptCustomReferenceKeys() {if (this.shouldExit()) return false;if (this.options.customReferenceKeys) {this.artifactInfo.customReferenceKeys = this.options.customReferenceKeys;}if (this.options.customSourceModelKey) {this.artifactInfo.customSourceModelKey =this.options.customSourceModelKey;}if (this.options.customTargetModelKey) {this.artifactInfo.customTargetModelKey =this.options.customTargetModelKey;}if (this.artifactInfo.relationType === 'hasManyThrough') {const props = await this.prompt([{type: 'confirm',name: 'customReferenceKeys',message: g.f('Do you have custom reference keys for source and target models?',),when: this.artifactInfo.customReferenceKeys === undefined,default: false,},]);Object.assign(this.artifactInfo, props);if (this.artifactInfo.customReferenceKeys) {const answerSource = await this.prompt([{type: 'input',name: 'customSourceModelKey',message: g.f('What is the name of reference key in source model?'),when: this.artifactInfo.customSourceModelKey === undefined,},]);if (answerSource.customSourceModelKey) {this.artifactInfo.customSourceModelKey =answerSource.customSourceModelKey;}const answerTarget = await this.prompt([{type: 'input',name: 'customTargetModelKey',message: g.f('What is the name of reference key in target model?'),when: this.artifactInfo.customTargetModelKey === undefined,},]);if (answerTarget.customTargetModelKey) {this.artifactInfo.customTargetModelKey =answerTarget.customTargetModelKey;}const customSourceModelKeyType = relationUtils.getModelPropertyType(this.artifactInfo.modelDir,this.artifactInfo.sourceModel,this.artifactInfo.customSourceModelKey,);const customTargetModelKeyType = relationUtils.getModelPropertyType(this.artifactInfo.modelDir,this.artifactInfo.destinationModel,this.artifactInfo.customTargetModelKey,); if (customSourceModelKeyType) {this.artifactInfo.customSourceModelKeyType = customSourceModelKeyType;} else {const answer = await this.prompt([{type: 'list',name: 'customSourceModelKeyType',message: g.f('What is the type of the custom reference key of source model?',),choices: ['number', 'string', 'object'],when: this.artifactInfo.customSourceModelKeyType === undefined,default: 'number',},]);this.artifactInfo.customSourceModelKeyType =answer.customSourceModelKeyType;}if (customTargetModelKeyType) {this.artifactInfo.customTargetModelKeyType = customTargetModelKeyType;} else {const answer = await this.prompt([{type: 'list',name: 'customTargetModelKeyType',message: g.f('What is the type of the custom reference key of source model?',),choices: ['number', 'string', 'object'],when: this.artifactInfo.customTargetModelKeyType === undefined,default: 'number',},]);this.artifactInfo.customTargetModelKeyType =answer.customTargetModelKeyType;}}}} \n async promptForeignKey() {`,
            path: `${cliPath}/generators/relation/index.js`
        }
    },
    // specificDSMigration: {
    //     addImport: {
    //         searchString: `import {<%= project.applicationName %>} from './application';`,
    //         replacement: `import {<%= project.applicationName %>} from './application';\nimport { ApplicationConfig } from '@loopback/core';`,
    //         path: `${cliPath}/generators/app/templates/src/migrate.ts.ejs`
    //     },
    //     removeLog: {
    //         searchString: `console.log('Migrating schemas (%s existing schema)', existingSchema);`,
    //         replacement: ``,
    //         path: `${cliPath}/generators/app/templates/src/migrate.ts.ejs`
    //     },
    //     declareDS: {
    //         searchString: `const existingSchema = args.includes('--rebuild') ? 'drop' : 'alter';`,
    //         replacement: `const existingSchema = args.includes('--rebuild') ? 'drop' : 'alter';\nconst datasourceName = args.find(arg => arg.startsWith('datasource='))?.split('=')[1];`,
    //         path: `${cliPath}/generators/app/templates/src/migrate.ts.ejs`
    //     },
    //     reAddLog: {
    //         searchString: `args.find(arg => arg.startsWith('datasource='))?.split('=')[1];`,
    //         replacement: `args.find(arg => arg.startsWith('datasource='))?.split('=')[1];\nconsole.log('Migrating schemas (%s existing schema)', existingSchema);`,
    //         path: `${cliPath}/generators/app/templates/src/migrate.ts.ejs`
    //     },
    //     removeMigrationStatement: {
    //         searchString: `await app.migrateSchema({existingSchema});`,
    //         replacement: ``,
    //         path: `${cliPath}/generators/app/templates/src/migrate.ts.ejs`
    //     },
    //     appCreation: {
    //         searchString: `const app = new <%= project.applicationName %>();`,
    //         replacement: `const config: ApplicationConfig = {};\nconst app = new <%= project.applicationName %>(config);`,
    //         path: `${cliPath}/generators/app/templates/src/migrate.ts.ejs`
    //     },
    //     removeProcessExit: {
    //         searchString: `process.exit(0);`,
    //         replacement: ``,
    //         path: `${cliPath}/generators/app/templates/src/migrate.ts.ejs`
    //     },
    //     declareOptionAndElse: {
    //         searchString: `await app.boot();`,
    //         replacement: `await app.boot();\nlet options = {}; if (datasourceName) {console.log('Migrating specific datasource: %s', datasourceName);try {const repositoryBindings = app.find('repositories.*');const models = [];for (const binding of repositoryBindings) {if (binding.key !== 'repositories.RefreshTokenRepository') {const repo: any = await app.get(binding.key);if (repo.dataSource && repo.dataSource.name === datasourceName) {models.push(repo.entityClass.modelName);}}}if (models.length === 0) {console.warn(\`No models found for datasource \${datasourceName}\`);}options = { existingSchema, models };console.log(\`Migration of datasource \${datasourceName} completed successfully.\`);} catch (err) {console.log(err);console.error(\`Error migrating datasource \${datasourceName}:\`, err);process.exit(1);}} else {console.log('Migrating all datasources');options = { existingSchema };}await app.migrateSchema(options);process.exit(0);`,
    //         path: `${cliPath}/generators/app/templates/src/migrate.ts.ejs`
    //     },
    // },
    serviceGenerationFix: {
        addQuotesIfHyphen: {
            searchString: 'methodParameters[methodName].push(param.name);',
            replacement: `const { argName } = buildParameter(param, {});methodParameters[methodName].push(argName);`,
            path: `${cliPath}/generators/openapi/spec-helper.js`
        }
    },
    addQuotesToDefaultFn: {
        addQutoes: {
            searchString: 'if (NON_TS_TYPES.includes(val.tsType)) {',
            replacement: `if (val.defaultFn) { val.defaultFn = \`'\${val.defaultFn}'\`; }\nif (NON_TS_TYPES.includes(val.tsType)) {`,
            path: `${cliPath}/generators/model/property-definition.js`
        }
    },
    addTypeCheckBeforeJsonParsing: {
        addTypeCheckBeforeJsonParsing: {
            searchString: 'props[key] = JSON.parse(props[key]);',
            replacement: `if (typeof props[key] === 'string') {props[key] = JSON.parse(props[key]);}`,
            path: `${cliPath}/generators/datasource/index.js`
        }
    },
    disableStrictModeInModelDiscovery: {
        setStrictToFalse: {
            searchString: '...discoveredSettings,',
            replacement: `...discoveredSettings,strict: false,`,
            path: `${cliPath}/generators/discover/import-discovered-model.js`
        },
    },
    addEnumValuesToMySQL: {
        declareEnumString: {
            searchString: 'templateData.properties[key][\'type\'] = \'String\';',
            replacement: `const enumItemString = enumItems.toString().replace(/,\s*$/, '');\ntemplateData.properties[key]['type'] = 'String';`,
            path: `${cliPath}/generators/discover/index.js`
        },
        assignUpdatedMySQL: {
            searchString: '`{enum: [${enumItems.toString()}]}`;',
            replacement: ' `{enum: [${enumItemString}]}`;const mysqlString = templateData.properties[key][\'mysql\'];templateData.properties[key][\'mysql\'] = mysqlString.replace("\'enum\',",`\'enum\', value: "${enumItemString}",`,);',
            path: `${cliPath}/generators/discover/index.js`
        }
    },
    iterateContentProperties: {
        replaceLoop: {
            searchString: 'for (const m of content) {',
            replacement: 'for (const eachContent in content) {',
            path: `${cliPath}/generators/openapi/spec-helper.js`
        },
        replaceAssignment: {
            searchString: 'propSchema = content[m].schema;',
            replacement: 'propSchema = eachContent.schema;',
            path: `${cliPath}/generators/openapi/spec-helper.js`
        }
    },
    removeDuplicationInHasOneTemplate: {
        removeDoubles: {
            searchString: '<%= targetModelClassName %>,',
            replacement: '',
            path: `${cliPath}/generators/relation/templates/controller-relation-template-has-one.ts.ejs`,
        }
    },
    supportAllOptionInRepoGenerator: {
        checkForAllOption: {
            searchString: 'if (this.options.model) {',
            replacement: 'if(this.options.all){this.artifactInfo.modelNameList = modelList;}\nif (this.options.model) {',
            path: `${cliPath}/generators/repository/index.js`,
        },
    },
    setAllTrueIfAllModelSelected: {
        checkForAllOption: {
            searchString: 'debug(`props after model list prompt: ${inspect(props)}`);',
            replacement: 'if (this.artifactInfo.modelNameList.length === modelList.length) {this.artifactInfo.all = true;} else {this.options.model = this.artifactInfo.modelNameList.toString();}\ndebug(`props after model list prompt: ${inspect(props)}`);',
            path: `${cliPath}/generators/repository/index.js`,
        },
    },
    supportMultiModelsInRepoGenerator: {
        addSplitingModelsByComma: {
            searchString: 'this.options.model = utils.toClassName(this.options.model);',
            replacement: 'let models = this.options.model.split(\',\');models = models.map(model => utils.toClassName(model));const modelNameList = [];this.options.model = models.toString();models.forEach(model => {if (modelList \&\& modelList.length > 0 \&\& modelList.includes(model)) {modelNameList.push(model);} else {modelList = [];}});Object.assign(this.artifactInfo, { modelNameList });',
            path: `${cliPath}/generators/repository/index.js`,
        },
        removeSingleModelImplementation: {
            searchString: `if\\s*\\(\\s*modelList\\s*&&\\s*modelList\\.length\\s*>\\s*0\\s*&&\\s*modelList\\.includes\\(\\s*this\\.options\\.model\\s*\\)\\s*\\)\\s*\\{\\s*Object\\.assign\\(\\s*this\\.artifactInfo,\\s*\\{modelNameList:\\s*\\[this\\.options\\.model\\]\\}\\);\\s*\\}\\s*else\\s*\\{\\s*modelList\\s*=\\s*\\[\\];\\s*\\}`,
            replacement: '',
            path: `${cliPath}/generators/repository/index.js`,
            isRegex: true
        },
    },
    generateConfigs: {
        forAppGenerator: {
            searchString: 'if (this.shouldExit()) return result;',
            replacement: `if (this.shouldExit()) return result;\nif(\!this.projectInfo.config \&\& this.options['generate-configs']) {delete this.projectInfo['generate-configs'];const configs = { ...this.projectInfo };delete configs.projectType;delete configs.dependencies;this.log(JSON.stringify(configs));process.exit(0)}`,
            path: `${cliPath}/generators/app/index.js`,
        },
        forControllerGenerator: {
            searchString: '// renames the file',
            replacement: `if(\!this.artifactInfo.config \&\& this.options['generate-configs']) {delete this.artifactInfo['generate-configs'];const configs = { ...this.artifactInfo };this.log(JSON.stringify(configs));process.exit(0)}`,
            path: `${cliPath}/generators/controller/index.js`,
        },
        forDatasourceGenerator: {
            searchString: '// From LB3',
            replacement: `if(\!this.artifactInfo.config \&\& this.options['generate-configs']) {delete this.artifactInfo['generate-configs'];const configs = { ...this.artifactInfo };this.log(JSON.stringify(configs));process.exit(0)}`,
            path: `${cliPath}/generators/datasource/index.js`,
        },
        forDiscoverGenerator: {
            searchString: '// Exit if needed',
            replacement: `if (\!this.artifactInfo.config \&\& this.options['generate-configs']) {delete this.artifactInfo['generate-configs'];const configs = { ...this.artifactInfo };if (configs.modelDefinitions.length === this.modelChoices.length) {delete configs.modelDefinitions;configs.all = true;} else {configs.modelDefinitions.forEach(({ name }) => {if (\!configs.models) configs.models = '';configs.models += \`\${name},\`;});configs.models = configs.models.substring(0, configs.models.length - 1);delete configs.modelDefinitions;}delete configs.dataSource;configs.schema = this.options.schema;this.log(JSON.stringify(configs));process.exit(0);}`,
            path: `${cliPath}/generators/discover/index.js`,
        },
        forInterceptorGenerator: {
            searchString: '// Setting up data for templates',
            replacement: `if(\!this.artifactInfo.config \&\& this.options['generate-configs']) {delete this.artifactInfo['generate-configs'];const configs = { ...this.artifactInfo };this.log(JSON.stringify(configs));process.exit(0)}`,
            path: `${cliPath}/generators/interceptor/index.js`,
        },
        forModelGenerator: {
            searchString: 'debug(\'scaffolding\');',
            replacement: `if(\!this.artifactInfo.config \&\& this.options['generate-configs']) {delete this.artifactInfo['generate-configs'];const configs = { ...this.artifactInfo };this.log(JSON.stringify(configs));process.exit(0)}\ndebug('scaffolding');`,
            path: `${cliPath}/generators/model/index.js`,
        },
        forOpenapiGenerator: {
            searchString: 'this._generateModels();',
            replacement: `if(\!this.artifactInfo.config \&\& this.options['generate-configs']) {delete this.artifactInfo['generate-configs'];const configs = { ...this.artifactInfo };configs.url = this.url;this.log(JSON.stringify(configs));process.exit(0)}\nthis._generateModels();`,
            path: `${cliPath}/generators/openapi/index.js`,
        },
        forRestCrudGenerator: {
            searchString: 'if (_.isEmpty(this.artifactInfo.modelNameList)) {',
            replacement: `if(\!this.artifactInfo.config \&\& this.options['generate-configs']) {delete this.artifactInfo['generate-configs'];const configs = { ...this.artifactInfo };configs.url = this.url;this.log(JSON.stringify(configs));process.exit(0)}\nif (_.isEmpty(this.artifactInfo.modelNameList)) {`,
            path: `${cliPath}/generators/rest-crud/index.js`,
        },
        forServiceGenerator: {
            searchString: '// Setting up data for templates',
            replacement: 'if(\!this.artifactInfo.config \&\& this.options[\'generate-configs\']) {delete this.artifactInfo[\'generate-configs\'];const configs = {};configs.name = this.artifactInfo.name;configs.serviceType = this.artifactInfo.serviceType;configs.datasource = this.artifactInfo.datasource;this.log(JSON.stringify(configs));process.exit(0);}',
            path: `${cliPath}/generators/service/index.js`,
        },
        forRepositoryGenerator: {
            searchString: 'this.artifactInfo.isRepositoryBaseBuiltin = BASE_REPOSITORIES.includes(',
            replacement: 'if (\!this.artifactInfo.config && this.options[\'generate-configs\']) {delete this.artifactInfo[\'generate-configs\'];const configs = {};configs.datasource = this.artifactInfo.dataSourceName;configs.model = this.options.model;configs.id = this.options.idProperty;configs.all = this.artifactInfo.all;configs.repositoryBaseClass = this.artifactInfo.repositoryBaseClass;this.log(JSON.stringify(configs));process.exit(0);}\nthis.artifactInfo.isRepositoryBaseBuiltin = BASE_REPOSITORIES.includes(',
            path: `${cliPath}/generators/repository/index.js`,
        },
        forRelationGenerator: {
            searchString: 'let relationGenerator;',
            replacement: 'if (\!this.artifactInfo.config \&\& this.options[\'generate-configs\']) {delete this.artifactInfo[\'generate-configs\'];const configs = {};configs.relationName = this.artifactInfo.relationName;configs.sourceModel = this.artifactInfo.sourceModel;configs.destinationModel = this.artifactInfo.destinationModel;configs.throughModel = this.artifactInfo.throughModel;configs.foreignKeyName = this.artifactInfo.foreignKeyName;configs.sourceModelPrimaryKey = this.artifactInfo.sourceModelPrimaryKey;configs.destinationModelPrimaryKey = this.artifactInfo.destinationModelPrimaryKey;configs.sourceKeyOnThrough = this.artifactInfo.sourceKeyOnThrough;configs.sourceModelPrimaryKeyType = this.artifactInfo.sourceModelPrimaryKeyType;configs.targetKeyOnThrough = this.artifactInfo.targetKeyOnThrough;configs.destinationModelPrimaryKeyType = this.artifactInfo.destinationModelPrimaryKeyType;configs.relationName = this.artifactInfo.relationName;configs.relationType = this.artifactInfo.relationType;configs.registerInclusionResolver = this.artifactInfo.registerInclusionResolver;this.log(JSON.stringify(configs));process.exit(0);}\nlet relationGenerator;',
            path: `${cliPath}/generators/relation/index.js`,
        },
    },
    fixDiscoveryWithMissingModels: {
        ignoreUndefinedModel: {
            searchString: 'const modelInfo = this.discoveringModels[i];',
            replacement: `const modelInfo = this.discoveringModels[i];\nif (\!modelInfo) continue;`,
            path: `${cliPath}/generators/discover/index.js`,
        },
    },
    outDirControllers: {
        outDirOption: {
            searchString: 'return super._setupGenerator();',
            replacement: `this.option('outDir', {type: String,description: 'Custom output directory for controller'});\nreturn super._setupGenerator();`,
            path: `${cliPath}/generators/controller/index.js`,
        },
        outDirOptionToArtifact: {
            searchString: 'const dest = this.destinationPath(',
            replacement: `if (this.options.outDir) {this.artifactInfo.outDir = path.resolve(this.options.outDir);}\nconst dest = this.destinationPath(`,
            path: `${cliPath}/generators/controller/index.js`,
        },
        changeParameter: {
            searchString: 'updateIndex(dir',
            replacement: `updateIndex(this.artifactInfo.relPath`,
            path: `${cliPath}/lib/base-generator.js`,
        },
        addParameter: {
            searchString: 'this.fs)',
            replacement: `this.fs, subDir)`,
            path: `${cliPath}/lib/base-generator.js`,
        },
        addSubDir: {
            searchString: 'async _updateIndexFile(dir, file) {',
            replacement: `async _updateIndexFile(dir, file) {\nconst subDir = path.relative(this.artifactInfo.relPath, this.artifactInfo.outDir);`,
            path: `${cliPath}/lib/base-generator.js`,
        },
        removeExtraPath: {
            searchString: 'updateDirRelPath,',
            replacement: `'',`,
            path: `${cliPath}/lib/base-generator.js`,
        },
        addParameterToMethod: {
            searchString: 'fsApis)',
            replacement: `fsApis, subDir = '')`,
            path: `${cliPath}/lib/update-index.js`,
        },
        changeExport: {
            searchString: `from './`,
            replacement: `from './\${subDir? subDir + '/':''}`,
            path: `${cliPath}/lib/update-index.js`,
        },
    },
    sameTableRelationInDiscover: {
        setStrictToFalse: {
            searchString: 'this.copyTemplatedFiles(',
            replacement: `if (templateData && templateData['relationDestinationImports'] && templateData['relationDestinationImports'].includes(templateData['name'])) { templateData['relationDestinationImports'] = templateData['relationDestinationImports'].filter(e => e !== templateData['name']); }\nthis.copyTemplatedFiles(`,
            path: `${cliPath}/generators/discover/index.js`
        },
    },
    retainPropertyDetailsAfterCreatingRelation: {
        addUtilMethod: {
            searchString: 'exports.getPropertyType = function (classObj, propertyName) {',
            replacement: `exports.getPropertyDecoratorDetails = function (classObj, propertyName) {if(!classObj.getProperty(propertyName)) {return ''}\nreturn classObj.getProperty(propertyName).getDecorator('property').getArguments()[0].getText();};\nexports.getPropertyType = function (classObj, propertyName) {`,
            path: `${cliPath}/generators/relation/utils.generator.js`
        },
        fetchForeignKeyDetails: {
            searchString: 'const sourceClass = relationUtils.getClassObj(sourceFile, sourceModel);',
            replacement: `const sourceClass = relationUtils.getClassObj(sourceFile, sourceModel);\nconst foreignKeyDetails = relationUtils.getPropertyDecoratorDetails(sourceClass, foreignKeyName);`,
            path: `${cliPath}/generators/relation/belongs-to-relation.generator.js`
        },
        addDetailsToUpdatedProperty: {
            searchString: 'relationUtils.addProperty(sourceClass, modelProperty);',
            replacement: `if(foreignKeyDetails !== '') {if (foreignKeyDetails.includes('nullable: true') || foreignKeyDetails.includes('nullable: true')) { modelProperty['hasQuestionToken'] = true;} if (!modelProperty['decorators'][0]['arguments'][0].includes(',')) { modelProperty['decorators'][0]['arguments'].push("{}"); } modelProperty['decorators'][0]['arguments'].push(foreignKeyDetails);}\nrelationUtils.addProperty(sourceClass, modelProperty);`,
            path: `${cliPath}/generators/relation/belongs-to-relation.generator.js`
        }
    },
};

(async () => {
    applyPatches(patches);
    applyPrePatches();
})();

export const globalPatches = async () => {
    applyPatches(patches);
    applyPrePatches();
}