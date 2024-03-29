﻿// service for page: account
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "Account";

    WinJS.Namespace.define("Account", {
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, true);
            }
        },
        initSpracheView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".initSpracheView.");
                var ret = Account._initSpracheView.select(complete, error, recordId, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, namespaceName + ".initSpracheView.");
                var ret = Account._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, namespaceName + ".initSpracheView.");
                var ret = Account._initSpracheView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _loginRequest: {
            get: function () {
                return AppData.getFormatView("LoginRequest", 0, false, true);
            }
        },
        loginRequest: {
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".loginRequest.");
                var ret = Account._loginRequest.insert(complete, error, viewResponse);
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
                var ret = Account._loginView.insert(complete, error, viewResponse);
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
                var ret = Account._appListSpecView.select(complete, error);
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
                Log.call(Log.l.trace, namespaceName + ".CR_VERANSTOPTION_ODataView.");
                var ret = Account._CR_VERANSTOPTION_View.select(complete, error, restriction, {
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
                var ret = Account._GlobalUserServersVIEW.select(complete, error, restriction, {
                    ordered: true
                });
                Log.ret(Log.l.trace);
                return ret;

            }
        }
    });
})();
