/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as L from '../index';

export abstract class Load {

    /* *
     *
     *  Constructor
     *
     * */

    protected constructor (url: URL, contentType: string, content: string) {
        this._content = content;
        this._contentType = contentType;
        this._url = url;
    }

    /* *
     *
     *  Properties
     *
     * */

    private _content: string;
    private _contentType: string;
    private _url: URL;

    public get content (): string {
        return this._content.toString();
    }

    public get contentType (): string {
        return this._contentType;
    }

    public abstract get hasFailed (): boolean;

    public get url (): URL {
        return this._url;
    }

    /* *
     *
     *  Functions
     *
     * */

    protected getInspectors (): Array<L.Inspector> {

        const inspectors: Array<L.Inspector> = [
            new L.URLInspector(this.url.toString())
        ];

        switch (this.contentType) {
            case 'text/html':
                inspectors.push(new L.HTMLInspector(this.content));
                break;
        }

        return inspectors;
    }

    public update (keywordURLSets: L.Dictionary<L.KeywordURLSet>, loadTasks?: L.Dictionary<boolean>): void {

        const inspectors = this.getInspectors();
        const linkAliases: Array<string> = [];
        const url = this.url.toString();

        let inspector: (L.Inspector|undefined);
        let inspectorLink: (string|undefined);
        let inspectorLinks: (Array<string>|undefined);
        let keyword: (string|undefined);
        let keywordURLSet: (L.KeywordURLSet|undefined);
        let keywords: (Array<string>|undefined);
        let linkAlias: (string|undefined);

        for (inspector of inspectors) {

            if (typeof loadTasks !== 'undefined') {

                inspectorLinks = inspector.getLinks(url);

                for (inspectorLink of inspectorLinks) {

                    if (inspectorLink.includes('#')) {
                        inspectorLink = inspectorLink.substr(0, inspectorLink.indexOf('#'));
                    }

                    if (typeof loadTasks.get(inspectorLink) === 'undefined') {
                        loadTasks.set(inspectorLink, false);
                    }
                }
            }

            keywords = inspector.getKeywords();

            for (keyword of keywords) {

                keywordURLSet = keywordURLSets.get(keyword);
                
                if (typeof keywordURLSet === 'undefined') {
                    keywordURLSets.set(keyword, (keywordURLSet = new L.KeywordURLSet(keyword)));
                }

                try {
                    keywordURLSet.addURL(url, inspector.getKeywordWeight(keyword), inspector.getTitle());
                    linkAliases.push(...inspector.getLinkAliases(url));
                }
                catch (error) {
                    console.log(keyword);
                    console.log(keywordURLSets.get(keyword), keywordURLSet);
                }
            }
        }

        for (linkAlias of linkAliases) {

            inspector = new L.URLInspector(linkAlias);
            keywords = inspector.getKeywords();

            for (keyword of keywords) {

                keywordURLSet = keywordURLSets.get(keyword);

                if (typeof keywordURLSet === 'undefined') {
                    keywordURLSets.set(keyword, (keywordURLSet = new L.KeywordURLSet(keyword)));
                }

                if (!keywordURLSet.containsURL(url)) {
                    keywordURLSet.addURL(linkAlias, inspector.getKeywordWeight(keyword), '');
                }
            }
        }
    }
}

export default Load;
