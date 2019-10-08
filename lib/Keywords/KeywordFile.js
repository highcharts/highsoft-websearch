"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
class KeywordFile {
    constructor(keyword, content) {
        this._items = {};
        this._keyword = keyword;
        if (typeof content === 'string') {
            this._items = content
                .split('\n')
                .map(line => line.split('\t', 3))
                .reduce(KeywordFile.reducer, {});
        }
    }
    static reducer(items, item) {
        items[item[0]] = {
            title: item[2],
            url: item[0],
            weight: parseInt(item[1])
        };
        return items;
    }
    static sorter(itemA, itemB) {
        return (itemA.weight - itemB.weight);
    }
    get items() {
        return this._items;
    }
    get keyword() {
        return this._keyword;
    }
    addURL(url, weight, title) {
        this._items[url] = { title, url, weight };
    }
    toString() {
        const items = this._items;
        return Object
            .keys(items)
            .map(itemURL => items[itemURL])
            .sort(KeywordFile.sorter)
            .map(item => (item.url + '\t' + item.weight + '\t' + item.title))
            .join('\n');
    }
}
exports.KeywordFile = KeywordFile;
exports.default = KeywordFile;
