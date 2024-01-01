"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stableHash = void 0;
// Stable hash function.
function stableHash(prefix, seed) {
    var hash = 0;
    if (seed.length === 0)
        return hash.toString();
    for (var i = 0; i < seed.length; i++) {
        var char = seed.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return "".concat(prefix !== null && prefix !== void 0 ? prefix : 'cl', "_").concat(hash.toString(36));
}
exports.stableHash = stableHash;
