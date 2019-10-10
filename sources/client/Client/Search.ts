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

        private static defaultResultFormatter (search: Search, item: KeywordItem): void {


        }

        /* *
        *
        *  Constructor
        *
        * */

        public constructor (baseURL: URL, inputElement: HTMLInputElement, outputElement: HTMLElement, buttonElement: HTMLElement) {

            this._baseURL = baseURL;
            this._buttonElement = buttonElement;
            this._inputElement = inputElement;
            this._outputElement = outputElement;
            this._resultFormatter = Search.defaultResultFormatter;

            this.addEventListeners();
        }

        /* *
        *
        *  Properties
        *
        * */

        private _baseURL: URL;
        private _buttonElement: HTMLElement;
        private _inputElement: HTMLInputElement;
        private _outputElement: HTMLElement;
        private _resultFormatter: ResultFormatter;

        public get baseURL (): URL {
            return this._baseURL;
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

        public get resultFormatter (): ResultFormatter {
            return this._resultFormatter;
        }

        public set resultFormatter (value: ResultFormatter) {
            this._resultFormatter = value;
        }

        /* *
        *
        *  Events
        *
        * */

        private onButtonClick (e: MouseEvent): void {
            console.log(this, e);
        }

        private onInputKeyDown (e: KeyboardEvent): void {
            console.log(this, e);
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
                .fromURL(new URL(term, this.baseURL))
                .then(download => new KeywordURLSet(term, download.content));
        } 

        public find (query: string): Promise<Array<KeywordItem>> {

            const download = this.download;
            const downloadPromises: Array<Promise<KeywordURLSet>> = [];
            const terms = KeywordFilter.getWords(query);

            let term: string;

            for (term of terms) {
                downloadPromises.push(download(term));
            }

            return Promise
                .all(downloadPromises)
                .then(this.consolidate);
        }
    }

    export function connect (url: string, inputElementID: string, outputElementID: string, buttonElementID: string): Search {

        const baseURL = new URL(url);

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

        return new Search(baseURL, inputElement, outputElement, buttonElement);
    }
}
