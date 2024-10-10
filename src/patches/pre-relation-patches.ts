import { Patch } from '../types/index.js';
import { applyPatches } from '../utils/utils.js';

export const patches: Patch = {};

export function applyPreRelationPatches(): void {
    applyPatches(patches);
}
