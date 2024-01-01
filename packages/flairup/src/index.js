"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSheet = exports.cx = void 0;
var Sheet_1 = require("./Sheet");
var forIn_1 = require("./utils/forIn");
var is_1 = require("./utils/is");
var stableHash_1 = require("./utils/stableHash");
var stringManipulators_1 = require("./utils/stringManipulators");
function cx() {
    var styles = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        styles[_i] = arguments[_i];
    }
    return styles
        .reduce(function (acc, curr) {
        return "".concat(acc, " ").concat(Array.from(curr).join(' '));
    }, '')
        .trim();
}
exports.cx = cx;
function createSheet(name) {
    var sheet = new Sheet_1.Sheet(name);
    return {
        create: create,
        getStyle: sheet.getStyle.bind(sheet),
    };
    function create(styles) {
        var scopedStyles = {};
        (0, forIn_1.forIn)(styles, function (scopeName, styles) {
            if (is_1.is.topLevelClass(scopeName, styles)) {
                var scopeClassName_1 = (0, stableHash_1.stableHash)(sheet.name, scopeName);
                var parentClass_1 = scopeName.slice(1);
                (0, forIn_1.forIn)(styles, function (property, value) {
                    iterateStyles(sheet, value, scopeClassName_1, parentClass_1).forEach(function (className) {
                        addScopedStyle(property, className);
                    });
                });
                return;
            }
            var scopeClassName = (0, stableHash_1.stableHash)(sheet.name, scopeName);
            iterateStyles(sheet, styles, scopeClassName).forEach(function (className) {
                addScopedStyle(scopeName, className);
            });
        });
        sheet.apply();
        return scopedStyles;
        function addScopedStyle(name, className) {
            var _a;
            scopedStyles[name] = (_a = scopedStyles[name]) !== null && _a !== void 0 ? _a : new Set();
            scopedStyles[name].add(className);
        }
    }
}
exports.createSheet = createSheet;
function iterateStyles(sheet, styles, scopeClassName, parentClassName) {
    var output = new Set();
    (0, forIn_1.forIn)(styles, function (property, value) {
        if (is_1.is.directClass(property, value)) {
            return handleAddedClassnames(value).forEach(function (classes) {
                return output.add(classes);
            });
        }
        if (is_1.is.pseudoSelector(property) ||
            is_1.is.mediaQuery(property) ||
            is_1.is.cssVariables(property, value)) {
            return handleChunks(sheet, value !== null && value !== void 0 ? value : {}, property, scopeClassName).forEach(function (classes) { return output.add(classes); });
        }
        if (is_1.is.validProperty(value)) {
            var ruleClassName = sheet.addRule(property, value, parentClassName);
            return output.add(ruleClassName);
        }
    });
    return output;
}
function handleAddedClassnames(classes) {
    return [].concat(classes);
}
function handleChunks(sheet, styles, property, scopeClassName) {
    var classes = new Set();
    var chunkRows = [];
    (0, forIn_1.forIn)(styles, function (property, value) {
        if (is_1.is.validProperty(value)) {
            chunkRows.push((0, stringManipulators_1.genLine)(property, value));
            return;
        }
        iterateStyles(sheet, value !== null && value !== void 0 ? value : {}, scopeClassName).forEach(function (className) {
            return classes.add(className);
        });
    });
    if (chunkRows.length) {
        var output = chunkRows.join(' ');
        sheet.append("".concat((0, stringManipulators_1.chunkSelector)([scopeClassName], property), " ").concat((0, stringManipulators_1.wrapWithCurlys)(is_1.is.mediaQuery(property)
            ? (0, stringManipulators_1.genCssRules)([scopeClassName], output)
            : output, true)));
    }
    classes.add(scopeClassName);
    return classes;
}
