import { Command } from '@oclif/core';
import { patches } from '../patches/pre-relation-patches.js';
import { applyPatches } from '../utils/index.js';
export default class PreRelationPatches extends Command {
    static description = 'execute pre relation patches.';
    async run() {
        applyPatches(patches);
    }
}
