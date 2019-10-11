/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as FS from 'fs';
import * as L from '../index';
import Load from './Load';
import * as Path from 'path';

export class Sideload extends Load {

    /* *
     *
     *  Static Functions
     *
     * */

    public static fromPath (baseURL: URL, localPath: string): Promise<Sideload> {
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

    public static getContentType (localPath: string): (string|undefined) {
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

    /* *
     *
     *  Constructor
     *
     * */

    private constructor (baseURL: URL, localPath: string, contentType: string, content: string) {
        super(new URL(localPath, baseURL), contentType, content);
        this._baseURL = baseURL;
        this._localPath = localPath;
    }

    /* *
     *
     *  Properties
     *
     * */

    private _baseURL: URL;
    private _localPath: string;

    public get baseURL (): URL {
        return this._baseURL;
    }

    public get hasFailed (): boolean {
        return (this.content.length === 0);
    }

    public get localPath (): string {
        return this._localPath;
    }
}

export default Sideload;
