'use strict';
var t1 = new Date();
var http = require('http');
var connect = require('connect');
var Q = require('q');
Q.longStackSupport = true;

var urlrouter = require('urlrouter');
var config = require('./config/config.agent.js');
var logger = require('./lib/log');
var redis = require('redis');
var rds = redis.createClient();
var request = require('request');

var get = function(key) {
    return Q.ninvoke(rds, 'get', key).then(function(res) {
        if (res) {
            return JSON.parse(res);
        }
    });
};

var set = function(key, obj) {
    return Q.ninvoke(rds, 'set', key, JSON.stringify(obj)).then(function() {
        rds.expire(key, 30 * 60, logger.info.bind(logger, 'set ' + key + ' result:'));
    });
};

var getFromR = function(q) {
    return Q.denodeify(request)({
        url: 'http://r.yunshipei.net/get',
        qs: {
            q: q
        }
    }).spread(function(response, body) {
        if (!body || body.length === 0) throw new Error('body = ' + body);
        try {
            body = JSON.parse(body);
        } catch (e) {}
        return body;
    });
};
// getFromR('lenovocomcn.devproxy.yunshipei.com').done(console.log, console.error)

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
        res.end('Zproxy Dis Agent');
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
                return getFromR(q);
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

http.createServer(app).listen(config.port, function() { //'listening' listener
    logger.info('listen on %s, in %s ms', config.port, new Date() - t1);
});