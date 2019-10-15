/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as CLI from './index';
import * as FS from 'fs';
import * as L from '../index';
import * as Path from 'path';
import { KeywordURLSet } from '../Keywords';

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

        const argv = process.argv.slice(2).map(CLI.Options.argumentMapper);

        if (argv.includes('--help') || argv.length === 0) {
            Application.success(CLI.HELP);
            return;
        }

        if (argv.includes('--version')) {
            Application.success(CLI.VERSION);
            return;
        }

        let url: URL;

        try {
            url = new URL(argv[argv.length-1]);
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

    private createDirectory (directoryPath: string): Promise<void> {

        Application.log(`Create ${directoryPath}`);

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

    private downloadAll (depth: number): Promise<void> {

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
                            return this.downloadURL(new URL(loadURL), timeout, depth);
                        })
                );
            }
            catch (error) {
                // silent fail
            }
        }

        return Promise
            .all(downloadPromises)
            .then(() => {
                return this.downloadAll(--depth);
            });
    }

    private downloadURL (url: URL, timeout: number, depth: number): Promise<void> {

        Application.log(`Download ${url}`);

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

    private loadAll (depth: number): Promise<void> {

        this._loadTasks.set(this._baseURL.toString(), false);

        if (typeof this._options.sideload === 'string') {
            return this.sideloadAll(this._options.sideload, depth);
        }

        return this.downloadAll(depth);
    }

    private prepareKeywordURLSets (directoryPath: string): Promise<void> {
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
            let keywordURLSet: KeywordURLSet;

            for (let directoryEntry of directoryEntries) {

                if (!directoryEntry.endsWith('.txt')) {
                    continue;
                }

                try {
                    keyword = Path.basename(directoryEntry, Path.extname(directoryEntry));
                    keywordURLSet = new KeywordURLSet(keyword, FS.readFileSync(Path.join(directoryPath, directoryEntry)).toString());
                    keywordURLSets.set(keyword, keywordURLSet);
                }
                catch (error) {
                    // silent fail
                }
            }

            resolve();
        });
    }

    private run (): Promise<void> {

        const depthOptions = this._options.depth;
        const outOptions = this._options.out;

        return Promise
            .resolve()
            .then(() => this.prepareKeywordURLSets(outOptions))
            .then(() => this.loadAll(depthOptions))
            .then(() => this.saveAll(outOptions))
            .then(() => 'Done.')
            .then(Application.success)
            .catch(Application.error);
    }

    private saveAll (directoryPath: string): Promise<Array<void>> {
        return this
            .createDirectory(directoryPath)
            .then(() => {

                const savePromises: Array<Promise<void>> = [];
                const keywordURLSets = this._keywordURLSets.values;

                let keywordURLSet: L.KeywordURLSet;

                for (keywordURLSet of keywordURLSets) {
                    savePromises.push(this.saveFile(directoryPath, keywordURLSet));
                }

                return Promise.all(savePromises);
            });
    }

    private saveFile (directoryPath: string, keywordURLSet: L.KeywordURLSet): Promise<void> {

        const filePath = Path.join(directoryPath, (keywordURLSet.keyword + '.txt'));

        // Application.log(`Save ${filePath}...`);

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

    private sideloadAll (localPath: string, depth: number): Promise<void> {

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
                sideloadPromises.push(this.sideloadPath(baseURL, loadPath, depth));
            }
            catch (error) {
                // silent fail
            }
        }

        return Promise
            .all(sideloadPromises)
            .then(() => {
                return this.sideloadAll(localPath, --depth);
            });
    }

    private sideloadPath(baseURL: URL, path: string, depth: number): Promise<void> {

        Application.log(`Sideload ${path}`);

        return CLI.Sideload
            .fromPath(baseURL, path)
            .then((sideload: CLI.Sideload): void => {

                if (sideload.hasFailed) {
                    Application.log(`FAILED: ${path}`);
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
