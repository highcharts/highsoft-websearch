"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const Inspectors = require("./index");
const Keywords = require("../Keywords/index");
const ENTITY_PATTERN = /&(\w+);/;
const LINK_PATTERN = /href\s*=\s*(['"])(.*?)\1/;
const META_PATTERN = /<(head|noscript|script|style)[^>]*>[\s\S]*?<\/\1>/;
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
    a: 10
};
class HTMLInspector extends Inspectors.Inspector {
    static getBody(html) {
        const metaPattern = new RegExp(META_PATTERN, 'gi');
        return html.replace(metaPattern, ' ');
    }
    static getText(html) {
        const tagPattern = new RegExp(TAG_PATTERN, 'gi');
        const entityPattern = new RegExp(ENTITY_PATTERN, 'g');
        return HTMLInspector
            .getBody(html)
            .replace(tagPattern, ' ')
            .replace(entityPattern, ' ');
    }
    getKeywords() {
        if (typeof this._keywords !== 'undefined') {
            return this._keywords;
        }
        const words = Keywords.KeywordFilter.getWords(HTMLInspector.getText(this.content.toLowerCase()));
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
        const content = this.content;
        const tags = Object.keys(TITLE_WEIGHT).join('|');
        const tagPattern = new RegExp(`<(${tags})[^>]*?>(.*?)<\/\\1>`, 'gi');
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
        const tags = Object.keys(TITLE_WEIGHT).join('|');
        const tagPattern = new RegExp(`<(${tags})[^>]*?\\s+id\\s*?=\\s*?(['"])([^>'"]*?)\\2[^>]*?>(.*?)<\/\\1>`, 'gi');
        const linkAliases = [];
        let match;
        let matchURL;
        let matchURLString;
        while ((match = tagPattern.exec(content)) !== null) {
            try {
                matchURL = new URL('#' + match[3], baseURL);
                matchURLString = matchURL.toString();
                if (!linkAliases.includes(matchURLString)) {
                    linkAliases.push(matchURL.toString());
                }
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
        let matchURLString;
        while ((match = linkPattern.exec(content)) !== null) {
            try {
                matchURL = new URL(match[2], baseURL);
                matchURLString = matchURL.toString();
                if (!links.includes(matchURLString)) {
                    links.push(matchURL.toString());
                }
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
