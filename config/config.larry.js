/**!
 * Development Configuration
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

var path = require('path');

var config = module.exports = {
    db: {
        uri: 'mongodb://localhost:27017/platform_development'
    },
    log: {
        dir: path.join(__dirname, '..', 'log'),
        level: 'debug'
    }
};
