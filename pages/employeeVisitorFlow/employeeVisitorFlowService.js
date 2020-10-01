// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/scripts/generalData.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EmployeeVisitorFlow", {
        _employeeView: {
            get: function () {
                return AppData.getFormatView("Benutzer", 0, false);
            }
        },
        employeeView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = EmployeeVisitorFlow._employeeView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = EmployeeVisitorFlow._employeeView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = EmployeeVisitorFlow._employeeView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = EmployeeVisitorFlow._employeeView.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Vorname: "",
                Nachname: "",
                Login: AppData.generalData.userName || "",
                LogInNameBeforeAtSymbole: "",
                LogInNameAfterAtSymbole: "", 
                Password: "",
                VeranstaltungID: AppData.getRecordId("Veranstaltung"),
                INITAPUserRoleID: 3,
                Password2: ""
            },
            defaultRestriction: {
                Vorname: "",
                Nachname: "",
                Login: "",
                Names: "",
                OrderAttribute: "Nachname",
                OrderDesc: true
            }
        },
        _CR_V_Bereich_ODataVIEW: {
            get: function () {
                return AppData.getFormatView("CR_V_Bereich", 0);
            }
        },
        CR_V_Bereich_ODataVIEW: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "userPhotoView.");
                var ret = EmployeeVisitorFlow._CR_V_Bereich_ODataVIEW.select(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _benutzerView: {
            get: function () {
                return AppData.getFormatView("Benutzer", 0);
            }
        },
        benutzerView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "benutzerView.");
                var ret = EmployeeVisitorFlow._benutzerView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "benutzerView.");
                var ret = EmployeeVisitorFlow._benutzerView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "benutzerView.");
                var ret = EmployeeVisitorFlow._benutzerView.insertWithId(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Info1: "",
                Info2: "",
                Vorname: "",
                Name: "",
                Titel: "",
                Position: "",
                TelefonFestnetz: "",
                TelefonMobil: "",
                EMail: "",
                Bemerkungen: ""
            }
        }
    });
})();


