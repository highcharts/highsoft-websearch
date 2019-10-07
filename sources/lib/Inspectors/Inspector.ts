/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as URL from 'url';

export abstract class Inspector {

    /* *
     *
     *  Constructor
     *
     * */

    public constructor (content: string) {
        this._content = content;
    }

    /* *
     *
     *  Properties
     *
     * */

    private _content: string;

    protected get content (): string {
        return this._content;
    }

    /* *
     *
     *  Functions
     *
     * */

    public abstract getKeywords (): Array<string>;

    public abstract getKeywordWeight (keyword: string): number;

    public abstract getLinkAliases (baseURL?: URL.URL): Array<string>;

    public abstract getLinks (baseURL?: URL.URL): Array<string>;

}

export default Inspector;
