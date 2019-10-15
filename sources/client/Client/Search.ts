/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

namespace HighsoftSearch {
    export class Search {

        /* *
         *
         *  Static Functions
         *
         * */

        /**
         * The default renderer for search results. Contains special handling of
         * rendering in lists and tables. Returns the preview element of the
         * result for lazy loading.
         *
         * @param search
         * The search instance as a reference for rendering.
         *
         * @param item
         * The search result in structure of a keyword item with title and URL.
         */
        private static defaultResultRenderer (search: Search, item?: KeywordItem): (HTMLElement|undefined) {

            const outputElement = search.outputElement;

            if (typeof item === 'undefined') {
                outputElement.style.display = 'none';
                return;
            }

            const linkElement = document.createElement('a');

            let headElement: HTMLElement;
            let previewElement: HTMLElement;
            let resultElement: HTMLElement;

            switch (outputElement.tagName.toLowerCase()) {
                default:
                    headElement = document.createElement('h3');
                    previewElement = document.createElement('p');
                    resultElement = document.createElement('div');
                    resultElement.appendChild(headElement);
                    resultElement.appendChild(previewElement);
                    outputElement.appendChild(resultElement);
                    break;
                case 'dl':
                    headElement = document.createElement('dt');
                    previewElement = document.createElement('dd');
                    resultElement = headElement;
                    outputElement.appendChild(headElement);
                    outputElement.appendChild(previewElement);
                    break;
                case 'ol':
                case 'ul':
                    headElement = document.createElement('h3');
                    previewElement = document.createElement('p');
                    resultElement = document.createElement('li');
                    resultElement.appendChild(headElement);
                    resultElement.appendChild(previewElement);
                    outputElement.appendChild(resultElement);
                    break;
                case 'table':
                    headElement = document.createElement('th');
                    previewElement = document.createElement('td');
                    resultElement = document.createElement('tr');
                    resultElement.appendChild(headElement);
                    resultElement.appendChild(previewElement);
                    outputElement.appendChild(resultElement);
                    break;
            }

            linkElement.setAttribute('href', item.url);
            linkElement.setAttribute('title', `Relevance: ${item.weight}%`);
            linkElement.innerText = item.title;
            headElement.appendChild(linkElement);
            resultElement.setAttribute('class', 'SearchResult');
            outputElement.style.display = '';

            return previewElement;
        }

        /**
         * Generates a preview text out of the URL content of a keyword item.
         *
         * @param search
         * The search instance as a reference for rendering.
         *
         * @param item
         * The search result in structure of a keyword item with title and URL.
         */
        public static preview (search: Search, item: KeywordItem): Promise<string> {

            const searchTerms = search.terms;

            if (typeof searchTerms === 'undefined') {
                Promise.resolve('');
            }

            return Download
                .fromURL(item.url)
                .then(download => {

                    const downloadDocument = document.createElement('html');

                    downloadDocument.innerHTML = download.content;

                    const downloadBody = downloadDocument.getElementsByTagName('body')[0];

                    if (
                        typeof downloadBody === 'undefined' ||
                        typeof searchTerms === 'undefined'
                    ) {
                        return '';
                    }

                    const preview = KeywordFilter.getWords(downloadBody.innerText);
                    const previewLowerCase = preview.map(word => word.toLowerCase());

                    let previewIndex = -1;
                    let previewStart = 0;
                    let previewEnd = 0;

                    for (let searchTerm of searchTerms) {

                        previewIndex = previewLowerCase.indexOf(searchTerm.toLowerCase());

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

        /* *
         *
         *  Constructor
         *
         * */

        /**
         * Creates a new search instance with given base path, where keyword
         * files can be found.
         *
         * @param basePath
         * Base path to the keyword files.
         *
         * @param inputElement
         * Input element of search control.
         *
         * @param outputElement
         * Output element of search control.
         *
         * @param buttonElement
         * Button element of search control.
         */
        public constructor (basePath: string, inputElement: HTMLInputElement, outputElement: HTMLElement, buttonElement: HTMLElement) {

            this._basePath = basePath;
            this._buttonElement = buttonElement;
            this._inputElement = inputElement;
            this._outputElement = outputElement;
            this._pendingPreviews = [];
            this._resultRenderer = Search.defaultResultRenderer;
            this._timeout = 0;

            this.addEventListeners();
        }

        /* *
         *
         *  Properties
         *
         * */

        private _basePath: string;
        private _buttonElement: HTMLElement;
        private _inputElement: HTMLInputElement;
        private _outputElement: HTMLElement;
        private _pendingPreviews: Array<[HTMLElement, KeywordItem]>;
        private _query: (string|undefined);
        private _resultRenderer: ResultFormatter;
        private _terms: (Array<string>|undefined);
        private _timeout: number;

        public get basePath (): string {
            return this._basePath;
        }

        public get buttonElement (): HTMLElement {
            return this._buttonElement;
        }

        public get inputElement (): HTMLInputElement {
            return this._inputElement;
        }

        public get outputElement (): HTMLElement {
            return this._outputElement;
        }

        public get query (): (string|undefined) {
            return this._query;
        }

        public get resultRenderer (): ResultFormatter {
            return this._resultRenderer;
        }

        public set resultRenderer (value: ResultFormatter) {
            this._resultRenderer = value;
        }

        public get terms (): (Array<string>|undefined) {
            return this._terms;
        }

        /* *
         *
         *  Events
         *
         * */

        private onButtonClick (evt: Event): void {

            clearTimeout(this._timeout);

            if (evt.target !== this._buttonElement) {
                return;
            }

            this.onTimeout();
        }

        private onInputKeyDown (evt: KeyboardEvent): void {

            clearTimeout(this._timeout);

            const inputElement = this._inputElement;

            if (evt.target !== inputElement) {
                return;
            }

            if (evt.key === 'Enter') {
                this.onButtonClick(evt);
                return;
            }

            this._timeout = setTimeout(this.onTimeout.bind(this), 500);
        }

        private onScroll (): void {

            const pendingPreviews = this._pendingPreviews;
            const scrollBorder = (window.innerHeight + window.scrollY + 16);

            let pendingPreview: ([HTMLElement, KeywordItem]|undefined);

            while (typeof (pendingPreview = pendingPreviews.shift()) !== 'undefined') {

                const [ previewElement, previewItem ] = pendingPreview;

                if (previewElement.offsetTop > scrollBorder) {
                    pendingPreviews.unshift(pendingPreview);
                    break;
                }

                Search
                    .preview(this, previewItem)
                    .then(html => {
                        previewElement.innerHTML = html;
                    })
                    .catch(() => undefined);
            }
        }

        private onTimeout (): void {

            const query = this._inputElement.value;
            const words = KeywordFilter.getWords(query);

            if (words.length === 0 || words[0].length < 2) {
                this.hideResults();
                return;
            }

            this
                .find(query)
                .then(items => {
                    if (items.length === 0) {
                        this.hideResults();
                    }
                    else {
                        this.showResults(items)
                    }
                })
                .catch(() => this.hideResults);
        }

        /* *
         *
         *  Functions
         *
         * */

        private addEventListeners (): void {

            this.buttonElement.addEventListener('click', this.onButtonClick.bind(this));
            this.inputElement.addEventListener('keydown', this.onInputKeyDown.bind(this));

            if (this.outputElement.ownerDocument) {
                this.outputElement.ownerDocument
                    .addEventListener('scroll', this.onScroll.bind(this));
            }
        }

        private consolidate (keywordFiles: Array<KeywordURLSet>): Array<KeywordItem> {

            const consolidatedItems: Record<string, KeywordItem> = {};

            let keywordFile: KeywordURLSet;
            let keywordItems: Record<string, KeywordItem>;
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
                .sort(KeywordURLSet.sorter);
        }

        public download (term: string): Promise<KeywordURLSet> {
            return Download
                .fromURL(this.basePath + term + '.txt')
                .then(download => new KeywordURLSet(term, download.content))
                .catch(() => new KeywordURLSet(term));
        } 

        public find (query: string): Promise<Array<KeywordItem>> {

            this._query = query;

            const downloadPromises: Array<Promise<KeywordURLSet>> = [];
            const terms = this._terms = KeywordFilter.getWords(query);

            let term: string;

            for (term of terms) {
                downloadPromises.push(this.download(term));
            }

            return Promise
                .all(downloadPromises)
                .then(this.consolidate)
                .catch(() => []);
        }

        private hideResults (): void {
            this._resultRenderer.call(this, this);
        }

        private showResults (keywordItems: Array<KeywordItem>): void {

            const pendingPreviews = this._pendingPreviews;

            this._outputElement.innerHTML = '';

            let previewElement: (HTMLElement|undefined);

            for (let keywordItem of keywordItems) {

                previewElement = this._resultRenderer.call(this, this, keywordItem);

                if (typeof previewElement === 'undefined') {
                    continue;
                }

                pendingPreviews.push([previewElement, keywordItem]);
            }

            this.onScroll();
        }
    }
}
