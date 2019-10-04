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

    public static fromURL(url: URL, depth: number, timeout: number): Promise<Download> {

        return new Promise(() => HTTPS.get(
                url.toString(),
                {
                    method: 'GET',
                    timeout: timeout
                },
                (response) => new Download(url, depth, response)
        ));
    }

    /* *
     *
     *  Constructor
     *
     * */

    private constructor (url: URL, depth: number, response: HTTP.IncomingMessage) {
        this._depth = depth;
        this._response = response;
        this._url = url;
    }

    /* *
     *
     *  Properties
     *
     * */

    private _depth: number;
    private _response: HTTP.IncomingMessage;
    private _url: URL;

    public get depth(): number {
        return this._depth;
    }

    public get hasFailed(): boolean {

        const statusCode = this._response.statusCode;

        return (typeof statusCode === 'undefined' || statusCode >= 400);
    }

    public get url(): URL {
        return this._url;
    }

    /* *
     *
     *  Functions
     *
     * */

    public getInspectors(): Array<L.Inspector> {

        const inspectors: Array<L.Inspector> = [];

        inspectors.push(new L.URLInspector(this._url.toString()));

        return inspectors;
    }
}

export default Download;
