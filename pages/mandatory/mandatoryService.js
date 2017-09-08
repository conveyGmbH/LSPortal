// service for page: event
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
        }
    });
})();


