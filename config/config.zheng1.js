/**!
 * Development Configuration
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

var path = require('path');
var __amui_root = '/Volumes/data/work/amui';

var config = module.exports = {
    db: {
        uri: 'mongodb://localhost:27017/platform_development'
    },
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
    log: {
        dir: path.join(__dirname, '..', 'log'),
        level: 'debug'
    }
};
