﻿// service for page: StartQuestions
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "DiaVisitors";

    WinJS.Namespace.define("DiaVisitors", {
        _eventId: 0,
        _kontaktanzahlView: {
            get: function () {
                var ret = AppData.getFormatView("Veranstaltung", 20684);
                ret.maxPageSize = 5;
                return ret;
            }
        },
        kontaktanzahlView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".kontaktanzahlView.");
                if (!restriction) {
                    restriction = {
                        VeranstaltungID: DiaVisitors._eventId
                    };
                }
                var ret = DiaVisitors._kontaktanzahlView.select(complete, error, restriction, {
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
