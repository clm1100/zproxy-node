/**!
 * Production Configuration
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2013 Allmobilize Inc
 */

'use strict';

var path = require('path');

var __amui_root = '/root/common/amuisrcdeploy';
var config = module.exports = {
    db: {
        uri: 'mongodb://192.168.10.202/platform_production'
    },
    static: {
        development: 'preview.ysp.com'
    },
    session: {
        cookie: {
            domain: ".ysp.com"
        }
    },
    amui: {
        root: __amui_root,
        widget: path.join(__amui_root, 'widget'),
        built: '__amui.min.js',
        src: 'src',
        baseLessPath: path.join(__amui_root, 'less'),
        distPath: path.join(__amui_root, 'dist'),
        baseJSPath: path.join(__amui_root, 'js')
    },
    log: {
        dir: path.join(__dirname, '..', 'log'),
        level: 'debug'
    }
};
