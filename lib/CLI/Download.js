"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const HTTP = require("http");
const HTTPS = require("https");
const Load_1 = require("./Load");
class Download extends Load_1.default {
    constructor(url, response, content) {
        super(url, (response.headers['content-type'] || '').split(';')[0], content);
        this._statusCode = (response.statusCode || 500);
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
                    resolve(new Download(url, response, Buffer.concat(dataBuffer).toString()));
                });
                response.on('error', reject);
            };
            const options = {
                method: 'GET',
            };
            if (url.protocol === 'https:') {
                HTTPS.get(url, options, handler).on('error', reject);
            }
            else {
                HTTP.get(url, options, handler).on('error', reject);
            }
        });
    }
    get hasFailed() {
        const statusCode = this.statusCode;
        return (typeof statusCode === 'undefined' || statusCode >= 400);
    }
    get statusCode() {
        return this._statusCode;
    }
}
exports.Download = Download;
exports.default = Download;
