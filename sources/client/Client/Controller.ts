/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

namespace HighsoftWebSearch {
    export class Controller {

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
         * @param entry
         * The search result in structure of a keyword entry with title and URL.
         */
        public static defaultResultRenderer (controller: Controller, entry?: KeywordEntry): (HTMLElement|undefined) {

            const outputElement = controller.outputElement;

            if (typeof entry === 'undefined') {
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

            linkElement.setAttribute('href', entry.url);
            linkElement.setAttribute('title', `Relevance: ${entry.weight}%`);
            linkElement.innerText = entry.title;
            headElement.appendChild(linkElement);
            resultElement.setAttribute('class', 'SearchResult');
            outputElement.style.display = '';

            return previewElement;
        }

        /* *
         *
         *  Constructor
         *
         * */

        /**
         * Creates a new search controller for given elements.
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
        public constructor (search: Search, inputElement: HTMLInputElement, outputElement: HTMLElement, buttonElement: HTMLElement) {

            this._buttonElement = buttonElement;
            this._inputElement = inputElement;
            this._outputElement = outputElement;
            this._pendingPreviews = [];
            this._resultRenderer = Controller.defaultResultRenderer;
            this._search = search;
            this._timeout = 0;

            this.addEventListeners();
        }

        /* *
         *
         *  Properties
         *
         * */

        private _buttonElement: HTMLElement;
        private _inputElement: HTMLInputElement;
        private _outputElement: HTMLElement;
        private _pendingPreviews: Array<[HTMLElement, KeywordEntry]>;
        private _resultRenderer: ResultFormatter;
        private _search: Search;
        private _timeout: number;

        public get buttonElement (): HTMLElement {
            return this._buttonElement;
        }

        public get inputElement (): HTMLInputElement {
            return this._inputElement;
        }

        public get outputElement (): HTMLElement {
            return this._outputElement;
        }

        public get resultRenderer (): ResultFormatter {
            return this._resultRenderer;
        }

        public set resultRenderer (value: ResultFormatter) {
            this._resultRenderer = value;
        }

        public get search (): Search {
            return this._search;
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

        private onInputChange (evt: Event): void {

            const inputElement = this._inputElement;

            if (evt.target !== inputElement) {
                return;
            }

            const words = KeywordFilter.getWords(this._inputElement.value);

            if (words.length === 0 || words[0].length < 2) {
                this.hideResults();
                return;
            }
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

            let pendingPreview: ([HTMLElement, KeywordEntry]|undefined);

            while (typeof (pendingPreview = pendingPreviews.shift()) !== 'undefined') {

                const [ previewElement, previewEntry ] = pendingPreview;

                if (previewElement.offsetTop > scrollBorder) {
                    pendingPreviews.unshift(pendingPreview);
                    break;
                }

                this._search
                    .preview(previewEntry)
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

            this._search
                .find(query)
                .then(keywordEntries => {
                    if (keywordEntries.length === 0) {
                        this.hideResults();
                    }
                    else {
                        this.showResults(keywordEntries)
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
            this.inputElement.addEventListener('input', this.onInputChange.bind(this));
            this.inputElement.addEventListener('keydown', this.onInputKeyDown.bind(this));

            if (this.outputElement.ownerDocument) {
                this.outputElement.ownerDocument.addEventListener('scroll', this.onScroll.bind(this));
            }
        }

        private hideResults (): void {
            this._pendingPreviews.length = 0;
            this._resultRenderer.call(this, this);
        }

        private showResults (keywordEntries: Array<KeywordEntry>): void {

            const pendingPreviews = this._pendingPreviews;

            this._outputElement.innerHTML = '';

            let keywordEntry: (KeywordEntry|undefined);
            let previewElement: (HTMLElement|undefined);

            for (keywordEntry of keywordEntries) {

                previewElement = this._resultRenderer.call(this, this, keywordEntry);

                if (typeof previewElement === 'undefined') {
                    continue;
                }

                pendingPreviews.push([previewElement, keywordEntry]);
            }

            this.onScroll();
        }
    }
}
