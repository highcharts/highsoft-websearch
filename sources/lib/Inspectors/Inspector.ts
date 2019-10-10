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

    public abstract getLinkAliases (baseURL?: string): Array<string>;

    public abstract getLinks (baseURL?: string): Array<string>;

    public abstract getTitle (): string;
}

export default Inspector;
