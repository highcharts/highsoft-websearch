/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

/**
 * Represents a search result in a keyword file.
 */
export interface KeywordItem {
    /**
     * Title of the URL.
     */
    title: string;
    /**
     * Weight of the URL.
     */
    weight: number;
    /**
     * URL of the content, that matches the search.
     */
    url: string;
}

export default KeywordItem;
