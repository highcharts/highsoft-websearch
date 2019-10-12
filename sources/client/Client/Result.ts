/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

namespace HighsoftSearch {
    export interface ResultFormatter {
        (search: Search, item?: KeywordItem): void;
    }
}
