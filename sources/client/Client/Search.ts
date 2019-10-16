/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

namespace HighsoftWebSearch {
    export class Search {

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

        private consolidate (keywordFiles: Array<KeywordURLSet>): Array<KeywordEntry> {

            const consolidatedEntries: Dictionary<KeywordEntry> = new Dictionary<KeywordEntry>();

            let keywordEntry: KeywordEntry;
            let keywordEntries: Array<KeywordEntry>;
            let keywordFile: KeywordURLSet;

            for (keywordFile of keywordFiles) {

                keywordEntries = keywordFile.entries.values;

                for (keywordEntry of keywordEntries) {
                    if (!consolidatedEntries.contains(keywordEntry.url)) {
                        consolidatedEntries.set(keywordEntry.url, keywordEntry);
                    }
                }
            }

            return consolidatedEntries.values.sort(KeywordURLSet.sorter);
        }

        public download (searchTerm: string): Promise<KeywordURLSet> {
            return Download
                .fromURL(this.basePath + searchTerm + '.txt')
                .then(download => new KeywordURLSet(searchTerm, download.content))
                .catch(() => new KeywordURLSet(searchTerm));
        } 

        public find (query: string): Promise<Array<KeywordEntry>> {

            const downloadPromises: Array<Promise<KeywordURLSet>> = [];
            const terms = this._terms = KeywordFilter.getWords(query);

            let term: string;

            for (term of terms) {
                downloadPromises.push(this.download(term));
            }

            return Promise
                .all(downloadPromises)
                .then(keywordEntries => this.consolidate(keywordEntries))
                .then(keywordEntries => {
                    this._query = query;
                    return keywordEntries;
                })
                .catch(() => []);
        }

        /**
         * Generates a preview snippet from the URL content of a given keyword
         * entry.
         *
         * @param entry
         * Keyword entry to render a preview snippet from.
         */
        public preview (entry: KeywordEntry): Promise<string> {

            const terms = (this.terms || []).slice();

            return Download
                .fromURL(entry.url)
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

                    for (let term of terms) {

                        previewIndex = previewLowerCase.indexOf(term.toLowerCase());

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
    }
}
