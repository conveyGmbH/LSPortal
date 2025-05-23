﻿// service for page: dbinit
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    var namespaceName = "DBInit";

    WinJS.Namespace.define("DBInit", {
        _loginRequest: {
            get: function () {
                return AppData.getFormatView("LoginRequest", 0, false, true);
            }
        },
        loginRequest: {
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".loginRequest.");
                var ret = DBInit._loginRequest.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _loginView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter_Anmeldung", 0, false, true);
            }
        },
        loginView: {
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".loginView.");
                var ret = DBInit._loginView.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _appListSpecView: {
            get: function () {
                return AppData.getFormatView("AppListSpec", 20457);
            }
        },
        appListSpecView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, namespaceName + ".appListSpecView.");
                var ret = DBInit._appListSpecView.select(complete, error);
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
                Log.call(Log.l.trace, namespaceName + ".CR_VERANSTOPTION_ODataView.");
                var ret = DBInit._CR_VERANSTOPTION_View.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "INITOptionTypeID"
                });
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
                var ret = DBInit._GlobalUserServersVIEW.select(complete, error, restriction, {
                    ordered: true
                });
                Log.ret(Log.l.trace);
                return ret;

            }
        }

    });
})();
