// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EmpList", {
        _employeeView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20471);
            }
        },
        employeeView: {
            select: function (complete, error, restriction, recordId) {
                Log.call(Log.l.trace, "EmpList.");
                var ret;
                if (recordId) {
                    ret = EmpList._employeeView.selectById(complete, error, recordId);
                } else {
                    ret = EmpList._employeeView.select(complete, error, restriction, {
                        ordered: true,
                        desc: restriction.OrderDesc,
                        orderAttribute: restriction.OrderAttribute
                    });
                    ret.maxPageSize = 20;
                }

                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "EmpList.");
                var ret = EmpList._employeeView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EmpList.");
                var ret = EmpList._employeeView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultRestriction: {
                Vorname: "",
                Nachname: "",
                Login: "",
                Names: "",
                OrderAttribute: ["NichtLizenzierteApp", "Nachname"],
                OrderDesc: true
            }
        },
        _employeePWExportView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20552);
            }
        },
        employeePWExportView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "EmployeeGenPWList.");
                var ret = EmpList._employeePWExportView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "MitarbeiterVIEWID"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "EmployeeGenPWList.");
                var ret = EmpList._employeePWExportView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EmployeeGenPWList.");
                var ret = EmpList._employeePWExportView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return EmpList._employeePWExportView;
            }
        }
    });
})();


