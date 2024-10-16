import { Patch } from '../types/index.js';
import { applyPatches } from '../utils/index.js';

export const patches: Patch = {
    markStoredAndVirtualAsGenerated: {
        addAssignment: {
            searchString: '\' CASE WHEN extra LIKE \\\'%auto_increment%\\\' THEN 1 ELSE 0 END AS "generated"\' +',
            replacement: `\`
            case
              when extra like '%virtual%' then 1
              when extra like '%stored%' then 1
              when extra LIKE '%auto_increment%' THEN 1
              else 0
            end as "generated"
            \` +`,
            path: './node_modules/loopback-connector-mysql/lib/discovery.js',
            replaceAll: true
        },
    },
    fetchIndexInfo: {
        constructObject: {
            searchString: 'schema.properties[propName] = {',
            replacement: `const propertyDetails = {`,
            path: './node_modules/loopback-datasource-juggler/lib/datasource.js',
        },
        assignIndexProperty: {
            searchString: 'if (pks[item.columnName]) {',
            replacement: `if (item.indexType === 'BTREE' && item.indexName !== 'PRIMARY' && !item.isForeignKey ) { propertyDetails.index = {unique: true} };`,
            path: './node_modules/loopback-datasource-juggler/lib/datasource.js',
        },
        reassignPKs: {
            searchString: 'schema.properties[propName].id = pks[item.columnName];',
            replacement: `propertyDetails[propName].id = pks[item.columnName];`,
            path: './node_modules/loopback-datasource-juggler/lib/datasource.js',
        },
        removeIfStatement: {
            searchString: 'if (uniqueKeys.includes(propName)) {',
            replacement: ``,
            path: './node_modules/loopback-datasource-juggler/lib/datasource.js',
        },
        addNewIfStatement: {
            searchString: 'schema.properties[propName][\'index\'] = {unique: true};',
            replacement: `if (uniqueKeys.includes(propName) && propertyDetails[propName]['index'] === undefined) { propertyDetails[propName]['index'] = {unique: true};`,
            path: './node_modules/loopback-datasource-juggler/lib/datasource.js',
        },
        assignNewProperty: {
            searchString: 'const dbSpecific = schema.properties[propName][dbType] = {',
            replacement: `schema.properties[propName] = propertyDetails;\nconst dbSpecific = schema.properties[propName][dbType] = {`,
            path: './node_modules/loopback-datasource-juggler/lib/datasource.js',
        },
        updateQuery: {
            searchString: 'const dbSpecific = schema.properties[propName][dbType] = {',
            replacement: `schema.properties[propName] = propertyDetails;\nconst dbSpecific = schema.properties[propName][dbType] = {`,
            path: './node_modules/loopback-datasource-juggler/lib/datasource.js',
        },
    },
};

export function applyPostDSPatches(): void {
    applyPatches(patches);
}
