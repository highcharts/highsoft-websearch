"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const Inspectors = require("./index");
const KEYWORD_PATTERN = /(?:^|\s)([A-z][\w\-]*)/;
const LINK_PATTERN = /href\s*=\s*(['"])([^\\1])\1/;
const META_PATTERN = /<(head|noscript|script|style)[^>]*>.*<\/\\1>/;
const TAG_PATTERN = /<[\/!]?[\w-]+[^>]*>/;
const TITLE_WEIGHT = {
    title: 100,
    h1: 90,
    h2: 80,
    h3: 70,
    h4: 60,
    h5: 50,
    h6: 40,
    dt: 30,
};
class HTMLInspector extends Inspectors.Inspector {
    static getText(html) {
        const metaPattern = new RegExp(META_PATTERN, 'gi');
        const tagPattern = new RegExp(TAG_PATTERN, 'gi');
        return html
            .replace(metaPattern, ' ')
            .replace(tagPattern, ' ');
    }
    getKeywords() {
        const contentText = HTMLInspector.getText(this.content.toLowerCase());
        const keywordPattern = new RegExp(KEYWORD_PATTERN, 'gi');
        const keywords = [];
        let keyword;
        let keywordMatch;
        while ((keywordMatch = keywordPattern.exec(contentText)) !== null) {
            keyword = keywordMatch[1];
            if (!keywords.includes(keyword)) {
                keywords.push(keyword);
            }
        }
        return keywords;
    }
    getKeywordWeight(keyword) {
        const content = this.content.toLowerCase();
        const tags = Object.keys(TITLE_WEIGHT).join('|');
        const tagPattern = new RegExp(`<(${tags})[^>]*>(.*?)<\/\\1>`, 'gi');
        let finalWeight = 0;
        let matchWeight = 0;
        let tagMatch;
        while ((tagMatch = tagPattern.exec(content)) !== null) {
            if (HTMLInspector.getText(tagMatch[2]).includes(keyword)) {
                matchWeight = (TITLE_WEIGHT[tagMatch[1]] || 0);
            }
            if (matchWeight > finalWeight) {
                finalWeight = matchWeight;
            }
        }
        return finalWeight;
    }
    getLinks() {
        const content = this.content;
        const linkPattern = new RegExp(LINK_PATTERN, 'gi');
        const links = [];
        let linkMatch;
        while ((linkMatch = linkPattern.exec(content)) !== null) {
            links.push(linkMatch[2]);
        }
        return links;
    }
}
exports.HTMLInspector = HTMLInspector;
exports.default = HTMLInspector;
