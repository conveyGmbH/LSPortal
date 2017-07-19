// service for page: dbinit
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("DBInit", {
        _appListSpecView: {
            get: function () {
                return AppData.getFormatView("AppListSpec", 20457);
            }
        },
        appListSpecView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, "appListSpecView.");
                var ret = DBInit._appListSpecView.select(complete, error);

                // this will return a promise to controller
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
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "CR_VERANSTOPTION_ODataView.");
                var ret = DBInit._CR_VERANSTOPTION_View.select(complete,
                    error,
                    restriction,
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
