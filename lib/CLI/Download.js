"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const Https = require("https");
const Inspectors = require("../Inspectors/index");
class Download {
    constructor(url, depth, response, content) {
        this._content = content;
        this._depth = depth;
        this._response = response;
        this._url = url;
    }
    static fromURL(url, depth, timeout) {
        return new Promise((resolve, reject) => {
            const request = Https.get(url.toString(), {
                method: 'GET',
                timeout: timeout
            }, (response) => {
                let dataBuffer = new Array();
                response.on('data', (data) => {
                    dataBuffer.push(data);
                });
                response.on('end', () => {
                    resolve(new Download(url, depth, response, Buffer.concat(dataBuffer)));
                });
                response.on('error', reject);
            });
            request.on('error', reject);
        });
    }
    get content() {
        return this._content;
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
            new Inspectors.URLInspector(this._url.toString())
        ];
        switch (this.getContentType()[0]) {
            case 'text/html':
                inspectors.push(new Inspectors.HTMLInspector(this.getContentText()));
                break;
        }
        return inspectors;
    }
}
exports.Download = Download;
exports.default = Download;
