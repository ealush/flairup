"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forIn = void 0;
function forIn(obj, fn) {
    for (var key in obj) {
        fn(key.trim(), obj[key]);
    }
}
exports.forIn = forIn;
