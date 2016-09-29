/**!
 * DevProxy
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

var Q = require('q');
var cheerio = require('cheerio');

var EmbedOneCode = require('./embed-one-code');
var Preprocess = require('./preprocess');

module.exports.process = function(params) {
    var d = Q.defer();
    try {
        var $ = cheerio.load(params.html, {
            normalizeWhitespace: false,
            xmlMode: false,
            decodeEntities: false
        });

        params.base = $('base').attr('href') || 'http://' + params.host + params.path;

        // 插入一行代码.
        EmbedOneCode.doEmbed($, params);
        
        // dom处理
        Preprocess.run($, {}, params);
        d.resolve($.html());
    } catch (e) {
        d.reject(e);
    }
    return d.promise;
};