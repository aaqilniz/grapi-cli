import { Command } from '@oclif/core';
import { patches } from '../patches/post-ds-patches.js';
import { applyPatches } from '../utils/index.js';
export default class PostDsPatches extends Command {
    static description = 'execute post ds patches.';
    async run() {
        applyPatches(patches);
    }
}
