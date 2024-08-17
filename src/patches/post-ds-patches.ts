import { Patch } from '../types/index.js';
import { applyPatches } from '../utils/index.js';

export const patches: Patch = {};

export function applyPostDSPatches(): void {
    applyPatches(patches, './node_modules');
}
