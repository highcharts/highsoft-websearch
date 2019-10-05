"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
const COMMON_KEYWORDS = [
    'a', 'an', 'and', 'are', 'at', 'be', 'by', 'can', 'com', 'could', 'from',
    'had', 'has', 'have', 'https', 'i', 'if', 'in', 'is', 'it', 'my', 'net',
    'of', 'on', 'or', 'org', 'our', 'shall', 'should', 'that', 'the', 'their',
    'they', 'this', 'to', 'was', 'we', 'will', 'with', 'you', 'your'
];
class KeywordFilter {
    static commonFilter(keyword) {
        return !COMMON_KEYWORDS.includes(keyword);
    }
    constructor() {
    }
}
exports.KeywordFilter = KeywordFilter;
exports.default = KeywordFilter;
