/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

namespace HighsoftSearch {
    /**
     * A renderer of a row in the search results.
     *
     * @param search
     * The search instance as a reference for rendering.
     *
     * @param item
     * The search result in structure of a keyword item with title and URL.
     */
    export interface ResultFormatter {
        (search: Search, item?: KeywordItem): (HTMLElement|undefined);
    }
}
