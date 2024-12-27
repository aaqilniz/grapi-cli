import { Patch } from '../types/index.js';

export const patches: Patch = {
    makeAuditAPIsReadonly: {
        replaceFalseToTrue: {
            searchString: 'readonly: false',
            replacement: `readonly: true`,
            path: './src/model-endpoints/audit-log.rest-config.ts',
        },
    },
};
