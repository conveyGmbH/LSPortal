// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    var namespaceName = "EmployeeGenPWList";

    WinJS.Namespace.define("EmployeeGenPWList", {
        _employeePWView: {
            get: function () {
                var ret = AppData.getFormatView("Mitarbeiter", 20544);
                ret.maxPageSize = 50;
                return ret;
            }
        },
        employeePWView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".employeePWView.", "restriction=" + (restriction ? JSON.stringify(restriction) : ""));
                var ret = EmployeeGenPWList._employeePWView.select(complete, error, restriction, {
                    ordered: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".employeePWView.");
                var ret = EmployeeGenPWList._employeePWView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".employeePWView.");
                var ret = EmployeeGenPWList._employeePWView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
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
        _employeePWExportView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20552);
            }
        },
        employeePWExportView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".employeePWExportView.", "restriction=" + (restriction ? JSON.stringify(restriction) : ""));
                var ret = EmployeeGenPWList._employeePWExportView.select(complete, error, restriction, {
                    ordered: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".employeePWExportView.");
                var ret = EmployeeGenPWList._employeePWExportView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".employeePWExportView.");
                var ret = EmployeeGenPWList._employeePWExportView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return EmployeeGenPWList._employeePWExportView;
            }
        },
        defaultHeaderRestriction: {
            Name: "",
            Login: "",
            GenPassword: 0,
            Barcode: ""
        },
        defaultHeaderLabelRestriction: {
            Name: "",
            Login: "",
            GenPassword: 0,
            Barcode: ""
        }
    });
})();