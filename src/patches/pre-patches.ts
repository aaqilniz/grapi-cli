import { Patch } from '../types/index.js';
import { applyPatches } from '../utils/utils.js';

const patches: Patch = {};

export function applyPrePatches(): void {
    applyPatches(patches, './node_modules');
}
