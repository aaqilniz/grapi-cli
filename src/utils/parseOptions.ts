export function processOptions(flags: any) {
    const options: any = {};
    if (flags.config) {
        const config = JSON.parse(flags.config);
        Object.keys(config).forEach(key => { options[key] = config[key]; });
    } else {
        Object.keys(flags).forEach(key => { options[key] = flags[key]; });
    }
    return options;
}