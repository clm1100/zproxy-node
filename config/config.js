/**!
 * Default Configuration
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

var path = require('path');

var pkg = require('../package.json');
var util = require('platform-common').util;

if (!process.env.NODE_ENV) {
    throw new Error('请设置NODE_ENV变量.');
}

var __amui_root = '/Volumes/work/amui'; // path.join(__dirname, '..', '..', 'amui');

var config = {
    name: pkg.name,
    version: pkg.version,
    port: 9090,
    static: {
        development: 'preview.yunshipei.com',
        production: 'a.yunshipei.com',
        staging: 'c.yunshipei.com',
        v2: 'v2preview.yunshipei.com'
    },
    mainPath: path.resolve(__dirname, '../'),
    configPath: __dirname,
    socketPath: path.resolve(__dirname, '../app.socket'),
    /**
     * AMUI 配置
     */
    amui: {
        root: __amui_root,
        widget: path.join(__amui_root, 'widget'),
        built: '__amui.min.js',
        src: 'src',
        baseLessPath: path.join(__amui_root, 'less'),
        distPath: path.join(__amui_root, 'dist'),
        baseJSPath: path.join(__amui_root, 'js'),
        widgetData: 'api_data.json',
        widgetContent: 'api_content.js',
        widgetGUI: 'api_gui.json'
    },
    /**
     * 日志目录
     */
    log: {
        dir: path.join(__dirname, '..', 'log'),
        level: 'silly'
    }
};

module.exports = require('platform-common/environments')(__dirname, config);
