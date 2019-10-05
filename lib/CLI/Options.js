"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const Fs = require("fs");
class Options {
    constructor() {
        this._allowForeignDomains = false;
        this._depth = 1;
        this._timeout = 60000;
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
    static getOptionsFromFile(filePath, options = new Options()) {
        try {
            const file = Fs.readFileSync(filePath);
            try {
                const optionsJSON = JSON.parse(file.toString());
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
    get allowForeignDomains() {
        return this._allowForeignDomains;
    }
    get depth() {
        return this._depth;
    }
    get timeout() {
        return this._timeout;
    }
}
exports.Options = Options;
exports.default = Options;
