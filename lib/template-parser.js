/**!
 * AMUI Widget Template Parse
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

var path = require('path');
var Handlebars = require('handlebars');

var fs = require('platform-common').fs;
var util = require('platform-common').util;

var config = require('../config/config');
var logger = require('../lib/log');

var AMUI_WIDGETS = {};
fs.readdir(config.amui.widget, function(err, files) {
    if (err) {
        return  logger.error(err);
    }
    util.each(files, function(file) {
        if (file.charAt('.') === '.') { // 隐藏文件不读取.
            return;
        }
        var p = path.join(config.amui.widget, file, 'src', file + '.hbs');
        fs.readFile(p, {
            encoding: 'utf8'
        }, function(err, content) {
            //Handlebars.registerPartial(file, content);
            //AMUI_WIDGETS[file] = Handlebars.precompile(content);
            AMUI_WIDGETS[file] = content;
        });
    });
});

module.exports.parse = function(template, data, /*Object*/ customPartial) {
    var local = Handlebars.create();
    /////////////////////////////////////////////////////////////////////////
    // initial handlebars helper
    var HELPERS = {
        'ifCond': function(v1, operator, v2, options) {
            switch (operator) {
                case '==':
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '<':
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=':
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>':
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=':
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
            return options.inverse(this);
        },
        'parseLayout': function(childIndex, options) {
            var self = this;

            var child = this.content.___AM_PRIVATE_CHILDREN[childIndex];
            //logger.debug(child);
            var result = [];
            util.each(child, function(childWidget) {
                var moduleName = childWidget.__type === 'blank' ? childWidget.id : childWidget.__type;
                var widgetHbs = local.partials[moduleName];
                //logger.debug(typeof widgetHbs);
                if (!widgetHbs) {
                    logger.error('unregister Module [ %s ]', moduleName)
                    return;
                }
                if (util.isFunction(widgetHbs)) {
                    result.push(widgetHbs(childWidget));
                } else {
                    var template = local.compile(widgetHbs);
                    result.push(template(childWidget));
                }
            });
            return result.join('\n');
        }
    };
    util.each(HELPERS, function(func, helperName) {
        local.registerHelper(helperName, func);
    });

    /////////////////////////////////////////////////////////////////////////
    // initial handlebars partial
    util.each(AMUI_WIDGETS, function(partial, name) {
        logger.debug('register partial: %s', name);
        local.registerPartial(name, partial); // TODO: 这里有优化空间.
    });

    util.each(customPartial, function(partial, name) {
        logger.debug('register partial(custom): %s', name);
        local.registerPartial(name, partial);
    });

    var templateFunc = local.compile(template);
    return templateFunc(data);

};