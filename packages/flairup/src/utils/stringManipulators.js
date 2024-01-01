"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendString = exports.makeClassName = exports.chunkSelector = exports.joinedProperty = exports.camelCaseToDash = exports.wrapWithCurlys = exports.genCssRules = exports.handlePropertyValue = exports.genLine = exports.genCssRule = void 0;
var is_1 = require("./is");
function genCssRule(classes, property, value) {
    return genCssRules(classes, genLine(property, value));
}
exports.genCssRule = genCssRule;
function genLine(property, value) {
    return "".concat(camelCaseToDash(property), ": ").concat(handlePropertyValue(property, value), ";");
}
exports.genLine = genLine;
// Some properties need special handling
function handlePropertyValue(property, value) {
    if (property === 'content') {
        return "\"".concat(value, "\"");
    }
    return value;
}
exports.handlePropertyValue = handlePropertyValue;
function genCssRules(classes, content) {
    return "".concat(makeClassName(classes), " ").concat(wrapWithCurlys(content));
}
exports.genCssRules = genCssRules;
function wrapWithCurlys(content, breakLine) {
    if (breakLine === void 0) { breakLine = false; }
    return [breakLine ? '{\n' : '{', content, breakLine ? '\n}' : '}'].join('');
}
exports.wrapWithCurlys = wrapWithCurlys;
function camelCaseToDash(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
exports.camelCaseToDash = camelCaseToDash;
function joinedProperty(property, value) {
    return "".concat(property, ":").concat(value);
}
exports.joinedProperty = joinedProperty;
// Creates the css line for a chunk
function chunkSelector(className, property) {
    var base = makeClassName(className);
    if (is_1.is.pseudoSelector(property)) {
        return "".concat(base).concat(property);
    }
    if (is_1.is.mediaQuery(property)) {
        return "".concat(property);
    }
    return base;
}
exports.chunkSelector = chunkSelector;
function makeClassName(classes) {
    return classes
        .filter(Boolean)
        .map(function (c) { return ".".concat(c); })
        .join(' ');
}
exports.makeClassName = makeClassName;
function appendString(base, line) {
    return base ? "".concat(base, "\n").concat(line) : line;
}
exports.appendString = appendString;
