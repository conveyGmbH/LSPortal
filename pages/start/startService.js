// service for page: start
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Start", {
        _mitarbeiterView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20453);
            }
        },
        mitarbeiterView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "mitarbeiterView.", "recordId=" + recordId);
                var ret = Start._mitarbeiterView.selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _kontaktanzahlView: {
            get: function() {
                var ret = AppData.getFormatView("Kontakt", 20455);
                ret.maxPageSize = 10;
                return ret;
            }
        },
        kontaktanzahlView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, "kontaktanzahlView.");
                var ret = Start._kontaktanzahlView.select(complete, error, null, {
                    ordered: true,
                    orderAttribute: "Datum",
                    asc: true
                });
                    
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _reportLand: {
            get: function () {
                var ret = AppData.getFormatView("Kontakt", 20473);
                ret.maxPageSize = 10;
                return ret;
            }
        },
        reportLand: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Start.");
                if (!restriction) {
                    restriction = {};
                }
                restriction.LanguageSpecID = AppData.getLanguageId();
                var ret = Start._reportLand.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Anzahl",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Start.");
                var ret = Start._reportLand.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Start._reportLand.");
                var ret = Start._reportLand.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return Start._reportLand;
            }
        }
    
    });
})();
