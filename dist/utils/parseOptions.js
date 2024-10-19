import { isJson } from '../utils/index.js';
import path from 'path';
import fs from 'fs';
export function processOptions(flags) {
    const options = {};
    if (flags.config) {
        if ((typeof flags.config === 'string') &&
            !isJson(flags.config)) {
            const jsonFile = path.resolve(process.cwd(), flags.config);
            if (fs.existsSync(jsonFile)) {
                flags.config = fs.readFileSync(jsonFile, 'utf-8');
            }
        }
        const config = JSON.parse(flags.config);
        if (Array.isArray(config))
            return config;
        Object.keys(config).forEach(key => {
            if (isJson(config[key]) &&
                typeof config[key] === 'string') {
                config[key] = JSON.parse(config[key]);
            }
            ;
            options[key] = config[key];
        });
    }
    else {
        Object.keys(flags).forEach(key => { options[key] = flags[key]; });
    }
    return options;
}
