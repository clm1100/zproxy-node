/**!
 * 嵌入一行代码.
 * @author: larry / ll@yunshipei.com
 *
 * Copyright (c) 2014 Allmobilize Inc
 */

'use strict';

// var cheerio = require('cheerio');

var config = require('../../config/config');

var TYPE_HANDLE = {
    1: 'development',
    2: 'production',
    3: 'development',
    4: 'staging',
    5: 'v2',
    6: 'production'
};

var _getMobilzeRoot = function(meta) {
    var siteID = meta.siteID;
    var env = meta.env;
    var root = 'http://' + config.static[env] + '/';
    root += siteID + '/';
    return root;
};

var _getYSPCode = function(meta) {
    meta.env = TYPE_HANDLE[meta.type];
    var siteID = meta.siteID;
    var proxy = meta.proxy;
    var jsUrl = _getMobilzeRoot(meta);
    jsUrl += 'allmobilize.min.js';
    // if (meta.env === 'development') {
    //     jsUrl += '?_t=' + Date.now(); // disable cache
    // }
    // CDN Code Hack
    if (meta.type == 6) {
        return ['<!--[if gte IE 9]>--><script charset="utf-8" id="allmobilizeE">!function(e,i){function t(){var e=/webkit|(firefox)[\\/\\s](\\d+)|(opera)[\\s\\S]*version[\\/\\s](\\d+)|(msie)[\\s](\\d+)/i.exec(navigator.userAgent);return e?e[1]&&+e[2]<4?!1:e[3]&&+e[4]<11?!1:e[5]&&+e[6]<10?!1:-1!=i.cookie.indexOf(l)?!1:!0:!1}function a(){var e={id:"allmobilize",charset:"utf-8","data-mode":"cdn",src:"',
            jsUrl,
            '"},t=i.createElement("script");for(var a in e)e.hasOwnProperty(a)&&t.setAttribute(a,e[a]);var o=i.getElementById("allmobilizeE");o.parentNode.insertBefore(t,o.nextSibling)}function o(){var e=navigator.userAgent||"";if(e.match(/MSIE\\s([\\d.]+)/)||e.match(/Trident\\/[\\d](?=[^\\?]+).*rv:([0-9.].)/)||e.match(/Firefox\\/([\\d.]+)/)){var i=\'javascript:window.location="\'+location.href+\'"\';location.href=i}else location.reload()}var l="_yspdisable=1";if(t()){e._allmobilizeReload=function(){var e=new Date;e.setTime(e.getTime()+864e5),i.cookie=l+";path=/;expire="+e.toGMTString(),o()};var n=\'<plaintext id="allmobilizeH" style="display:none">\';i.write(n),a(),setTimeout(function(){e.AMPlatform||_allmobilizeReload()},6e3)}}(window,document);</script><meta http-equiv="Cache-Control" content="no-transform " /><link rel="alternate" media="handheld" href="#" /><!--<![endif]-->'
        ].join('');
    }
// <script charset="utf-8" type="text/javascript">console.log("您正处于测试版");function charu(){var oDiv=document.createElement("div");var oText="You are in the preview version";var oBody=document.getElementsByTagName("body")[0];oDiv.style.width="280px";oDiv.style.height="30px";oDiv.style.lineHeight="30px";oDiv.style.textAlign="center";oDiv.style.color="#fff";oDiv.style.backgroundColor="rgba(22,22,22,.7)";oDiv.style.borderRadius="15px";oDiv.style.position="fixed";oDiv.style.zIndex="999";oDiv.id="alert";oDiv.style.bottom="100px";oDiv.style.left="50%";oDiv.style.marginLeft="-140px";oDiv.style.fontSize="18px";oDiv.innerHTML=oText;oBody.appendChild(oDiv);setTimeout(function(){oDiv.style.display="none"},5000)};var charu_timer=setTimeout(charu, 4000);</script>
    return '<script id="allmobilize"  date-idd="xxx" charset="utf-8" type="text/javascript" src="' +
        jsUrl + '"></script><meta http-equiv="Cache-Control" content="no-siteapp" /><link rel="alternate" media="handheld" href="#" />';
    // allmobilize script

};

var _getBaseCode = function(host, path) {
    return '<!-- <base href="http://' + host + path + '" /> -->'
}

module.exports.doEmbed = function($, meta) {
    var siteID = meta.siteID;
    var head = $('head');
    if (head.length === 0) {
        head = $.root();
    } else {
        head = $(head[0]);
    }

    if ($('script#allmobilize').length !== 0) {
        $('script#allmobilize').remove();
    }

    var yspCode = _getYSPCode(meta) + _getBaseCode(meta.host, meta.path);
    // 有head插head, 没head插html
    head.prepend(yspCode);

    // 直接插 HTML 

    // $.root().prepend(yspCode);
    return $;
};