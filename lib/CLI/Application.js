"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
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
            writeStream.write('[');
            writeStream.write((new Date()).toTimeString().substr(0, 8));
            writeStream.write('] ERROR: ');
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
        let options = CLI.Options.getOptionsFromArguments(process.argv);
        if (options.help) {
            Application.success(CLI.HELP);
            return;
        }
        if (options.version) {
            Application.success(CLI.VERSION);
            return;
        }
        if (FS.existsSync('highsoft-websearch.json')) {
            options = (CLI.Options.getOptionsFromFile('highsoft-websearch.json', options) || options);
        }
        else if (options.verbose) {
            Application.log('Configuration "highsoft-websearch.json" not found.');
        }
        options = CLI.Options.getOptionsFromArguments(process.argv, options);
        if (options === null) {
            Application.error('Option arguments are invalid.');
            return;
        }
        if (typeof options.url !== 'string') {
            Application.success(CLI.HELP);
            return;
        }
        let url;
        try {
            url = new URL(options.url);
        }
        catch (error) {
            Application.error('URL is invalid.');
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
    copyClient(directoryPath, verbose) {
        return new Promise((resolve, reject) => {
            if (verbose) {
                Application.log('Copy highsoft-websearch.js');
            }
            FS.copyFile(Path.join(__dirname, '..', '..', 'client', 'highsoft-websearch.js'), Path.join(directoryPath, 'highsoft-websearch.js'), (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
    createDirectory(directoryPath, verbose) {
        if (verbose) {
            Application.log(`Create ${directoryPath}`);
        }
        return new Promise((resolve, reject) => {
            if (FS.existsSync(directoryPath) &&
                FS.statSync(directoryPath).isDirectory()) {
                resolve(directoryPath);
                return;
            }
            FS.mkdir(directoryPath, { recursive: true }, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(directoryPath);
                }
            });
        });
    }
    downloadAll(depth, inspectIds, verbose) {
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
                if (verbose) {
                    Application.log(`FOREIGN DOMAIN: ${loadURL}`);
                }
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
                    return this.downloadURL(new URL(loadURL), timeout, depth, inspectIds, verbose);
                }));
            }
            catch (error) {
                if (verbose) {
                    Application.log(error);
                }
            }
        }
        return Promise
            .all(downloadPromises)
            .then(() => {
            return this.downloadAll(--depth, inspectIds, verbose);
        });
    }
    downloadURL(url, timeout, depth, inspectIds, verbose) {
        if (verbose) {
            Application.log(`Download ${url}`);
        }
        return CLI.Download
            .fromURL(url, timeout)
            .then((download) => {
            if (download.hasFailed) {
                Application.log(`FAILED: ${url}`);
                return;
            }
            download.update(this._keywordURLSets, (depth > 1 ? this._loadTasks : undefined), inspectIds);
        });
    }
    inspectAll(depth, inspectIds, verbose) {
        this._loadTasks.set(this._baseURL.toString(), false);
        if (typeof this._options.sideload === 'string') {
            return this.sideloadAll(this._options.sideload, depth, inspectIds, verbose);
        }
        return this.downloadAll(depth, inspectIds, verbose);
    }
    loadKeywordURLSets(directoryPath, verbose) {
        return new Promise((resolve) => {
            if (!FS.existsSync(directoryPath) ||
                !FS.statSync(directoryPath).isDirectory()) {
                resolve();
                return;
            }
            const directoryEntries = FS.readdirSync(directoryPath);
            const keywordURLSets = this._keywordURLSets;
            let keyword;
            let keywordURLSet;
            for (let directoryEntry of directoryEntries) {
                if (!directoryEntry.endsWith('.txt')) {
                    continue;
                }
                try {
                    keyword = Path.basename(directoryEntry, Path.extname(directoryEntry));
                    keywordURLSet = new L.KeywordURLSet(keyword, FS.readFileSync(Path.join(directoryPath, directoryEntry)).toString());
                    keywordURLSets.set(keyword, keywordURLSet);
                }
                catch (error) {
                    if (verbose) {
                        Application.log(error);
                    }
                }
            }
            resolve();
        });
    }
    run() {
        const copyClient = this._options.copyClient;
        const depth = this._options.depth;
        const inspectIds = this._options.inspectIds;
        const out = this._options.out;
        const verbose = this._options.verbose;
        return Promise
            .resolve()
            .then(() => verbose && Application.log('Initializing...'))
            .then(() => this.loadKeywordURLSets(out, verbose))
            .then(() => Application.log('Inspecting...'))
            .then(() => this.inspectAll(depth, inspectIds, verbose))
            .then(() => verbose && Application.log('Saving...'))
            .then(() => this.saveAll(out, copyClient, verbose))
            .then(() => Application.log('Done.'))
            .then(() => Application.success())
            .catch(Application.error);
    }
    saveAll(directoryPath, copyClient, verbose) {
        return this
            .createDirectory(directoryPath, verbose)
            .then(() => {
            const savePromises = [];
            const keywordURLSets = this._keywordURLSets.values;
            let keywordURLSet;
            for (keywordURLSet of keywordURLSets) {
                savePromises.push(this.saveFile(directoryPath, keywordURLSet, verbose));
            }
            return Promise.all(savePromises);
        })
            .then(() => {
            if (copyClient) {
                return this.copyClient(directoryPath, verbose);
            }
            return Promise.resolve();
        });
    }
    saveFile(directoryPath, keywordURLSet, verbose) {
        const filePath = Path.join(directoryPath, (keywordURLSet.keyword + '.txt'));
        if (verbose) {
            Application.log(`Save ${filePath}...`);
        }
        return new Promise((resolve, reject) => {
            FS.writeFile(filePath, (keywordURLSet + '\n'), (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    sideloadAll(localPath, depth, inspectIds, verbose) {
        if (depth === 0) {
            return Promise.resolve();
        }
        const baseURLString = this._baseURL.toString();
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
                loadTasks.set(loadURL, true);
                loadPath = Path.join(localPath, loadURL.substr(baseURLString.length));
                sideloadPromises.push(this.sideloadPath(new URL(loadURL), loadPath, depth, inspectIds, verbose));
            }
            catch (error) {
                if (verbose) {
                    Application.log(error);
                }
            }
        }
        return Promise
            .all(sideloadPromises)
            .then(() => {
            return this.sideloadAll(localPath, --depth, inspectIds, verbose);
        });
    }
    sideloadPath(url, path, depth, inspectIds, verbose) {
        if (verbose) {
            Application.log(`Sideload ${path}`);
        }
        return CLI.Sideload
            .fromPath(url, path)
            .then((sideload) => {
            if (sideload.hasFailed) {
                Application.log(`SIDELOAD FAILED: ${path}`);
                return;
            }
            sideload.update(this._keywordURLSets, (depth > 1 ? this._loadTasks : undefined), inspectIds);
        });
    }
}
exports.Application = Application;
exports.default = Application;
