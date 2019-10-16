/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as Inspectors from './index';
import * as Keywords from '../Keywords/index';

export class URLInspector extends Inspectors.Inspector {

    /* *
     *
     *  Properties
     *
     * */

    private _keywords: (Array<string>|undefined);

    /* *
     *
     *  Functions
     *
     * */

    public getKeywords (): Array<string> {

        if (typeof this._keywords !== 'undefined') {
            return this._keywords;
        }

        const words = Keywords.KeywordFilter.getWords(this.content.toLowerCase());

        let keywords: Array<string> = [];
        let word: string;

        for (word of words) {
            if (!keywords.includes(word)) {
                keywords.push(word);
            }
        }

        this._keywords = keywords = keywords.filter(Keywords.KeywordFilter.commonFilter);

        return keywords;
    }

    public getKeywordWeight (keyword: string): number {

        const keywords = this.getKeywords();
        const keywordIndex = keywords.indexOf(keyword);

        let keywordsLength = keywords.length;

        if (keywordsLength === 0) {
            return 0;
        }

        if (keywordsLength > 10) {
            keywordsLength = 10;
        }

        let indexWeight = 0;

        if (keywordIndex > -1 && keywordIndex < keywordsLength) {
            indexWeight = (1 - (keywordIndex / 10));
        }

        return Math.round(indexWeight * 100);
    }

    public getLinkAliases (): Array<string> {
        return [];
    }

    public getLinks (): Array<string> {
        return [];
    }

    public getTitle (): undefined {
        return;
    }
}

export default URLInspector;
