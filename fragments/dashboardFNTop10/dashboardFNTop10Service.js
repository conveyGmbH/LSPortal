// service for page: dashboardFNTop10
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "DashboardFNTop10";

    WinJS.Namespace.define("DashboardFNTop10", {
        _reportLand: {
            get: function () {
                var ret = AppData.getFormatView("Kontakt", 20473);
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
                var ret = DashboardFNTop10._reportLand.select(complete, error, restriction, {
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
                var ret = DashboardFNTop10._reportLand.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".reportLand.");
                var ret = DashboardFNTop10._reportLand.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return DashboardFNTop10._reportLand;
            }
        },
        _veranstaltungView: {
            get: function () {
                var ret = AppData.getFormatView("Veranstaltung", 0);
                return ret;
            }
        },
        veranstaltungView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".veranstaltungView.");
                var ret = DashboardFNTop10._veranstaltungView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _mitarbeiterView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20453);
            }
        },
        mitarbeiterView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".mitarbeiterView.", "restriction=" + (restriction ? JSON.stringify(restriction) : ""));
                var ret = DashboardFNTop10._mitarbeiterView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                AnzKontakte: 0
            }
        }
    });
})();