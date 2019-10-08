/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

const COMMON_KEYWORDS = [
    'a', 'all', 'an', 'and', 'are', 'at', 'be', 'by', 'can', 'com', 'could',
    'from', 'had', 'has', 'have', 'https', 'i', 'if', 'in', 'is', 'it', 'my',
    'net', 'of', 'on', 'or', 'org', 'our','shall',  'should', 'that', 'the',
    'their', 'they', 'this', 'to', 'was', 'we', 'will', 'with', 'you', 'your'
];

const WORD_PATTERN = /[A-z](?:[\w\-\.]*[A-z])?/;

export class KeywordFilter {

    /* *
     *
     *  Static Functions
     *
     * */

    public static commonFilter (keyword: string): boolean {
        return (COMMON_KEYWORDS.indexOf(keyword) === -1);
    }

    public static getWords (content: string): Array<string> {

        const wordPattern = new RegExp(WORD_PATTERN.source, 'gi');

        return (content.match(wordPattern) || []);
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

export default KeywordFilter;
