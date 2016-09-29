'use strict';

var Q = require('q');

var cheerio = require('cheerio');
var config = require('../../config/config');
var URL = require('url');
// var env = process.env.NODE_ENV || 'development';

var _getMobilzeRoot = function(siteID, proxy) {
    var root = 'http://' + config.static[proxy ? 'development' : 'production'] + '/';
    root += siteID + '/';
    return root;
};

var _getYSPCode = function(siteID, proxy) {
    var jsUrl = _getMobilzeRoot(siteID, proxy);
    jsUrl += 'allmobilize.min.js';
    if (proxy) {
        jsUrl += '?_t=' + (new Date()).getTime(); // disable cache
    }
    return '<script id="allmobilize" date-idd="convert" charset="utf-8" type="text/javascript" src="' +
        jsUrl + '"></script><script charset="utf-8" type="text/javascript"></script>'; // allmobilize script

};

var _getImgURL = function(url, host, path) {
    // console.log(url, host, path);
    return URL.resolve(URL.resolve('http://' + host + '/', path), url);
};

var _getLinkURL = function(url, host) {
    var parsedURL = URL.parse(url);
    if (host === parsedURL.host) {
        return parsedURL.path;
    } else {
        return url;
    }
};

// host=yunshipei.com:8080,
// siteID=base64,
// html=<html>,
// path=/p/a/t/h
exports.convert = function(options) {

    var d = Q.defer();
    try {
        var siteID = options.siteID;
        var $ = cheerio.load(options.html);
        var ct = $('meta[http-equiv=Content-Type]');
        // 有head插head, 没head插html
        var head = $('head').length ? $('head') : $('html');
        var yspCode = _getYSPCode(siteID, options.proxy);
        var html;

        // 开始替换
        // if (options.proxy) {
        $('img').each(function() {
            var el = $(this);
            var src = el.attr('src');
            if (!src) {
                return;
            }
            if (src.indexOf('http') === 0) {
                return;
            }
            el.attr('src', _getImgURL(src, options.host, options.path));
        });

        $('a').each(function() {
            var el = $(this);
            var href = el.attr('href');
            if (!href) {
                return;
            }
            if (href.indexOf('http') === 0) {
                return;
            }
            el.attr('href', _getLinkURL(href, options.host));
        });
        // }

        if (!options.xhr) {
            if (ct) {
                ct.attr('content', 'text/html; charset=UTF-8');
            } else {
                head.prepend('<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />');
            }

            $('script#allmobilize').remove();
            head.prepend(yspCode);
        }
        // 没html插页头
        html = head.length ? $.html() : (yspCode + $.html());
        d.resolve(html);
    } catch (err) {
        d.reject(err);
    }
    return d.promise;
};
