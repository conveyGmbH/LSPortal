// service for page: startContacts
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("VisitorFlowLevelIndicator", {
        _bereichhourView: {
            get: function () {
                return AppData.getFormatView("CR_V_Bereich", 20614);
            }
        },
        bereichhourView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "mitarbeiterView.", "recordId=" + restriction);
                var ret = VisitorFlowLevelIndicator._bereichhourView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                
            }
        },
        _bereichhalfhourView: {
            get: function () {
                return AppData.getFormatView("CR_V_Bereich", 20615);
            }
        },
        bereichhalfhour: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "mitarbeiterView.", "recordId=" + restriction);
                var ret = VisitorFlowLevelIndicator._bereichhalfhourView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {

            }
        }
    });
})();