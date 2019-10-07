/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

export const VERSION = `Version ${require(__dirname + '/../../package.json').version}`;

export const HELP = `${VERSION}

Syntax:  highsoft-search [Options] [URL]

Options:

--allowForeignDomains  Allow foreign domains in link levels.

--depth [number]       Set number of link levels to follow.

--help, -h             Prints this help text.

--out [directory]      Set output directory for keyword files.

--timeout [number]     Set timeout in milliseconds to wait for server response.

--version, -v          Prints the version.
`;
