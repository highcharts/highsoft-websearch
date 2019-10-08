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
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
define("Client/Download", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    exports.Download = Download;
    exports.default = AJAX;
});
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
define("Client/Search", ["require", "exports", "Client/index", "index"], function (require, exports, Client, Keywords) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WORD_PATTERN = /[A-z](?:[\w\-\.]*[A-z])?/;
    var Search = (function () {
        function Search(baseURL) {
            this._baseURL = baseURL;
        }
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
                .sort(Keywords.KeywordFile.sorter);
        };
        Search.prototype.download = function (term, baseURL) {
            return Client.Download
                .fromURL(new URL(term, baseURL))
                .then(function (download) { return new Keywords.KeywordFile(term, download.content); });
        };
        Search.prototype.find = function (query) {
            var e_3, _a;
            var baseURL = this._baseURL;
            var loadPromises = [];
            var wordPattern = new RegExp(WORD_PATTERN.source, 'gi');
            try {
                for (var _b = __values(query.split(wordPattern)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var term = _c.value;
                    loadPromises.push(this.download(term, baseURL));
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return Promise
                .all(loadPromises)
                .then(this.consolidate);
        };
        return Search;
    }());
    exports.Search = Search;
});
define("Client/index", ["require", "exports", "Client/Download", "Client/Search"], function (require, exports, Download_1, Search_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(Download_1);
    __export(Search_1);
});
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
define("Keywords/KeywordFile", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var KeywordFile = (function () {
        function KeywordFile(keyword, content) {
            this._items = {};
            this._keyword = keyword;
            if (typeof content === 'string') {
                this._items = content
                    .split('\n')
                    .map(function (line) { return line.split('\t', 3); })
                    .reduce(KeywordFile.reducer, {});
            }
        }
        KeywordFile.reducer = function (items, item) {
            items[item[0]] = {
                title: item[2],
                url: item[0],
                weight: parseInt(item[1])
            };
            return items;
        };
        KeywordFile.sorter = function (itemA, itemB) {
            return (itemA.weight - itemB.weight);
        };
        Object.defineProperty(KeywordFile.prototype, "items", {
            get: function () {
                return this._items;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(KeywordFile.prototype, "keyword", {
            get: function () {
                return this._keyword;
            },
            enumerable: true,
            configurable: true
        });
        KeywordFile.prototype.addURL = function (url, weight, title) {
            this._items[url] = { title: title, url: url, weight: weight };
        };
        KeywordFile.prototype.toString = function () {
            var items = this._items;
            return Object
                .keys(items)
                .map(function (itemURL) { return items[itemURL]; })
                .sort(KeywordFile.sorter)
                .map(function (item) { return (item.url + '\t' + item.weight + '\t' + item.title); })
                .join('\n');
        };
        return KeywordFile;
    }());
    exports.KeywordFile = KeywordFile;
    exports.default = KeywordFile;
});
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
define("Keywords/KeywordFilter", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var COMMON_KEYWORDS = [
        'a', 'all', 'an', 'and', 'are', 'at', 'be', 'by', 'can', 'com', 'could',
        'from', 'had', 'has', 'have', 'https', 'i', 'if', 'in', 'is', 'it', 'my',
        'net', 'of', 'on', 'or', 'org', 'our', 'shall', 'should', 'that', 'the',
        'their', 'they', 'this', 'to', 'was', 'we', 'will', 'with', 'you', 'your'
    ];
    var WORD_PATTERN = /[A-z](?:[\w\-\.]*[A-z])?/;
    var KeywordFilter = (function () {
        function KeywordFilter() {
        }
        KeywordFilter.commonFilter = function (keyword) {
            return (COMMON_KEYWORDS.indexOf(keyword) === -1);
        };
        KeywordFilter.getWords = function (content) {
            var wordPattern = new RegExp(WORD_PATTERN.source, 'gi');
            return (content.match(wordPattern) || []);
        };
        return KeywordFilter;
    }());
    exports.KeywordFilter = KeywordFilter;
    exports.default = KeywordFilter;
});
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
define("Keywords/KeywordItem", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("Keywords/index", ["require", "exports", "Keywords/KeywordFile", "Keywords/KeywordFilter"], function (require, exports, KeywordFile_1, KeywordFilter_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(KeywordFile_1);
    __export(KeywordFilter_1);
});
define("index", ["require", "exports", "Client/index", "Keywords/index"], function (require, exports, index_1, index_2) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(index_1);
    __export(index_2);
});
