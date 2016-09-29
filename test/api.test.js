/**!
 * API - /convert Test Case
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

//var assert = require("assert");
var request = require('request');

var config = require('../config/config');

var fs = require('platform-common').fs;
var util = require('platform-common').util;

describe('convert api ', function() {

    it('should convert api success', function(done) {

        var form = {
            //'ua': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.5 Safari/537.36',
            'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53',
            'siteID': '553ef0f71a4da3d3f2c0ab2729d1a13f',
            'host': 'www.jinling.com',
            'path': '/Join/',
            'html': '',
            'html64': ''
        };

        request.get('http://' + form.host + form.path, function(err, response, body) {
            if (err) {
                return done(err);
            }
            form.html = body;
            form.html64 = util.base64(body);
            request({
                'method': 'post',
                'url': 'http://127.0.0.1:' + config.port + '/convert',
                'headers': {
                    'Host': 'http://127.0.0.1',
                    'Connection': 'keep-alive',
                    'Cache-Control': 'max-age=0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.5 Safari/537.36',
                    'Accept-Encoding': 'gzip,deflate,sdch',
                    'Accept-Language': 'zh-CN,zh;q=0.8'
                },
                'form': form
            }, function(err, response, body) {
                if (err) {
                    return done(err);
                }
                fs.outputFile(__dirname + '/.result.html', body, function(err) {
                    if (err) {
                        console.error(err);
                    }
                });
                //console.log('====================================================================');
                console.log(body);
                done();
            });
        });
    });

    it('should convert api success', function(done) {

        var form = {
            //'ua': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.5 Safari/537.36',
            'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53',
            'siteID': 'dc562dbfe7032e6602261e377fa54d47',
            'host': 'www.weimingfj.com',
            'path': '/',
            'html': '',
            'html64': ''
        };
        // var form = {
        //     'ua': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.5 Safari/537.36',
        //     'siteID': '3669a65977b61dc14fd49d057aca4952',
        //     'host': 'www.google.com',
        //     'path': '/',
        //     'html': '',
        //     'html64': ''
        // };

        request.get('http://' + form.host + form.path, function(err, response, body) {
            if (err) {
                return done(err);
            }
            form.html = body;
            form.html64 = util.base64(body);
            request({
                'method': 'post',
                'url': 'http://127.0.0.1:' + config.port + '/convert',
                'headers': {
                    'Host': 'http://127.0.0.1',
                    'Connection': 'keep-alive',
                    'Cache-Control': 'max-age=0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.5 Safari/537.36',
                    'Accept-Encoding': 'gzip,deflate,sdch',
                    'Accept-Language': 'zh-CN,zh;q=0.8'
                },
                'form': form
            }, function(err, response, body) {
                if (err) {
                    return done(err);
                }
                fs.outputFile(__dirname + '/.result.html', body, function(err) {
                    if (err) {
                        console.error(err);
                    }
                });
                //console.log('====================================================================');
                console.log(body);
                done();
            });
        });

        // fs.readFile(__dirname + '/convert.testcase', {
        //     'encoding': 'utf8'
        // }, function(err, data) {
        //     if (err) {
        //         return done(err);
        //     }
        //     form.html = data;
        //     request({
        //         'method': 'post',
        //         'url': 'http://127.0.0.1:' + config.port + '/convert',
        //         'headers': {
        //             'Host': 'http://127.0.0.1',
        //             'Connection': 'keep-alive',
        //             'Cache-Control': 'max-age=0',
        //             'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        //             'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.5 Safari/537.36',
        //             'Accept-Encoding': 'gzip,deflate,sdch',
        //             'Accept-Language': 'zh-CN,zh;q=0.8'
        //         },
        //         'form': form
        //     }, function(err, response, body){
        //         if(err){
        //             return done(err);
        //         }
        //         console.log('====================================================================');
        //         console.log(body);
        //         done();
        //     });
        // });
    });
});