/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

namespace HighsoftWebSearch {
    /**
     * Set of keyword entries containg URL, Title, and weight.
     */
    export class KeywordURLSet {

        /* *
         *
         *  Static Functions
         *
         * */

        /**
         * Converts a splitted string to a keyword entry and adds it to a
         * dictionary.
         *
         * @param entries
         * Initial keyword entries.
         *
         * @param values
         * Splitted string with entry values.
         */
        private static reducer (entries: Dictionary<KeywordEntry>, values: Array<string>): Dictionary<KeywordEntry> {

            if (values.length < 3) {
                return entries;
            }

            entries.set(
                values[1],
                {
                    title: values[2],
                    url: values[1],
                    weight: parseInt(values[0])
                }
            );

            return entries;
        }

        /**
         * Descending order of keyword entries.
         *
         * @param entryA
         * First keyword entry to compare.
         *
         * @param entryB
         * Second keyword entry to compare.
         */
        public static sorter (entryA: KeywordEntry, entryB: KeywordEntry): number {

            const weightA = entryA.weight;
            const weightB = entryB.weight;

            if (weightA !== weightB) {
                return (weightB - weightA);
            }

            const urlA = entryA.url;
            const urlB = entryB.url;
            
            return (urlA < urlB ? -1 : urlA > urlB ? 1 : 0);
        }

        /* *
         *
         *  Constructor
         *
         * */

        /**
         * Creates a set of keyword entries containing url, title, and weight.
         *
         * @param keyword
         * Keyword of the set.
         *
         * @param content
         * Optionally initializes the set with tab separated values.
         */
        public constructor (keyword: string, content?: string) {

            this._entries = new Dictionary<KeywordEntry>();
            this._keyword = keyword;

            if (typeof content === 'string') {
                this._entries = content
                    .split('\n')
                    .map(line => line.split('\t', 3))
                    .reduce(KeywordURLSet.reducer, this._entries);
            }
        }

        /* *
         *
         *  Properties
         *
         * */

        private _entries: Dictionary<KeywordEntry>;
        private _keyword: string;

        /**
         * Returns the dictionary with all keyword entries accessible via URL.
         */
        public get entries (): Dictionary<KeywordEntry> {
            return this._entries;
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

            const entries = this._entries;
            const entry = entries.get(url);

            if (
                typeof entry === 'undefined' ||
                entry.weight < weight
            ) {
                entries.set(url, { title, url, weight });
            }
        }

        /**
         * Return true, if the set contains the given URL.
         *
         * @param
         * URL to find in the set.
         */
        public containsURL (url: string): boolean {
            return this._entries.contains(url);
        }

        /**
         * Returns a string of tab separated values for storage purpose.
         */
        public toString (): string {

            const entries = this._entries;

            return entries.values
                .sort(KeywordURLSet.sorter)
                .map(entry => (entry.weight + '\t' + entry.url + '\t' + entry.title))
                .join('\n');
        }
    }
}
