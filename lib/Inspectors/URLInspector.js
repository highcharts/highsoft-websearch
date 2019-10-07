"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const Inspectors = require("./index");
const KEYWORD_PATTERN = /[A-z][\w\-]*/;
class URLInspector extends Inspectors.Inspector {
    getKeywords() {
        if (typeof this._keywords !== 'undefined') {
            return this._keywords;
        }
        const keywordPattern = new RegExp(KEYWORD_PATTERN, 'gi');
        this._keywords = (this.content.match(keywordPattern) || []);
        return this._keywords;
    }
    getKeywordWeight(keyword) {
        const content = this.content;
        const length = content.length;
        if (length === 0) {
            return 0;
        }
        let index = content.indexOf(keyword);
        let weight = 0;
        while (index !== -1) {
            weight += (100 - Math.round((index / length) * 100));
            index = content.indexOf(keyword, (index + keyword.length));
        }
        return weight;
    }
    getLinkAliases() {
        return [];
    }
    getLinks() {
        return [];
    }
}
exports.URLInspector = URLInspector;
exports.default = URLInspector;
