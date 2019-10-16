/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

namespace HighsoftWebsearch {
    export class Download {

        /* *
         *
         *  Static Function
         *
         * */

        public static fromURL (url: string, timeout: number = 60000): Promise<Download> {
            return new Promise((resolve, reject) => {

                const request = new XMLHttpRequest();

                request.open('GET', url.toString(), true);
                request.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error(request.status.toString()));
                };
                request.onload = () => {
                    clearTimeout(timeout);
                    try {
                        resolve(
                            new Download(
                                new URL(request.responseURL),
                                request.status,
                                (request.getResponseHeader('Content-Type') || 'text/plain'),
                                request.response
                            )
                        );
                    }
                    catch (error) {
                        reject(error);
                    }
                };
                request.responseType = 'text';
                request.setRequestHeader('Content-Type', 'text/plain');
                timeout = setTimeout(() => {
                    request.abort();
                    reject(new Error('Timeout'));
                }, timeout);
                request.send();
            });
        }

        /* *
         *
         *  Constructor
         *
         * */

        private constructor (url: URL, statusCode: number, contentType: string, content: string) {
            this._content = content;
            this._contentType = contentType;
            this._statusCode = statusCode;
            this._url = url;
        }

        /* *
         *
         *  Properties
         *
         * */

        private _content: string;
        private _contentType: string;
        private _statusCode: number;
        private _url: URL;

        public get content (): string {
            return this._content;
        }

        public get contentType (): string {
            return this._contentType;
        }

        public get statusCode (): number {
            return this._statusCode;
        }

        public get url (): URL {
            return this._url;
        }
    }
}
