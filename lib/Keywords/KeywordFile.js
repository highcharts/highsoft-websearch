"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
class KeywordFile {
    constructor(keyword) {
        this._keyword = keyword;
        this._weightedUrls = {};
    }
    get keyword() {
        return this._keyword;
    }
    addURL(url, weight) {
        this._weightedUrls[url] = weight;
    }
    toString() {
        const weightedUrls = this._weightedUrls;
        return Object
            .keys(weightedUrls)
            .sort((urlA, urlB) => {
            return (weightedUrls[urlA] - weightedUrls[urlB]);
        })
            .join('\n');
    }
}
exports.KeywordFile = KeywordFile;
exports.default = KeywordFile;
