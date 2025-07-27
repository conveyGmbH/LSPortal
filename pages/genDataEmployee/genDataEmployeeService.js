// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/scripts/generalData.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("GenDataEmployee", {
        _employeeTableView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 0, false);
            }
        },
        _employeeView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20678);
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
                var ret = GenDataEmployee._employeeTableView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = GenDataEmployee._employeeTableView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = GenDataEmployee._employeeTableView.insert(complete, error, viewResponse);
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
                bUseOr: false,
                bAndInEachRow: false,
                OrderAttribute: "Nachname",
                OrderDesc: false
            }
        },
        _initAPUserRoleView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITAPUserRole");
            }
        },
        initAPUserRoleView: {
            select: function (complete, error) {
                var ret = GenDataEmployee._initAPUserRoleView.select(complete, error);
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "GenDataEmployee.initAnredeView.");
                var ret = GenDataEmployee._initAPUserRoleView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "GenDataEmployee.initAnredeView.");
                var ret = GenDataEmployee._initAPUserRoleView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


