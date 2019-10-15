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

        if (item.length < 3) {
            return items;
        }

        items[item[1]] = {
            title: item[2],
            url: item[1],
            weight: parseInt(item[0])
        };

        return items;
    }

    public static sorter (itemA: Keywords.KeywordItem, itemB: Keywords.KeywordItem): number {
        return (itemB.weight - itemA.weight);
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

    public addURL (weight: number, url: string, title: string) {

        const items = this._items;

        if (
            typeof items[url] === 'undefined' ||
            items[url].weight < weight
        ) {
            items[url] = {
                title,
                url,
                weight
            };
        }
    }

    public containsURL (url: string): boolean {
        return (typeof this._items[url] !== 'undefined');
    }

    public toString (): string {

        const items = this._items;

        return Object
            .keys(items)
            .map(key => items[key])
            .sort(KeywordURLSet.sorter)
            .map(item => (item.weight + '\t' + item.url + '\t' + item.title))
            .join('\n');
    }
}

export default KeywordURLSet;
