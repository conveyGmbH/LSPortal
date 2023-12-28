// service for page: mandatoryList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "MandatoryList";

    WinJS.Namespace.define(namespaceName, {
        _mandatoryView: {
            get: function () {
                return AppData.getFormatView("PflichtFelder", 20502, false);
            }
        },
        mandatoryView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".mandatoryView.");
                var ret = MandatoryList._mandatoryView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "PflichtFelderVIEWID"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _mandatoryUpdate: {
            get: function () {
                return AppData.getFormatView("PflichtFelder", 0, false);
            }
        },
        mandatoryUpdate: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".mandatoryUpdate.");
                var ret = MandatoryList._mandatoryUpdate.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "PflichtFelderVIEWID"
                });
                Log.ret(Log.l.trace);
                return ret;

            },
            //one row
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".mandatoryUpdate.");
                var ret = MandatoryList._mandatoryUpdate.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


