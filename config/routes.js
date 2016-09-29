/**!
 * Routes
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

var api = require('../app/api');

module.exports = function(app) {
    app.get('/', api.index);
    app.post('/convert', api.convert);
}
