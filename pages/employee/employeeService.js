﻿// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/scripts/generalData.js" />

(function () {
    "use strict";
    var namespaceName = "Employee";

    WinJS.Namespace.define("Employee", {
        _employeeView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 0, false);
            }
        },
        employeeView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".employeeView.", "recordId=" + recordId);
                var ret = Employee._employeeView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".employeeView.");
                var ret = Employee._employeeView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".employeeView.");
                var ret = Employee._employeeView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".employeeView.");
                var ret = Employee._employeeView.insert(complete, error, viewResponse);
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
                VeranstaltungID: 0, // Auf Server im INSERT Trigger ermittelt für "einfache" Benutzerverwaltung
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
                return AppData.getFormatView("Mitarbeiter", 20471);
            }
        },
        licenceBView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".licenceBView.");
                var ret = Employee._licenceBView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            }
        }
    });
})();
