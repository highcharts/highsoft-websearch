/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
declare namespace HighsoftSearch {
    class Download {
        static fromURL(url: URL, timeout?: number): Promise<Download>;
        private constructor();
        private _content;
        private _contentType;
        private _statusCode;
        private _url;
        readonly content: string;
        readonly contentType: string;
        readonly statusCode: number;
        readonly url: URL;
    }
}
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
declare namespace HighsoftSearch {
    interface ResultFormatter {
        (search: Search, item: KeywordItem): void;
    }
}
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
declare namespace HighsoftSearch {
    class Search {
        private static defaultResultFormatter;
        constructor(baseURL: URL, inputElement: HTMLInputElement, outputElement: HTMLElement, buttonElement: HTMLElement);
        private _baseURL;
        private _buttonElement;
        private _inputElement;
        private _outputElement;
        private _resultFormatter;
        readonly baseURL: URL;
        readonly buttonElement: HTMLElement;
        readonly inputElement: HTMLInputElement;
        readonly outputElement: HTMLElement;
        resultFormatter: ResultFormatter;
        private onButtonClick;
        private onInputKeyDown;
        private addEventListeners;
        private consolidate;
        download(term: string): Promise<KeywordURLSet>;
        find(query: string): Promise<Array<KeywordItem>>;
    }
    function connect(url: string, inputElementID: string, outputElementID: string, buttonElementID: string): Search;
}
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
declare namespace HighsoftSearch {
    class KeywordFilter {
        static commonFilter(keyword: string): boolean;
        static getWords(content: string): Array<string>;
        private constructor();
    }
}
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
declare namespace HighsoftSearch {
    interface KeywordItem {
        title: string;
        url: URL;
        weight: number;
    }
}
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
declare namespace HighsoftSearch {
    class KeywordURLSet {
        private static reducer;
        static sorter(itemA: KeywordItem, itemB: KeywordItem): number;
        constructor(keyword: string, content?: string);
        private _items;
        private _keyword;
        readonly items: Record<string, KeywordItem>;
        readonly keyword: string;
        addURL(url: string, weight: number, title: string): void;
        containsURL(url: string): boolean;
        toString(): string;
    }
}
