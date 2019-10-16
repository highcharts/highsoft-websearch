/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

namespace HighsoftWebSearch {
    /**
     * Represents a search result in a keyword file.
     */
    export interface KeywordEntry {
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
}
