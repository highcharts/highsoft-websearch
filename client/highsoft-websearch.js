"use strict";
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
var HighsoftWebSearch;
(function (HighsoftWebSearch) {
    var Dictionary = (function () {
        function Dictionary() {
            var e_1, _a;
            var dictionaries = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                dictionaries[_i] = arguments[_i];
            }
            var dictionary = dictionaries.shift();
            if (typeof dictionary === 'undefined') {
                this._keys = [];
                this._values = [];
                return;
            }
            this._keys = dictionary.keys;
            this._values = dictionary.values;
            var keys;
            var values;
            try {
                for (var dictionaries_1 = __values(dictionaries), dictionaries_1_1 = dictionaries_1.next(); !dictionaries_1_1.done; dictionaries_1_1 = dictionaries_1.next()) {
                    dictionary = dictionaries_1_1.value;
                    keys = dictionary._keys;
                    values = dictionary._values;
                    for (var index = 0, indexEnd = keys.length; index < indexEnd; ++index) {
                        this.set(keys[index], values[index]);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (dictionaries_1_1 && !dictionaries_1_1.done && (_a = dictionaries_1.return)) _a.call(dictionaries_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        Object.defineProperty(Dictionary.prototype, "keys", {
            get: function () {
                return this._keys.slice();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Dictionary.prototype, "values", {
            get: function () {
                return this._values.slice();
            },
            enumerable: false,
            configurable: true
        });
        Dictionary.prototype.contains = function (key) {
            return (this._keys.indexOf(key) !== -1);
        };
        Dictionary.prototype.get = function (key) {
            var keys = this._keys;
            var values = this._values;
            var index = keys.indexOf(key);
            if (index === -1) {
                return;
            }
            return values[index];
        };
        Dictionary.prototype.set = function (key, value) {
            var keys = this._keys;
            var values = this._values;
            var index = keys.indexOf(key);
            if (typeof value === 'undefined') {
                if (index > -1) {
                    keys.splice(index, 1);
                    values.splice(index, 1);
                }
                return;
            }
            if (index === -1) {
                keys.push(key);
                values.push(value);
            }
            else {
                values[index] = value;
            }
        };
        return Dictionary;
    }());
    HighsoftWebSearch.Dictionary = Dictionary;
})(HighsoftWebSearch || (HighsoftWebSearch = {}));
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
var HighsoftWebSearch;
(function (HighsoftWebSearch) {
    function connect(basePath, inputElement, buttonElement, outputElement) {
        if (typeof inputElement === 'string') {
            inputElement = (document.getElementById(inputElement) || '');
        }
        if (!(inputElement instanceof HTMLInputElement)) {
            throw new Error('Input element not found.');
        }
        if (typeof outputElement === 'string') {
            outputElement = (document.getElementById(outputElement) || '');
        }
        if (!(outputElement instanceof HTMLElement)) {
            throw new Error('Output element not found.');
        }
        if (typeof buttonElement === 'string') {
            buttonElement = (document.getElementById(buttonElement) || '');
        }
        if (!(buttonElement instanceof HTMLElement)) {
            throw new Error('Button element not found.');
        }
        return new HighsoftWebSearch.Controller(new HighsoftWebSearch.Search(basePath), inputElement, outputElement, buttonElement);
    }
    HighsoftWebSearch.connect = connect;
})(HighsoftWebSearch || (HighsoftWebSearch = {}));
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var HighsoftWebSearch;
(function (HighsoftWebSearch) {
    var Controller = (function () {
        function Controller(search, inputElement, outputElement, buttonElement) {
            this._buttonElement = buttonElement;
            this._inputElement = inputElement;
            this._outputElement = outputElement;
            this._pendingPreviews = [];
            this._resultRenderer = Controller.defaultResultRenderer;
            this._search = search;
            this._timeout = 0;
            this.addEventListeners();
        }
        Controller.defaultResultRenderer = function (controller, entry) {
            var outputElement = controller.outputElement;
            if (typeof entry === 'undefined') {
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
            linkElement.setAttribute('href', entry.url);
            linkElement.setAttribute('title', "Relevance: " + entry.weight + "%");
            linkElement.innerText = entry.title;
            headElement.appendChild(linkElement);
            resultElement.setAttribute('class', 'SearchResult');
            outputElement.style.display = '';
            return previewElement;
        };
        Object.defineProperty(Controller.prototype, "buttonElement", {
            get: function () {
                return this._buttonElement;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Controller.prototype, "inputElement", {
            get: function () {
                return this._inputElement;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Controller.prototype, "outputElement", {
            get: function () {
                return this._outputElement;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Controller.prototype, "resultRenderer", {
            get: function () {
                return this._resultRenderer;
            },
            set: function (value) {
                this._resultRenderer = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Controller.prototype, "search", {
            get: function () {
                return this._search;
            },
            enumerable: false,
            configurable: true
        });
        Controller.prototype.onButtonClick = function (evt) {
            if (evt.target !== this._buttonElement) {
                return;
            }
            clearTimeout(this._timeout);
            this.onTimeout();
        };
        Controller.prototype.onInputChange = function (evt) {
            var inputElement = this._inputElement;
            if (evt.target !== inputElement) {
                return;
            }
            var words = HighsoftWebSearch.KeywordFilter.getWords(this._inputElement.value);
            if (words.length === 0 || words[0].length < 2) {
                this.hideResults();
                return;
            }
        };
        Controller.prototype.onInputKeyDown = function (evt) {
            var inputElement = this._inputElement;
            if (evt.target !== inputElement) {
                return;
            }
            clearTimeout(this._timeout);
            if (evt.key === 'Enter') {
                this.onButtonClick(evt);
                return;
            }
            this._timeout = setTimeout(this.onTimeout.bind(this), 500);
        };
        Controller.prototype.onScroll = function () {
            var pendingPreviews = this._pendingPreviews;
            var scrollBorder = (window.innerHeight + window.scrollY + 16);
            var pendingPreview;
            var _loop_1 = function () {
                var _a = __read(pendingPreview, 2), previewElement = _a[0], previewEntry = _a[1];
                if (previewElement.offsetTop > scrollBorder) {
                    pendingPreviews.unshift(pendingPreview);
                    return "break";
                }
                this_1._search
                    .preview(previewEntry)
                    .then(function (html) {
                    previewElement.innerHTML = html;
                })
                    .catch(function () { return undefined; });
            };
            var this_1 = this;
            while (typeof (pendingPreview = pendingPreviews.shift()) !== 'undefined') {
                var state_1 = _loop_1();
                if (state_1 === "break")
                    break;
            }
        };
        Controller.prototype.onTimeout = function () {
            var _this = this;
            var query = this._inputElement.value;
            var words = HighsoftWebSearch.KeywordFilter.getWords(query);
            if (words.length === 0 || words[0].length < 2) {
                this.hideResults();
                return;
            }
            this._search
                .find(query)
                .then(function (keywordEntries) {
                if (keywordEntries.length === 0) {
                    _this.hideResults();
                }
                else {
                    _this.showResults(keywordEntries);
                }
            })
                .catch(function () { return _this.hideResults; });
        };
        Controller.prototype.addEventListeners = function () {
            this.buttonElement.addEventListener('click', this.onButtonClick.bind(this));
            this.inputElement.addEventListener('input', this.onInputChange.bind(this));
            this.inputElement.addEventListener('keydown', this.onInputKeyDown.bind(this));
            if (this.outputElement.ownerDocument) {
                this.outputElement.ownerDocument.addEventListener('scroll', this.onScroll.bind(this));
            }
        };
        Controller.prototype.hideResults = function () {
            this._pendingPreviews.length = 0;
            this._resultRenderer.call(this, this);
        };
        Controller.prototype.showResults = function (keywordEntries) {
            var e_2, _a;
            var pendingPreviews = this._pendingPreviews;
            this._outputElement.innerHTML = '';
            var keywordEntry;
            var previewElement;
            try {
                for (var keywordEntries_1 = __values(keywordEntries), keywordEntries_1_1 = keywordEntries_1.next(); !keywordEntries_1_1.done; keywordEntries_1_1 = keywordEntries_1.next()) {
                    keywordEntry = keywordEntries_1_1.value;
                    previewElement = this._resultRenderer.call(this, this, keywordEntry);
                    if (typeof previewElement === 'undefined') {
                        continue;
                    }
                    pendingPreviews.push([previewElement, keywordEntry]);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (keywordEntries_1_1 && !keywordEntries_1_1.done && (_a = keywordEntries_1.return)) _a.call(keywordEntries_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            this.onScroll();
        };
        return Controller;
    }());
    HighsoftWebSearch.Controller = Controller;
})(HighsoftWebSearch || (HighsoftWebSearch = {}));
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
var HighsoftWebSearch;
(function (HighsoftWebSearch) {
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
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Download.prototype, "contentType", {
            get: function () {
                return this._contentType;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Download.prototype, "statusCode", {
            get: function () {
                return this._statusCode;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Download.prototype, "url", {
            get: function () {
                return this._url;
            },
            enumerable: false,
            configurable: true
        });
        return Download;
    }());
    HighsoftWebSearch.Download = Download;
})(HighsoftWebSearch || (HighsoftWebSearch = {}));
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
var HighsoftWebSearch;
(function (HighsoftWebSearch) {
    var Search = (function () {
        function Search(basePath) {
            this._basePath = basePath;
        }
        Object.defineProperty(Search.prototype, "basePath", {
            get: function () {
                return this._basePath;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Search.prototype, "query", {
            get: function () {
                return this._query;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Search.prototype, "terms", {
            get: function () {
                return this._terms;
            },
            enumerable: false,
            configurable: true
        });
        Search.prototype.consolidate = function (keywordFiles) {
            var e_3, _a, e_4, _b;
            var consolidatedEntries = new HighsoftWebSearch.Dictionary();
            var keywordEntry;
            var keywordEntries;
            var keywordFile;
            try {
                for (var keywordFiles_1 = __values(keywordFiles), keywordFiles_1_1 = keywordFiles_1.next(); !keywordFiles_1_1.done; keywordFiles_1_1 = keywordFiles_1.next()) {
                    keywordFile = keywordFiles_1_1.value;
                    keywordEntries = keywordFile.entries.values;
                    try {
                        for (var keywordEntries_2 = (e_4 = void 0, __values(keywordEntries)), keywordEntries_2_1 = keywordEntries_2.next(); !keywordEntries_2_1.done; keywordEntries_2_1 = keywordEntries_2.next()) {
                            keywordEntry = keywordEntries_2_1.value;
                            if (!consolidatedEntries.contains(keywordEntry.url)) {
                                consolidatedEntries.set(keywordEntry.url, keywordEntry);
                            }
                        }
                    }
                    catch (e_4_1) { e_4 = { error: e_4_1 }; }
                    finally {
                        try {
                            if (keywordEntries_2_1 && !keywordEntries_2_1.done && (_b = keywordEntries_2.return)) _b.call(keywordEntries_2);
                        }
                        finally { if (e_4) throw e_4.error; }
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (keywordFiles_1_1 && !keywordFiles_1_1.done && (_a = keywordFiles_1.return)) _a.call(keywordFiles_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return consolidatedEntries.values.sort(HighsoftWebSearch.KeywordURLSet.sorter);
        };
        Search.prototype.download = function (searchTerm) {
            return HighsoftWebSearch.Download
                .fromURL(this.basePath + searchTerm + '.txt')
                .then(function (download) { return new HighsoftWebSearch.KeywordURLSet(searchTerm, download.content); })
                .catch(function () { return new HighsoftWebSearch.KeywordURLSet(searchTerm); });
        };
        Search.prototype.find = function (query) {
            var e_5, _a;
            var _this = this;
            var downloadPromises = [];
            var terms = this._terms = HighsoftWebSearch.KeywordFilter.getWords(query.toLowerCase());
            var term;
            try {
                for (var terms_1 = __values(terms), terms_1_1 = terms_1.next(); !terms_1_1.done; terms_1_1 = terms_1.next()) {
                    term = terms_1_1.value;
                    downloadPromises.push(this.download(term));
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (terms_1_1 && !terms_1_1.done && (_a = terms_1.return)) _a.call(terms_1);
                }
                finally { if (e_5) throw e_5.error; }
            }
            return Promise
                .all(downloadPromises)
                .then(function (keywordEntries) { return _this.consolidate(keywordEntries); })
                .then(function (keywordEntries) {
                _this._query = query;
                return keywordEntries;
            })
                .catch(function () { return []; });
        };
        Search.prototype.preview = function (entry) {
            var terms = (this.terms || []).slice();
            return HighsoftWebSearch.Download
                .fromURL(entry.url)
                .then(function (download) {
                var e_6, _a;
                var downloadDocument = document.createElement('html');
                downloadDocument.innerHTML = download.content;
                var downloadBody = downloadDocument.getElementsByTagName('body')[0];
                if (typeof downloadBody === 'undefined') {
                    return '';
                }
                var preview = HighsoftWebSearch.KeywordFilter.getWords(downloadBody.innerText);
                var previewLowerCase = preview.map(function (word) { return word.toLowerCase(); });
                var previewIndex = -1;
                var previewStart = 0;
                var previewEnd = 0;
                try {
                    for (var terms_2 = __values(terms), terms_2_1 = terms_2.next(); !terms_2_1.done; terms_2_1 = terms_2.next()) {
                        var term = terms_2_1.value;
                        previewIndex = previewLowerCase.indexOf(term.toLowerCase());
                        if (previewIndex >= 0) {
                            break;
                        }
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (terms_2_1 && !terms_2_1.done && (_a = terms_2.return)) _a.call(terms_2);
                    }
                    finally { if (e_6) throw e_6.error; }
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
        return Search;
    }());
    HighsoftWebSearch.Search = Search;
})(HighsoftWebSearch || (HighsoftWebSearch = {}));
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
var HighsoftWebSearch;
(function (HighsoftWebSearch) {
    var COMMON_KEYWORDS = [
        'a', 'all', 'an', 'and', 'are', 'at', 'be', 'by', 'can', 'co', 'com',
        'could', 'from', 'had', 'has', 'have', 'https', 'i', 'if', 'in', 'is',
        'it', 'my', 'net', 'no', 'of', 'on', 'or', 'org', 'our', 'shall',
        'should', 'that', 'the', 'their', 'they', 'this', 'to', 'was', 'we',
        'will', 'with', 'yes', 'you', 'your'
    ];
    var WORD_PATTERN = /(?:^|\W)([^\d\W](?:[^\d\W]|[\-])*[^\d\W])(?=\W|$)/;
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
    HighsoftWebSearch.KeywordFilter = KeywordFilter;
})(HighsoftWebSearch || (HighsoftWebSearch = {}));
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
var HighsoftWebSearch;
(function (HighsoftWebSearch) {
    var KeywordURLSet = (function () {
        function KeywordURLSet(keyword, content) {
            this._entries = new HighsoftWebSearch.Dictionary();
            this._keyword = keyword;
            if (typeof content === 'string') {
                this._entries = content
                    .split('\n')
                    .map(function (line) { return line.split('\t', 3); })
                    .reduce(KeywordURLSet.reducer, this._entries);
            }
        }
        KeywordURLSet.reducer = function (entries, values) {
            if (values.length < 3) {
                return entries;
            }
            entries.set(values[1], {
                title: values[2],
                url: values[1],
                weight: parseInt(values[0])
            });
            return entries;
        };
        KeywordURLSet.sorter = function (entryA, entryB) {
            var weightA = entryA.weight;
            var weightB = entryB.weight;
            if (weightA !== weightB) {
                return (weightB - weightA);
            }
            var urlA = entryA.url;
            var urlB = entryB.url;
            return (urlA < urlB ? -1 : urlA > urlB ? 1 : 0);
        };
        Object.defineProperty(KeywordURLSet.prototype, "entries", {
            get: function () {
                return this._entries;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(KeywordURLSet.prototype, "keyword", {
            get: function () {
                return this._keyword;
            },
            enumerable: false,
            configurable: true
        });
        KeywordURLSet.prototype.addURL = function (weight, url, title) {
            var entries = this._entries;
            var entry = entries.get(url);
            if (typeof entry === 'undefined' ||
                entry.weight < weight) {
                entries.set(url, { title: title, url: url, weight: weight });
            }
        };
        KeywordURLSet.prototype.containsURL = function (url) {
            return this._entries.contains(url);
        };
        KeywordURLSet.prototype.toString = function () {
            var entries = this._entries;
            return entries.values
                .sort(KeywordURLSet.sorter)
                .map(function (entry) { return (entry.weight + '\t' + entry.url + '\t' + entry.title); })
                .join('\n');
        };
        return KeywordURLSet;
    }());
    HighsoftWebSearch.KeywordURLSet = KeywordURLSet;
})(HighsoftWebSearch || (HighsoftWebSearch = {}));
