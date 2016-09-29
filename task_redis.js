'use strict';

var config = {
    port: 9999
};

var cronJob = require('cron').CronJob;
var http = require('http');
var connect = require('connect');
var urlrouter = require('urlrouter');

var logger = require('./lib/log');


var app = connect();
var relation = require('./app/services/relation');

var validate = function(str) {
    return str !== 'amadmin@2013';
};

// autotask config
var task = new cronJob({
    cronTime: '00 * * * * *',
    onTick: function() {
        relation.run();
    },
    start: false
});
task.start();

// connect.setting
app.use(connect.responseTime());
app.use(function(req, res, next) {
    res.setHeader('X-Powered-By', 'yunshipei.com');
    next();
});
app.use(connect.methodOverride());
app.use(connect.urlencoded());
app.use(connect.json());
// app.use(connect.multipart());
app.use(connect.logger());

// API
app.use(urlrouter(function(app) {
    app.get('/', function(req, res) {
        res.end(config.name, config.version);
    });

    app.post('/add', function(req, res) {
        //console.log(req.body.pwd);
        if (!req.body.pwd || validate(req.body.pwd)) {
            return res.end();
        }
        relation.setOne(req.body.site);
    });
}));

// http listen
http.createServer(app).listen(config.port, function() { //'listening' listener
    logger.info('listen on', config.port);
});
