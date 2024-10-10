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
};

export function applyPostDSPatches(): void {
    applyPatches(patches);
}
