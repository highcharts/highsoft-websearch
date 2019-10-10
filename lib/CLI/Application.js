"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const CLI = require("./index");
const FS = require("fs");
const Path = require("path");
class Application {
    constructor(url, options) {
        this._keywordURLSets = {};
        this._links = [url.toString()];
        this._options = options;
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
    static log(message) {
        const writeStream = process.stdout;
        writeStream.write('[');
        writeStream.write((new Date()).toTimeString().substr(0, 8));
        writeStream.write('] ');
        writeStream.write(message);
        writeStream.write('\n');
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
        Application.log(`Download ${url}`);
        return CLI.Download
            .fromURL(url, this._options.timeout)
            .then(download => {
            download.addKeywordURLSets(this._keywordURLSets, (depth > 1 ? this._links : undefined));
        });
    }
    downloadAll() {
        const depth = this._options.depth;
        const downloadPromises = [];
        const links = this._links;
        let link;
        let url;
        while (typeof (link = links.shift()) === 'string') {
            try {
                url = new URL(link);
                downloadPromises.push(this.download(url, depth));
            }
            catch (error) {
            }
        }
        return Promise.all(downloadPromises);
    }
    prepareSaveAll(directoryPath) {
        Application.log(`Create ${directoryPath}`);
        return new Promise((resolve, reject) => {
            FS.mkdir(directoryPath, { recursive: true }, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    run() {
        const directoryPath = this._options.out;
        return Promise
            .resolve()
            .then(() => this.downloadAll())
            .then(() => this.prepareSaveAll(directoryPath))
            .then(() => this.saveAll(directoryPath))
            .then(() => 'Done.')
            .then(Application.success)
            .catch(Application.error);
    }
    save(directoryPath, keywordURLSet) {
        const filePath = Path.join(directoryPath, (keywordURLSet.keyword + '.txt'));
        Application.log(`Save ${filePath}...`);
        return new Promise((resolve, reject) => {
            FS.writeFile(filePath, keywordURLSet.toString(), (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    saveAll(directoryPath) {
        const savePromises = [];
        const keywordURLSets = Object.values(this._keywordURLSets);
        let keywordURLSet;
        for (keywordURLSet of keywordURLSets) {
            savePromises.push(this.save(directoryPath, keywordURLSet));
        }
        return Promise.all(savePromises);
    }
}
exports.Application = Application;
exports.default = Application;
