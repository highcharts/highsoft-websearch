/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as Keywords from './index';

export class KeywordURLSet {

    /* *
     *
     *  Static Functions
     *
     * */

    private static reducer (items: Record<string, Keywords.KeywordItem>, item: Array<string>): Record<string, Keywords.KeywordItem> {

        items[item[0]] = {
            title: item[2],
            url: new URL(item[0]),
            weight: parseInt(item[1])
        };

        return items;
    }

    public static sorter (itemA: Keywords.KeywordItem, itemB: Keywords.KeywordItem): number {
        return (itemA.weight - itemB.weight);
    }

    /* *
     *
     *  Constructor
     *
     * */

    public constructor (keyword: string, content?: string) {

        this._items = {};
        this._keyword = keyword;

        if (typeof content === 'string') {
            this._items = content
                .split('\n')
                .map(line => line.split('\t', 3))
                .reduce(KeywordURLSet.reducer, {});
        }
    }

    /* *
     *
     *  Properties
     *
     * */

    private _items: Record<string, Keywords.KeywordItem>;
    private _keyword: string;

    public get items (): Record<string, Keywords.KeywordItem> {
        return this._items;
    }

    public get keyword (): string {
        return this._keyword;
    }

    /* *
     *
     *  Functions
     *
     * */

    public containsURL (url: string): boolean {
        return (typeof this._items[url] !== 'undefined');
    }

    public addURL (url: string, weight: number, title: string) {
        this._items[url] = {
            title,
            url: new URL(url),
            weight
        };
    }

    public toString (): string {

        const items = this._items;

        return Object
            .keys(items)
            .map(key => items[key])
            .sort(KeywordURLSet.sorter)
            .map(item => (item.url + '\t' + item.weight + '\t' + item.title))
            .join('\n');
    }
}

export default KeywordURLSet;
