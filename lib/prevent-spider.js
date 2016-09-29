/**!
 * Prevent Spider
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

var spiders = /spider\-ads|Baiduspider|Googlebot|Googlebot\-Image|Adsbot\-Google|Googlebot\-Mobile|Mediapartners\-Google|yahoo\-slurp|slurp|msnbot|msnbot\-newsblogs|msnbot\-products|msnbot\-media|www.aibang.com|aibang.com|aibang|aibangspider|aibang\-spider|aibangbot|aibang\-bot/

module.exports = function(ua) {
    return spiders.test(ua);
}