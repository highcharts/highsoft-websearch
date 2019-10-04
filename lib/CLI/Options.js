"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
var FS = require("fs");
var Options = (function () {
    function Options() {
        this._allowForeignDomains = false;
        this._depth = 1;
        this._timeout = 60000;
    }
    Options.getOptionsFromArguments = function (argv, options) {
        if (options === void 0) { options = new Options(); }
        try {
            var arg = void 0;
            for (var i = 0, ie = argv.length; i < ie; ++i) {
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
    };
    Options.getOptionsFromFile = function (filePath, options) {
        if (options === void 0) { options = new Options(); }
        try {
            var file = FS.readFileSync(filePath);
            try {
                var optionsJSON = JSON.parse(file.toString());
                if (typeof optionsJSON.discoveryOptions !== 'undefined') {
                    var discoveryOptions = optionsJSON.discoveryOptions;
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
    };
    Object.defineProperty(Options.prototype, "allowForeignDomains", {
        get: function () {
            return this._allowForeignDomains;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options.prototype, "depth", {
        get: function () {
            return this._depth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options.prototype, "timeout", {
        get: function () {
            return this._timeout;
        },
        enumerable: true,
        configurable: true
    });
    return Options;
}());
exports.Options = Options;
exports.default = Options;
