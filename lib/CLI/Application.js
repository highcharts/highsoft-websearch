"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const CLI = require("./index");
const Keywords = require("../Keywords/index");
const URL = require("url");
class Application {
    constructor(url, options) {
        this._options = options;
        this._url = url;
    }
    static error(message, exitCode = 1) {
        if (typeof message !== 'undefined') {
            let writeStream = process.stderr;
            if (!writeStream.writable) {
                writeStream = process.stdout;
            }
            writeStream.write(message);
            writeStream.write('\n');
        }
        return process.exit(exitCode);
    }
    static main() {
        const argv = process.argv.map(CLI.Arguments.argumentMapper);
        if (argv.includes('--help') || argv.length === 0) {
            Application.success(CLI.HELP);
            return;
        }
        if (argv.includes('--version')) {
            Application.success(CLI.VERSION);
            return;
        }
        let url;
        try {
            url = new URL.URL(argv[argv.length - 1]);
        }
        catch (error) {
            Application.error('URL is invalid.');
            return;
        }
        let options = CLI.Options.getOptionsFromFile('highsoft-search.json');
        if (options === null) {
            Application.error('Options file "highsoft-search.json" is invalid.');
            return;
        }
        options = CLI.Options.getOptionsFromArguments(argv, options);
        if (options === null) {
            Application.error('Option arguments are invalid.');
            return;
        }
        const application = new Application(url, options);
        application.run();
    }
    static success(message) {
        if (typeof message !== 'undefined') {
            const writeStream = process.stdout;
            writeStream.write(message);
            writeStream.write('\n');
        }
        return process.exit();
    }
    run() {
        const options = this._options;
        const depth = options.depth;
        const keywordFiles = {};
        const timeout = options.timeout;
        Keywords.KeywordDownload
            .fromURL(this._url, depth, timeout)
            .then(download => download.addKeywordFiles(keywordFiles))
            .then(() => console.log(keywordFiles))
            .catch(Application.error);
    }
}
exports.Application = Application;
exports.default = Application;
