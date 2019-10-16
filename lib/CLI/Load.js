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
    update(keywordURLSets, loadTasks, inspectIds) {
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
                    keywordURLSet = new L.KeywordURLSet(keyword);
                    keywordURLSets.set(keyword, keywordURLSet);
                }
                keywordURLSet.addURL(inspector.getKeywordWeight(keyword), url, title);
                if (inspectIds) {
                    linkAliases.push(...inspector.getLinkAliases(url));
                }
            }
        }
        for (linkAlias of linkAliases) {
            inspector = new L.URLInspector(linkAlias.substr(linkAlias.indexOf('#')));
            keywords = inspector.getKeywords();
            for (keyword of keywords) {
                keywordURLSet = keywordURLSets.get(keyword);
                if (typeof keywordURLSet === 'undefined') {
                    keywordURLSets.set(keyword, (keywordURLSet = new L.KeywordURLSet(keyword)));
                }
                keywordURLSet.addURL(inspector.getKeywordWeight(keyword), linkAlias, title);
            }
        }
    }
}
exports.Load = Load;
exports.default = Load;
