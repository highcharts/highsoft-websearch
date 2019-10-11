/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as Inspectors from './index';
import * as Keywords from '../Keywords/index';

/* *
 *
 *  Constants
 *
 * */

const ENTITY_PATTERN = /&(\w+);/;
const LINK_PATTERN = /href\s*=\s*(['"])(.*?)\1/;
const META_PATTERN = /<(head|noscript|script|style)[^>]*>[\s\S]*?<\/\1>/;
const TAG_PATTERN = /<[\/!]?[\w-]+[^>]*>/;
const TITLE_PATTERN = /<title[^>]*>([\s\S]+?)<\/title>/;
const TITLE_WEIGHT: Record<string, number> = {
    title: 100,
    h1: 90,
    h2: 80,
    h3: 70,
    h4: 60,
    h5: 50,
    h6: 40,
    dt: 30,
    a: 10
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

        return html.replace(metaPattern, ' ').trim();
    }

    public static getText (html: string): string {

        const tagPattern = new RegExp(TAG_PATTERN, 'gi');
        const entityPattern = new RegExp(ENTITY_PATTERN, 'g');

        return HTMLInspector
            .getBody(html)
            .replace(tagPattern, ' ')
            .replace(entityPattern, ' ')
            .trim();
    }

    public static getTitle (html: string): (string|undefined) {

        const titlePattern = new RegExp(TITLE_PATTERN, 'gi');
        const titleMatch = titlePattern.exec(html);

        if (titleMatch === null) {
            return;
        }

        return (titleMatch[1] || '').replace(/\s+/g, ' ').trim();
    }

    /* *
     *
     *  Properties
     *
     * */

    private _keywords: (Array<string>|undefined);
    private _linkAliases: (Array<string>|undefined);
    private _links: (Array<string>|undefined);
    private _title: (string|undefined);

    /* *
     *
     *  Functions
     *
     * */

    public getKeywords (): Array<string> {

        if (typeof this._keywords !== 'undefined') {
            return this._keywords;
        }

        const words = Keywords.KeywordFilter.getWords(
            HTMLInspector.getText(this.content.toLowerCase())
        );

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
        const tags = Object.keys(TITLE_WEIGHT).join('|');
        const tagPattern = new RegExp(`<(${tags})[^>]*?>(.*?)<\/\\1>`, 'gi');

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

    public getLinkAliases (baseURL?: string): Array<string> {

        if (typeof this._linkAliases !== 'undefined') {
            return this._linkAliases;
        }

        const content = HTMLInspector.getBody(this.content);
        const tags = Object.keys(TITLE_WEIGHT).join('|');
        const tagPattern = new RegExp(`<(${tags})[^>]*?\\s+id\\s*?=\\s*?(['"])([^>'"]*?)\\2[^>]*?>(.*?)<\/\\1>`, 'gi');
        const linkAliases: Array<string> = [];

        let match: (RegExpExecArray|null|undefined);
        let matchURL: (URL|undefined);
        let matchURLString: (string|undefined);

        while ((match = tagPattern.exec(content)) !== null) {
            try {
                matchURL = new URL('#' + match[3], baseURL);
                matchURLString = matchURL.toString();

                if (!linkAliases.includes(matchURLString)) {
                    linkAliases.push(matchURL.toString());
                }
            }
            catch (error) {
                // silent fail
            }
        }
        
        this._linkAliases = linkAliases;

        return linkAliases;
    }

    public getLinks (baseURL?: string): Array<string> {

        if (typeof this._links !== 'undefined') {
            return this._links;
        }

        const content = HTMLInspector.getBody(this.content);
        const linkPattern = new RegExp(LINK_PATTERN, 'gi');
        const links: Array<string> = [];

        let match: (RegExpExecArray|null|undefined);
        let matchURL: (URL|undefined);
        let matchURLString: string;

        while ((match = linkPattern.exec(content)) !== null) {
            try {
                matchURL = new URL(match[2], baseURL);
                matchURLString = matchURL.toString();

                if (!links.includes(matchURLString)) {
                    links.push(matchURL.toString());
                }
            }
            catch (error) {
                // silent fail
            }
        }

        this._links = links;

        return links;
    }

    public getTitle (): (string|undefined) {

        let title = this._title;

        if (typeof title === 'undefined') {
            this._title = title = HTMLInspector.getTitle(this.content);
        }

        return title;
    }
}

export default HTMLInspector;
