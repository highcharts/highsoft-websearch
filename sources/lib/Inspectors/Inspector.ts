/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

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

    public get content(): string {
        return this._content;
    }

    /* *
     *
     *  Functions
     *
     * */

    public abstract getKeywords(): Array<string>;

    public abstract getKeywordWeight(keyword: string): number;

    public abstract getLinks(): Array<string>;

}

export default Inspector;
