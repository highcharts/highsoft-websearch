"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const Inspectors = require("./index");
const URL = require("url");
const ID_PATTERN = /id\s*=\s*(['"])([^\\1])\1/;
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
    static getBody(html) {
        const metaPattern = new RegExp(META_PATTERN, 'gi');
        return html.replace(metaPattern, ' ');
    }
    static getText(html) {
        const tagPattern = new RegExp(TAG_PATTERN, 'gi');
        return HTMLInspector
            .getBody(html)
            .replace(tagPattern, ' ');
    }
    getKeywords() {
        if (typeof this._keywords !== 'undefined') {
            return this._keywords;
        }
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
        this._keywords = keywords;
        return keywords;
    }
    getKeywordWeight(keyword) {
        const content = this.content.toLowerCase();
        const tags = Object.keys(TITLE_WEIGHT).join('|');
        const tagPattern = new RegExp(`<(${tags})[^>]*>(.*?)<\/\\1>`, 'gi');
        let finalWeight = 0;
        let matchWeight = 0;
        let match;
        while ((match = tagPattern.exec(content)) !== null) {
            if (HTMLInspector.getText(match[2]).includes(keyword)) {
                matchWeight = (TITLE_WEIGHT[match[1]] || 0);
            }
            if (matchWeight > finalWeight) {
                finalWeight = matchWeight;
            }
        }
        return finalWeight;
    }
    getLinkAliases(baseURL) {
        if (typeof this._linkAliases !== 'undefined') {
            return this._linkAliases;
        }
        const content = HTMLInspector.getBody(this.content);
        const idPattern = new RegExp(ID_PATTERN, 'gi');
        const linkAliases = [];
        let match;
        let matchURL;
        while ((match = idPattern.exec(content)) !== null) {
            try {
                matchURL = new URL.URL('#' + match[2], baseURL);
                linkAliases.push(matchURL.toString());
            }
            catch (error) {
            }
        }
        this._linkAliases = linkAliases;
        return linkAliases;
    }
    getLinks(baseURL) {
        if (typeof this._links !== 'undefined') {
            return this._links;
        }
        const content = HTMLInspector.getBody(this.content);
        const linkPattern = new RegExp(LINK_PATTERN, 'gi');
        const links = [];
        let match;
        let matchURL;
        while ((match = linkPattern.exec(content)) !== null) {
            try {
                matchURL = new URL.URL(match[2], baseURL);
                links.push(matchURL.toString());
            }
            catch (error) {
            }
        }
        this._links = links;
        return links;
    }
}
exports.HTMLInspector = HTMLInspector;
exports.default = HTMLInspector;
