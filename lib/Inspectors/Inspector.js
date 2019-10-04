"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
var Inspector = (function () {
    function Inspector(content) {
        this._content = content;
    }
    Object.defineProperty(Inspector.prototype, "content", {
        get: function () {
            return this._content;
        },
        enumerable: true,
        configurable: true
    });
    return Inspector;
}());
exports.Inspector = Inspector;
exports.default = Inspector;
