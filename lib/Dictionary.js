"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
class Dictionary {
    constructor(...dictionaries) {
        let dictionary = dictionaries.shift();
        if (typeof dictionary === 'undefined') {
            this._keys = [];
            this._values = [];
            return;
        }
        this._keys = dictionary.keys;
        this._values = dictionary.values;
        let keys;
        let values;
        for (dictionary of dictionaries) {
            keys = dictionary._keys;
            values = dictionary._values;
            for (let index = 0, indexEnd = keys.length; index < indexEnd; ++index) {
                this.set(keys[index], values[index]);
            }
        }
    }
    get keys() {
        return this._keys.slice();
    }
    get values() {
        return this._values.slice();
    }
    contains(key) {
        return (this._keys.indexOf(key) !== -1);
    }
    get(key) {
        const keys = this._keys;
        const values = this._values;
        const index = keys.indexOf(key);
        if (index === -1) {
            return;
        }
        return values[index];
    }
    set(key, value) {
        const keys = this._keys;
        const values = this._values;
        const index = keys.indexOf(key);
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
    }
}
exports.Dictionary = Dictionary;
exports.default = Dictionary;
