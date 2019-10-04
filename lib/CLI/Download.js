"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
var HTTPS = require("https");
var L = require("../index");
var Download = (function () {
    function Download(url, depth, response) {
        this._depth = depth;
        this._response = response;
        this._url = url;
    }
    Download.fromURL = function (url, depth, timeout) {
        return new Promise(function () { return HTTPS.get(url.toString(), {
            method: 'GET',
            timeout: timeout
        }, function (response) { return new Download(url, depth, response); }); });
    };
    Object.defineProperty(Download.prototype, "depth", {
        get: function () {
            return this._depth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Download.prototype, "hasFailed", {
        get: function () {
            var statusCode = this._response.statusCode;
            return (typeof statusCode === 'undefined' || statusCode >= 400);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Download.prototype, "url", {
        get: function () {
            return this._url;
        },
        enumerable: true,
        configurable: true
    });
    Download.prototype.getInspectors = function () {
        var inspectors = [];
        inspectors.push(new L.URLInspector(this._url.toString()));
        return inspectors;
    };
    return Download;
}());
exports.Download = Download;
exports.default = Download;
