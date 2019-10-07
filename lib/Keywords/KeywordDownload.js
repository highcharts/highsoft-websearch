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
const Keywords = require("./index");
const URL = require("url");
class KeywordDownload {
    constructor(url, depth, response, content) {
        this._content = content;
        this._depth = depth;
        this._links = [];
        this._response = response;
        this._url = url;
    }
    static fromURL(url, depth, timeout) {
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
                            url = new URL.URL(location, url);
                            KeywordDownload
                                .fromURL(url, depth, timeout)
                                .then(resolve);
                            return;
                        }
                        catch (error) {
                        }
                    }
                    resolve(new KeywordDownload(url, depth, response, Buffer.concat(dataBuffer)));
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
    get depth() {
        return this._depth;
    }
    get hasFailed() {
        const statusCode = this._response.statusCode;
        return (typeof statusCode === 'undefined' || statusCode >= 400);
    }
    get url() {
        return this._url;
    }
    addKeywordFiles(keywordFiles, links) {
        const inspectors = this.getInspectors();
        const linkAliases = [];
        const url = this.url.toString();
        let inspector;
        let inspectorLinks;
        let keyword;
        let keywordFile;
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
                keywordFile = keywordFiles[keyword];
                if (typeof keywordFile === 'undefined') {
                    keywordFiles[keyword] = keywordFile = new Keywords.KeywordFile(keyword);
                }
                keywordFile.addURL(url, inspector.getKeywordWeight(keyword));
                linkAliases.push(...inspector.getLinkAliases(url));
            }
        }
        for (linkAlias of linkAliases) {
            inspector = new Inspectors.URLInspector(linkAlias.toString());
            keywords = inspector.getKeywords();
            for (keyword of keywords) {
                keywordFile = keywordFiles[keyword];
                if (typeof keywordFile === 'undefined') {
                    keywordFiles[keyword] = keywordFile = new Keywords.KeywordFile(keyword);
                }
                keywordFile.addURL(linkAlias, inspector.getKeywordWeight(keyword));
            }
        }
    }
    getContentText() {
        return this._content.toString('utf8');
    }
    getContentType() {
        return (this._response.headers['content-type'] || '').split(';')[0];
    }
    getInspectors() {
        const inspectors = [
            new Inspectors.URLInspector(this.url.toString())
        ];
        switch (this.getContentType()) {
            case 'text/html':
                inspectors.push(new Inspectors.HTMLInspector(this.getContentText()));
                break;
        }
        return inspectors;
    }
}
exports.KeywordDownload = KeywordDownload;
exports.default = KeywordDownload;
