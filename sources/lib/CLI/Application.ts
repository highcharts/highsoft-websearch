/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as CLI from './index';
import * as FS from 'fs';
import * as Keywords from '../Keywords/index';
import * as Path from 'path';

export class Application {

    /* *
     *
     *  Static Functions
     *
     * */

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
        this._keywordURLSets = {};
        this._links = [url.toString()];
        this._options = options;
    }

    /* *
     *
     *  Properties
     *
     * */

    private _keywordURLSets: Record<string, Keywords.KeywordURLSet>;
    private _links: Array<string>;
    private _options: CLI.Options;

    /* *
     *
     *  Functions
     *
     * */

    private download (url: URL, depth: number): Promise<void> {

        Application.log(`Download ${url}`);

        return CLI.Download
            .fromURL(url, this._options.timeout)
            .then(download => {
                download.addKeywordURLSets(this._keywordURLSets, (depth > 1 ? this._links : undefined));
            });
    }

    private downloadAll (): Promise<Array<void>> {

        const depth = this._options.depth;
        const downloadPromises: Array<Promise<void>> = [];
        const links = this._links;

        let link: (string|undefined);
        let url: (URL|undefined);

        while (typeof (link = links.shift()) === 'string') {
            try {
                url = new URL(link);
                downloadPromises.push(this.download(url, depth));
            }
            catch (error) {
                // silent fail
            }
        }

        return Promise.all(downloadPromises);
    }

    private prepareSaveAll(directoryPath: string): Promise<void> {

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

    private run (): Promise<void> {

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

    private save (directoryPath: string, keywordURLSet: Keywords.KeywordURLSet): Promise<void> {

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

    private saveAll (directoryPath: string): Promise<Array<void>> {

        const savePromises: Array<Promise<void>> = [];
        const keywordURLSets = Object.values(this._keywordURLSets);

        let keywordURLSet: Keywords.KeywordURLSet;

        for (keywordURLSet of keywordURLSets) {
            savePromises.push(this.save(directoryPath, keywordURLSet));
        }

        return Promise.all(savePromises);
    }
}

export default Application;
