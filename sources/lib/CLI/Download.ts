/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as Http from 'http';
import * as Https from 'https';
import * as Inspectors from '../Inspectors/index';

export class Download {

    /* *
     *
     *  Static Function
     *
     * */

    public static fromURL(url: string, depth: number, timeout: number): Promise<Download> {

        return new Promise((resolve, reject) => {

            const request = Https.get(
                url.toString(),
                {
                    method: 'GET',
                    timeout: timeout
                },
                (response) => {

                    let dataBuffer: Array<Buffer> = new Array<Buffer>();

                    response.on('data', (data) => {
                        dataBuffer.push(data);
                    });
                    response.on('end', () => {
                        resolve(new Download(url, depth, response, Buffer.concat(dataBuffer)));
                    });

                    response.on('error', reject);
                }
            );

            request.on('error', reject);
        });
    }

    /* *
     *
     *  Constructor
     *
     * */

    private constructor (url: string, depth: number, response: Http.IncomingMessage, content: Buffer) {
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
    private _response: Http.IncomingMessage;
    private _url: string;

    public get content(): Buffer {
        return this._content;
    }

    public get depth(): number {
        return this._depth;
    }

    public get hasFailed(): boolean {

        const statusCode = this._response.statusCode;

        return (typeof statusCode === 'undefined' || statusCode >= 400);
    }

    public get url(): string {
        return this._url;
    }

    /* *
     *
     *  Functions
     *
     * */

    public getContentText(): string {

        let charset = this.getContentType()[1];

        if (typeof charset !== 'undefined') {
            charset = (charset.split('=')[1] || '').trim();
        }

        return this._content.toString(charset || 'utf-8');
    }

    private getContentType(): Array<(string|undefined)> {
        return (this._response.headers['content-type'] || '')
            .split(';')
            .map(parts => parts.trim())
            .filter(parts => !!parts);
    }

    public getInspectors(): Array<Inspectors.Inspector> {

        const inspectors: Array<Inspectors.Inspector> = [
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

export default Download;
