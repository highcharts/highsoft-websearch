"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const CLI = require("./index");
class Application {
    constructor(url, options) {
        this._keywordFiles = {};
        this._links = [];
        this._options = options;
        this._url = url;
    }
    static error(message, exitCode = 1) {
        if (typeof message !== 'undefined') {
            let writeStream = process.stderr;
            if (!writeStream.writable) {
                writeStream = process.stdout;
            }
            writeStream.write(message.toString());
            writeStream.write('\n');
            if (message instanceof Error &&
                message.stack) {
                writeStream.write(message.stack);
                writeStream.write('\n');
            }
        }
        return process.exit(exitCode);
    }
    static main() {
        const argv = process.argv.map(CLI.Options.argumentMapper);
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
            url = new URL(argv[argv.length - 1]);
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
    download(url, depth) {
        return CLI.Download
            .fromURL(url, this._options.timeout)
            .then(download => {
            download.addKeywordFiles(this._keywordFiles, (depth > 1 ? this._links : undefined));
        });
    }
    run() {
        const depth = this._options.depth;
        const downloads = [];
        const links = this._links;
        links.push(this._url.toString());
        let link;
        let url;
        while (typeof (link = links.shift()) === 'string') {
            try {
                url = new URL(link);
                downloads.push(this.download(url, depth));
            }
            catch (error) {
            }
        }
        Promise
            .all(downloads)
            .then(() => console.log(this._keywordFiles))
            .catch(Application.error);
    }
}
exports.Application = Application;
exports.default = Application;
