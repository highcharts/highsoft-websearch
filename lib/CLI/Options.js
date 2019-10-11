"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs");
class Options {
    constructor() {
        this._allowForeignDomains = false;
        this._delay = 1000;
        this._depth = 1;
        this._out = process.cwd();
        this._timeout = 60000;
    }
    static argumentMapper(argv) {
        switch (argv) {
            case '-h':
                return '--help';
            case '-v':
                return '--version';
        }
        return argv;
    }
    static getOptionsFromArguments(argv, options = new Options()) {
        try {
            let arg;
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
                        arg = argv[++i];
                        options._out = arg;
                        continue;
                    case '--sideload':
                        arg = argv[++i];
                        options._sideload = arg;
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
    static getOptionsFromFile(filePath, options = new Options()) {
        try {
            const file = FS.readFileSync(filePath);
            try {
                const optionsJSON = JSON.parse(file.toString());
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
                    if (typeof discoveryOptions.sideload === 'string') {
                        options._sideload = discoveryOptions.sideload;
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
    get allowForeignDomains() {
        return this._allowForeignDomains;
    }
    get delay() {
        return this._delay;
    }
    get depth() {
        return this._depth;
    }
    get out() {
        return this._out;
    }
    get sideload() {
        return this._sideload;
    }
    get timeout() {
        return this._timeout;
    }
}
exports.Options = Options;
exports.default = Options;
