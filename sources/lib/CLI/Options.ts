/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as FS from 'fs';

export class Options {

    /* *
     *
     *  Static Functions
     *
     * */

    public static argumentMapper (argv: string): string {

        switch (argv) {
            case '-h':
                return '--help';
            case '-v':
                return '--version';
        }

        return argv;
    }

    public static getOptionsFromArguments (argv: Array<string>, options: Options = new Options()): (Options|null) {
        try {

            let arg: string;

            for (let i = 0, ie = argv.length; i < ie; ++i) {

                arg = argv[i];

                switch (arg) {
                    case '--allowForeignDomains':
                        options._allowForeignDomains = true;
                        continue;
                    case '--delay':
                        arg = argv[++i];
                        options._delay = parseInt(arg);
                        continue;
                    case '--depth':
                        arg = argv[++i];
                        options._depth = parseInt(arg);
                        continue;
                    case '--out':
                        arg = argv[++i]
                        options._out = arg;
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

            const file = FS.readFileSync(filePath);

            try {

                const optionsJSON: OptionsJSON = JSON.parse(file.toString());

                if (typeof optionsJSON.discoveryOptions !== 'undefined') {

                    const discoveryOptions = optionsJSON.discoveryOptions;

                    if (typeof discoveryOptions.allowForeignDomains === 'boolean') {
                        options._allowForeignDomains = discoveryOptions.allowForeignDomains;
                    }

                    if (typeof discoveryOptions.delay === 'number') {
                        options._delay = discoveryOptions.delay;
                    }

                    if (typeof discoveryOptions.depth === 'number') {
                        options._depth = discoveryOptions.depth;
                    }

                    if (typeof discoveryOptions.out === 'string') {
                        options._out = discoveryOptions.out;
                    }

                    if (typeof discoveryOptions.timeout === 'number') {
                        options._timeout = discoveryOptions.timeout;
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
        this._delay = 1000;
        this._depth = 1;
        this._out = process.cwd();
        this._timeout = 60000;
    }

    /* *
     *
     *  Properties
     *
     * */

    private _allowForeignDomains: boolean;
    private _delay: number;
    private _depth: number;
    private _out: string;
    private _timeout: number;

    public get allowForeignDomains (): boolean {
        return this._allowForeignDomains;
    }

    public get delay (): number {
        return this._delay;
    }

    public get depth (): number {
        return this._depth;
    }

    public get out (): string {
        return this._out;
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
        delay?: number;
        depth?: number;
        out?: string;
        timeout?: number;
    }
}

export default Options;
