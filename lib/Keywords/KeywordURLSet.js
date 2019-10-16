"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const L = require("../index");
class KeywordURLSet {
    constructor(keyword, content) {
        this._items = new L.Dictionary();
        this._keyword = keyword;
        if (typeof content === 'string') {
            this._items = content
                .split('\n')
                .map(line => line.split('\t', 3))
                .reduce(KeywordURLSet.reducer, this._items);
        }
    }
    static reducer(items, item) {
        if (item.length < 3) {
            return items;
        }
        items.set(item[1], {
            title: item[2],
            url: item[1],
            weight: parseInt(item[0])
        });
        return items;
    }
    static sorter(itemA, itemB) {
        const weightA = itemA.weight;
        const weightB = itemB.weight;
        if (weightA !== weightB) {
            return (weightB - weightA);
        }
        const urlA = itemA.url;
        const urlB = itemB.url;
        return (urlA < urlB ? -1 : urlA > urlB ? 1 : 0);
    }
    get items() {
        return this._items;
    }
    get keyword() {
        return this._keyword;
    }
    addURL(weight, url, title) {
        const items = this._items;
        const item = items.get(url);
        if (typeof item === 'undefined' ||
            item.weight < weight) {
            items.set(url, { title, url, weight });
        }
    }
    containsURL(url) {
        return this._items.contains(url);
    }
    toString() {
        const items = this._items;
        return items.values
            .sort(KeywordURLSet.sorter)
            .map(item => (item.weight + '\t' + item.url + '\t' + item.title))
            .join('\n');
    }
}
exports.KeywordURLSet = KeywordURLSet;
exports.default = KeywordURLSet;
