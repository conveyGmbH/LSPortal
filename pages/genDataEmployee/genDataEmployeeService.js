﻿// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/scripts/generalData.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("GenDataEmployee", {
        _employeeView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 0, false);
            }
        },
        employeeView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = GenDataEmployee._employeeView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = GenDataEmployee._employeeView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = GenDataEmployee._employeeView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = GenDataEmployee._employeeView.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Vorname: "",
                Nachname: "",
                Login: "",
                LogInNameBeforeAtSymbol: "",
                LogInNameAfterAtSymbol: "", 
                Password: "",
                VeranstaltungID: AppData.getRecordId("Veranstaltung2"),
                INITAPUserRoleID: 3,
                Password2: ""
            },
            defaultRestriction: {
                Vorname: "",
                Nachname: "",
                Login: "",
                Names: "",
                OrderAttribute: "Nachname",
                OrderDesc: false
            }
        },
        _licenceBView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20678);
            }
        },
        licenceBView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = GenDataEmployee._licenceBView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            }
        },
        _LGNTINITAPUserRoleView: {
            get: function () {
                return AppData.getFormatView("LGNTINITAPUserRole", 20695);
            }
        },
        LGNTINITAPUserRoleView: {
            select: function (complete, error, restriction) {
                var ret = GenDataEmployee._LGNTINITAPUserRoleView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "INITAPUserRoleID"
                });
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


