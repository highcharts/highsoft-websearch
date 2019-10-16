/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as FS from 'fs';
import * as Path from 'path';

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
                return '--verbose';
        }

        return argv;
    }

    public static getOptionsFromArguments (argv: Array<string>, options: Options = new Options()): Options {

        argv = argv.map(Options.argumentMapper);

        let arg: string;

        for (let index = 0, indexEnd = argv.length; index < indexEnd; ++index) {

            arg = argv[index];

            switch (arg) {
                case '--allowForeignDomains':
                    options._allowForeignDomains = true;
                    continue;
                case '--copyClient':
                    options._copyClient = true;
                    continue;
                case '--delay':
                    arg = argv[++index];
                    options._delay = parseInt(arg);
                    continue;
                case '--depth':
                    arg = argv[++index];
                    options._depth = parseInt(arg);
                    continue;
                case '--help':
                    options._help = true;
                    continue;
                case '--out':
                    arg = argv[++index]
                    options._out = arg;
                    continue;
                case '--sideload':
                    arg = argv[++index];
                    options._sideload = arg;
                    continue;
                case '--timeout':
                    arg = argv[++index];
                    options._timeout = parseInt(arg);
                    continue;
                case '--verbose':
                    options._verbose = true;
                    continue;
                case '--version':
                    options._version = true;
                    continue;
            }

            if (index === (indexEnd - 1)) {
                options._url = argv[index];
            }
        }

        return options;
    }

    public static getOptionsFromFile (filePath: string, options: Options = new Options()): (Options|null|undefined) {
        try {

            const file = FS.readFileSync(filePath);

            try {

                const optionsJSON: (OptionsJSON|undefined) = JSON.parse(file.toString());

                if (typeof optionsJSON !== 'undefined') {

                    if (typeof optionsJSON.allowForeignDomains === 'boolean') {
                        options._allowForeignDomains = optionsJSON.allowForeignDomains;
                    }

                    if (typeof optionsJSON.copyClient === 'boolean') {
                        options._copyClient = optionsJSON.copyClient;
                    }

                    if (typeof optionsJSON.delay === 'number') {
                        options._delay = optionsJSON.delay;
                    }

                    if (typeof optionsJSON.depth === 'number') {
                        options._depth = optionsJSON.depth;
                    }

                    if (typeof optionsJSON.out === 'string') {
                        options._out = Path.join(Path.dirname(filePath), optionsJSON.out);
                    }

                    if (typeof optionsJSON.sideload === 'string') {
                        options._sideload = optionsJSON.sideload;
                    }

                    if (typeof optionsJSON.timeout === 'number') {
                        options._timeout = optionsJSON.timeout;
                    }

                    if (typeof optionsJSON.url === 'string') {
                        options._url = optionsJSON.url;
                    }

                    if (typeof optionsJSON.verbose === 'boolean') {
                        options._verbose = optionsJSON.verbose;
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
        this._copyClient = false;
        this._delay = 1000;
        this._depth = 1;
        this._help = false;
        this._out = process.cwd();
        this._timeout = 60000;
        this._verbose = false;
        this._version = false;
    }

    /* *
     *
     *  Properties
     *
     * */

    private _allowForeignDomains: boolean;
    private _copyClient: boolean;
    private _delay: number;
    private _depth: number;
    private _help: boolean;
    private _out: string;
    private _sideload: (string|undefined);
    private _timeout: number;
    private _url: (string|undefined);
    private _verbose: boolean;
    private _version: boolean;

    public get allowForeignDomains (): boolean {
        return this._allowForeignDomains;
    }

    public get copyClient (): boolean {
        return this._copyClient;
    }

    public get delay (): number {
        return this._delay;
    }

    public get depth (): number {
        return this._depth;
    }

    public get help (): boolean {
        return this._help;
    }

    public get out (): string {
        return this._out;
    }

    public get sideload (): (string|undefined) {
        return this._sideload;
    }

    public get timeout (): number {
        return this._timeout;
    }

    public get url (): (string|undefined) {
        return this._url;
    }

    public get verbose (): boolean {
        return this._verbose;
    }

    public get version (): boolean {
        return this._version;
    }
}

/* *
 *
 *  Interfaces
 *
 * */

export interface OptionsJSON {
    allowForeignDomains?: boolean;
    copyClient?: boolean;
    delay?: number;
    depth?: number;
    out?: string;
    sideload?: string;
    timeout?: number;
    url?: string;
    verbose?: boolean;
}

export default Options;
