"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const HTTP = require("http");
const HTTPS = require("https");
const Inspectors = require("../Inspectors/index");
const Keywords = require("../Keywords/index");
class Download {
    constructor(url, response, content) {
        this._content = content;
        this._contentType = (response.headers['content-type'] || '').split(';')[0];
        this._links = [];
        this._response = response;
        this._statusCode = (response.statusCode || 500);
        this._url = url;
    }
    static fromURL(url, timeout = 60000) {
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
    addKeywordURLSets(keywordFiles, links) {
        const inspectors = this.getInspectors();
        const linkAliases = [];
        const url = this.url.toString();
        let inspector;
        let inspectorLinks;
        let keyword;
        let keywordURLSet;
        let keywords;
        let linkAlias;
        for (inspector of inspectors) {
            if (typeof links !== 'undefined') {
                inspectorLinks = inspector.getLinks(url);
                for (let inspectorLink of inspectorLinks) {
                    if (!links.includes(inspectorLink)) {
                        links.push(inspectorLink);
                    }
                }
            }
            keywords = inspector.getKeywords();
            for (keyword of keywords) {
                keywordURLSet = keywordFiles[keyword];
                if (typeof keywordURLSet === 'undefined') {
                    keywordFiles[keyword] = keywordURLSet = new Keywords.KeywordURLSet(keyword);
                }
                keywordURLSet.addURL(url, inspector.getKeywordWeight(keyword), '');
                linkAliases.push(...inspector.getLinkAliases(url));
            }
        }
        for (linkAlias of linkAliases) {
            inspector = new Inspectors.URLInspector(linkAlias);
            keywords = inspector.getKeywords();
            for (keyword of keywords) {
                keywordURLSet = keywordFiles[keyword];
                if (typeof keywordURLSet === 'undefined') {
                    keywordFiles[keyword] = keywordURLSet = new Keywords.KeywordURLSet(keyword);
                }
                if (!keywordURLSet.containsURL(url)) {
                    keywordURLSet.addURL(linkAlias, inspector.getKeywordWeight(keyword), '');
                }
            }
        }
    }
    getInspectors() {
        const inspectors = [
            new Inspectors.URLInspector(this.url.toString())
        ];
        switch (this.contentType) {
            case 'text/html':
                inspectors.push(new Inspectors.HTMLInspector(this.content));
                break;
        }
        return inspectors;
    }
}
exports.Download = Download;
exports.default = Download;
