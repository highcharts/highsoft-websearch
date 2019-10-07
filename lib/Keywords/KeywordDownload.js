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
    addKeywordFiles(keywordFiles) {
        const inspectors = this.getInspectors();
        const linkAliases = [];
        const url = this.url;
        let keywordFile;
        let keywords;
        for (let inspector of inspectors) {
            keywords = inspector.getKeywords().filter(Keywords.KeywordFilter.commonFilter);
            for (let keyword of keywords) {
                keywordFile = keywordFiles[keyword];
                if (typeof keywordFile === 'undefined') {
                    keywordFiles[keyword] = keywordFile = new Keywords.KeywordFile(keyword);
                }
                keywordFile.addURL(url.toString(), inspector.getKeywordWeight(keyword));
                linkAliases.push(...inspector.getLinkAliases(url));
            }
        }
        this.addLinkAliasesToKeywordFiles(linkAliases, keywordFiles);
    }
    addLinkAliasesToKeywordFiles(linkAliases, keywordFiles) {
        let keywordFile;
        let keywords;
        let inspector;
        for (let linkAlias of linkAliases) {
            inspector = new Inspectors.URLInspector(linkAlias);
            keywords = inspector.getKeywords();
            for (let keyword of keywords) {
                keywordFile = keywordFiles[keyword];
                keywordFile.addURL(linkAlias, inspector.getKeywordWeight(keyword));
            }
        }
    }
    getContentText() {
        let charset = this.getContentType()[1];
        if (typeof charset !== 'undefined') {
            charset = (charset.split('=')[1] || '').trim();
        }
        return this._content.toString(charset || 'utf-8');
    }
    getContentType() {
        return (this._response.headers['content-type'] || '')
            .split(';')
            .map(parts => parts.trim())
            .filter(parts => !!parts);
    }
    getInspectors() {
        const inspectors = [
            new Inspectors.URLInspector(this.url.toString())
        ];
        switch (this.getContentType()[0]) {
            case 'text/html':
                inspectors.push(new Inspectors.HTMLInspector(this.getContentText()));
                break;
        }
        return inspectors;
    }
}
exports.KeywordDownload = KeywordDownload;
exports.default = KeywordDownload;
