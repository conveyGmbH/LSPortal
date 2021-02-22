﻿// service for page: mediaList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("MediaList", {
        getSketchlistView: function (isLocal) {
                return AppData.getFormatView("KontaktNotiz", 20504, isLocal);
        },
        sketchlistView: {
            select: function (complete, error, restriction, isLocal) {
                Log.call(Log.l.trace, "MediaList.");
                var ret;
                if (typeof restriction === "number") {
                    ret = MediaList.getSketchlistView(isLocal).selectById(complete, error, restriction);
                } else {
                    ret = MediaList.getSketchlistView(isLocal).select(complete, error, restriction, {
                        ordered: true,
                        orderAttribute: "KontaktNotizVIEWID",
                        desc: true
                    });
                }
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response, isLocal) {
                Log.call(Log.l.trace, "MediaList.");
                var ret = MediaList.getSketchlistView(isLocal).getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl, isLocal) {
                Log.call(Log.l.trace, "MediaList.");
                var ret = MediaList.getSketchlistView(isLocal).selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


