// service for page: LocalEvents
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("LocalEvents", {
        _orderAttribute: "Name",
        _orderDesc: true,
        _VeranstaltungView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20542);
            }
        },
        VeranstaltungView: {
            select: function (complete, error, restriction, options) {
                options = {
                    ordered: true,
                    orderAttribute: LocalEvents._orderAttribute,
                    desc: LocalEvents._orderDesc
                }
                Log.call(Log.l.trace, "LocalEvents.");
                var ret = LocalEvents._VeranstaltungView.select(complete, error, restriction, options);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "LocalEvents.");
                var ret = LocalEvents._VeranstaltungView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "LocalEvents.");
                var ret = LocalEvents._VeranstaltungView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _PRCChangeUser: {
            get: function () {
                return AppData.getFormatView("PRC_ChangeUserVeranstaltung", 0);
            }
        },
        PRCChangeUser: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "LocalEvents.");
                var ret = LocalEvents._PRCChangeUser.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();
