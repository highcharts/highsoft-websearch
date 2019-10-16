/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

namespace HighsoftWebSearch {
    /**
     * Renders a given entry of search results.
     *
     * @param controller
     * Search controller as a reference for rendering.
     *
     * @param entry
     * Search result in structure of a keyword entry with title and URL.
     */
    export interface ResultFormatter {
        (controller: Controller, entry?: KeywordEntry): (HTMLElement|undefined);
    }
}
