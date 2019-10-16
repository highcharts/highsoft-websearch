/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

namespace HighsoftWebsearch {
    export class Search {

        /* *
         *
         *  Static Functions
         *
         * */

        /**
         * Generates a preview text from the URL content of a keyword item.
         *
         * @param search
         * The search instance as a reference for rendering.
         *
         * @param item
         * The search result in structure of a keyword item with title and URL.
         */
        public static preview (item: KeywordItem, searchTerms: Array<string>): Promise<string> {

            if (searchTerms.length === 0) {
                Promise.resolve('');
            }

            return Download
                .fromURL(item.url)
                .then(download => {

                    const downloadDocument = document.createElement('html');

                    downloadDocument.innerHTML = download.content;

                    const downloadBody = downloadDocument.getElementsByTagName('body')[0];

                    if (typeof downloadBody === 'undefined') {
                        return '';
                    }

                    const preview = KeywordFilter.getWords(downloadBody.innerText);
                    const previewLowerCase = preview.map(word => word.toLowerCase());

                    let previewIndex = -1;
                    let previewStart = 0;
                    let previewEnd = 0;

                    for (let queryTerm of searchTerms) {

                        previewIndex = previewLowerCase.indexOf(queryTerm.toLowerCase());

                        if (previewIndex >= 0) {
                            break;
                        }
                    }

                    if (previewIndex < 10) {
                        previewEnd = 21;
                    }
                    else {
                        previewEnd = previewIndex + 11;
                        previewStart = previewIndex - 10;
                    }

                    if (previewIndex === -1) {
                        return preview.slice(previewStart, previewEnd).join(' ');
                    }

                    return (
                        preview.slice(previewStart, previewIndex).join(' ') +
                        ' <b>' + preview[previewIndex] + '</b> ' +
                        preview.slice((previewIndex + 1), previewEnd).join(' ')
                    );
                })
                .catch(() => '');
        }

        /* *
         *
         *  Constructor
         *
         * */

        /**
         * Creates a new search instance with the given base path, where keyword
         * files can be found.
         *
         * @param basePath
         * Base path to the keyword files.
         */
        public constructor (basePath: string) {
            this._basePath = basePath;
        }

        /* *
         *
         *  Properties
         *
         * */

        private _basePath: string;
        private _query: (string|undefined);
        private _terms: (Array<string>|undefined);

        public get basePath (): string {
            return this._basePath;
        }

        public get query (): (string|undefined) {
            return this._query;
        }

        public get terms (): (Array<string>|undefined) {
            return this._terms;
        }

        /* *
         *
         *  Functions
         *
         * */

        private consolidate (keywordFiles: Array<KeywordURLSet>): Array<KeywordItem> {

            const consolidatedItems: Dictionary<KeywordItem> = new Dictionary<KeywordItem>();

            let keywordFile: KeywordURLSet;
            let keywordItem: KeywordItem;
            let keywordItems: Array<KeywordItem>;

            for (keywordFile of keywordFiles) {

                keywordItems = keywordFile.items.values;

                for (keywordItem of keywordItems) {
                    if (!consolidatedItems.contains(keywordItem.url)) {
                        consolidatedItems.set(keywordItem.url, keywordItem);
                    }
                }
            }

            return consolidatedItems.values.sort(KeywordURLSet.sorter);
        }

        public download (searchTerm: string): Promise<KeywordURLSet> {
            return Download
                .fromURL(this.basePath + searchTerm + '.txt')
                .then(download => new KeywordURLSet(searchTerm, download.content))
                .catch(() => new KeywordURLSet(searchTerm));
        } 

        public find (query: string): Promise<Array<KeywordItem>> {

            this._query = query;

            const downloadPromises: Array<Promise<KeywordURLSet>> = [];
            const terms = this._terms = KeywordFilter.getWords(query);

            let term: string;

            for (term of terms) {
                downloadPromises.push(this.download(term));
            }

            return Promise
                .all(downloadPromises)
                .then(this.consolidate)
                .catch(() => []);
        }
    }
}
