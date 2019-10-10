/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as HTTP from 'http';
import * as HTTPS from 'https';
import * as Inspectors from '../Inspectors/index';
import * as Keywords from '../Keywords/index';

export class Download {

    /* *
     *
     *  Static Function
     *
     * */

    public static fromURL (url: URL, timeout: number = 60000): Promise<Download> {

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
        this._links = [];
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
    private _links: Array<string>;
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

    public addKeywordURLSets (keywordFiles: Record<string, Keywords.KeywordURLSet>, links?: Array<string>): void {

        const inspectors = this.getInspectors();
        const linkAliases: Array<string> = [];
        const url = this.url.toString();

        let inspector: (Inspectors.Inspector|undefined);
        let inspectorLinks: (Array<string>|undefined);
        let keyword: (string|undefined);
        let keywordURLSet: (Keywords.KeywordURLSet|undefined);
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

                keywordURLSet = keywordFiles[keyword];
                
                if (typeof keywordURLSet === 'undefined') {
                    keywordFiles[keyword] = keywordURLSet = new Keywords.KeywordURLSet(keyword);
                }

                keywordURLSet.addURL(url, inspector.getKeywordWeight(keyword), '');
                linkAliases.push(...inspector.getLinkAliases(url));
            }
        }

        for (linkAlias of linkAliases) {

            inspector = new Inspectors.URLInspector(linkAlias);
            keywords = inspector.getKeywords();

            for (keyword of keywords) {

                keywordURLSet = keywordFiles[keyword];

                if (typeof keywordURLSet === 'undefined') {
                    keywordFiles[keyword] = keywordURLSet = new Keywords.KeywordURLSet(keyword);
                }

                if (!keywordURLSet.containsURL(url)) {
                    keywordURLSet.addURL(linkAlias, inspector.getKeywordWeight(keyword), '');
                }
            }
        }
    }

    private getInspectors (): Array<Inspectors.Inspector> {

        const inspectors: Array<Inspectors.Inspector> = [
            new Inspectors.URLInspector(this.url.toString())
        ];

        switch (this.contentType) {
            case 'text/html':
                inspectors.push(new Inspectors.HTMLInspector(this.content));
                break;
        }

        return inspectors;
    }
}

export default Download;
