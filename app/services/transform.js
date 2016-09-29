/*jslint eqeq: true*/
/**!
 * Transport
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

/**
 * Params: siteID device path html
 * Return: html
 */

var vm = require('vm');
var Q = require('q');
//var contextify = require('contextify');

//var Q = require('q');
var TemplateParser = require('../../lib/template-parser');

var util = require('platform-common').util;
var constants = require('platform-common').constants;
var PlatformStorage = require('am-storage-pf');

var Exceptions = require('../exceptions');

//var buildStorageMgr = require('platform-model').StorageManager.buildStorageMgr;

var loadModel = require('platform-model').loadModel;
var SiteModel = loadModel('develop.Site');

var logger = require('../../lib/log');

var html2Dollar = require('../../lib/html2dollar');
var Preprocess = require('./preprocess');


//////////////////////////////////////////////////////////////////////////
// default context
var DEFAULT_CONTEXT = {
    '__template': undefined,
    '_helpers': {

    },
    '__clone': function() { // generate a clone
        var util = require('platform-common').util;
        var attrToRemove = ["select", "__clone", "_helpers", "_options"],
            data = util.assign({}, this);
        util.each(attrToRemove, function(index, item) {
            delete data[item];
        });
        return data;
    }
};

module.exports.doTransform = function(device, siteID, path, html) {

    var _used = process.memoryUsage();
    var OID, $, host, buildStorageMgr, collect, destory, blankWidgets; //, dataCollectionSandBox;
    // TODO: __root 应在不同开发环境下使用不同的地址.  比如开发环境应使用am.proxy.yunshipei.com
    var context = {
        '__device': device,
        '__lang': 'zh-CN'
        // '__stylePath': 'http://am.proxy.yunshipei.com/' + siteID + '/style.min.css',
        // '__root': 'http://am.proxy.yunshipei.com/' + siteID + '/' // TODO: 全球的.

    };

    return SiteModel.findOne('siteID', siteID).then(function(site) { // get data.js
        if (!site) {
            throw new Error('not found Site.');
        }
        host = site.host;
        OID = site._id.toString();
        buildStorageMgr = PlatformStorage.getBuiltStorage(site);
        logger.info('found site. OID: %s', OID);
        //logger.debug('found site. Site: ', site.toObject());
        if (site.ide.type === 'pro') { // 当网站是Pro版本时 加载cdn的资源.
            context.__stylePath = 'http://' + constants.URL.cdn + '/' + siteID + '/style.min.css';
            context.__root = 'http://' + constants.URL.cdn + '/' + siteID + '/'; // TODO: 全球的.
        } else { // 当网站不是Pro版本时 从开发服务器加载静态资源.
            context.__stylePath = 'http://' + constants.URL.devStatic + '/' + siteID + '/style.min.css';
            context.__root = 'http://' + constants.URL.devStatic + '/' + siteID + '/';
        }
        return buildStorageMgr.get({
            //'root': host,
            'file': 'data.' + device + '.js', // TODO: 多设备支持时, 要更改. 根据设备获取data.js
            'encoding': 'utf8'
        });
    }).then(function(data) { // eval data.js
        if (!data) {
            throw new Exceptions.NotFoundDatajsException(siteID, device);
        }

        var window = {
            location: {
                host: host
            }
        };

        logger.debug('found data.js');

        //dataCollectionSandBox = contextify();
        //dataCollectionSandBox.run('var result = ' + data);
        util.time('VM Create');
        var result = vm.runInThisContext('var window = ' + JSON.stringify(window) + ';result = ' + data);
        logger.info('VM Create Duration: %dms', util.timeEnd('VM Create'));

        //return dataCollectionSandBox.result;
        return result;
    }).then(function(data) { // parse HTML
        logger.debug('parse HTML. ');
        return html2Dollar(html, data.version || 3.0).spread(function(_$, _destory) {
            $ = _$;
            destory = _destory || function() {};
            return data;
        });
    }).then(function(data) { // processing DOM
        data._options = util.merge(data._options, Preprocess.DEFAULT_OPTIONS);
        logger.debug('processing DOM.');

        Preprocess.run($, data._options, {
            'host': host,
            'path': path
        });
        return data;
    }).then(function(data) { // build context and match page
        logger.debug('build context.');
        context = util.merge(context, DEFAULT_CONTEXT, data);

        // var __helpers = vm.runInThisContext('__helpers = ' + pkg.helpers);

        //context._helpers = util.assign({}, DEFAULT_CONTEXT._helpers, data._helpers);

        logger.debug('context: ', context.__clone);
        context.select = function(data) {
            logger.debug('start match page.');
            var page = util.find(data, function(page, pattern) {
                var reg = new RegExp(pattern, 'i');
                logger.debug('page pattern: %s ', pattern);
                return reg.test(path);
            });
            if (!page) {
                throw new Exceptions.NotMatchTemplateException(siteID, path);
            }
            return page;
        };

        logger.debug('context: ', context);

        return [context, data];
    }).spread(function(context, data) { // eval data.js block
        util.time('Data Eval Duration');
        var result = util.transform(data, function(results, value, key) {
            logger.debug('data collect block: %s', key);
            var v;
            if (util.isFunction(value)) {
                v = value($, context);
            } else {
                v = value;
            }
            results[key] = v;
        });

        result._helpers = context._helpers;
        result.__root = context.__root;
        result.__stylePath = context.__stylePath;
        //logger.debug('result: ', result);

        return result;
    }).then(function(result) {
        var page = result.content;
        if (page.redirect) { // 当前为重定向页面时

            var redirect = page.redirect;
            if (redirect.charAt(0) !== '/') {
                redirect = '/' + redirect;
            }
            return '<html><meta http-equiv="refresh" content="0;url=' + redirect + '"></html>';
        } else {

            var template = context.__template = page.template;
            //var modules = page.modules;
            logger.info('matched page: ', template);
            delete page.template;
            delete page.modules;
            delete page.device;
            result.content = util.transform(page, function(results, value, key) {
                results[key] = value($, context);
                //logger.debug('current eval data.js block: %s', key, util.inspect(results[key]));
            });
            logger.info('Data Eval Duration: %dms', util.timeEnd('Data Eval Duration'));

            collect = result;

            util.time('Read Template and Partials');
            return buildStorageMgr.get({
                //'root': host,
                'file': context.__template + '.hbs',
                'encoding': 'utf8'
            }).then(function(template) {
                blankWidgets = {};
                var promises = [];
                util.each(collect.content, function(value, key) {
                    logger.debug('widget data key: %s', key, value);
                    //TODO: 重构.
                    if (value && value.__type === 'blank') {
                        promises.push(buildStorageMgr.get({
                            'file': 'partials/' + value.widgetId + '.hbs',
                            'encoding': 'utf8'
                        }).then(function(data) {
                            logger.debug('blank widget: %s, OID: %s', key, value.widgetId);
                            logger.debug('blank widget template: %s', data);
                            blankWidgets[value.id] = data;
                        }));
                    }
                    logger.debug(value.__type === 'layout2' || value.__type === 'layout3' || value.__type === 'layout4');
                    if (value.__type === 'layout2' || value.__type === 'layout3' || value.__type === 'layout4') {
                        util.each(value.content.___AM_PRIVATE_CHILDREN, function(widgetColumn) {
                            util.each(widgetColumn, function(widget, seq) {
                                if (widget.__type === 'blank') {
                                    promises.push(buildStorageMgr.get({
                                        'file': 'partials/' + widget.widgetId + '.hbs',
                                        'encoding': 'utf8'
                                    }).then(function(data) {
                                        logger.debug('blank children widget: %s, OID: %s', seq, widget.widgetId);
                                        logger.debug('blank children widget template: %s', data);
                                        blankWidgets[widget.id] = data;
                                    }));
                                }
                            });
                        });
                    }
                });
                return Q.all(promises).then(function() {
                    logger.info('Read Template and Partials Duration: %dms', util.timeEnd('Read Template and Partials'));
                    return template;
                });
            }).then(function(template) { // render template
                util.time('Render Duration');
                logger.info('memory before: %s', util.inspect(process.memoryUsage()));
                //logger.debug('page template: %s', template);
                var allmobileHtml = TemplateParser.parse(template, collect, blankWidgets);
                //logger.debug('template compile: %s', allmobileHtml);
                logger.info('Render Duration: %dms', util.timeEnd('Render Duration'));
                destory();
                logger.info('memory before: %s', util.inspect(_used));
                //dataCollectionSandBox.dispose();
                return allmobileHtml;
            });
        }
    }).
    catch(function(err) {
        //dataCollectionSandBox.dispose();
        throw err;
    });
};