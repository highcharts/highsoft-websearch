/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

export class KeywordFile {

    /* *
     *
     *  Constructor
     *
     * */

    public constructor (keyword: string) {
        this._keyword = keyword;
        this._weightedUrls = {};
    }

    /* *
     *
     *  Properties
     *
     * */

    private _keyword: string;
    private _weightedUrls: Record<string, number>;

    public get keyword (): string {
        return this._keyword;
    }

    /* *
     *
     *  Functions
     *
     * */

    public addURL (url: string, weight: number) {
        this._weightedUrls[url] = weight;
    }

    public toString (): string {

        const weightedUrls = this._weightedUrls;

        return Object
            .keys(weightedUrls)
            .sort((urlA: string, urlB: string): number => {
                return (weightedUrls[urlA] - weightedUrls[urlB]);
            })
            .join('\n');
    }
}

export default KeywordFile;
