"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const COMMON_KEYWORDS = [
    'a', 'all', 'an', 'and', 'are', 'at', 'be', 'by', 'can', 'com', 'could',
    'from', 'had', 'has', 'have', 'https', 'i', 'if', 'in', 'is', 'it', 'my',
    'net', 'of', 'on', 'or', 'org', 'our', 'shall', 'should', 'that', 'the',
    'their', 'they', 'this', 'to', 'was', 'we', 'will', 'with', 'you', 'your'
];
const WORD_PATTERN = /(?:^|\W)([^\d\W](?:[^\d\W]|[\-])*[^\d\W])(?:\W|$)/;
class KeywordFilter {
    static commonFilter(keyword) {
        return (COMMON_KEYWORDS.indexOf(keyword) === -1);
    }
    static getWords(content) {
        const wordPattern = new RegExp(WORD_PATTERN.source, 'gi');
        const words = [];
        let wordMatch;
        while ((wordMatch = wordPattern.exec(content)) !== null) {
            words.push(wordMatch[1]);
        }
        return words;
    }
    constructor() {
    }
}
exports.KeywordFilter = KeywordFilter;
exports.default = KeywordFilter;
