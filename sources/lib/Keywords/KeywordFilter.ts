/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

const COMMON_KEYWORDS = [
    'a', 'an', 'and', 'are', 'at', 'be', 'by', 'can', 'com', 'could', 'from',
    'had', 'has', 'have', 'https', 'i', 'if', 'in', 'is', 'it', 'my', 'net',
    'of', 'on', 'or', 'org', 'our','shall',  'should', 'that', 'the', 'their',
    'they', 'this', 'to', 'was', 'we', 'will', 'with', 'you', 'your'
];

export class KeywordFilter {

    /* *
     *
     *  Static Functions
     *
     * */

    public static commonFilter (keyword: string): boolean {
        return !COMMON_KEYWORDS.includes(keyword)
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
