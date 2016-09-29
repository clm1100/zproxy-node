/**!
 * HTML to Dollar Adapter
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';


var path = require('path');
var Q = require('q');
var fs = require('fs');

var jsdom = require('jsdom');

var cheerio;

var lodash = require('lodash');

var logger = require('./log');
var util = require('platform-common').util;

try {
    cheerio = require('zpio')
} catch (e){
    logger.error(e);
    cheerio = require('cheerio');
}

var Zepto = fs.readFileSync(__dirname + '/zepto.js', 'utf8');

module.exports = function(html, version) {
    util.time('HTML to Dollar');
    var d = Q.defer();
    version = parseFloat(version) || 3.2;
    logger.debug('HTML: %s', html);
    try {
        // if (version >= 3.2) {
        logger.info('Cheerio Parsing  --Version: %s', cheerio.version);
        var $ = cheerio.load(html);
        //$.extend = lodash.extend;
        d.resolve([$]);
        // } else {
        //     logger.debug('JSDom Parsing  --version: %s', jsdom.version);
        //     jsdom.env({
        //         'html': html,
        //         //'src': [Zepto],
        //         'done': function(err, window) {
        //             if (err) {
        //                 return d.reject(err);
        //             }

        //             try {
        //                 window.run(Zepto);
        //             } catch (e) {
        //                 return d.reject(e);
        //             }
        //             d.resolve([
        //                 window.$,
        //                 function() {
        //                     window.close();
        //                     window = null;
        //                 }
        //             ]);
        //         }
        //     });
        // }
    } catch (err) {
        d.reject(err);
    }
    return d.promise.then(function(result) {
        logger.info('HTML to Dollar: %dms', util.timeEnd('HTML to Dollar'));
        return result;
    });
};