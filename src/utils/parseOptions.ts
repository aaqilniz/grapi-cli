import { isJson } from '../utils/index.js';

export function processOptions(flags: any) {
    const options: any = {};
    if (flags.config) {
        const config = JSON.parse(flags.config);
        if(Array.isArray(config)) return config;
        
        Object.keys(config).forEach(key => {
            if (
                isJson(config[key]) &&
                typeof config[key] === 'string'
            ) {
                config[key] = JSON.parse(config[key]);
            };
            options[key] = config[key];
        });
    } else {
        Object.keys(flags).forEach(key => { options[key] = flags[key]; });
    }
    return options;
}