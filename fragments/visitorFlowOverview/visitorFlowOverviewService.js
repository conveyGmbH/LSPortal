// service for page: startContacts
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("VisitorFlowOverview", {
        _visitorView: {
            get: function () {
                return AppData.getFormatView("CR_V_Bereich", 20613);
            }
        },
        visitorView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "mitarbeiterView.", "recordId=" + restriction);
                var ret = VisitorFlowOverview._visitorView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();