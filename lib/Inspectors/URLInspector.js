"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
exports.URLInspector = void 0;
const Inspectors = require("./index");
const Keywords = require("../Keywords/index");
class URLInspector extends Inspectors.Inspector {
    getKeywords() {
        if (typeof this._keywords !== 'undefined') {
            return this._keywords;
        }
        const words = Keywords.KeywordFilter.getWords(this.content.toLowerCase());
        let keywords = [];
        let word;
        for (word of words) {
            if (!keywords.includes(word)) {
                keywords.push(word);
            }
        }
        this._keywords = keywords = keywords.filter(Keywords.KeywordFilter.commonFilter);
        return keywords;
    }
    getKeywordWeight(keyword) {
        const keywords = this.getKeywords();
        const keywordIndex = keywords.indexOf(keyword);
        let keywordsLength = keywords.length;
        if (keywordsLength === 0) {
            return 0;
        }
        if (keywordsLength > 10) {
            keywordsLength = 10;
        }
        let indexWeight = 0;
        if (keywordIndex > -1 && keywordIndex < keywordsLength) {
            indexWeight = (1 - (keywordIndex / 10));
        }
        return Math.round(indexWeight * 100);
    }
    getLinkAliases() {
        return [];
    }
    getLinks() {
        return [];
    }
    getTitle() {
        return;
    }
}
exports.URLInspector = URLInspector;
exports.default = URLInspector;
