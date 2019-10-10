"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const HTTP = require("http");
const HTTPS = require("https");
const L = require("../index");
class Download {
    constructor(url, response, content) {
        this._content = content;
        this._contentType = (response.headers['content-type'] || '').split(';')[0];
        this._response = response;
        this._statusCode = (response.statusCode || 500);
        this._url = url;
    }
    static fromURL(url, timeout = 60000) {
        if (timeout < 0) {
            timeout = 0;
        }
        return new Promise((resolve, reject) => {
            const handler = (response) => {
                let dataBuffer = new Array();
                response.on('data', (data) => {
                    dataBuffer.push(data);
                });
                response.on('end', () => {
                    const statusCode = (response.statusCode || 200);
                    const location = response.headers['location'];
                    if (statusCode >= 300 &&
                        statusCode <= 399 &&
                        location) {
                        try {
                            url = new URL(location, url);
                            Download
                                .fromURL(url, timeout)
                                .then(resolve);
                            return;
                        }
                        catch (error) {
                        }
                    }
                    resolve(new Download(url, response, Buffer.concat(dataBuffer)));
                });
                response.on('error', reject);
            };
            const options = {
                method: 'GET',
                timeout: timeout
            };
            if (url.protocol === 'https:') {
                HTTPS.get(url, options, handler).on('error', reject);
            }
            else {
                HTTP.get(url, options, handler).on('error', reject);
            }
        });
    }
    get content() {
        return this._content.toString();
    }
    get contentType() {
        return this._contentType;
    }
    get hasFailed() {
        const statusCode = this._response.statusCode;
        return (typeof statusCode === 'undefined' || statusCode >= 400);
    }
    get statusCode() {
        return this._statusCode;
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
    update(keywordURLSets, urlDownloads) {
        const inspectors = this.getInspectors();
        const linkAliases = [];
        const url = this.url.toString();
        let inspector;
        let inspectorLink;
        let inspectorLinks;
        let keyword;
        let keywordURLSet;
        let keywords;
        let linkAlias;
        for (inspector of inspectors) {
            if (typeof urlDownloads !== 'undefined') {
                inspectorLinks = inspector.getLinks(url);
                for (inspectorLink of inspectorLinks) {
                    if (inspectorLink.includes('#')) {
                        inspectorLink = inspectorLink.substr(0, inspectorLink.indexOf('#'));
                    }
                    if (typeof urlDownloads.get(inspectorLink) === 'undefined') {
                        urlDownloads.set(inspectorLink, false);
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
                    keywordURLSet.addURL(url, inspector.getKeywordWeight(keyword), inspector.getTitle());
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
exports.Download = Download;
exports.default = Download;
