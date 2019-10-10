/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

/**
 * Dictionary implementation to support JavaScript keywords as keys.
 */
export class Dictionary<T> {

    /* *
     *
     *  Constructor
     *
     * */

    public constructor (...dictionaries: Array<Dictionary<T>>) {

        let dictionary = dictionaries.shift();

        if (typeof dictionary === 'undefined') {

            this._keys = [];
            this._values = [];

            return;
        }

        this._keys = dictionary.keys;
        this._values = dictionary.values;

        let keys: (Array<string>|undefined);
        let values: (Array<T>|undefined);

        for (dictionary of dictionaries) {

            keys = dictionary._keys;
            values = dictionary._values;

            for (let index = 0, indexEnd = keys.length; index < indexEnd; ++index) {
                this.set(keys[index], values[index]);
            }
        }
    }

    /* *
     *
     *  Properties
     *
     * */

    private _keys: Array<string>;
    private _values: Array<T>;

    public get keys (): Array<string> {
        return this._keys.slice();
    }

    public get values (): Array<T> {
        return this._values.slice();
    }

    /* *
     *
     *  Functions
     *
     * */

    public get (key: string): (T|undefined) {

        const keys = this._keys;
        const values = this._values;
        const index = keys.indexOf(key);

        if (index === -1) {
            return;
        }

        return values[index];
    }

    public set (key: string, value?: T): void {

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

export default Dictionary;
