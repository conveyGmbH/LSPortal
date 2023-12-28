// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "EventTextUsage";

    WinJS.Namespace.define(namespaceName, {
            _eventTextUsageView: {
                get: function() {
                    return AppData.getLgntInit("LGNTINITDokVerwendung");
                }
            },
            eventTextUsageView: {
                select: function (complete, error) {
                    Log.call(Log.l.trace, namespaceName + ".eventTextUsageView.");
                    var ret = EventTextUsage._eventTextUsageView.select(complete, error);
                    Log.ret(Log.l.trace);
                    return ret;
                },
                getResults: function () {
                    Log.call(Log.l.trace, namespaceName + ".eventTextUsageView.");
                    var ret = EventTextUsage._eventTextUsageView.results;
                    Log.ret(Log.l.trace);
                    return ret;
                },
                getMap: function () {
                    Log.call(Log.l.trace, namespaceName + ".eventTextUsageView.");
                    var ret = EventTextUsage._eventTextUsageView.map;
                    Log.ret(Log.l.trace);
                    return ret;
                }
            }
    });
})();


