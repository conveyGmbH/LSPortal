﻿// service for page: dashboardFNHour
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "DashboardFNHour";

    WinJS.Namespace.define("DashboardFNHour", {
        _kontaktanzahlView: {
            get: function () {
                var ret = AppData.getFormatView("Veranstaltung", 20684);
                ret.maxPageSize = 5;
                return ret;
            }
        },
        kontaktanzahlView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, namespaceName + ".kontaktanzahlView.");
                var ret = DashboardFNHour._kontaktanzahlView.select(complete, error, null, {
                    ordered: true,
                    orderAttribute: "Datum",
                    asc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();
