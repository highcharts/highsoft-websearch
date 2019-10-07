"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const Inspectors = require("./index");
const Keywords = require("../Keywords/index");
const KEYWORD_PATTERN = /[A-z]\w*/;
class URLInspector extends Inspectors.Inspector {
    getKeywords() {
        if (typeof this._keywords !== 'undefined') {
            return this._keywords;
        }
        const keywordPattern = new RegExp(KEYWORD_PATTERN, 'gi');
        const keywords = [];
        const words = Keywords.KeywordFilter.getWords(this.content);
        let word;
        for (word of words) {
            if (!keywords.includes(word)) {
                keywords.push(word);
            }
        }
        this._keywords = keywords.filter(Keywords.KeywordFilter.commonFilter);
        return this._keywords;
    }
    getKeywordWeight(keyword) {
        const content = this.content;
        let length = content.length;
        if (length === 0) {
            return 0;
        }
        const index = content.indexOf(keyword);
        if (length > 100) {
            length = 100;
        }
        if (index === -1 ||
            index > length) {
            return 0;
        }
        const indexWeight = (100 - Math.round((index / length) * 100));
        const lengthWeight = (100 - Math.round((length / 100) * 100));
        return Math.round(((indexWeight * 25) + (lengthWeight * 75)) / 100);
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
