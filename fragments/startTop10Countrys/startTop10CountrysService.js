// service for page: startTop10Countrys
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "StartTop10Countrys";

    WinJS.Namespace.define("StartTop10Countrys", {
        _startTop10CountrysmitarbeiterView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20683);
            }
        },
        startTop10CountrysmitarbeiterView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".startTop10CountrysmitarbeiterView.");
                var ret = StartTop10Countrys._startTop10CountrysmitarbeiterView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _reportLand: {
            get: function () {
                var ret = AppData.getFormatView("Veranstaltung", 20687);
                ret.maxPageSize = 10;
                return ret;
            }
        },
        reportLand: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".reportLand.");
                if (!restriction) {
                    restriction = {};
                }
                restriction.LanguageSpecID = AppData.getLanguageId();
                var ret = StartTop10Countrys._reportLand.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Anzahl",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".reportLand.");
                var ret = StartTop10Countrys._reportLand.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".reportLand.");
                var ret = StartTop10Countrys._reportLand.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return StartTop10Countrys._reportLand;
            }
        }
    });
})();
