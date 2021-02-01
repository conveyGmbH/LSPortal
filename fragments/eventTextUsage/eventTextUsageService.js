// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EventTextUsage", {
            _LGNTINITDokVerwendungView: {
                get: function() {
                    return AppData.getLgntInit("LGNTINITDokVerwendung");
                }
            },
            LGNTINITDokVerwendungView: {
                select: function (complete, error) {
                    Log.call(Log.l.trace, "EventTextUsage.LGNTINITDokVerwendungView.");
                    var ret = EventTextUsage._LGNTINITDokVerwendungView.select(complete, error);
                    Log.ret(Log.l.trace);
                    return ret;
                },
                getResults: function () {
                    Log.call(Log.l.trace, "EventTextUsage.LGNTINITDokVerwendungView.");
                    var ret = EventTextUsage._LGNTINITDokVerwendungView.results;
                    Log.ret(Log.l.trace);
                    return ret;
                },
                getMap: function () {
                    Log.call(Log.l.trace, "EventTextUsage.LGNTINITDokVerwendungView.");
                    var ret = EventTextUsage._LGNTINITDokVerwendungView.map;
                    Log.ret(Log.l.trace);
                    return ret;
                }
            }
    });
})();


