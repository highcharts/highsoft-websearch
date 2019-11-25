/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
declare namespace HighsoftWebSearch {
    class Dictionary<T> {
        constructor(...dictionaries: Array<Dictionary<T>>);
        private _keys;
        private _values;
        get keys(): Array<string>;
        get values(): Array<T>;
        contains(key: string): boolean;
        get(key: string): (T | undefined);
        set(key: string, value?: T): void;
    }
}
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
declare namespace HighsoftWebSearch {
    function connect(basePath: string, inputElement: (string | HTMLInputElement), buttonElement: (string | HTMLElement), outputElement: (string | HTMLElement)): Controller;
}
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
declare namespace HighsoftWebSearch {
    class Controller {
        static defaultResultRenderer(controller: Controller, entry?: KeywordEntry): (HTMLElement | undefined);
        constructor(search: Search, inputElement: HTMLInputElement, outputElement: HTMLElement, buttonElement: HTMLElement);
        private _buttonElement;
        private _inputElement;
        private _outputElement;
        private _pendingPreviews;
        private _resultRenderer;
        private _search;
        private _timeout;
        get buttonElement(): HTMLElement;
        get inputElement(): HTMLInputElement;
        get outputElement(): HTMLElement;
        get resultRenderer(): ResultFormatter;
        set resultRenderer(value: ResultFormatter);
        get search(): Search;
        private onButtonClick;
        private onInputChange;
        private onInputKeyDown;
        private onScroll;
        private onTimeout;
        private addEventListeners;
        private hideResults;
        private showResults;
    }
}
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
declare namespace HighsoftWebSearch {
    class Download {
        static fromURL(url: string, timeout?: number): Promise<Download>;
        private constructor();
        private _content;
        private _contentType;
        private _statusCode;
        private _url;
        get content(): string;
        get contentType(): string;
        get statusCode(): number;
        get url(): URL;
    }
}
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
declare namespace HighsoftWebSearch {
    interface ResultFormatter {
        (controller: Controller, entry?: KeywordEntry): (HTMLElement | undefined);
    }
}
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
declare namespace HighsoftWebSearch {
    class Search {
        constructor(basePath: string);
        private _basePath;
        private _query;
        private _terms;
        get basePath(): string;
        get query(): (string | undefined);
        get terms(): (Array<string> | undefined);
        private consolidate;
        download(searchTerm: string): Promise<KeywordURLSet>;
        find(query: string): Promise<Array<KeywordEntry>>;
        preview(entry: KeywordEntry): Promise<string>;
    }
}
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
declare namespace HighsoftWebSearch {
    interface KeywordEntry {
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
declare namespace HighsoftWebSearch {
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
declare namespace HighsoftWebSearch {
    class KeywordURLSet {
        private static reducer;
        static sorter(entryA: KeywordEntry, entryB: KeywordEntry): number;
        constructor(keyword: string, content?: string);
        private _entries;
        private _keyword;
        get entries(): Dictionary<KeywordEntry>;
        get keyword(): string;
        addURL(weight: number, url: string, title: string): void;
        containsURL(url: string): boolean;
        toString(): string;
    }
}
