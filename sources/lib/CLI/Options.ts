/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as Fs from 'fs';

export class Options {

    /* *
     *
     *  Static Functions
     *
     * */

    public static getOptionsFromArguments (argv: Array<string>, options: Options = new Options()): (Options|null) {

        try {
            let arg: string;

            for (let i = 0, ie = argv.length; i < ie; ++i) {

                arg = argv[i];

                switch (arg) {
                    case '--allowForeignDomains':
                        options._allowForeignDomains = true;
                        continue;
                    case '--depth':
                        arg = argv[++i];
                        options._depth = parseInt(arg);
                        continue;
                    case '--timeout':
                        arg = argv[++i];
                        options._timeout = parseInt(arg);
                        continue;
                }
            }

            return options;
        }
        catch (error) {
            return null;
        }
    }

    public static getOptionsFromFile (filePath: string, options: Options = new Options()): (Options|null|undefined) {

        try {
            const file = Fs.readFileSync(filePath);

            try {

                const optionsJSON: OptionsJSON = JSON.parse(file.toString());

                if (typeof optionsJSON.discoveryOptions !== 'undefined') {

                    const discoveryOptions = optionsJSON.discoveryOptions;

                    if (typeof discoveryOptions.allowForeignDomains === 'boolean') {
                        options._allowForeignDomains = discoveryOptions.allowForeignDomains;
                    }

                    if (typeof discoveryOptions.depth === 'number') {
                        options._depth = discoveryOptions.depth;
                    }
                }

                return options;
            }
            catch (error) {
                return null;
            }
        }
        catch (error) {
            return undefined;
        }

    }

    /* *
     *
     *  Constructor
     *
     * */

    private constructor () {
        this._allowForeignDomains = false;
        this._depth = 1;
        this._timeout = 60000;
    }

    /* *
     *
     *  Properties
     *
     * */

    private _allowForeignDomains: boolean;
    private _depth: number;
    private _timeout: number;

    public get allowForeignDomains (): boolean {
        return this._allowForeignDomains;
    }

    public get depth (): number {
        return this._depth;
    }

    public get timeout (): number {
        return this._timeout;
    }
}

/* *
 *
 *  Interfaces
 *
 * */

export interface OptionsJSON {
    discoveryOptions?: {
        allowForeignDomains?: boolean;
        depth?: number;
        timeout?: number;
    }
}

export default Options;
