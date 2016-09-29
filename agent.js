'use strict';
var t1 = new Date();
require('newrelic');
var http = require('http');
var connect = require('connect');
var Q = require('q');
Q.longStackSupport = true;

var urlrouter = require('urlrouter');
var util = require('platform-common').util;
var model = require('platform-model');
var loadModel = require('platform-model').loadModel;
var SiteModel = loadModel('develop.Site');
var config = require('./config/config.agent.js');
var logger = require('./lib/log');
var redis = require('redis');
var dns = require('dns');
var rds = redis.createClient();

var get = function(key) {
    return Q.ninvoke(rds, 'get', key).then(function(res) {
        if (res) {
            return JSON.parse(res);
        }
    });
};

//允许通过的 siteID
var allowList = ['da6afd6e78e5149e525a077a1ec4fd67'];


var set = function(key, obj) {
    return Q.ninvoke(rds, 'set', key, JSON.stringify(obj)).then(function() {
        rds.expire(key, 20, logger.info.bind(logger, 'set ' + key + ' result:'));
    });
};
var resolve4 = Q.nfbind(dns.resolve4);
var resolveCname = Q.nfbind(dns.resolveCname);

// 1. 从Host中得到siteID, 插proxy代码
// 2. 从Host解析得到siteID, 从<siteID>.<Host>中得到回源ip, 插正式版代码
// 3. <host>.shipei.net, 从DNS解析到<siteID>.cloud.ysp.com 得到 siteID, 插proxy代码
// 4. 直接返回记录, 插入 c.ysp 代码
// 5. v2proxy 插 v2preview.ysp.com 代码
// 6. cdnproxy 插特殊的CDN代码
// 9. return 403

var regex = /^([^\.]+)\.(dev)?(v2proxy|sslproxy|cdnproxy|proxy|preview|qing|cloud)\.(ysp|yunshipei|shipei)\.(com|cn|net|org)$/;
var type3Regex = /^(.+)\.shipei\.(net)$/;

var isHostDeny = function(q) {
    var testHost = util.filter(config.denyHosts, function(denyHost) {
        return q.indexOf(denyHost) !== -1;
    });
    return testHost.length !== 0;
}

var parseQuery = function(q) {
    var record = {};
    record.query = q;
    record.oriSchema = 'http';
    if (isHostDeny(q)) {
        record.type = 9;
        logger.info('record deny %s', q);
        return record;
    }
    var regexResult = regex.exec(q);
    if (regexResult) {
        // /^([^\.]+)\.(dev)?(sslproxy|proxy|preview|qing|cloud)\.(ysp|yunshipei|shipei)\.(com|cn|net|org)$/.exec('xxxx.sslproxy.ysp.com')
        // ['xxxx.sslproxy.ysp.com', 'xxxx', undefined, 'sslproxy', 'ysp', 'com']
        // type1
        record.siteID = regexResult[1];
        record.type = 1;
        if (regexResult[3] === 'sslproxy') record.oriSchema = 'https';
        if (regexResult[3] === 'v2proxy') record.type = 5;
        if (regexResult[3] === 'cdnproxy') record.type = 6;
        return SiteModel.findBySiteID(record.siteID).then(function(site) {
            var res;
            if (!site || !site.host) return logger.info('query mongodb %s got none', record.siteID);
            var host;
            host = site.host.replace('http://', '').split('/')[0];
            record.oriIP = record.oriHost = host;
            logger.info('query mongodb %s : %s', record.siteID, host);
            return record;
        });
    } else {
        /// type2或者type3
        record.oriHost = q;
        record.type = 2;


        return resolveCname(record.query).then(function(cnameArr) {
            /// 解析域名
            var cname = cnameArr[0];
            var regexResult = regex.exec(cname);
            if (!regexResult) throw new Error(record.query + ' = ' + cname + ' ---- mismatch');
            return regexResult[1];
        }).then(function(siteID) {

            if (util.indexOf(allowList, siteID) < 0) {
                // 由于域名解析 导致服务器被关闭  由于客户有需要重新打开..   由于域名解析问题,关闭非法域名
                throw new Error(record.query + '---- not support!!!');
            }

            /// 得到 siteID
            record.siteID = siteID;
            var type3RegexResult = type3Regex.exec(record.query);
            /// 如果是type3, 直接使用Host中的原页面Host
            if (type3RegexResult) {
                record.type = 3;
                record.oriIP = record.oriHost = type3RegexResult[1];
                return record;
            } else {
                /// 如果不是type3, 继续解析得到源ip
                return resolve4(siteID + '.' + record.query).then(function(ipArr) {
                    var ip = ipArr[0];
                    if (!ip) throw new Error(record.query + ' can\'t find ip');
                    record.oriIP = ip;
                    return record;
                });
            }
        });
    }
};

var app = connect();
app.use(connect.responseTime());
app.use(function(req, res, next) {
    res.setHeader('X-Powered-By', 'yunshipei.com');
    next();
});
app.use(connect.query());
app.use(connect.urlencoded());
app.use(connect.json());
// app.use(connect.logger());
app.use(urlrouter(function(app) {
    app.get('/', function(req, res) {
        res.end('Zproxy Agent');
    });

    app.get('/get', function(req, res) {
        var q = req.query.q;
        var fromCache;
        var errHanlde = function(err) {
            logger.error(err.stack || err);
            return res.end();
        };
        try {
            get(q).then(function(value) {
                if (value) {
                    logger.info('query rds %s:', q, value);
                    fromCache = true;
                    return value;
                }
                return parseQuery(q);
            }).done(function(result) {
                if (result && !fromCache) {
                    set(result.query, result).done();
                }
                return res.end(JSON.stringify(result));
            }, errHanlde);
        } catch (e) {
            errHanlde(e)
        }
    });
}));

logger.debug('正在初始化数据库连接...');

model.connect(config.db.uri, function(err) {
    if (err) {
        logger.error(err.stack);
        throw err;
    }
    logger.debug('数据库连接成功.');
});

http.createServer(app).listen(config.port, function() { //'listening' listener
    logger.info('listen on %s, in %s ms', config.port, new Date() - t1);
});