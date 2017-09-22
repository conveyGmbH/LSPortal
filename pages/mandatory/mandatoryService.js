﻿// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Mandatory", {
        _manquestView: {
            get: function () {
                return AppData.getFormatView("FragenAntworten", 0, false);
            }
        },
        manquestView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Mandatory.");
                var ret = Mandatory._manquestView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Sortierung"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "manquestView.");
                var ret = Mandatory._manquestView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _CR_VERANSTOPTION_View: {
            get: function () {
                return AppData.getFormatView("CR_VERANSTOPTION", 0, false);
            }
        },
        CR_VERANSTOPTION_ODataView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = Mandatory._CR_VERANSTOPTION_View.select(complete,
                    error,
                    {
                        ordered: true,
                        orderAttribute: "INITOptionTypeID"
                    });
                Log.ret(Log.l.trace);
                return ret;

            }
        }
    });
})();


