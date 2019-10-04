"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
var Arguments = (function () {
    function Arguments() {
    }
    Arguments.argumentMapper = function (argv) {
        switch (argv) {
            case '-h':
                return '--help';
            case '-v':
                return '--version';
        }
        return argv;
    };
    return Arguments;
}());
exports.Arguments = Arguments;
exports.default = Arguments;
