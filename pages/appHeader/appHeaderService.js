// services for page: contact
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "AppHeader";

    WinJS.Namespace.define("AppHeader", {
        _userPhotoView: {
            get: function () {
                return AppData.getFormatView("DOC1Mitarbeiter", 0);
            }
        },
        userPhotoView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".userPhotoView.");
                var ret = AppHeader._userPhotoView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _GlobalUserServersVIEW: {
            get: function () {
                return AppData.getFormatView("GlobalUserServers", 20581, false);
            }
        },
        GlobalUserServersVIEW: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".GlobalUserServersVIEW.");
                var ret = AppHeader._GlobalUserServersVIEW.select(complete, error, restriction, {
                    ordered: true
                });
                Log.ret(Log.l.trace);
                return ret;

            }
        }
    });
})();
