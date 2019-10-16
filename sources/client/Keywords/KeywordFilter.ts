/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

namespace HighsoftWebsearch {

    /**
     * Contains common words, that are not useful as search terms.
     */
    const COMMON_KEYWORDS = [
        'a', 'all', 'an', 'and', 'are', 'at', 'be', 'by', 'can', 'co', 'com',
        'could', 'from', 'had', 'has', 'have', 'https', 'i', 'if', 'in', 'is',
        'it', 'my', 'net', 'no', 'of', 'on', 'or', 'org', 'our','shall',
        'should', 'that', 'the', 'their', 'they', 'this', 'to', 'was', 'we',
        'will', 'with', 'yes', 'you', 'your'
    ];

    /**
     * Regular expression to extract words from any string.
     */
    const WORD_PATTERN = /(?:^|\W)([^\d\W](?:[^\d\W]|[\-])*[^\d\W])(?=\W|$)/;

    export class KeywordFilter {

        /* *
         *
         *  Static Functions
         *
         * */

        /**
         * Loop filter for common words. Returns true if the given keyword is
         * not common.
         *
         * @param keyword
         * Keyword to check.
         */
        public static commonFilter (keyword: string): boolean {
            return (COMMON_KEYWORDS.indexOf(keyword) === -1);
        }

        /**
         * Extracts words from a content string. Returns an array of extracted
         * words.
         *
         * @param content
         * Content string to extract words from.
         */
        public static getWords (content: string): Array<string> {

            const wordPattern = new RegExp(WORD_PATTERN.source, 'gi');
            const words: Array<string> = [];

            let wordMatch: (RegExpExecArray|null);

            while ((wordMatch = wordPattern.exec(content)) !== null) {
                words.push(wordMatch[1]);
            }

            return words;
        }

        /* *
         *
         *  Constructor
         *
         * */

        private constructor () {
            // prevent public instances
        }
    }
}
