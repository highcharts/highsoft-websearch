"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HELP = exports.VERSION = void 0;
exports.VERSION = `Version ${require(__dirname + '/../../package.json').version}`;
exports.HELP = `${exports.VERSION}

Syntax:  highsoft-websearch [Options] [URL]

Options:

--allowForeignDomains  Allow foreign domains in link levels.

--copyClient           Copy the client component into the output directory.

--delay [number]       Set the delay in milliseconds between downloads.

--depth [number]       Set the number of link levels to follow.

--help, -h             Print this help text.

--inspectIds           Inspect element IDs for potential hash URLs.

--out [directory]      Set the  directory for keyword files.

--timeout [number]     Set the timeout in milliseconds to wait for server
                       response.

--verbose, -v          Print detailed actions for each URL and keyword file.

--version              Print the version.
`;
