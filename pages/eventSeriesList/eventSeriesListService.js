// service for page: EventSeriesList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EventSeriesList", {
        _SerienView: {
            get: function () {
                return AppData.getFormatView("MandantSerie", 0); //20620
            }
        },
        SerienView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "LocalEvents.");
                var ret = EventSeriesList._SerienView.select(complete, error, restriction, {
                    //ordered: true,
                    //orderAttribute: "Startdatum",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "LocalEvents.");
                var ret = EventSeriesList._SerienView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "LocalEvents.");
                var ret = EventSeriesList._SerienView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = EventSeriesList._SerienView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = EventSeriesList._SerienView.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();