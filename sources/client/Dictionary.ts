/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

namespace HighsoftWebSearch {
    /**
     * Dictionary implementation to support JavaScript keywords as keys.
     */
    export class Dictionary<T> {

        /* *
         *
         *  Constructor
         *
         * */

        /**
         * Creates a new dictionary instance with support for JavaScript keywords as
         * keys.
         *
         * @param dictionaries
         * Copy items from given dictionary instances.
         */
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

        /**
         * Returns all keys of the dictionary.
         */
        public get keys (): Array<string> {
            return this._keys.slice();
        }

        /**
         * Returns all values of the dictionary.
         */
        public get values (): Array<T> {
            return this._values.slice();
        }

        /* *
         *
         *  Functions
         *
         * */

        /**
         * Returns true, if the given key is in the dictionary instance.
         *
         * @param key
         * Key to find in the dictionary instance.
         */
        public contains (key: string): boolean {
            return (this._keys.indexOf(key) !== -1);
        }

        /**
         * Returns the value for a given key, or `undefined` if not found.
         *
         * @param key
         * Corresponding key of the value.
         */
        public get (key: string): (T|undefined) {

            const keys = this._keys;
            const values = this._values;
            const index = keys.indexOf(key);

            if (index === -1) {
                return;
            }

            return values[index];
        }

        /**
         * Sets the value for a given key. Removes the key, if no value is given or
         * the value is `undefined`.
         *
         * @param key
         * Corresponding key of the value.
         * 
         * @param value
         * Value or `undefined` for removing the key.
         */
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
}
