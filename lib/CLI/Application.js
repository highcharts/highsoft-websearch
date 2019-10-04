"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
var CLI = require("./index");
var L = require("../index");
var Application = (function () {
    function Application(url, options) {
        this._options = options;
        this._url = url;
    }
    Application.error = function (message, exitCode) {
        if (exitCode === void 0) { exitCode = 1; }
        if (typeof message !== 'undefined') {
            var writeStream = process.stderr;
            if (!writeStream.writable) {
                writeStream = process.stdout;
            }
            writeStream.write(message);
            writeStream.write('\n');
        }
        return process.exit(exitCode);
    };
    Application.main = function () {
        var argv = process.argv.map(CLI.Arguments.argumentMapper);
        if (argv.includes('--help') || argv.length === 0) {
            Application.success(CLI.HELP);
            return;
        }
        if (argv.includes('--version')) {
            Application.success(CLI.VERSION);
            return;
        }
        var url = L.URLUtilities.getURL(argv[argv.length - 1]);
        if (typeof url === 'undefined') {
            Application.error('URL is invalid.');
            return;
        }
        var options = CLI.Options.getOptionsFromFile('highsoft-search.json');
        if (options === null) {
            Application.error('Options file "highsoft-search.json" is invalid.');
            return;
        }
        options = CLI.Options.getOptionsFromArguments(argv, options);
        if (options === null) {
            Application.error('Option arguments are invalid.');
            return;
        }
        var application = new Application(url, options);
        application.run();
    };
    Application.success = function (message) {
        if (typeof message !== 'undefined') {
            var writeStream = process.stdout;
            writeStream.write(message);
            writeStream.write('\n');
        }
        return process.exit();
    };
    Application.prototype.run = function () {
        var options = this._options;
        var depth = options.depth;
        var timeout = options.timeout;
        CLI.Download
            .fromURL(this._url, depth, timeout)
            .then(function (download) { return download.getInspectors(); })
            .then(function (inspectors) { return console.log(inspectors); });
    };
    return Application;
}());
exports.Application = Application;
exports.default = Application;
