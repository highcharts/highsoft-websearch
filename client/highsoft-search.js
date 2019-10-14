"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
var HighsoftSearch;
(function (HighsoftSearch) {
    function connect(basePath, inputElementID, outputElementID, buttonElementID) {
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
        return new HighsoftSearch.Search(basePath, inputElement, outputElement, buttonElement);
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
                request.open('GET', url.toString(), true);
                request.onerror = function () {
                    clearTimeout(timeout);
                    reject(new Error(request.status.toString()));
                };
                request.onload = function () {
                    clearTimeout(timeout);
                    try {
                        resolve(new Download(new URL(request.responseURL), request.status, (request.getResponseHeader('Content-Type') || 'text/plain'), request.response));
                    }
                    catch (error) {
                        reject(error);
                    }
                };
                request.responseType = 'text';
                request.setRequestHeader('Content-Type', 'text/plain');
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
        function Search(basePath, inputElement, outputElement, buttonElement) {
            this._basePath = basePath;
            this._buttonElement = buttonElement;
            this._inputElement = inputElement;
            this._outputElement = outputElement;
            this._resultRenderer = Search.defaultResultRenderer;
            this._timeout = 0;
            this.addEventListeners();
        }
        Search.defaultResultRenderer = function (search, item) {
            var outputElement = search.outputElement;
            if (typeof item === 'undefined') {
                outputElement.style.display = 'none';
                return;
            }
            var linkElement = document.createElement('a');
            var headElement;
            var previewElement;
            var resultElement;
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
            linkElement.setAttribute('title', "Relevance: " + item.weight + "%");
            linkElement.innerText = item.title;
            headElement.appendChild(linkElement);
            resultElement.setAttribute('class', 'SearchResult');
            outputElement.style.display = '';
            Search
                .preview(search, item)
                .then(function (html) {
                previewElement.innerHTML = html;
            })
                .catch(function () { return undefined; });
        };
        Search.preview = function (search, item) {
            var searchTerms = search.terms;
            if (typeof searchTerms === 'undefined') {
                Promise.resolve('');
            }
            return HighsoftSearch.Download
                .fromURL(item.url)
                .then(function (download) {
                var e_1, _a;
                var downloadDocument = document.createElement('html');
                downloadDocument.innerHTML = download.content;
                var downloadBody = downloadDocument.getElementsByTagName('body')[0];
                if (typeof downloadBody === 'undefined' ||
                    typeof searchTerms === 'undefined') {
                    return '';
                }
                var preview = HighsoftSearch.KeywordFilter.getWords(downloadBody.innerText);
                var previewLowerCase = preview.map(function (word) { return word.toLowerCase(); });
                var previewIndex = -1;
                var previewStart = 0;
                var previewEnd = 0;
                try {
                    for (var searchTerms_1 = __values(searchTerms), searchTerms_1_1 = searchTerms_1.next(); !searchTerms_1_1.done; searchTerms_1_1 = searchTerms_1.next()) {
                        var searchTerm = searchTerms_1_1.value;
                        previewIndex = previewLowerCase.indexOf(searchTerm.toLowerCase());
                        if (previewIndex >= 0) {
                            break;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (searchTerms_1_1 && !searchTerms_1_1.done && (_a = searchTerms_1.return)) _a.call(searchTerms_1);
                    }
                    finally { if (e_1) throw e_1.error; }
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
                return (preview.slice(previewStart, previewIndex).join(' ') +
                    ' <b>' + preview[previewIndex] + '</b> ' +
                    preview.slice((previewIndex + 1), previewEnd).join(' '));
            })
                .catch(function () { return ''; });
        };
        Object.defineProperty(Search.prototype, "basePath", {
            get: function () {
                return this._basePath;
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
        Object.defineProperty(Search.prototype, "query", {
            get: function () {
                return this._query;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Search.prototype, "resultRenderer", {
            get: function () {
                return this._resultRenderer;
            },
            set: function (value) {
                this._resultRenderer = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Search.prototype, "terms", {
            get: function () {
                return this._terms;
            },
            enumerable: true,
            configurable: true
        });
        Search.prototype.onButtonClick = function (e) {
            clearTimeout(this._timeout);
            if (e.target !== this._buttonElement) {
                return;
            }
            this.onTimeout();
        };
        Search.prototype.onInputKeyDown = function (e) {
            clearTimeout(this._timeout);
            var inputElement = this._inputElement;
            if (e.target !== inputElement) {
                return;
            }
            if (e.key === 'Enter') {
                this.onButtonClick(e);
                return;
            }
            this._timeout = setTimeout(this.onTimeout.bind(this), 500);
        };
        Search.prototype.onTimeout = function () {
            var _this = this;
            var query = this._inputElement.value;
            var words = HighsoftSearch.KeywordFilter.getWords(query);
            if (words.length === 0 || words[0].length < 2) {
                this.hideResults();
                return;
            }
            this
                .find(query)
                .then(function (items) {
                if (items.length === 0) {
                    _this.hideResults();
                }
                else {
                    _this.showResults(items);
                }
            })
                .catch(function () { return _this.hideResults; });
        };
        Search.prototype.addEventListeners = function () {
            this.buttonElement.addEventListener('click', this.onButtonClick.bind(this));
            this.inputElement.addEventListener('keydown', this.onInputKeyDown.bind(this));
        };
        Search.prototype.consolidate = function (keywordFiles) {
            var e_2, _a, e_3, _b;
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
                        for (var keywordItemURLs_1 = (e_3 = void 0, __values(keywordItemURLs)), keywordItemURLs_1_1 = keywordItemURLs_1.next(); !keywordItemURLs_1_1.done; keywordItemURLs_1_1 = keywordItemURLs_1.next()) {
                            keywordItemURL = keywordItemURLs_1_1.value;
                            consolidatedItems[keywordItemURL] = (consolidatedItems[keywordItemURL] ||
                                keywordItems[keywordItemURL]);
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (keywordItemURLs_1_1 && !keywordItemURLs_1_1.done && (_b = keywordItemURLs_1.return)) _b.call(keywordItemURLs_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (keywordFiles_1_1 && !keywordFiles_1_1.done && (_a = keywordFiles_1.return)) _a.call(keywordFiles_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return Object
                .keys(consolidatedItems)
                .map(function (keywordItemURL) { return consolidatedItems[keywordItemURL]; })
                .sort(HighsoftSearch.KeywordURLSet.sorter);
        };
        Search.prototype.download = function (term) {
            return HighsoftSearch.Download
                .fromURL(this.basePath + term + '.txt')
                .then(function (download) { return new HighsoftSearch.KeywordURLSet(term, download.content); })
                .catch(function () { return new HighsoftSearch.KeywordURLSet(term); });
        };
        Search.prototype.find = function (query) {
            var e_4, _a;
            this._query = query;
            var downloadPromises = [];
            var terms = this._terms = HighsoftSearch.KeywordFilter.getWords(query);
            var term;
            try {
                for (var terms_1 = __values(terms), terms_1_1 = terms_1.next(); !terms_1_1.done; terms_1_1 = terms_1.next()) {
                    term = terms_1_1.value;
                    downloadPromises.push(this.download(term));
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (terms_1_1 && !terms_1_1.done && (_a = terms_1.return)) _a.call(terms_1);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return Promise
                .all(downloadPromises)
                .then(this.consolidate)
                .catch(function () { return []; });
        };
        Search.prototype.hideResults = function () {
            this._resultRenderer.call(this, this);
        };
        Search.prototype.showResults = function (items) {
            var e_5, _a;
            this._outputElement.innerHTML = '';
            try {
                for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                    var item = items_1_1.value;
                    this._resultRenderer.call(this, this, item);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
                }
                finally { if (e_5) throw e_5.error; }
            }
        };
        return Search;
    }());
    HighsoftSearch.Search = Search;
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
    var WORD_PATTERN = /(?:^|\W)([^\d\W](?:[^\d\W]|[\-\.])*[^\d\W])(?=\W|$)/;
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
            items[item[1]] = {
                title: item[2],
                url: item[1],
                weight: parseInt(item[0])
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
                url: url,
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
                .map(function (item) { return (item.weight + '\t' + item.url + '\t' + item.title); })
                .join('\n');
        };
        return KeywordURLSet;
    }());
    HighsoftSearch.KeywordURLSet = KeywordURLSet;
})(HighsoftSearch || (HighsoftSearch = {}));
