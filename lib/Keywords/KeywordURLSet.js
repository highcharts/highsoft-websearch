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
        this._entries = new L.Dictionary();
        this._keyword = keyword;
        if (typeof content === 'string') {
            this._entries = content
                .split('\n')
                .map(line => line.split('\t', 3))
                .reduce(KeywordURLSet.reducer, this._entries);
        }
    }
    static reducer(entries, values) {
        if (values.length < 3) {
            return entries;
        }
        entries.set(values[1], {
            title: values[2],
            url: values[1],
            weight: parseInt(values[0])
        });
        return entries;
    }
    static sorter(entryA, entryB) {
        const weightA = entryA.weight;
        const weightB = entryB.weight;
        if (weightA !== weightB) {
            return (weightB - weightA);
        }
        const urlA = entryA.url;
        const urlB = entryB.url;
        return (urlA < urlB ? -1 : urlA > urlB ? 1 : 0);
    }
    get entries() {
        return this._entries;
    }
    get keyword() {
        return this._keyword;
    }
    addURL(weight, url, title) {
        const entries = this._entries;
        const entry = entries.get(url);
        if (typeof entry === 'undefined' ||
            entry.weight < weight) {
            entries.set(url, { title, url, weight });
        }
    }
    containsURL(url) {
        return this._entries.contains(url);
    }
    toString() {
        const entries = this._entries;
        return entries.values
            .sort(KeywordURLSet.sorter)
            .map(entry => (entry.weight + '\t' + entry.url + '\t' + entry.title))
            .join('\n');
    }
}
exports.KeywordURLSet = KeywordURLSet;
exports.default = KeywordURLSet;
