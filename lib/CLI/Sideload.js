"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs");
const Load_1 = require("./Load");
const Path = require("path");
class Sideload extends Load_1.default {
    constructor(baseURL, localPath, contentType, content) {
        super(new URL(localPath, baseURL), contentType, content);
        this._baseURL = baseURL;
        this._localPath = localPath;
    }
    static fromPath(baseURL, localPath) {
        return new Promise((resolve, reject) => {
            try {
                const contentType = Sideload.getContentType(localPath);
                if (!contentType) {
                    resolve(Sideload.fromPath(baseURL, Path.join(localPath, 'index.html')));
                    return;
                }
                let content = '';
                if (FS.existsSync(localPath)) {
                    content = FS.readFileSync(localPath).toString();
                }
                resolve(new Sideload(baseURL, localPath, contentType, content));
            }
            catch (error) {
                reject(error);
            }
        });
    }
    static getContentType(localPath) {
        switch (Path.extname(localPath).toLowerCase()) {
            default:
            case '.txt':
                return 'text/plain';
            case '':
                return undefined;
            case '.css':
                return 'text/css';
            case '.htm':
            case '.html':
                return 'text/html';
            case '.jpg':
            case '.jpeg':
                return 'image/jpeg';
            case '.js':
                return 'application/javascript';
            case '.json':
                return 'application/json';
            case '.png':
                return 'image/png';
            case '.svg':
                return 'image/svg+xml';
        }
    }
    get baseURL() {
        return this._baseURL;
    }
    get hasFailed() {
        return (this.content.length === 0);
    }
    get localPath() {
        return this._localPath;
    }
}
exports.Sideload = Sideload;
exports.default = Sideload;
