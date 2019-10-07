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

    public addKeywordFiles (keywordFiles: Record<string, Keywords.KeywordFile>): void {

        const inspectors = this.getInspectors();
        const linkAliases: Array<string> = [];
        const url = this.url;

        let keywordFile: Keywords.KeywordFile;
        let keywords: Array<string>;

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

    private addLinkAliasesToKeywordFiles (linkAliases: Array<string>, keywordFiles: Record<string, Keywords.KeywordFile>): void {

        let keywordFile: Keywords.KeywordFile;
        let keywords: Array<string>;
        let inspector: Inspectors.URLInspector;

        for (let linkAlias of linkAliases) {

            inspector = new Inspectors.URLInspector(linkAlias);
            keywords = inspector.getKeywords();

            for (let keyword of keywords) {

                keywordFile = keywordFiles[keyword];
                keywordFile.addURL(linkAlias, inspector.getKeywordWeight(keyword));
            }
        }
    }

    private getContentText (): string {

        let charset = this.getContentType()[1];

        if (typeof charset !== 'undefined') {
            charset = (charset.split('=')[1] || '').trim();
        }

        return this._content.toString(charset || 'utf-8');
    }

    private getContentType (): Array<(string|undefined)> {
        return (this._response.headers['content-type'] || '')
            .split(';')
            .map(parts => parts.trim())
            .filter(parts => !!parts);
    }

    private getInspectors (): Array<Inspectors.Inspector> {

        const inspectors: Array<Inspectors.Inspector> = [
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

export default KeywordDownload;
