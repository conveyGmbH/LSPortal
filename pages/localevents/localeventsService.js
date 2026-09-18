// service for page: LocalEvents
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("LocalEvents", {
        _orderAttribute: "Name",
        _orderDesc: true,
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
