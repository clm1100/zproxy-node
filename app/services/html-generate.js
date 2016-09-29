/**!
 * 使用html展示页面
 *
 * @author: zheng1 / yhben@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

var cheerio = require('cheerio');
var EmbedOneCode = require('./embed-one-code');



module.exports = function(params) {
    var $ = cheerio.load(params.html);
    var srcHeadHtml = $.html('head');
    EmbedOneCode.doEmbed($, params);
    var dstHeadHtml = $.html('head');
    // console.log(dstHeadHtml);
    return JSON.stringify({
        src: srcHeadHtml,
        dst: dstHeadHtml
    });
};