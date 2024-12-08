import { Command } from '@oclif/core'
import { patches } from '../patches/pre-patches.js';
import { applyPatches } from '../utils/index.js';

export default class PrePatches extends Command {

  static override description = 'execute pre patches.'

  public async run(): Promise<void> {
    applyPatches(patches);
  }
}