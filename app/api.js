/**!
 * API's
 * @author: yhben
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

var util = require('platform-common').util;

var config = require('../config/config');
var cookie = require('cookie');
// var jschardet = require('jschardet');
// 
// https://github.com/mooz/node-icu-charset-detector
var uncompress = require('compress-buffer').uncompress;
//var convert = require('./services/convert');
var device = require('./services/device');
var Transform = require('./services/transform');
var proxy = require('./services/proxy');


var logger = require('../lib/log');
var cache = require('../lib/cache');
var Notify = require('./mailers/notify');

module.exports.index = function(req, res) {
    res.end(config.name + '-' + config.version);
};

var isInet = function(ip) {
    return (ip === '103.250.225.178') || (ip.indexOf('192.168.') !== -1);
};

var debugMode = function(req) {
    return process.env.NODE_ENV === 'development' || isInet(req.headers['x-real-ip'] || '');
};

module.exports.convert = function(req, res) {
    // html;
    // siteID;
    // host;
    // path;
    // ua;
    // html64 base64 decode;
    var oriBuf, charset, uncompressed, iconv,
        params = req.body,
        _debugMode = debugMode(req, res);

    // if (require('../lib/prevent-spider')(params.ua)) {
    //     res.statusCode = 401;
    //     return res.end('');
    // }
    var reporter = {};
    util.each(['debug', 'error', 'info'], function(cmd) {
        reporter[cmd] = function() {
            [].push.call(arguments, '@' + params.siteID + params.path);
            logger[cmd].apply(this, arguments);
        };
    });

    req.ip = req.headers['x-real-ip'] || req.ip;
    util.time('Duration');

    var debug = {};

    var amCookie = params.cookie ? params.cookie.allmobilize : 'desktop';
    var cacheKey = util.md5(amCookie + '-' + params.ua + '-' + params.path + '-' + params.html64 || params.html);
    reporter.info('cache key: %s', cacheKey);
    //reporter.info(req.headers);
    res.writeDebug = function(msg) {
        if (_debugMode) {
            res.write(msg || '');
        }
    };
    cache.exists(cacheKey).then(function(cached) {
        if (cached) {
            return cache.get(cacheKey);
        }
    }).then(function(value) {
        var isCompressed = false;
        if (value) {
            res.write(new Buffer(value, 'binary'));
            res.write('<!-- from cache. -->');
        } else {
            params.cookie = params.cookie ? cookie.parse(params.cookie) : {};

            reporter.debug(params.siteID);

            if (!params.html64 || !params.html64.length) {
                reporter.debug('%s html64 not exists', params.siteID);
                //params.html64 = params.html || '';
            } else {
                oriBuf = new Buffer(params.html64, 'base64');
                // 如果开启转码
                util.time('ICONV Duration');
                // 1. 转buffer
                // 2. 检测编码
                // 3. 转换编码, 回utf8
                util.time('uncompress Duration');
                uncompressed = uncompress(oriBuf);
                if (uncompressed) {
                    isCompressed = true;
                    oriBuf = uncompressed;
                }
                reporter.debug('uncompress %s ms, isCompressed = %s', util.timeEnd('uncompress Duration'), isCompressed);
                params.html = oriBuf.toString('binary');
                reporter.info('ICONV Duration: %d ms', util.timeEnd('ICONV Duration'));
            }

            params.html = params.html || '';

            if (params.xhr) {
                //res.write(); // Ajax 请求不进行转码.
                return params.html;
            }

            return proxy.process(params).then(function(html) {
                return html;
            });
            ////// 现在不适用后端转码
            // if (params.proxy || params.insertCode) {
            //     return proxy.process(params).then(function(html) {
            //         return html;
            //     });
            // } else {
            //     return device.detect({
            //         ua: params.ua,
            //         host: params.host,
            //         cookie: params.cookie
            //     }).then(function(thisDevice) {
            //         params.device = thisDevice;
            //         if (thisDevice === 'desktop') {
            //             //params.html += '<div id="_allmobilizeGoMo" style="text-align: center; clear: both; padding: 0px; margin: 20px 0px; z-index: 99999;"><span style="color: rgb(255, 255, 255); margin: 0px; padding: 10px 20px; border-top-left-radius: 5px; border-top-right-radius: 5px; border-bottom-right-radius: 5px; border-bottom-left-radius: 5px; font-style: normal; font-variant: normal; font-weight: normal; font-size: 14px; line-height: normal; font-family: \'Microsoft YaHei\', SimSun, Arial, sans-serif; cursor: pointer; background: rgb(34, 34, 34);" onclick="document.cookie = \'allmobilize=desktop\';">回到云适配版</span></div>';
            //             return params.html;
            //         }

            //         reporter.info('current device: %s', thisDevice);

            //         return Transform.doTransform(thisDevice, params.siteID, params.path, params.html); // TODO: 这行逻辑移到 convert里面
            //     }).then(function(mobilizedHTML) { // success
            //         process.nextTick(function() {
            //             reporter.info('memory after:  %s', util.inspect(process.memoryUsage()));
            //         });
            //         return mobilizedHTML;
            //     });
            // }
        }
    }).catch(function(err) {
        //res.statusCode = 500;
        //reporter.error(err);
        reporter.error(err.message || err, err.stack);
        debug.error = {
            type: err.type,
            msg: err.toString()
        };
        debug.notifiable = !!err.notifiable;
        if (err.notifiable !== false) {
            Notify.bug({
                error: err,
                process: process,
                request: req
            }).done(null, function(err) {
                reporter.error('邮件通知发送错误.', err);
            });
        }
        // TODO : 重构时,优化.
        var cheerio = require('cheerio');
        var $ = cheerio.load(params.html);
        var allmobilizeScriptTag = $('#allmobilize');
        if (allmobilizeScriptTag.length) {
            allmobilizeScriptTag.remove();
        }
        return $.html();
    }).then(function(result) {
        if (result) {
            cache.put(cacheKey, result.toString());
            res.write(new Buffer(result, 'binary'));
        }
    }).done(function() {
        var duration = util.format('Duration: %dms', util.timeEnd('Duration'));
        reporter.info(duration);
        // TODO: 重构.
        if (_debugMode) {
            util.each(params, function(value, key) {
                if (value.length > 100) {
                    value = value.substring(0, 100);
                }
                debug[key] = value;
            });
        }
        //reporter.debug(result.split('\n').slice(0, 20).split('\n'));
        if (!params.xhr) {
            res.writeDebug('\n<!--\n');
            res.writeDebug('\t' + JSON.stringify(debug, null, 2));
            res.writeDebug('\n-->\n\n\n');
            res.end('<!-- ' + duration + '-->');
        } else {
            res.end();
        }
    });
};