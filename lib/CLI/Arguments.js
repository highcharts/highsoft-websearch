"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
class Arguments {
    static argumentMapper(argv) {
        switch (argv) {
            case '-h':
                return '--help';
            case '-v':
                return '--version';
        }
        return argv;
    }
    constructor() {
    }
}
exports.Arguments = Arguments;
exports.default = Arguments;
