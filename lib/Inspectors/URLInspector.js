"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const Inspectors = require("./index");
const KEYWORD_PATTERN = /\w[\w\.\-]*/;
class URLInspector extends Inspectors.Inspector {
    getKeywords() {
        const keywordPattern = new RegExp(KEYWORD_PATTERN, 'gi');
        return (this.content.match(keywordPattern) || []);
    }
    getKeywordWeight(keyword) {
        const content = this.content;
        const length = content.length;
        if (length === 0) {
            return 0;
        }
        let index = 0;
        let weight = 0;
        while (index !== -1) {
            if (index > 0) {
                weight += (100 - Math.round((index / length) * 100));
            }
            index = content.indexOf(keyword, index);
        }
        return weight;
    }
    getLinks() {
        return [];
    }
}
exports.URLInspector = URLInspector;
exports.default = URLInspector;
