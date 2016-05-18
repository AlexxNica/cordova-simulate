// Copyright (c) Microsoft Corporation. All rights reserved.
// Based in part on code from Apache Ripple, https://github.com/apache/incubator-ripple

var init = function () {
    console.log("xhr proxy initialized!");
    augmentXHR();
};

var isSameOriginRequest = function (url) {
    url = parseUrl(url);

    if (url.port !== location.port) {
        return false;
    }

    var sameOrigin = url.href.match(location.origin.replace(/www\./, '')) ||
        !url.href.match(/^https?:\/\/|^file:\/\//);

    return !!sameOrigin;
};

var parseUrl = function (url) {
    var a = document.createElement("a");

    a.href = url;

    return {
        href: a.href,
        host: a.host,
        origin: a.origin,
        port: a.port,
        protocol: a.protocol,
        search: a.search
    };
};

var augmentXHR = function () {
    var _XMLHttpRequest = XMLHttpRequest;
    window.XMLHttpRequest = function () {
        var xhr = new _XMLHttpRequest(),
            origMethods = {
                setRequestHeader: xhr.setRequestHeader,
                open: xhr.open
            };

        xhr.setRequestHeader = function (header) {
            // This is done to get around jQuery 1.3.2 setting a header that it shouldn't
            if (header && header.toUpperCase() !== "X-REQUESTED-WITH") {
                origMethods.setRequestHeader.apply(xhr, Array.prototype.slice.call(arguments));
            }
        };

        xhr.open = function (method, url) {
            var sameOrigin = isSameOriginRequest(url);

            if (!sameOrigin) {
                url = "/xhr_proxy?rurl=" + escape(url);
            }

            origMethods.open.apply(xhr, Array.prototype.slice.call(arguments));

            if (!sameOrigin) {
                xhr.setRequestHeader("X-Cordova-Simulate-User-Agent", navigator.userAgent);
            }
        };

        return xhr;
    };
};

module.exports = {
    init: init
}