// service for page: startTop10Users
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "StartTop10Users";

    WinJS.Namespace.define("StartTop10Users", {
        _reportMitarbeiter: {
            get: function () {
                var ret = AppData.getFormatView("Veranstaltung", 20688);
                ret.maxPageSize = 10;
                return ret;
            }
        },
        reportMitarbeiter: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".reportMitarbeiter.");
                var ret = StartTop10Users._reportMitarbeiter.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Anzahl",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".reportMitarbeiter.");
                var ret = StartTop10Users._reportMitarbeiter.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".reportMitarbeiter.");
                var ret = StartTop10Users._reportMitarbeiter.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return StartTop10Users._reportMitarbeiter;
            }
        },
        _employeeView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20688);
            }
        },
        employeeView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".employeeView.");
                var ret = StartTop10Users._employeeView.select(complete, error, restriction, {
                    ordered: true /*Nachname*/
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".employeeView.");
                var ret = StartTop10Users._employeeView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".employeeView.");
                var ret = StartTop10Users._employeeView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                MitarbeiterVIEWID: "", //0
                Vorname: "",
                Nachname: "",
                fullName: ""
            }
        }
    });
})();
