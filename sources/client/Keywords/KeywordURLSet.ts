/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

namespace HighsoftWebsearch {
    /**
     * Set of keyword items containg URL, Title, and weight.
     */
    export class KeywordURLSet {

        /* *
         *
         *  Static Functions
         *
         * */

        /**
         * Converts a splitted string to a keyword item dictionary.
         *
         * @param items
         * Initial keyword item dictionary.
         *
         * @param item
         * Splitted string with item values.
         */
        private static reducer (items: Dictionary<KeywordItem>, item: Array<string>): Dictionary<KeywordItem> {

            if (item.length < 3) {
                return items;
            }

            items.set(
                item[1],
                {
                    title: item[2],
                    url: item[1],
                    weight: parseInt(item[0])
                }
            );

            return items;
        }

        /**
         * Descending order of keyword items.
         */
        public static sorter (itemA: KeywordItem, itemB: KeywordItem): number {

            const weightA = itemA.weight;
            const weightB = itemB.weight;

            if (weightA !== weightB) {
                return (weightB - weightA);
            }

            const urlA = itemA.url;
            const urlB = itemB.url;
            
            return (urlA < urlB ? -1 : urlA > urlB ? 1 : 0);
        }

        /* *
         *
         *  Constructor
         *
         * */

        /**
         * Creates a set of keyword items containing url, title, and weight.
         *
         * @param keyword
         * Keyword of the set.
         *
         * @param content
         * Optionally initializes the set with tab separated values.
         */
        public constructor (keyword: string, content?: string) {

            this._items = new Dictionary<KeywordItem>();
            this._keyword = keyword;

            if (typeof content === 'string') {
                this._items = content
                    .split('\n')
                    .map(line => line.split('\t', 3))
                    .reduce(KeywordURLSet.reducer, this._items);
            }
        }

        /* *
         *
         *  Properties
         *
         * */

        private _items: Dictionary<KeywordItem>;
        private _keyword: string;

        /**
         * Returns the dictionary with all keyword items accessible via URL.
         */
        public get items (): Dictionary<KeywordItem> {
            return this._items;
        }

        /**
         * Return the keyword of the set.
         */
        public get keyword (): string {
            return this._keyword;
        }

        /* *
         *
         *  Functions
         *
         * */

        /**
         * Adds or replaces a URL in the set.
         *
         * @param weight
         * Weight of the URL.
         *
         * @param url
         * URL to add.
         *
         * @param title
         * Title of the URL content.
         */
        public addURL (weight: number, url: string, title: string) {

            const items = this._items;
            const item = items.get(url);

            if (
                typeof item === 'undefined' ||
                item.weight < weight
            ) {
                items.set(url, { title, url, weight });
            }
        }

        /**
         * Return true, if the set contains the given URL.
         *
         * @param
         * URL to find in the set.
         */
        public containsURL (url: string): boolean {
            return this._items.contains(url);
        }

        /**
         * Returns a string of tab separated values for storage purpose.
         */
        public toString (): string {

            const items = this._items;

            return items.values
                .sort(KeywordURLSet.sorter)
                .map(item => (item.weight + '\t' + item.url + '\t' + item.title))
                .join('\n');
        }
    }
}
