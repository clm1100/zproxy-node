/**!
 * Proxy Node - Logger
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

var log = require('platform-common').log;
var util = require('platform-common').util;
var config = require('../config/config');

var logger = log({
    ExtendConsole: {
        timestamp: function() {
            return util.getDateTime(new Date(), 'YYYY-MM-DD HH:mm:ss.SSS').grey;
        },
        level: config.log.level,
        colorize: true,
        prettyPrint: true,
        handleExceptions: true
    },
    ExtendDailyRotateFile: {
        timestamp: function() {
            return util.getDateTime(new Date(), 'YYYY-MM-DD HH:mm:ss.SSS');
        },
        prettyPrint: true,
        datePattern: '/yyyy-MM-dd.log',
        level: 'error',
        maxFiles: 15,
        filename: config.log.dir
    }
});

module.exports = logger;