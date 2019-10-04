/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as I from './index';

const URL_INSPECTOR_PATTERN = /[\w\.\-]+/g;

export class URLInspector extends I.Inspector {

    /* *
     *
     *  Functions
     *
     * */

    public getKeywords (): Array<string> {

        try {
            return (URL_INSPECTOR_PATTERN.exec(this.content) || []);
        }
        finally {
            URL_INSPECTOR_PATTERN.lastIndex = 0;
        }
    }

    public getKeywordWeight (keyword: string): number {

        const content = this.content;
        const length = content.length;

        if (length === 0) {
            return 0;
        }

        let index = 0;
        let weight = 0;

        while (index !== -1) {

            if (index > 0) {
                weight += (100 - Math.round((index / length) * 100));
            }

            index = content.indexOf(keyword, index);
        }

        return weight;
    }

    public getLinks (): Array<string> {
        return [];
    }
}

export default URLInspector;
