/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
declare namespace HighsoftSearch {
    function connect(basePath: string, inputElement: (string | HTMLInputElement), buttonElement: (string | HTMLElement), outputElement: (string | HTMLElement)): Search;
}
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
declare namespace HighsoftSearch {
    class Download {
        static fromURL(url: string, timeout?: number): Promise<Download>;
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
        (search: Search, item?: KeywordItem): (HTMLElement | undefined);
    }
}
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
declare namespace HighsoftSearch {
    class Search {
        private static defaultResultRenderer;
        static preview(search: Search, item: KeywordItem): Promise<string>;
        constructor(basePath: string, inputElement: HTMLInputElement, outputElement: HTMLElement, buttonElement: HTMLElement);
        private _basePath;
        private _buttonElement;
        private _inputElement;
        private _outputElement;
        private _pendingPreviews;
        private _query;
        private _resultRenderer;
        private _terms;
        private _timeout;
        readonly basePath: string;
        readonly buttonElement: HTMLElement;
        readonly inputElement: HTMLInputElement;
        readonly outputElement: HTMLElement;
        readonly query: (string | undefined);
        resultRenderer: ResultFormatter;
        readonly terms: (Array<string> | undefined);
        private onButtonClick;
        private onInputKeyDown;
        private onScroll;
        private onTimeout;
        private addEventListeners;
        private consolidate;
        download(term: string): Promise<KeywordURLSet>;
        find(query: string): Promise<Array<KeywordItem>>;
        private hideResults;
        private showResults;
    }
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
        weight: number;
        url: string;
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
