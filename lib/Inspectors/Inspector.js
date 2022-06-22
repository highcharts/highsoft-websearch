"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inspector = void 0;
class Inspector {
    constructor(content) {
        this._content = content;
    }
    get content() {
        return this._content;
    }
}
exports.Inspector = Inspector;
exports.default = Inspector;
