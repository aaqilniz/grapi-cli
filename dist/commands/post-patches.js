import { Command } from '@oclif/core';
import { patches } from '../patches/post-patches.js';
import { applyPatches } from '../utils/index.js';
export default class PostPatches extends Command {
    static description = 'execute post patches.';
    async run() {
        applyPatches(patches);
    }
}
