/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as HTTP from 'http';
import * as HTTPS from 'https';
import * as Inspectors from '../Inspectors/index';
import * as Keywords from './index';
import * as URL from 'url';

export class KeywordDownload {

    /* *
     *
     *  Static Function
     *
     * */

    public static fromURL (url: URL.URL, depth: number, timeout: number): Promise<KeywordDownload> {

        return new Promise((resolve, reject) => {

            const handler = (response: HTTP.IncomingMessage) => {

                let dataBuffer: Array<Buffer> = new Array<Buffer>();

                response.on('data', (data) => {
                    dataBuffer.push(data);
                });
                response.on('end', () => {

                    const statusCode = (response.statusCode || 200);
                    const location = response.headers['location'];

                    if (
                        statusCode >= 300 &&
                        statusCode <= 399 &&
                        location
                    ) {
                        try {

                            url = new URL.URL(location, url);

                            KeywordDownload
                                .fromURL(url, depth, timeout)
                                .then(resolve);

                            return;
                        }
                        catch (error) {
                            // silent fail
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

    /* *
     *
     *  Constructor
     *
     * */

    private constructor (url: URL.URL, depth: number, response: HTTP.IncomingMessage, content: Buffer) {
        this._content = content;
        this._depth = depth;
        this._links = [];
        this._response = response;
        this._url = url;
    }

    /* *
     *
     *  Properties
     *
     * */

    private _content: Buffer;
    private _depth: number;
    private _links: Array<string>;
    private _response: HTTP.IncomingMessage;
    private _url: URL.URL;

    public get depth (): number {
        return this._depth;
    }

    public get hasFailed (): boolean {

        const statusCode = this._response.statusCode;

        return (typeof statusCode === 'undefined' || statusCode >= 400);
    }

    public get url (): URL.URL {
        return this._url;
    }

    /* *
     *
     *  Functions
     *
     * */

    public addKeywordFiles (keywordFiles: Record<string, Keywords.KeywordFile>, links?: Array<string>): void {

        const inspectors = this.getInspectors();
        const linkAliases: Array<string> = [];
        const url = this.url.toString();

        let inspector: (Inspectors.Inspector|undefined);
        let inspectorLinks: (Array<string>|undefined);
        let keyword: (string|undefined);
        let keywordFile: (Keywords.KeywordFile|undefined);
        let keywords: (Array<string>|undefined);
        let linkAlias: (string|undefined);

        for (inspector of inspectors) {

            if (typeof links !== 'undefined') {

                inspectorLinks = inspector.getLinks(url)

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

    private getContentText (): string {
        return this._content.toString('utf8');
    }

    private getContentType (): string {
        return (this._response.headers['content-type'] || '').split(';')[0];
    }

    private getInspectors (): Array<Inspectors.Inspector> {

        const inspectors: Array<Inspectors.Inspector> = [
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

export default KeywordDownload;
