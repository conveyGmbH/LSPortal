// service for page: startContacts
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("VisitorFlowDevices", {
        _visitorDeviceView: {
            get: function () {
                return AppData.getFormatView("DeviceLastCall", 20616);
            }
        },
        visitorDeviceView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "visitorDeviceView.", "recordId=" + restriction);
                var ret = VisitorFlowDevices._visitorDeviceView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                
            }
        }
    });
})();