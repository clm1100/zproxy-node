/* jslint camelcase:false*/
/**!
 * Transform Engine - Exception
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

var util = require('platform-common').util;

var Base = require('platform-common/errors').Base;


var TYPE = module.exports.TYPE = {
    10000: 'not_match_template',
    10001: 'not_found_datajs'
};
//var logger = require('../../lib/log');

var TransformEngineException = module.exports.TransformEngineException = function(code, reason) {

    if (util.isNumber(code)) {
        this.code = code;
        this.type = TYPE[code];
        this.name = 'TransformEngineException';
    } else {
        reason = code;
    }
    // TODO: 
    TransformEngineException.super_.call(this, reason);
};
util.inherits(TransformEngineException, Base);

var NotMatchTemplateException = module.exports.NotMatchTemplateException = function(siteID, path) {

    NotMatchTemplateException.super_.call(this, 10000, util.format('not match template %s - %s', path, siteID));
    this.notifiable = false;
};
util.inherits(NotMatchTemplateException, TransformEngineException);

var NotFoundDatajsException = module.exports.NotFoundDatajsException = function(siteID, device) {

    NotFoundDatajsException.super_.call(this, 10001, util.format('not found data.js %s - %s', siteID, device));
    this.notifiable = false;
};
util.inherits(NotFoundDatajsException, TransformEngineException);
