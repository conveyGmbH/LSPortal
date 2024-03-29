﻿// service for page: startContacts
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "VisitorFlowDevices";

    WinJS.Namespace.define("VisitorFlowDevices", {
        _visitorDeviceView: {
            get: function () {
                return AppData.getFormatView("DeviceLastCall", 20616);
            }
        },
        visitorDeviceView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".visitorDeviceView.", "recordId=" + restriction);
                var ret = VisitorFlowDevices._visitorDeviceView.select(complete, error, restriction,
                    {
                        ordered: true,
                        orderAttribute: "LastCallTS",
                        asc: true
                    });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return VisitorFlowDevices._visitorDeviceView.relationName;
                }
            },
            pkName: {
                get: function() {
                    return VisitorFlowDevices._visitorDeviceView.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (VisitorFlowDevices._visitorDeviceView.oDataPkName) {
                        ret = record[VisitorFlowDevices._visitorDeviceView.oDataPkName];
                    }
                    if (!ret && VisitorFlowDevices._visitorDeviceView.pkName) {
                        ret = record[VisitorFlowDevices._visitorDeviceView.pkName];
                    }
                }
                return ret;
            },
            defaultValue: {
                
            }
        }
    });
})();