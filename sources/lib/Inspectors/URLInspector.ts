/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as Inspectors from './index';

const KEYWORD_PATTERN = /[A-z][\w\-]*/;

export class URLInspector extends Inspectors.Inspector {

    /* *
     *
     *  Functions
     *
     * */

    public getKeywords (): Array<string> {

        const keywordPattern = new RegExp(KEYWORD_PATTERN, 'gi');

        return (this.content.match(keywordPattern) || []);
    }

    public getKeywordWeight (keyword: string): number {

        const content = this.content;
        const length = content.length;

        if (length === 0) {
            return 0;
        }

        let index = content.indexOf(keyword);
        let weight = 0;

        while (index !== -1) {
            weight += (100 - Math.round((index / length) * 100));
            index = content.indexOf(keyword, (index + keyword.length));
        }

        return weight;
    }

    public getLinks (): Array<string> {
        return [];
    }
}

export default URLInspector;
