"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs");
const Path = require("path");
class Options {
    constructor() {
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
    static argumentMapper(argv) {
        switch (argv) {
            case '-h':
                return '--help';
            case '-v':
                return '--verbose';
        }
        return argv;
    }
    static getOptionsFromArguments(argv, options = new Options()) {
        argv = argv.map(Options.argumentMapper);
        let arg;
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
                    arg = argv[++index];
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
    static getOptionsFromFile(filePath, options = new Options()) {
        try {
            const file = FS.readFileSync(filePath);
            try {
                const optionsJSON = JSON.parse(file.toString());
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
    get allowForeignDomains() {
        return this._allowForeignDomains;
    }
    get copyClient() {
        return this._copyClient;
    }
    get delay() {
        return this._delay;
    }
    get depth() {
        return this._depth;
    }
    get help() {
        return this._help;
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
    get url() {
        return this._url;
    }
    get verbose() {
        return this._verbose;
    }
    get version() {
        return this._version;
    }
}
exports.Options = Options;
exports.default = Options;
