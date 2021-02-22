﻿// service for page: svgMedia
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("SvgMedia", {
        getSketchDocView: function (isLocal) {
                return AppData.getFormatView("KontaktNotiz", 20505, isLocal);
        },
        sketchDocView: {
            select: function (complete, error, recordId, isLocal) {
                Log.call(Log.l.trace, "svgSketchView.");
                var ret = SvgMedia.getSketchDocView(isLocal).selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },

        getSketchView: function (isLocal) {
            return AppData.getFormatView("KontaktNotiz", 0, isLocal);
        },
        sketchView: {
            insert: function (complete, error, viewResponse, isLocal) {
                Log.call(Log.l.trace, "svgSketchView.");
                var ret = SvgMedia.getSketchView(isLocal).insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId, isLocal) {
                Log.call(Log.l.trace, "svgSketchView.");
                var ret = SvgMedia.getSketchView(isLocal).deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse, isLocal) {
                Log.call(Log.l.trace, "svgSketchView.");
                var ret = SvgMedia.getSketchView(isLocal).update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


