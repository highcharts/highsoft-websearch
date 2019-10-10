"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const CLI = require("./index");
const FS = require("fs");
const L = require("../index");
const Path = require("path");
class Application {
    constructor(url, options) {
        this._domain = url.protocol + '//' + url.hostname + '/';
        this._keywordURLSets = new L.Dictionary();
        this._options = options;
        this._urlDownloads = new L.Dictionary();
        this._urlDownloads.set(url.toString(), false);
    }
    static delay(ms, context) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(context), ms);
        });
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
    createDirectory(directoryPath) {
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
    downloadAll(depth) {
        if (depth === 0) {
            return Promise.resolve();
        }
        const delay = this._options.delay;
        const domain = this._domain;
        const downloadPromises = [];
        const urlDownloads = this._urlDownloads;
        const includeForeignDomains = this._options.allowForeignDomains;
        const timeout = this._options.timeout;
        let delayFactor = 0;
        for (let url of urlDownloads.keys) {
            if (!includeForeignDomains &&
                !url.startsWith(domain)) {
                continue;
            }
            if (urlDownloads.get(url) === true) {
                continue;
            }
            try {
                downloadPromises.push(Application
                    .delay(++delayFactor * delay)
                    .then(() => this.downloadURL(new URL(url), timeout, depth)));
            }
            catch (error) {
            }
        }
        return Promise
            .all(downloadPromises)
            .then(() => {
            return this.downloadAll(--depth);
        });
    }
    downloadURL(url, timeout, depth) {
        const urlDownloads = this._urlDownloads;
        Application.log(`Download ${url}`);
        urlDownloads.set(url.toString(), true);
        return CLI.Download
            .fromURL(url, timeout)
            .then((download) => {
            download.update(this._keywordURLSets, (depth > 1 ? urlDownloads : undefined));
        });
    }
    run() {
        return Promise
            .resolve()
            .then(() => this.downloadAll(this._options.depth))
            .then(() => this.saveAll(this._options.out))
            .then(() => 'Done.')
            .then(Application.success)
            .catch(Application.error);
    }
    saveAll(directoryPath) {
        return this
            .createDirectory(directoryPath)
            .then(() => {
            const savePromises = [];
            const keywordURLSets = this._keywordURLSets.values;
            let keywordURLSet;
            for (keywordURLSet of keywordURLSets) {
                savePromises.push(this.saveFile(directoryPath, keywordURLSet));
            }
            return Promise.all(savePromises);
        });
    }
    saveFile(directoryPath, keywordURLSet) {
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
}
exports.Application = Application;
exports.default = Application;
