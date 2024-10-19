import { applyPatches } from '../utils/utils.js';
const patches = {};
export function applyPrePatches() {
    applyPatches(patches);
}
