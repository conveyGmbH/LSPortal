// service for page: StartQuestions
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "DiaCountrysIndustries";

    WinJS.Namespace.define("DiaCountrysIndustries", {
        _eventId: 0,
        _reportLand: {
            get: function () {
                var ret = AppData.getFormatView("Veranstaltung", 20685);
                ret.maxPageSize = 10;
                return ret;
            }
        },
        reportLand: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".reportLand.");
                if (!restriction) {
                    restriction = {
                        VeranstaltungID: DiaCountrysIndustries._eventId
                    };
                }
                var ret = DiaCountrysIndustries._reportLand.select(complete, error, restriction, {
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
                var ret = DiaCountrysIndustries._reportLand.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".reportLand.");
                var ret = DiaCountrysIndustries._reportLand.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return DiaCountrysIndustries._reportLand;
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
                var ret = DiaCountrysIndustries._veranstaltungView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _mitarbeiterView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20683);
            }
        },
        mitarbeiterView: {
            select: function (complete, error, restriction) {
                if (!restriction) {
                    restriction = {
                        VeranstaltungID: DiaCountrysIndustries._eventId
                    };
                }
                Log.call(Log.l.trace, namespaceName + ".mitarbeiterView.", "restriction=" + (restriction ? JSON.stringify(restriction) : ""));
                var ret = DiaCountrysIndustries._mitarbeiterView.select(complete, error, restriction);
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
