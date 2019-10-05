/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as Inspectors from './index';

/* *
 *
 *  Constants
 *
 * */

const KEYWORD_PATTERN = /(?:^|\s)([A-z][\w\-]*)/;
const LINK_PATTERN = /href\s*=\s*(['"])([^\\1])\1/;
const META_PATTERN = /<(head|noscript|script|style)[^>]*>.*<\/\\1>/;
const TAG_PATTERN = /<[\/!]?[\w-]+[^>]*>/;
const TITLE_WEIGHT: Record<string, number> = {
    title: 100,
    h1: 90,
    h2: 80,
    h3: 70,
    h4: 60,
    h5: 50,
    h6: 40,
    dt: 30,

}

/* *
 *
 *  Classes
 *
 * */

export class HTMLInspector extends Inspectors.Inspector {

    /* *
     *
     *  Static Functions
     *
     * */

    public static getText (html: string): string {

        const metaPattern = new RegExp(META_PATTERN, 'gi');
        const tagPattern = new RegExp(TAG_PATTERN, 'gi');

        return html
            .replace(metaPattern, ' ')
            .replace(tagPattern, ' ');
    }

    /* *
     *
     *  Functions
     *
     * */

    public getKeywords (): Array<string> {

        const contentText = HTMLInspector.getText(this.content.toLowerCase());
        const keywordPattern = new RegExp(KEYWORD_PATTERN, 'gi');
        const keywords: Array<string> = [];

        let keyword: string;
        let keywordMatch: (RegExpExecArray|null);

        while ((keywordMatch = keywordPattern.exec(contentText)) !== null) {

            keyword = keywordMatch[1];

            if (!keywords.includes(keyword)) {
                keywords.push(keyword);
            }
        }

        return keywords;
    }

    public getKeywordWeight (keyword: string): number {

        const content = this.content.toLowerCase();
        const tags = Object.keys(TITLE_WEIGHT).join('|');
        const tagPattern = new RegExp(`<(${tags})[^>]*>(.*?)<\/\\1>`, 'gi');

        let finalWeight = 0;
        let matchWeight = 0;
        let tagMatch: (RegExpExecArray|null|undefined);

        while ((tagMatch = tagPattern.exec(content)) !== null) {

            if (HTMLInspector.getText(tagMatch[2]).includes(keyword)) {
                matchWeight = (TITLE_WEIGHT[tagMatch[1]] || 0);
            }

            if (matchWeight > finalWeight) {
                finalWeight = matchWeight;
            }
        }

        return finalWeight;
    }

    public getLinks (): Array<string> {

        const content = this.content;
        const linkPattern = new RegExp(LINK_PATTERN, 'gi');
        const links: Array<string> = [];

        let linkMatch: (RegExpExecArray|null|undefined);

        while ((linkMatch = linkPattern.exec(content)) !== null) {
            links.push(linkMatch[2]);
        }

        return links;
    }
}

export default HTMLInspector;
