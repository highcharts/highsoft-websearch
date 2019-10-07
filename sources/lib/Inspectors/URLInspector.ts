/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as Inspectors from './index';
import * as Keywords from '../Keywords/index';

const KEYWORD_PATTERN = /[A-z]\w*/;

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

        const words = Keywords.KeywordFilter.getWords(this.content);

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

        const content = this.content;

        let length = content.length;

        if (length === 0) {
            return 0;
        }

        const index = content.indexOf(keyword);

        if (length > 100) {
            length = 100;
        }

        if (
            index === -1 ||
            index > length
        ) {
            return 0;
        }

        const indexWeight = (100 - Math.round((index / length) * 100));
        const lengthWeight = (100 - Math.round((length / 100) * 100));

        return Math.round(((indexWeight * 25) + (lengthWeight * 75)) / 100);
    }

    public getLinkAliases (): Array<string> {
        return [];
    }

    public getLinks (): Array<string> {
        return [];
    }
}

export default URLInspector;
