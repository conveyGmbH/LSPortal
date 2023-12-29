// service for page: dashboardFNIndustries
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "DashboardFNIndustries";

    WinJS.Namespace.define("DashboardFNIndustries", {
        _reportLand: {
            get: function () {
                var ret = AppData.getFormatView("Kontakt", 20473);
                ret.maxPageSize = 50;
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
                var ret = DashboardFNIndustries._reportLand.select(complete, error, restriction, {
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
                var ret = DashboardFNIndustries._reportLand.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".reportLand.");
                var ret = DashboardFNIndustries._reportLand.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return DashboardFNIndustries._reportLand;
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
                var ret = DashboardFNIndustries._veranstaltungView.select(complete, error, restriction);
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
                var ret = DashboardFNIndustries._mitarbeiterView.select(complete, error, restriction);
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