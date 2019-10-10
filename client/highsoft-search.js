"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
var HighsoftSearch;
(function (HighsoftSearch) {
    var Download = (function () {
        function Download(url, statusCode, contentType, content) {
            this._content = content;
            this._contentType = contentType;
            this._statusCode = statusCode;
            this._url = url;
        }
        Download.fromURL = function (url, timeout) {
            if (timeout === void 0) { timeout = 60000; }
            return new Promise(function (resolve, reject) {
                var request = new XMLHttpRequest();
                var timeout = NaN;
                request.open('GET', url.toString(), true);
                request.onerror = function () {
                    clearTimeout(timeout);
                    reject(new Error(request.status.toString()));
                };
                request.onload = function () {
                    clearTimeout(timeout);
                    try {
                        resolve(new Download(new URL(request.responseURL), request.status, request.responseType, request.responseText));
                    }
                    catch (error) {
                        reject(error);
                    }
                };
                timeout = setTimeout(function () {
                    request.abort();
                    reject(new Error('Timeout'));
                }, timeout);
                request.send();
            });
        };
        Object.defineProperty(Download.prototype, "content", {
            get: function () {
                return this._content;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Download.prototype, "contentType", {
            get: function () {
                return this._contentType;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Download.prototype, "statusCode", {
            get: function () {
                return this._statusCode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Download.prototype, "url", {
            get: function () {
                return this._url;
            },
            enumerable: true,
            configurable: true
        });
        return Download;
    }());
    HighsoftSearch.Download = Download;
})(HighsoftSearch || (HighsoftSearch = {}));
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var HighsoftSearch;
(function (HighsoftSearch) {
    var Search = (function () {
        function Search(baseURL, inputElement, outputElement, buttonElement) {
            this._baseURL = baseURL;
            this._buttonElement = buttonElement;
            this._inputElement = inputElement;
            this._outputElement = outputElement;
            this._resultFormatter = Search.defaultResultFormatter;
            this.addEventListeners();
        }
        Search.defaultResultFormatter = function (search, item) {
        };
        Object.defineProperty(Search.prototype, "baseURL", {
            get: function () {
                return this._baseURL;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Search.prototype, "buttonElement", {
            get: function () {
                return this._buttonElement;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Search.prototype, "inputElement", {
            get: function () {
                return this._inputElement;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Search.prototype, "outputElement", {
            get: function () {
                return this._outputElement;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Search.prototype, "resultFormatter", {
            get: function () {
                return this._resultFormatter;
            },
            set: function (value) {
                this._resultFormatter = value;
            },
            enumerable: true,
            configurable: true
        });
        Search.prototype.onButtonClick = function (e) {
            console.log(this, e);
        };
        Search.prototype.onInputKeyDown = function (e) {
            console.log(this, e);
        };
        Search.prototype.addEventListeners = function () {
            this.buttonElement.addEventListener('click', this.onButtonClick.bind(this));
            this.inputElement.addEventListener('keydown', this.onInputKeyDown.bind(this));
        };
        Search.prototype.consolidate = function (keywordFiles) {
            var e_1, _a, e_2, _b;
            var consolidatedItems = {};
            var keywordFile;
            var keywordItems;
            var keywordItemURL;
            var keywordItemURLs;
            try {
                for (var keywordFiles_1 = __values(keywordFiles), keywordFiles_1_1 = keywordFiles_1.next(); !keywordFiles_1_1.done; keywordFiles_1_1 = keywordFiles_1.next()) {
                    keywordFile = keywordFiles_1_1.value;
                    keywordItems = keywordFile.items;
                    keywordItemURLs = Object.keys(keywordItems);
                    try {
                        for (var keywordItemURLs_1 = (e_2 = void 0, __values(keywordItemURLs)), keywordItemURLs_1_1 = keywordItemURLs_1.next(); !keywordItemURLs_1_1.done; keywordItemURLs_1_1 = keywordItemURLs_1.next()) {
                            keywordItemURL = keywordItemURLs_1_1.value;
                            consolidatedItems[keywordItemURL] = (consolidatedItems[keywordItemURL] ||
                                keywordItems[keywordItemURL]);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (keywordItemURLs_1_1 && !keywordItemURLs_1_1.done && (_b = keywordItemURLs_1.return)) _b.call(keywordItemURLs_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (keywordFiles_1_1 && !keywordFiles_1_1.done && (_a = keywordFiles_1.return)) _a.call(keywordFiles_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return Object
                .keys(consolidatedItems)
                .map(function (keywordItemURL) { return consolidatedItems[keywordItemURL]; })
                .sort(HighsoftSearch.KeywordURLSet.sorter);
        };
        Search.prototype.download = function (term) {
            return HighsoftSearch.Download
                .fromURL(new URL(term, this.baseURL))
                .then(function (download) { return new HighsoftSearch.KeywordURLSet(term, download.content); });
        };
        Search.prototype.find = function (query) {
            var e_3, _a;
            var download = this.download;
            var downloadPromises = [];
            var terms = HighsoftSearch.KeywordFilter.getWords(query);
            var term;
            try {
                for (var terms_1 = __values(terms), terms_1_1 = terms_1.next(); !terms_1_1.done; terms_1_1 = terms_1.next()) {
                    term = terms_1_1.value;
                    downloadPromises.push(download(term));
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (terms_1_1 && !terms_1_1.done && (_a = terms_1.return)) _a.call(terms_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return Promise
                .all(downloadPromises)
                .then(this.consolidate);
        };
        return Search;
    }());
    HighsoftSearch.Search = Search;
    function connect(url, inputElementID, outputElementID, buttonElementID) {
        var baseURL = new URL(url);
        var inputElement = document.getElementById(inputElementID);
        if (!(inputElement instanceof HTMLInputElement)) {
            throw new Error('Input element not found.');
        }
        var outputElement = document.getElementById(outputElementID);
        if (!(outputElement instanceof HTMLElement)) {
            throw new Error('Output element not found.');
        }
        var buttonElement = document.getElementById(buttonElementID);
        if (!(buttonElement instanceof HTMLElement)) {
            throw new Error('Button element not found.');
        }
        return new Search(baseURL, inputElement, outputElement, buttonElement);
    }
    HighsoftSearch.connect = connect;
})(HighsoftSearch || (HighsoftSearch = {}));
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
var HighsoftSearch;
(function (HighsoftSearch) {
    var COMMON_KEYWORDS = [
        'a', 'all', 'an', 'and', 'are', 'at', 'be', 'by', 'can', 'com', 'could',
        'from', 'had', 'has', 'have', 'https', 'i', 'if', 'in', 'is', 'it', 'my',
        'net', 'of', 'on', 'or', 'org', 'our', 'shall', 'should', 'that', 'the',
        'their', 'they', 'this', 'to', 'was', 'we', 'will', 'with', 'you', 'your'
    ];
    var WORD_PATTERN = /(?:^|\W)([^\d\W](?:[^\d\W]|[\-\.])*[^\d\W])(?:\W|$)/;
    var KeywordFilter = (function () {
        function KeywordFilter() {
        }
        KeywordFilter.commonFilter = function (keyword) {
            return (COMMON_KEYWORDS.indexOf(keyword) === -1);
        };
        KeywordFilter.getWords = function (content) {
            var wordPattern = new RegExp(WORD_PATTERN.source, 'gi');
            var words = [];
            var wordMatch;
            while ((wordMatch = wordPattern.exec(content)) !== null) {
                words.push(wordMatch[1]);
            }
            return words;
        };
        return KeywordFilter;
    }());
    HighsoftSearch.KeywordFilter = KeywordFilter;
})(HighsoftSearch || (HighsoftSearch = {}));
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
var HighsoftSearch;
(function (HighsoftSearch) {
    var KeywordURLSet = (function () {
        function KeywordURLSet(keyword, content) {
            this._items = {};
            this._keyword = keyword;
            if (typeof content === 'string') {
                this._items = content
                    .split('\n')
                    .map(function (line) { return line.split('\t', 3); })
                    .reduce(KeywordURLSet.reducer, {});
            }
        }
        KeywordURLSet.reducer = function (items, item) {
            items[item[0]] = {
                title: item[2],
                url: new URL(item[0]),
                weight: parseInt(item[1])
            };
            return items;
        };
        KeywordURLSet.sorter = function (itemA, itemB) {
            return (itemA.weight - itemB.weight);
        };
        Object.defineProperty(KeywordURLSet.prototype, "items", {
            get: function () {
                return this._items;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(KeywordURLSet.prototype, "keyword", {
            get: function () {
                return this._keyword;
            },
            enumerable: true,
            configurable: true
        });
        KeywordURLSet.prototype.addURL = function (url, weight, title) {
            this._items[url] = {
                title: title,
                url: new URL(url),
                weight: weight
            };
        };
        KeywordURLSet.prototype.containsURL = function (url) {
            return (typeof this._items[url] !== 'undefined');
        };
        KeywordURLSet.prototype.toString = function () {
            var items = this._items;
            return Object
                .keys(items)
                .map(function (key) { return items[key]; })
                .sort(KeywordURLSet.sorter)
                .map(function (item) { return (item.url + '\t' + item.weight + '\t' + item.title); })
                .join('\n');
        };
        return KeywordURLSet;
    }());
    HighsoftSearch.KeywordURLSet = KeywordURLSet;
})(HighsoftSearch || (HighsoftSearch = {}));
