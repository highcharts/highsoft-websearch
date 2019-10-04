"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
var URL_PATH_PATTERN = /^\.{0,2}\/(.*)$/;
var URLUtilities = (function () {
    function URLUtilities() {
    }
    URLUtilities.getURL = function (url) {
        try {
            return new URL(url);
        }
        catch (error) {
            return undefined;
        }
    };
    URLUtilities.getURLPath = function (urlPath) {
        try {
            if (!URL_PATH_PATTERN.test(urlPath)) {
                return undefined;
            }
            return urlPath;
        }
        catch (error) {
            return undefined;
        }
    };
    URLUtilities.isURL = function (url) {
        return (URLUtilities.getURL(url) instanceof URL);
    };
    URLUtilities.isURLPath = function (urlPath) {
        return (typeof URLUtilities.getURLPath(urlPath) === 'string');
    };
    return URLUtilities;
}());
exports.URLUtilities = URLUtilities;
exports.default = URLUtilities;
