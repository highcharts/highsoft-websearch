/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as FS from 'fs';
import Load from './Load';
import * as Path from 'path';

const CONTENT_TYPES: Record<string, (string|undefined)> = {
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

export class Sideload extends Load {

    /* *
     *
     *  Static Functions
     *
     * */

    public static fromPath (baseURL: URL, localPath: string): Promise<Sideload> {
        return new Promise((resolve, reject) => {
            try {

                let filePath = localPath;

                if (
                    FS.existsSync(filePath) &&
                    FS.statSync(filePath).isDirectory()
                ) {
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

                resolve(new Sideload(baseURL, localPath, contentType, content));
            }
            catch (error) {
                reject(error);
            }
        });
    }

    /* *
     *
     *  Constructor
     *
     * */

    private constructor (baseURL: URL, localPath: string, contentType: string, content: string) {
        super(baseURL, contentType, content);
        this._localPath = localPath;
    }

    /* *
     *
     *  Properties
     *
     * */

    private _localPath: string;

    public get hasFailed (): boolean {
        return (this.content.length === 0);
    }

    public get localPath (): string {
        return this._localPath;
    }
}

export default Sideload;
