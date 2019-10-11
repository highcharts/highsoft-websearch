"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const L = require("../index");
class Load {
    constructor(url, contentType, content) {
        this._content = content;
        this._contentType = contentType;
        this._title = 'Untitled';
        this._url = url;
    }
    get content() {
        return this._content.toString();
    }
    get contentType() {
        return this._contentType;
    }
    get title() {
        return this._title;
    }
    get url() {
        return this._url;
    }
    getInspectors() {
        const inspectors = [
            new L.URLInspector(this.url.toString())
        ];
        switch (this.contentType) {
            case 'text/html':
                inspectors.push(new L.HTMLInspector(this.content));
                break;
        }
        return inspectors;
    }
    update(keywordURLSets, loadTasks) {
        const inspectors = this.getInspectors();
        const linkAliases = [];
        const url = this.url.toString();
        let inspector;
        let title;
        for (inspector of inspectors) {
            if (typeof title === 'undefined') {
                title = inspector.getTitle();
            }
        }
        if (typeof title === 'undefined') {
            title = this.title;
        }
        else {
            this._title = title;
        }
        let inspectorLink;
        let inspectorLinks;
        let keyword;
        let keywordURLSet;
        let keywords;
        let linkAlias;
        for (inspector of inspectors) {
            if (typeof loadTasks !== 'undefined') {
                inspectorLinks = inspector.getLinks(url);
                for (inspectorLink of inspectorLinks) {
                    if (inspectorLink.includes('#')) {
                        inspectorLink = inspectorLink.substr(0, inspectorLink.indexOf('#'));
                    }
                    if (typeof loadTasks.get(inspectorLink) === 'undefined') {
                        loadTasks.set(inspectorLink, false);
                    }
                }
            }
            keywords = inspector.getKeywords();
            for (keyword of keywords) {
                keywordURLSet = keywordURLSets.get(keyword);
                if (typeof keywordURLSet === 'undefined') {
                    keywordURLSets.set(keyword, (keywordURLSet = new L.KeywordURLSet(keyword)));
                }
                try {
                    keywordURLSet.addURL(url, inspector.getKeywordWeight(keyword), title);
                    linkAliases.push(...inspector.getLinkAliases(url));
                }
                catch (error) {
                    console.log(keyword);
                    console.log(keywordURLSets.get(keyword), keywordURLSet);
                }
            }
        }
        for (linkAlias of linkAliases) {
            inspector = new L.URLInspector(linkAlias);
            keywords = inspector.getKeywords();
            for (keyword of keywords) {
                keywordURLSet = keywordURLSets.get(keyword);
                if (typeof keywordURLSet === 'undefined') {
                    keywordURLSets.set(keyword, (keywordURLSet = new L.KeywordURLSet(keyword)));
                }
                if (!keywordURLSet.containsURL(url)) {
                    keywordURLSet.addURL(linkAlias, inspector.getKeywordWeight(keyword), '');
                }
            }
        }
    }
}
exports.Load = Load;
exports.default = Load;
