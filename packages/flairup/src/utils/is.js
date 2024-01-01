"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.is = void 0;
// Selectors
exports.is = {
    pseudoSelector: function (selector) { return selector.startsWith(':'); },
    mediaQuery: function (property) { return property.startsWith('@media'); },
    directClass: function (property, _) {
        return property === '.';
    },
    cssVariables: function (property, _) {
        return property === '--';
    },
    validProperty: function (value) {
        return typeof value === 'string' || typeof value === 'number';
    },
    topLevelClass: function (property, _) {
        return property.startsWith('.') && property.length > 1;
    },
    string: function (value) { return typeof value === 'string'; },
};
