/**!
 * 转码之前进行的预处理工作.
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

var URL = require('url');

var util = require('platform-common').util;

var logger = require('../../lib/log');

//////////////////////////////////////////////////////////////////////////
// DOM Processing Handler
module.exports.DEFAULT_OPTIONS = {
    openLinkInSameWindow: false, // remove 'target=_blank' attribute of <a>
    removeStyle: true, // remove ‘style' attribute of every element
    cleanImg: false, // remove 'width' and 'height' of <img>, <input type="image">
    cleanTable: false, // remove 'width', 'height', 'bgcolor' of <table>, <td>, <th>
    cleanFrame: false, // remove 'width' of <iframe>
    cleanEmbed: false // remove 'width' of <embed>
};

var STYLE = "style",
    ATTR_WIDTH = "width",
    ATTR_HEIGHT = "height";

var _getLinkURL = function(url, host) {
    var parsedURL = URL.parse(url);
    if (host === parsedURL.host) {
        return parsedURL.path;
    } else {
        return url;
    }
};

var DOM_PROCESSING_HANDLER = {
    openLinkInSameWindow: function($) {
        $('a').removeAttr('target');
    },
    removeStyle: function($) {
        $('*').removeAttr(STYLE);
        $(STYLE).remove();
    },
    cleanImg: function($) {
        $('img, input[type="image"]')
            .removeAttr(ATTR_HEIGHT)
            .removeAttr(ATTR_WIDTH)
            .removeAttr('align');
    },
    cleanTable: function($) {
        $('table')
            .removeAttr(ATTR_HEIGHT)
            .removeAttr(ATTR_WIDTH);
        $('tr, th, td')
            .removeAttr(ATTR_HEIGHT)
            .removeAttr(ATTR_WIDTH)
            .removeAttr('bgcolor');
    },
    cleanFrame: function($) {
        $('iframe').removeAttr(ATTR_WIDTH);
    },
    cleanEmbed: function($) {
        $('embed').removeAttr(ATTR_WIDTH);
    }
};

var BUILT_IN_HANDLER = {
    addImgXsrc: function($) {
        $('img').each(function() {
            var self = $(this);
            self.attr('x-src', self.attr('src'));
        });
    },
    convertAddressToAbsoluteForIMG: function($, params) {
        $('img').each(function() {
            var el = $(this);
            var src = el.attr('src');
            if (!src) {
                return;
            }
            if (src.indexOf('http') === 0) {
                return;
            }
            el.attr('src', URL.resolve(params.base, src));
        });
    },
    convertAddressToAbsoluteForCSS: function($, params) {
        $('link').each(function() {
            var el = $(this);
            var href = el.attr('href');
            if (!href) {
                return;
            }
            if (href.indexOf('http') === 0) {
                return;
            }
            el.attr('href', URL.resolve(params.base, href));
        });
    },
    convertAddressToAbsoluteForJS: function($, params) {
        $('script').each(function() {
            var el = $(this);
            var src = el.attr('src');
            if (!src) {
                return;
            }
            if (src.indexOf('http') === 0) {
                return;
            }
            el.attr('src', URL.resolve(params.base, src));
        });
    },
    convertAddressToRelativeForLink: function($, params) {
        $('a').each(function() {
            var el = $(this);
            var href = el.attr('href');
            if (!href) {
                return;
            }

            if (!/http:\/\//.test(href)) { // 如果是相对地址 直接跳过. 如 /path/a.html
                return;
            }
            el.attr('href', _getLinkURL(href, params.host));
        });
    }
};


module.exports.run = function runDOMProcessing($, options, params) {
    util.time('DOM Processing');

    util.each(options, function(value, option) {
        if (value) {
            var handler = DOM_PROCESSING_HANDLER[option];
            if (handler) {
                handler($, params);
            }
        }
    });
    util.each(BUILT_IN_HANDLER, function(func) {
        func($, params);
    });
    logger.info('DOM Processing Duration: %dms', util.timeEnd('DOM Processing'));
    return $;
};