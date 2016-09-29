/**!
 * Notify
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

var Mailer = require('platform-common/mailer');
var util = require('platform-common').util;
var fs = require('platform-common').fs;
var Q = require('q');

var mailer = new Mailer({
    user: 'sys-robot@yunshipei.com',
    password: 'html5.js'
});

var denyNotify = {
    'not_defined': 1
};

var bugTemplate = fs.readFileSync(__dirname + '/emails/bug.tpl');

module.exports.bug = function(data) {
    if (denyNotify[data.error.type]) return Q();

    data.error.type = data.error.type || data.error.message;
    var message = {
        from: 'robot <sys-robot@yunshipei.com>',
        to: 'Bugs <bugs@yunshipei.com>',
        subject: 'BUG: ' + data.error.type,
        text: '',
        html: util.template(bugTemplate, data)
    };
    return mailer.send(message);
};

module.exports.monitor = function() {

};

module.exports.crash = function() {

};
