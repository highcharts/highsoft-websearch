/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as HTTP from 'http';
import * as HTTPS from 'https';
import Load from './Load';

export class Download extends Load {

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

                    resolve(new Download(url, response, Buffer.concat(dataBuffer).toString()));
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

    private constructor (url: URL, response: HTTP.IncomingMessage, content: string) {
        super(url, (response.headers['content-type'] || '').split(';')[0], content);
        this._statusCode = (response.statusCode || 500);
    }

    /* *
     *
     *  Properties
     *
     * */

    private _statusCode: number;

    public get hasFailed (): boolean {

        const statusCode = this.statusCode;

        return (typeof statusCode === 'undefined' || statusCode >= 400);
    }

    public get statusCode(): number {
        return this._statusCode;
    }
}

export default Download;
