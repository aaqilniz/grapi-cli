import { Flags } from '@oclif/core'

export const standardFlags = {
    config: Flags.string({ char: 'c', description: 'Config JSON object' }),
    'generate-config': Flags.string({ description: 'option to generate and return config object.' }),
    yes: Flags.boolean({ char: 'y', description: 'Skip all confirmation prompts with default or provided value.' }),
    help: Flags.boolean({ char: 'h', description: 'Print the generator’s options and usage.' }),
    ['skip-cache']: Flags.boolean({ default: false, description: 'Do not remember prompt answers. Default is false.' }),
    ['skip-install']: Flags.boolean({ default: false, description: 'Do not automatically install dependencies. Default is false.' }),
}