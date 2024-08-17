import { Command } from '@oclif/core'
import { patches } from '../patches/pre-relation-patches.js';
import { applyPatches } from '../utils/index.js';

export default class PreRelationPatches extends Command {

  static override description = 'execute pre relation patches.'

  public async run(): Promise<void> {
    applyPatches(patches, './node_modules');
  }
}