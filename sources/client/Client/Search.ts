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

        private static defaultResultFormatter (search: Search, item?: KeywordItem): void {

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

            Search
                .preview(search, item)
                .then(html => {
                    previewElement.innerHTML = html;
                })
                .catch(() => undefined);
        }

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

                    let previewIndex = -1;
                    let previewStart = 0;
                    let previewEnd = 0;

                    for (let searchTerm of searchTerms) {

                        previewIndex = preview.indexOf(searchTerm);

                        if (previewIndex >= 0) {
                            break;
                        }
                    }

                    if (previewIndex < 10) {
                        previewEnd = 20;
                    }
                    else {
                        previewEnd = previewIndex + 10;
                        previewStart = previewIndex - 10;
                    }

                    return (
                        preview.slice(previewStart, previewIndex).join(' ') +
                        '<b>' + preview[previewIndex] + '</b>' +
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

        public constructor (basePath: string, inputElement: HTMLInputElement, outputElement: HTMLElement, buttonElement: HTMLElement) {

            this._basePath = basePath;
            this._buttonElement = buttonElement;
            this._inputElement = inputElement;
            this._outputElement = outputElement;
            this._resultFormatter = Search.defaultResultFormatter;
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
        private _query: (string|undefined);
        private _resultFormatter: ResultFormatter;
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

        public get resultFormatter (): ResultFormatter {
            return this._resultFormatter;
        }

        public set resultFormatter (value: ResultFormatter) {
            this._resultFormatter = value;
        }

        public get terms (): (Array<string>|undefined) {
            return this._terms;
        }

        /* *
         *
         *  Events
         *
         * */

        private onButtonClick (e: Event): void {

            clearTimeout(this._timeout);

            if (e.target !== this._buttonElement) {
                return;
            }

            this.onTimeout();
        }

        private onInputKeyDown (e: KeyboardEvent): void {

            clearTimeout(this._timeout);

            const inputElement = this._inputElement;

            if (e.target !== inputElement) {
                return;
            }

            if (e.key === 'Enter') {
                this.onButtonClick(e);
                return;
            }

            this._timeout = setTimeout(this.onTimeout.bind(this), 500);
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
            this._resultFormatter.call(this, this);
        }

        private showResults (items: Array<KeywordItem>): void {

            this._outputElement.innerHTML = '';

            for (let item of items) {
                this._resultFormatter.call(this, this, item);
            }
        }
    }

    export function connect (basePath: string, inputElementID: string, outputElementID: string, buttonElementID: string): Search {

        const inputElement = document.getElementById(inputElementID);

        if (!(inputElement instanceof HTMLInputElement)) {
            throw new Error('Input element not found.');
        }

        const outputElement = document.getElementById(outputElementID);

        if (!(outputElement instanceof HTMLElement)) {
            throw new Error('Output element not found.');
        }

        const buttonElement = document.getElementById(buttonElementID);

        if (!(buttonElement instanceof HTMLElement)) {
            throw new Error('Button element not found.');
        }

        return new Search(basePath, inputElement, outputElement, buttonElement);
    }
}
