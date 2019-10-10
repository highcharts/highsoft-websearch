/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as HTTP from 'http';
import * as HTTPS from 'https';
import * as L from '../index';

export class Download {

    /* *
     *
     *  Static Function
     *
     * */

    public static fromURL (url: URL, timeout: number = 60000): Promise<Download> {

        if (timeout < 0) {
            timeout = 0;
        }

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

                            url = new URL(location, url);

                            Download
                                .fromURL(url, timeout)
                                .then(resolve);

                            return;
                        }
                        catch (error) {
                            // silent fail
                        }
                    }

                    resolve(new Download(url, response, Buffer.concat(dataBuffer)));
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

    private constructor (url: URL, response: HTTP.IncomingMessage, content: Buffer) {
        this._content = content;
        this._contentType = (response.headers['content-type'] || '').split(';')[0];
        this._response = response;
        this._statusCode = (response.statusCode || 500);
        this._url = url;
    }

    /* *
     *
     *  Properties
     *
     * */

    private _content: Buffer;
    private _contentType: string;
    private _response: HTTP.IncomingMessage;
    private _statusCode: number;
    private _url: URL;

    public get content (): string {
        return this._content.toString();
    }

    public get contentType (): string {
        return this._contentType;
    }

    public get hasFailed (): boolean {

        const statusCode = this._response.statusCode;

        return (typeof statusCode === 'undefined' || statusCode >= 400);
    }

    public get statusCode(): number {
        return this._statusCode;
    }

    public get url (): URL {
        return this._url;
    }

    /* *
     *
     *  Functions
     *
     * */

    private getInspectors (): Array<L.Inspector> {

        const inspectors: Array<L.Inspector> = [
            new L.URLInspector(this.url.toString())
        ];

        switch (this.contentType) {
            case 'text/html':
                inspectors.push(new L.HTMLInspector(this.content));
                break;
        }

        return inspectors;
    }

    public update (keywordURLSets: L.Dictionary<L.KeywordURLSet>, urlDownloads?: L.Dictionary<boolean>): void {

        const inspectors = this.getInspectors();
        const linkAliases: Array<string> = [];
        const url = this.url.toString();

        let inspector: (L.Inspector|undefined);
        let inspectorLink: (string|undefined);
        let inspectorLinks: (Array<string>|undefined);
        let keyword: (string|undefined);
        let keywordURLSet: (L.KeywordURLSet|undefined);
        let keywords: (Array<string>|undefined);
        let linkAlias: (string|undefined);

        for (inspector of inspectors) {

            if (typeof urlDownloads !== 'undefined') {

                inspectorLinks = inspector.getLinks(url);

                for (inspectorLink of inspectorLinks) {

                    if (inspectorLink.includes('#')) {
                        inspectorLink = inspectorLink.substr(0, inspectorLink.indexOf('#'));
                    }

                    if (typeof urlDownloads.get(inspectorLink) === 'undefined') {
                        urlDownloads.set(inspectorLink, false);
                    }
                }
            }

            keywords = inspector.getKeywords();

            for (keyword of keywords) {

                keywordURLSet = keywordURLSets.get(keyword);
                
                if (typeof keywordURLSet === 'undefined') {
                    keywordURLSets.set(keyword, (keywordURLSet = new L.KeywordURLSet(keyword)));
                }

                try {
                    keywordURLSet.addURL(url, inspector.getKeywordWeight(keyword), inspector.getTitle());
                    linkAliases.push(...inspector.getLinkAliases(url));
                }
                catch (error) {
                    console.log(keyword);
                    console.log(keywordURLSets.get(keyword), keywordURLSet);
                }
            }
        }

        for (linkAlias of linkAliases) {

            inspector = new L.URLInspector(linkAlias);
            keywords = inspector.getKeywords();

            for (keyword of keywords) {

                keywordURLSet = keywordURLSets.get(keyword);

                if (typeof keywordURLSet === 'undefined') {
                    keywordURLSets.set(keyword, (keywordURLSet = new L.KeywordURLSet(keyword)));
                }

                if (!keywordURLSet.containsURL(url)) {
                    keywordURLSet.addURL(linkAlias, inspector.getKeywordWeight(keyword), '');
                }
            }
        }
    }
}

export default Download;
