/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as Inspectors from './index';
import * as URL from 'url';

/* *
 *
 *  Constants
 *
 * */

const ID_PATTERN = /id\s*=\s*(['"])([^\\1])\1/
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

    public static getBody (html: string): string {

        const metaPattern = new RegExp(META_PATTERN, 'gi');

        return html.replace(metaPattern, ' ');
    }

    public static getText (html: string): string {

        const tagPattern = new RegExp(TAG_PATTERN, 'gi');

        return HTMLInspector
            .getBody(html)
            .replace(tagPattern, ' ');
    }

    /* *
     *
     *  Properties
     *
     * */

    private _keywords: (Array<string>|undefined);
    private _linkAliases: (Array<string>|undefined);
    private _links: (Array<string>|undefined);

    /* *
     *
     *  Functions
     *
     * */

    public getKeywords (): Array<string> {

        if (typeof this._keywords !== 'undefined') {
            return this._keywords;
        }

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

        this._keywords = keywords;

        return keywords;
    }

    public getKeywordWeight (keyword: string): number {

        const content = this.content.toLowerCase();
        const tags = Object.keys(TITLE_WEIGHT).join('|');
        const tagPattern = new RegExp(`<(${tags})[^>]*>(.*?)<\/\\1>`, 'gi');

        let finalWeight = 0;
        let matchWeight = 0;
        let match: (RegExpExecArray|null|undefined);

        while ((match = tagPattern.exec(content)) !== null) {

            if (HTMLInspector.getText(match[2]).includes(keyword)) {
                matchWeight = (TITLE_WEIGHT[match[1]] || 0);
            }

            if (matchWeight > finalWeight) {
                finalWeight = matchWeight;
            }
        }

        return finalWeight;
    }

    public getLinkAliases (baseURL?: URL.URL): Array<string> {

        if (typeof this._linkAliases !== 'undefined') {
            return this._linkAliases;
        }

        const content = HTMLInspector.getBody(this.content);
        const idPattern = new RegExp(ID_PATTERN, 'gi');
        const linkAliases: Array<string> = [];

        let match: (RegExpExecArray|null|undefined);
        let matchURL: (URL.URL|undefined);

        while ((match = idPattern.exec(content)) !== null) {
            try {
                matchURL = new URL.URL('#' + match[2], baseURL);
                linkAliases.push(matchURL.toString());
            }
            catch (error) {
                // silent fail
            }
        }
        
        this._linkAliases = linkAliases;

        return linkAliases;
    }

    public getLinks (baseURL?: URL.URL): Array<string> {

        if (typeof this._links !== 'undefined') {
            return this._links;
        }

        const content = HTMLInspector.getBody(this.content);
        const linkPattern = new RegExp(LINK_PATTERN, 'gi');
        const links: Array<string> = [];

        let match: (RegExpExecArray|null|undefined);
        let matchURL: (URL.URL|undefined);

        while ((match = linkPattern.exec(content)) !== null) {
            try {
                matchURL = new URL.URL(match[2], baseURL);
                links.push(matchURL.toString());
            }
            catch (error) {
                // silent fail
            }
        }

        this._links = links;

        return links;
    }
}

export default HTMLInspector;
