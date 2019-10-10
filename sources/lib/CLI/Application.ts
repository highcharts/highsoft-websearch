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

        const argv = process.argv.map(CLI.Options.argumentMapper);

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
        this._domain = url.protocol + '//' + url.hostname + '/';
        this._keywordURLSets = new L.Dictionary();
        this._options = options;
        this._urlDownloads = new L.Dictionary();
        this._urlDownloads.set(url.toString(), false);
    }

    /* *
     *
     *  Properties
     *
     * */

    private _domain: string;
    private _keywordURLSets: L.Dictionary<L.KeywordURLSet>;
    private _options: CLI.Options;
    private _urlDownloads: L.Dictionary<boolean>;

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

        const delay = this._options.delay;
        const domain = this._domain;
        const downloadPromises: Array<Promise<void>> = [];
        const urlDownloads = this._urlDownloads;
        const includeForeignDomains = this._options.allowForeignDomains;
        const timeout = this._options.timeout;

        let delayFactor = 0;

        for (let url of urlDownloads.keys) {

            if (
                !includeForeignDomains &&
                !url.startsWith(domain)
            ) {
                continue;
            }

            if (urlDownloads.get(url) === true) {
                continue;
            }
        
            try {
                downloadPromises.push(
                    Application
                        .delay(++delayFactor * delay)
                        .then(() => this.downloadURL(new URL(url), timeout, depth))
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

        const urlDownloads = this._urlDownloads;

        Application.log(`Download ${url}`);

        urlDownloads.set(url.toString(), true);

        return CLI.Download
            .fromURL(url, timeout)
            .then((download: CLI.Download): void => {
                download.update(
                    this._keywordURLSets,
                    (depth > 1 ? urlDownloads : undefined)
                );
            });
    }

    private run (): Promise<void> {
        return Promise
            .resolve()
            .then(() => this.downloadAll(this._options.depth))
            .then(() => this.saveAll(this._options.out))
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

        Application.log(`Save ${filePath}...`);

        return new Promise((resolve, reject) => {
            FS.writeFile(
                filePath,
                keywordURLSet.toString(),
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
}

export default Application;
