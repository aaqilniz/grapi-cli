import { Command } from '@oclif/core'
import { patches } from '../patches/post-patches.js';
import { applyPatches } from '../utils/index.js';

export default class PostPatches extends Command {

  static override description = 'execute post patches.'

  public async run(): Promise<void> {
    applyPatches(patches);
  }
}