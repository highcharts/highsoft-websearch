"use strict";
/*!*
 *
 *  Copyright (C) Highsoft AS
 *
 * */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var I = require("./index");
var URL_INSPECTOR_PATTERN = /[\w\.\-]+/g;
var URLInspector = (function (_super) {
    __extends(URLInspector, _super);
    function URLInspector() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    URLInspector.prototype.getKeywords = function () {
        try {
            return (URL_INSPECTOR_PATTERN.exec(this.content) || []);
        }
        finally {
            URL_INSPECTOR_PATTERN.lastIndex = 0;
        }
    };
    URLInspector.prototype.getKeywordWeight = function (keyword) {
        var content = this.content;
        var length = content.length;
        if (length === 0) {
            return 0;
        }
        var index = 0;
        var weight = 0;
        while (index !== -1) {
            if (index > 0) {
                weight += (100 - Math.round((index / length) * 100));
            }
            index = content.indexOf(keyword, index);
        }
        return weight;
    };
    URLInspector.prototype.getLinks = function () {
        return [];
    };
    return URLInspector;
}(I.Inspector));
exports.URLInspector = URLInspector;
exports.default = URLInspector;
