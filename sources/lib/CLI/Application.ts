/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as CLI from './index';
import * as FS from 'fs';
import * as L from '../index';
import * as Path from 'path';

export class Application {

    /* *
     *
     *  Static Functions
     *
     * */

    private static delay<T> (ms: number, context?: T): Promise<T> {
        return new Promise((resolve): void => {
            setTimeout((): void => resolve(context), ms);
        });
    }

    private static error (message?: (string|Error), exitCode: number = 1): never {

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

            if (
                message instanceof Error &&
                message.stack
            ) {
                writeStream.write(message.stack);
                writeStream.write('\n');
            }
        }

        return process.exit(exitCode);
    }

    private static log (message: string): void {

        const writeStream = process.stdout;

        writeStream.write('[');
        writeStream.write((new Date()).toTimeString().substr(0, 8));
        writeStream.write('] ');
        writeStream.write(message);
        writeStream.write('\n');
    }

    public static main (): void {

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

        let url: URL;

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

    private static success (message?: string): never {

        if (typeof message !== 'undefined') {

            const writeStream = process.stdout;

            writeStream.write(message);
            writeStream.write('\n');
        }

        return process.exit();
    }

    /* *
     *
     *  Constructor
     *
     * */

    private constructor (url: URL, options: CLI.Options) {
        this._baseURL = url;
        this._keywordURLSets = new L.Dictionary();
        this._options = options;
        this._loadTasks = new L.Dictionary();
    }

    /* *
     *
     *  Properties
     *
     * */

    private _baseURL: URL;
    private _keywordURLSets: L.Dictionary<L.KeywordURLSet>;
    private _loadTasks: L.Dictionary<boolean>;
    private _options: CLI.Options;

    /* *
     *
     *  Functions
     *
     * */

    private copyClient (directoryPath: string, verbose?: boolean): Promise<void> {
        return new Promise((resolve, reject) => {

            if (verbose) {
                Application.log('Copy highsoft-websearch.js');
            }

            FS.copyFile(
                Path.join(__dirname, '..', '..', 'client', 'highsoft-websearch.js'),
                Path.join(directoryPath, 'highsoft-websearch.js'),
                (error) => {

                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                }
            );
        });
    }

    private createDirectory (directoryPath: string, verbose?: boolean): Promise<void> {

        if (verbose) {
            Application.log(`Create ${directoryPath}`);
        }

        return new Promise((resolve, reject) => {
            FS.mkdir(
                directoryPath,
                { recursive: true },
                (error) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                }
            );
        });
    }

    private downloadAll (depth: number, verbose?: boolean): Promise<void> {

        if (depth === 0) {
            return Promise.resolve();
        }

        const baseURL = this._baseURL;
        const baseURLString = baseURL.toString();
        const delay = this._options.delay;
        const downloadPromises: Array<Promise<void>> = [];
        const includeForeignDomains = this._options.allowForeignDomains;
        const timeout = this._options.timeout;
        const loadTasks = this._loadTasks;

        let delayFactor = 0;

        for (let loadURL of loadTasks.keys) {

            if (
                !includeForeignDomains &&
                !loadURL.startsWith(baseURLString)
            ) {
                if (verbose) {
                    Application.log(`FOREIGN DOMAIN: ${loadURL}`);
                }
                continue;
            }

            if (loadTasks.get(loadURL) === true) {
                continue;
            }
        
            try {
                downloadPromises.push(
                    Application
                        .delay(++delayFactor * delay)
                        .then(() => {
                            loadTasks.set(loadURL, true);
                            return this.downloadURL(new URL(loadURL), timeout, depth, verbose);
                        })
                );
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
                return this.downloadAll(--depth, verbose);
            });
    }

    private downloadURL (url: URL, timeout: number, depth: number, verbose?: boolean): Promise<void> {

        if (verbose) {
            Application.log(`Download ${url}`);
        }

        return CLI.Download
            .fromURL(url, timeout)
            .then((download: CLI.Download): void => {

                if (download.hasFailed) {
                    Application.log(`FAILED: ${url}`);
                    return;
                }

                download.update(
                    this._keywordURLSets,
                    (depth > 1 ? this._loadTasks : undefined)
                );
            });
    }

    private inspectAll (depth: number, verbose?: boolean): Promise<void> {

        this._loadTasks.set(this._baseURL.toString(), false);

        if (typeof this._options.sideload === 'string') {
            return this.sideloadAll(this._options.sideload, depth, verbose);
        }

        return this.downloadAll(depth, verbose);
    }

    private loadKeywordURLSets (directoryPath: string, verbose?: boolean): Promise<void> {
        return new Promise((resolve) => {

            if (
                !FS.existsSync(directoryPath) ||
                !FS.statSync(directoryPath).isDirectory()
            ) {
                resolve();
                return;
            }

            const directoryEntries = FS.readdirSync(directoryPath);
            const keywordURLSets = this._keywordURLSets;

            let keyword: (string|undefined);
            let keywordURLSet: L.KeywordURLSet;

            for (let directoryEntry of directoryEntries) {

                if (!directoryEntry.endsWith('.txt')) {
                    Application.log(`LOAD FAILED: ${Path.join(directoryPath, directoryEntry)}`);
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

    private run (): Promise<void> {

        const copyClient = this._options.copyClient;
        const depth = this._options.depth;
        const out = this._options.out;
        const verbose = this._options.verbose;

        return Promise
            .resolve()
            .then(() => verbose && Application.log('Initializing...'))
            .then(() => this.loadKeywordURLSets(out, verbose))
            .then(() => Application.log('Inspecting...'))
            .then(() => this.inspectAll(depth, verbose))
            .then(() => verbose && Application.log('Saving...'))
            .then(() => this.saveAll(out, copyClient, verbose))
            .then(() => Application.log('Done.'))
            .then(() => Application.success())
            .catch(Application.error);
    }

    private saveAll (directoryPath: string, copyClient: boolean, verbose?: boolean): Promise<void> {
        return this
            .createDirectory(directoryPath, verbose)
            .then(() => {

                const savePromises: Array<Promise<void>> = [];
                const keywordURLSets = this._keywordURLSets.values;

                let keywordURLSet: L.KeywordURLSet;

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

    private saveFile (directoryPath: string, keywordURLSet: L.KeywordURLSet, verbose?: boolean): Promise<void> {

        const filePath = Path.join(directoryPath, (keywordURLSet.keyword + '.txt'));

        if (verbose) {
            Application.log(`Save ${filePath}...`);
        }

        return new Promise((resolve, reject) => {
            FS.writeFile(
                filePath,
                (keywordURLSet + '\n'),
                (error) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                }
            );
        });
    }

    private sideloadAll (localPath: string, depth: number, verbose?: boolean): Promise<void> {

        if (depth === 0) {
            return Promise.resolve();
        }

        const baseURL = this._baseURL;
        const baseURLString = baseURL.toString();
        const sideloadPromises: Array<Promise<void>> = [];
        const loadTasks = this._loadTasks;

        let loadPath: (string|undefined);
        let loadURL: (string|undefined);

        for (loadURL of loadTasks.keys) {

            if (
                !loadURL.startsWith(baseURLString) ||
                loadTasks.get(loadURL) === true
            ) {
                continue;
            }
        
            try {
                loadTasks.set(loadURL, true);
                loadPath = Path.join(localPath, loadURL.substr(baseURLString.length));
                sideloadPromises.push(this.sideloadPath(baseURL, loadPath, depth, verbose));
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
                return this.sideloadAll(localPath, --depth, verbose);
            });
    }

    private sideloadPath(baseURL: URL, path: string, depth: number, verbose?: boolean): Promise<void> {

        if (verbose) {
            Application.log(`Sideload ${path}`);
        }

        return CLI.Sideload
            .fromPath(baseURL, path)
            .then((sideload: CLI.Sideload): void => {

                if (sideload.hasFailed) {
                    Application.log(`SIDELOAD FAILED: ${path}`);
                    return;
                }

                sideload.update(
                    this._keywordURLSets,
                    (depth > 1 ? this._loadTasks : undefined)
                );
            });
    }
}

export default Application;
