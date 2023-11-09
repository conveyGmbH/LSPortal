// service for page: GenFragEvents
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("GenFragEvents", {
        _BenutzerView: {
            get: function () {
                return AppData.getFormatView("Benutzer", 20677);
            }
        },
        _BenutzerODataView: {
            get: function () {
                return AppData.getFormatView("Benutzer", 0);
            }
        },
        BenutzerODataView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "GenFragEvents.");
                var ret = GenFragEvents._BenutzerView.select(complete, error, restriction, {
                    ordered: true,
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "GenFragEvents.BenutzerODataView.");
                var ret = GenFragEvents._BenutzerODataView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "GenFragEvents.BenutzerView.");
                var ret = GenFragEvents._BenutzerView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "GenFragEvents.BenutzerView.");
                var ret = GenFragEvents._BenutzerView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "GenFragEvents.BenutzerView.");
                var ret = GenFragEvents._BenutzerView.map;
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Status: "",
                sessionEndBtn: false
            }
        },
        _eventId: null,
        _eventName: null,
        _questionView: {
            get: function () {
                var ret = AppData.getFormatView("Fragebogen", 20597);
                return ret;
            }
        },
        questionView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "questionView.");
                var ret = GenFragEvents._questionView.select(complete, error, restriction, { ordered: true, orderAttribute: "FragebogenVIEWID" });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "questionView.");
                var ret = GenFragEvents._questionView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "questionView.");
                var ret = GenFragEvents._questionView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {

            }
        }
    });
})();