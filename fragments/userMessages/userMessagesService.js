// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("UserMessages", {
        _BenutzerView: {
            get: function() {
                return AppData.getFormatView("Benutzer", 0);
            }
        },
        BenutzerView: {
            select: function(complete, error, recordId) {
                Log.call(Log.l.trace, "UserMessages.Benutzer.");
                var ret = UserMessages._BenutzerView.select(complete, error, recordId, {
                    orderAttribute: "Info1TS",
                    ordered: true,
                    desc: true

                });
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "benutzerView.");
                var ret = UserMessages._BenutzerView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "UserMessages.Benutzer.");
                var ret = UserMessages._BenutzerView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "UserMessages.Benutzer.");
                var ret = UserMessages._BenutzerView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _BenutzerNachrichtView: {
            get: function () {
                var ret = AppData.getFormatView("BenutzerNachricht", 20595, false);
                ret.maxPageSize = 20;
                return ret;
            }
        },
        BenutzerNachrichtView: {
            select: function(complete, error, restriction) {
                Log.call(Log.l.trace, "eventView.");
                var ret = UserMessages._BenutzerNachrichtView.select(complete,
                    error,
                    restriction,
                    {
                        ordered: true,
                        orderAttribute: "SendTS",
                        desc: true
                    });
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, "ContactList.");
                var ret = UserMessages._BenutzerNachrichtView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function(complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "ContactList.");
                var ret = UserMessages._BenutzerNachrichtView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function(complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "eventView.");
                var ret = UserMessages._BenutzerNachrichtView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "loginView.");
                var ret = UserMessages._BenutzerNachrichtView.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _BenutzerNachricht: {
            get: function () {
                var ret = AppData.getFormatView("BenutzerNachricht", 0, false);
                ret.maxPageSize = 20;
                return ret;
            }
        },
        BenutzerNachricht: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "eventView.");
                var ret = UserMessages._BenutzerNachricht.select(complete,
                    error,
                    restriction,
                    {
                        ordered: true,
                        orderAttribute: "SendTS",
                        desc: true
                    });
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "ContactList.");
                var ret = UserMessages._BenutzerNachricht.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "ContactList.");
                var ret = UserMessages._BenutzerNachricht.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "eventView.");
                var ret = UserMessages._BenutzerNachricht.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "loginView.");
                var ret = UserMessages._BenutzerNachricht.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
        /*_initAPUserRoleView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITAPUserRole");
            }
        },
        initAPUserRoleView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "EmpRoles.LGNTINITAPUserRole.");
                var ret = UserMessages._initAPUserRoleView.select(complete, error, recordId, {
                     ordered: true
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "EmpRoles.LGNTINITAPUserRole.");
                var ret = UserMessages._initAPUserRoleView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "EmpRoles.LGNTINITAPUserRole.");
                var ret = UserMessages._initAPUserRoleView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _CR_MA_APUSERRoleView: {
            get: function () {
                return AppData.getFormatView("CR_MA_APUSERRole", 0, false);
            }
        },
        CR_MA_APUSERRoleView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = UserMessages._CR_MA_APUSERRoleView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "INITAPUserRoleID"
                });
                Log.ret(Log.l.trace);
                return ret;

            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = UserMessages._CR_MA_APUSERRoleView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        }*/
    });
})();


