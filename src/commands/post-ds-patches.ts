import { Command } from '@oclif/core'
import { patches } from '../patches/post-ds-patches.js';
import { applyPatches } from '../utils/index.js';

export default class PostDsPatches extends Command {

  static override description = 'execute post ds patches.'

  public async run(): Promise<void> {
    applyPatches(patches, './node_modules');
  }

}
