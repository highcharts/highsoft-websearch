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
        this._baseURL = url;
        this._keywordURLSets = new L.Dictionary();
        this._options = options;
        this._loadTasks = new L.Dictionary();
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
        const baseURL = this._baseURL;
        const baseURLString = baseURL.toString();
        const delay = this._options.delay;
        const downloadPromises = [];
        const includeForeignDomains = this._options.allowForeignDomains;
        const timeout = this._options.timeout;
        const loadTasks = this._loadTasks;
        let delayFactor = 0;
        for (let loadURL of loadTasks.keys) {
            if (!includeForeignDomains &&
                !loadURL.startsWith(baseURLString)) {
                continue;
            }
            if (loadTasks.get(loadURL) === true) {
                continue;
            }
            try {
                downloadPromises.push(Application
                    .delay(++delayFactor * delay)
                    .then(() => {
                    loadTasks.set(loadURL, true);
                    return this.downloadURL(new URL(loadURL), timeout, depth);
                }));
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
        Application.log(`Download ${url}`);
        return CLI.Download
            .fromURL(url, timeout)
            .then((download) => {
            if (download.hasFailed) {
                Application.log(`FAILED: ${url}`);
                return;
            }
            download.update(this._keywordURLSets, (depth > 1 ? this._loadTasks : undefined));
        });
    }
    loadAll(depth) {
        this._loadTasks.set(this._baseURL.toString(), false);
        if (typeof this._options.sideload === 'string') {
            return this.sideloadAll(this._options.sideload, depth);
        }
        return this.downloadAll(depth);
    }
    run() {
        return Promise
            .resolve()
            .then(() => this.loadAll(this._options.depth))
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
    sideloadAll(basePath, depth) {
        if (depth === 0) {
            return Promise.resolve();
        }
        const baseURL = this._baseURL;
        const baseURLString = baseURL.toString();
        const sideloadPromises = [];
        const loadTasks = this._loadTasks;
        let loadPath;
        let loadURL;
        for (loadURL of loadTasks.keys) {
            if (!loadURL.startsWith(baseURLString) ||
                loadTasks.get(loadURL) === true) {
                continue;
            }
            try {
                loadPath = Path.join(basePath, loadURL.substr(baseURLString.length));
                loadTasks.set(loadURL, true);
                sideloadPromises.push(this.sideloadPath(baseURL, loadPath, depth));
            }
            catch (error) {
            }
        }
        return Promise
            .all(sideloadPromises)
            .then(() => {
            return this.sideloadAll(basePath, --depth);
        });
    }
    sideloadPath(baseURL, path, depth) {
        Application.log(`Sideload ${path}`);
        return CLI.Sideload
            .fromPath(baseURL, path)
            .then((sideload) => {
            if (sideload.hasFailed) {
                Application.log(`FAILED: ${path}`);
                console.log(sideload);
                return;
            }
            sideload.update(this._keywordURLSets, (depth > 1 ? this._loadTasks : undefined));
        });
    }
}
exports.Application = Application;
exports.default = Application;
