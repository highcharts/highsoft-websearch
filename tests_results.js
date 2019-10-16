/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */

const ChildProcess = require('child_process');
const ClientPath = require('path').posix;
const FS = require('fs');
const HTTP = require('http');
const ServerPath = require('path');

const CONFIGURATION = {
    baseDirectory: process.cwd(),
    serverPort: 8000
};

const CONTENT_TYPES = {
    '.bin': 'application/octet-stream',
    '.css': 'text/css',
    '.gif': 'image/gif',
    '.htm': 'text/html',
    '.html': 'text/html',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg',
    '.txt': 'text/plain'
};

function onClientError (error, socket) {
    console.error(error);
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
}

function onError (error) {
    console.error(error);
    process.exit(1);
}

function responseNotFound (response) {
    console.info('=> 404 Not Found');
    response.writeHead(404, 'Not Found');
    response.end();
}

function responseNotSupported (response) {
    console.info('=> 405 Method Not Allowed');
    response.writeHead(405, 'Method Not Allowed');
    response.end();
}

function responseRedirect (response, location) {
    console.info('=> 303 See Other');
    response.writeHead(303, 'See Other', { 'Location': location });
    response.end();
}

function serve (request, response) {

    const baseDirectory = CONFIGURATION.baseDirectory;
    const requestedClientPath = request.url;
    const requestedMethod = request.method;
    const requestedServerPath = ServerPath.join(baseDirectory, request.url);

    console.info(`${requestedMethod} ${requestedClientPath}`);

    switch (requestedMethod) {
        default:
            responseNotSupported(response);
            return;
        case 'GET':
        case 'HEAD':
            break;
    }

    if (
        !requestedServerPath.startsWith(baseDirectory) ||
        !FS.existsSync(requestedServerPath)
    ) {
        responseNotFound(response);
        return;
    }

    const requestServerStats = FS.statSync(requestedServerPath);

    if (requestServerStats.isDirectory()) {
        responseRedirect(response, ClientPath.join(requestedClientPath, 'index.html'));
        return;
    }

    let contentLength = requestServerStats.size;
    let contentType = (CONTENT_TYPES[ServerPath.extname(requestedServerPath)] || CONTENT_TYPES['.bin']);

    if (response.finished) {
        return;
    }

    response.writeHead(
        200,
        {
            'Content-Length': contentLength,
            'Content-Type': contentType
        }
    );

    if (requestedMethod === 'HEAD') {
        response.end();
    }
    else {
        response.end(FS.readFileSync(requestedServerPath));
    }
}

HTTP
    .createServer(serve)
    .on('clientError', onClientError)
    .on('error', onError)
    .listen(CONFIGURATION.serverPort, () => {

        const host = 'localhost:' + CONFIGURATION.serverPort;
        const hostURL = 'http://' + host + '/tests_results.html';

        console.info(`Listening on ${host}...`);

        switch (process.platform) {
            default:
                ChildProcess.exec('xdg-open ' + hostURL);
                break;
            case 'darwin':
                ChildProcess.exec('open ' + hostURL);
                break;
            case 'win32':
                ChildProcess.exec('cmd /c start ' + hostURL);
                break;
        }
    });
