/**!
 * Transport test case
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

// var assert = require("assert");
// var request = require('request');

// var model = require('platform-model');
// var util = require('platform-common').util;

// var Transport = require('../app/transport');

// describe('Transport ', function() {

//     it('should open db', function(done) {
//         model.connect('mongodb://localhost:27017/platform_development', function(err) {
//             if (err) {
//                 return done(err);
//             }
//             done();
//         });
//     });

//     it('should transport success', function(done) {

//         var host = 'https://www.google.com';
//         var siteID = '3669a65977b61dc14fd49d057aca4952';
//         var path = '/';

//         var url = 'http://localhost:9091/' + siteID;


//         request.get(host, function(err, res, body) {
//             assert.equal(err, undefined);
//             //console.log(body);
//             Transport.doTransport(siteID, path, body).done(function(mobilized) {
//                 console.log(mobilized);
//                 done();
//             }, function(err){
//                 console.log(err);
//                 done(err);
//             });
//         });
//     });

//     it('should close db', function(done) {
//         model.close(function(err) {
//             if (err) {
//                 return done(err);
//             }
//             done();
//         });
//     });
// });