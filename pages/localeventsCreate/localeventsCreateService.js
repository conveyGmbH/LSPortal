// service for page: localEvents
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("LocalEventsCreate", {
       
        _VeranstaltungTable: {
            get: function () {
                return AppData.getFormatView("VeranstaltungAnlage", 0);
            }
        },
        VeranstaltungView: {
            insert: function (complete, error, restriction) {
                Log.call(Log.l.trace, "LocalEventsCreate.");
                var ret = LocalEventsCreate._VeranstaltungTable.insert(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                VeranstaltungName: "",
                LeadSuccessMobileApp: 1,
                MobilerBarcodescanner: 0
            }
        }
    });
})();