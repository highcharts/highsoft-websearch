/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

/* *
 *
 *  Constants
 *
 * */

const URL_PATH_PATTERN = /^\.{0,2}\/(.*)$/;

/* *
 *
 *  Classes
 *
 * */

export class URLUtilities {

    /* *
     *
     *  Static Functions
     *
     * */

    public static getURL (url: string): (URL|undefined) {
        try {
            return new URL(url);
        }
        catch (error) {
            return undefined;
        }
    }

    public static getURLPath (urlPath: string): (string|undefined) {
        try {

            if (!URL_PATH_PATTERN.test(urlPath)) {
                return undefined;
            }

            return urlPath;
        }
        catch (error) {
            return undefined;
        }
    }

    public static isURL (url: string): boolean {
        return (URLUtilities.getURL(url) instanceof URL);
    }

    public static isURLPath (urlPath: string): boolean {
        return (typeof URLUtilities.getURLPath(urlPath) === 'string');
    }

    /* *
     *
     *  Constructor
     *
     * */

    private constructor() {
    }

}

export default URLUtilities;
