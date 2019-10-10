/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

namespace HighsoftSearch {
    export class KeywordURLSet {

        /* *
        *
        *  Static Functions
        *
        * */

        private static reducer (items: Record<string, KeywordItem>, item: Array<string>): Record<string, KeywordItem> {

            items[item[0]] = {
                title: item[2],
                url: new URL(item[0]),
                weight: parseInt(item[1])
            };

            return items;
        }

        public static sorter (itemA: KeywordItem, itemB: KeywordItem): number {
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

        private _items: Record<string, KeywordItem>;
        private _keyword: string;

        public get items (): Record<string, KeywordItem> {
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

        public addURL (url: string, weight: number, title: string) {
            this._items[url] = {
                title,
                url: new URL(url),
                weight
            };
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
                .map(item => (item.url + '\t' + item.weight + '\t' + item.title))
                .join('\n');
        }
    }
}
