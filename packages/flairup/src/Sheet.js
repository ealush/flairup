"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sheet = void 0;
var is_1 = require("./utils/is");
var stableHash_1 = require("./utils/stableHash");
var stringManipulators_1 = require("./utils/stringManipulators");
var Sheet = /** @class */ (function () {
    function Sheet(name) {
        this.name = name;
        // Hash->css
        this.storedStyles = {};
        // styles->hash
        this.storedClasses = {};
        this.style = '';
        this.count = 0;
        var id = "cl-".concat(name);
        this.styleTag = this.createStyleTag(id);
    }
    Sheet.prototype.getStyle = function () {
        return this.style;
    };
    Sheet.prototype.append = function (css) {
        this.style = (0, stringManipulators_1.appendString)(this.style, css);
    };
    Sheet.prototype.apply = function () {
        this.count++;
        if (!this.styleTag) {
            return;
        }
        this.styleTag.innerHTML = this.style;
    };
    Sheet.prototype.createStyleTag = function (id) {
        // check that we're in the browser and have access to the DOM
        if (typeof document === 'undefined') {
            return;
        }
        var styleTag = document.createElement('style');
        styleTag.type = 'text/css';
        styleTag.id = "flairup-".concat(id);
        document.head.appendChild(styleTag);
        return styleTag;
    };
    Sheet.prototype.addRule = function (property, value, parentClassName) {
        var key = (0, stringManipulators_1.joinedProperty)(property, value);
        var storedClass = this.storedClasses[key];
        if (is_1.is.string(storedClass)) {
            return storedClass;
        }
        var hash = (0, stableHash_1.stableHash)(this.name, key);
        this.storedClasses[key] = hash;
        this.storedStyles[hash] = [property, value];
        this.append((0, stringManipulators_1.genCssRule)([parentClassName, hash], property, value));
        return hash;
    };
    return Sheet;
}());
exports.Sheet = Sheet;
