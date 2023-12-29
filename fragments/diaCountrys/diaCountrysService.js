// service for page: StartQuestions
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "DiaCountrys";

    WinJS.Namespace.define("DiaCountrys", {
        _reportLand: {
            get: function () {
                var ret = AppData.getFormatView("Kontakt", 20473);
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
                var ret = DiaCountrys._reportLand.select(complete, error, restriction, {
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
                var ret = DiaCountrys._reportLand.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".reportLand.");
                var ret = DiaCountrys._reportLand.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return DiaCountrys._reportLand;
            }
        },
        _mitarbeiterView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20453);
            }
        },
        mitarbeiterView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".mitarbeiterView.");
                var ret = DiaCountrys._mitarbeiterView.select(complete, error, restriction);
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