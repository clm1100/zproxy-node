/**!
 * Default Configuration
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';


var util = require('platform-common').util;
var path = require('path');

var config = {
    port: 9091,
    log: {
        dir: path.join(__dirname, '..', 'log'),
        level: 'silly'
    },
    denyHosts: [
        '102030405060.com',
        '555miaomu.com',
        '670027.com',
        '822h.com',
        '855h.com',
        '8bie.com',
        'aocall.com',
        'aszgwl.com',
        'axsyjx.com',
        'best-metal.com',
        'eisen-v.com',
        'gzkyhb.com',
        'jxcled.com',
        'lfwxgs.com',
        'ltcsbps.com',
        'newvisioncctv.com',
        'qsphotoelectric.com',
        'sxzs0769.com',
        'syxmt.com.cn',
        'yadbw.com',
        'yuju008.com',
        '10086xy.com'
    ]
};

module.exports = require('platform-common/environments')(__dirname, config);
