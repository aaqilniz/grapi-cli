import { Command, Flags } from '@oclif/core'
import chalk from 'chalk';

import { processOptions, execute, standardFlags, prompt } from '../utils/index.js';

export default class Relation extends Command {
  static override description = 'generate relations.';

  static override flags = {
    ...standardFlags,
    relationType: Flags.string({ description: 'Relation type.' }),
    sourceModel: Flags.string({ description: 'Source model.' }),
    destinationModel: Flags.string({ description: 'Destination model.' }),
    throughModel: Flags.string({ description: 'Through model. For HasManyThrough relation only.' }),
    sourceModelPrimaryKey: Flags.string({ description: 'The name of the primary key of the source model.' }),
    sourceModelPrimaryKeyType: Flags.string({ description: 'The type of the primary key of the source model.' }),
    destinationModelPrimaryKey: Flags.string({ description: 'The name of the primary key of the destination model.' }),
    destinationModelPrimaryKeyType: Flags.string({ description: 'The type of the primary key of the destination model.' }),
    foreignKeyName: Flags.string({ description: 'Destination/Source model foreign key name for HasMany,HasOne/BelongsTo relation, respectively.' }),
    relationName: Flags.string({ description: 'Relation name.' }),
    sourceKeyOnThrough: Flags.string({ description: 'Foreign key that references the source model on the through model. For HasManyThrough relation only.' }),
    targetKeyOnThrough: Flags.string({ description: 'Foreign key that references the target model on the through model. For HasManyThrough relation only.' }),
  }

  public async run(): Promise<void> {
    const parsed = await this.parse(Relation);
    if (!parsed.flags.config) return prompt('relation', parsed.flags);
    let options = processOptions(parsed.flags);
    const { relationType } = options;
    let configs = '';
    if (Object.keys(options).length) {
      configs = ` --config='${JSON.stringify(options)}' `;
    }
    const command = `lb4 relation${configs}--yes`;
    const executed: any = await execute(command, 'generating relation.');
    if (executed.stderr) console.log(chalk.bold(chalk.green(executed.stderr)));
    if (executed.stdout) console.log(chalk.bold(chalk.green(executed.stdout)));
    if (relationType === 'referencesMany') {
      await execute(
        `grapi-cli patch --config '{"patches": ["referencesManyFilters"]}'`,
        'applying patches for filters for referencesMany.'
      );
    }
  }
}
