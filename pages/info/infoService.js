// service for page: info
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Info", {
        _appInfoSpecView: {
            get: function () {
                return AppData.getFormatView("AppInfoSpec", 20583, false);
            }
        },
        appInfoSpecView: {
            select: function(complete, error) {
                Log.call(Log.l.trace, "appInfoSpecView.");
                var ret = Info._appInfoSpecView.select(complete, error);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                dbVersion: ""
            }
        }
    });
})();


