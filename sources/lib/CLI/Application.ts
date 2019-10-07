/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

import * as CLI from './index';
import * as Keywords from '../Keywords/index';
import * as URL from 'url';

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

        let url: URL.URL;

        try {
            url = new URL.URL(argv[argv.length-1]);
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

    private constructor (url: URL.URL, options: CLI.Options) {
        this._keywordFiles = {};
        this._links = [];
        this._options = options;
        this._url = url;
    }

    /* *
     *
     *  Properties
     *
     * */

    private _keywordFiles: Record<string, Keywords.KeywordFile>;
    private _links: Array<string>;
    private _options: CLI.Options;
    private _url: URL.URL;

    /* *
     *
     *  Functions
     *
     * */

    private download (url: URL.URL, depth: number): Promise<void> {

        return Keywords.KeywordDownload
            .fromURL(url, depth, this._options.timeout)
            .then(download => {
                download.addKeywordFiles(this._keywordFiles, (depth > 1 ? this._links : undefined));
            });
    }

    private run (): void {

        const depth = this._options.depth;
        const downloads: Array<Promise<void>> = [];
        const links = this._links;

        links.push(this._url.toString());

        let link: (string|undefined);
        let url: (URL.URL|undefined);

        while (typeof (link = links.shift()) === 'string') {
            try {

                url = new URL.URL(link);
                downloads.push(this.download(new URL.URL(link), depth));
            }
            catch (error) {
                // silent fail
            }
        }

        Promise
            .all(downloads)
            .then(() => console.log(this._keywordFiles))
            .catch(Application.error);
    }

}

export default Application;
