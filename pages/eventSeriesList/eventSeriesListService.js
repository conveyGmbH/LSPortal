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
                Log.call(Log.l.trace, "EventSeriesList.SerienView.");
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
                Log.call(Log.l.trace, "EventSeriesList.SerienView.");
                var ret = EventSeriesList._SerienView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EventSeriesList.SerienView.");
                var ret = EventSeriesList._SerienView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: EventSeriesList._SerienView.relationName,
            pkName: EventSeriesList._SerienView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventSeriesList._SerienView.oDataPkName) {
                        ret = record[EventSeriesList._SerienView.oDataPkName];
                    }
                    if (!ret && EventSeries._langSeriesView.pkName) {
                        ret = record[EventSeriesList._SerienView.pkName];
                    }
                }
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "EventSeriesList.SerienView.");
                var ret = EventSeriesList._SerienView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "EventSeriesList.SerienView.");
                var ret = EventSeriesList._SerienView.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();