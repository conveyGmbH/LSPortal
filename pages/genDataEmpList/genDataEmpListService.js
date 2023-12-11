// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("GenDataEmpList", {
        _employeeView: {
            get: function () {
                var ret = AppData.getFormatView("Mitarbeiter", 20676);
                ret.maxPageSize = 25;
                return ret;
            }
        },
        employeeView: {
            select: function (complete, error, restriction, recordId) {
                Log.call(Log.l.trace, "GenDataEmpList.");
                var ret;
                if (recordId) {
                    ret = GenDataEmpList._employeeView.selectById(complete, error, recordId);
                } else {
                    ret = GenDataEmpList._employeeView.select(complete, error, restriction, {
                        ordered: true,
                        desc: restriction.OrderDesc,
                        orderAttribute: restriction.OrderAttribute
                    });
                }
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "GenDataEmpList.");
                var ret = GenDataEmpList._employeeView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EmpList.");
                var ret = GenDataEmpList._employeeView.selectNext(complete, error, response, nextUrl);
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
                Log.call(Log.l.trace, "GenDataEmpList.");
                var ret = GenDataEmpList._employeePWExportView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "MitarbeiterVIEWID"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "GenDataEmpList.");
                var ret = GenDataEmpList._employeePWExportView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "GenDataEmpList.");
                var ret = GenDataEmpList._employeePWExportView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return GenDataEmpList._employeePWExportView;
            }
        }
    });
})();


