'use strict';

var request = require('request');
var redis = require('redis');
var rds = redis.createClient();
var util = require('platform-common').util;
var env = process.env.NODE_ENV || 'development';
var logger = require('../../lib/log');

var config = {
    platformAPI: {
        development: 'http://localhost:20000/api/sites/proxyinfo',
        production: 'http://platform.yunshipei.com/api/sites/proxyinfo'
    }
};

// redis config
rds.on('error', function(err) {
    logger.error('Redis Error ' + err);
});

var getAll = function(cb) {
    request({
        url: config.platformAPI[env],
        method: 'GET',
        form: {
            pwd: 'amadmin@2013'
        },
        json: true
    }, function(err, response, body) {
        if (!err && response.statusCode === 200) {
            cb(body);
        } else {
            logger.error(err || '[ERROR] request statusCode is ' + response.statusCode);
        }
    });
};

var setOne = function(oneRelations) {
    var handle = function(err) {
        if (err) {
            return logger.error('[ERROR]', oneRelations.siteID, oneRelations.host, ':', err);
        }
        logger.debug(oneRelations.host, 'add success!');
    };

    rds.set(oneRelations.siteID, oneRelations.siteID + ',' + oneRelations.host + ',' + (oneRelations.cms ? 'true' : ''), handle);
    rds.set(oneRelations.host, oneRelations.siteID + ',' + oneRelations.ip + ',' + (oneRelations.cms ? 'true' : ''), handle);
};

var setAll = function(allRelations) {
    util.each(allRelations, function(oneRelations) {
        setOne(oneRelations);
    });
};


exports.run = function() {
    getAll(setAll);
};

exports.setOne = setOne;

exports.setAll = setAll;