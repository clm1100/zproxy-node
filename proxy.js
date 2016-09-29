'use strict';
// require('newrelic');
var http = require('http');

var connect = require('connect');
var urlrouter = require('urlrouter');
require('q').longStackSupport = true;

var util = require('platform-common').util;
var fs = require('platform-common').fs;

var model = require('platform-model');
var config = require('./config/config');
var routes = require('./config/routes');
var logger = require('./lib/log');

// var redis = require('./service/redis');


var app = connect();
// var socketPath = config.socketPath;

// var removeSocket = function () {
//     if (fs.existsSync(socketPath)){
//         fs.unlinkSync(socketPath);
//         console.log(socketPath, 'has removed!');
//     }
// };

// var exitHandle = function () {
//     removeSocket();
//     process.exit();
// };
// var exitSign = [
//     'exit',
//     'SIGINT',
//     'SIGHUP',
//     'SIGTERM'
// ];
app.use(connect.compress());
app.use(connect.responseTime());
app.use(function(req, res, next) {
    res.setHeader('X-Powered-By', 'yunshipei.com');
    next();
});
app.use(connect.methodOverride());
app.use(connect.urlencoded({
    limit: '10mb'
}));
app.use(connect.json({
    limit: '10mb'
}));
// app.use(connect.multipart());
// app.use(connect.logger());

// API
app.use(urlrouter(routes));

logger.debug('正在初始化数据库连接...');

model.connect(config.db.uri, function(err) {
    if (err) {
        logger.error('数据库连接失败', err.stack);
        // throw err;
    }
    logger.debug('数据库连接成功.');
});

http.createServer(app).listen(config.port, function() { //'listening' listener
    logger.info('listen on', config.port);
});
// server.listen(config.port, function() { //'listening' listener
// http.createServer(app).listen(socketPath, function() { //'listening' listener
//     logger.info('server bound');
// });


// removeSocket();
// util.each(exitSign, function (sign) {
//     process.on(sign, exitHandle);
//});