/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as Client from './index';
import * as Keywords from '../index';

const WORD_PATTERN = /[A-z](?:[\w\-\.]*[A-z])?/;

export class Search {

    /* *
     *
     *  Constructor
     *
     * */

    public constructor (baseURL: URL) {
        this._baseURL = baseURL;
    }

    /* *
     *
     *  Properties
     *
     * */

    private _baseURL: URL;

    /* *
     *
     *  Functions
     *
     * */

    private consolidate (keywordFiles: Array<Keywords.KeywordFile>): Array<Keywords.KeywordItem> {

        const consolidatedItems: Record<string, Keywords.KeywordItem> = {};

        let keywordFile: Keywords.KeywordFile;
        let keywordItems: Record<string, Keywords.KeywordItem>;
        let keywordItemURL: string;
        let keywordItemURLs: Array<string>;

        for (keywordFile of keywordFiles) {

            keywordItems = keywordFile.items;
            keywordItemURLs = Object.keys(keywordItems);

            for (keywordItemURL of keywordItemURLs) {
                consolidatedItems[keywordItemURL] = (
                    consolidatedItems[keywordItemURL] ||
                    keywordItems[keywordItemURL]
                );
            }
        }

        return Object
            .keys(consolidatedItems)
            .map(keywordItemURL => consolidatedItems[keywordItemURL])
            .sort(Keywords.KeywordFile.sorter);
    }

    public download (term: string, baseURL: URL): Promise<Keywords.KeywordFile> {
        return Client.Download
            .fromURL(new URL(term, baseURL))
            .then(download => new Keywords.KeywordFile(term, download.content));
    } 

    public find (query: string): Promise<Array<Keywords.KeywordItem>> {

        const baseURL = this._baseURL;
        const loadPromises: Array<Promise<Keywords.KeywordFile>> = [];
        const wordPattern = new RegExp(WORD_PATTERN.source, 'gi');

        for (let term of query.split(wordPattern)) {
            loadPromises.push(this.download(term, baseURL));
        }

        return Promise
            .all(loadPromises)
            .then(this.consolidate);
    }
}