"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sideload = void 0;
const FS = require("fs");
const Load_1 = require("./Load");
const Path = require("path");
const CONTENT_TYPES = {
    '.txt': 'text/plain',
    '.css': 'text/css',
    '.htm': 'text/html',
    '.html': 'text/html',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
};
class Sideload extends Load_1.default {
    constructor(url, localPath, contentType, content) {
        super(url, contentType, content);
        this._localPath = localPath;
    }
    static fromPath(url, localPath) {
        return new Promise((resolve, reject) => {
            try {
                let filePath = localPath;
                if (FS.existsSync(filePath) &&
                    FS.statSync(filePath).isDirectory()) {
                    filePath = Path.join(filePath, 'index.html');
                }
                let contentType = CONTENT_TYPES[Path.extname(filePath).toLowerCase()];
                if (typeof contentType === 'undefined') {
                    contentType = 'text/html';
                    filePath = (filePath + '.html');
                }
                let content = '';
                if (FS.existsSync(filePath)) {
                    content = FS.readFileSync(filePath).toString();
                }
                resolve(new Sideload(url, localPath, contentType, content));
            }
            catch (error) {
                reject(error);
            }
        });
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
