// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EmployeeGenPWList", {
        _employeePWView: {
            get: function () {
                var ret = AppData.getFormatView("Mitarbeiter", 20544);
                ret.maxPageSize = 200;
                return ret;
            }
        },
        employeePWView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "EmployeeGenPWList.");
                var ret = EmployeeGenPWList._employeePWView.select(complete, error, restriction, {
                    ordered: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "EmployeeGenPWList.");
                var ret = EmployeeGenPWList._employeePWView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EmployeeGenPWList.");
                var ret = EmployeeGenPWList._employeePWView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
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
                var ret = EmployeeGenPWList._employeePWExportView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "MitarbeiterVIEWID"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "EmployeeGenPWList.");
                var ret = EmployeeGenPWList._employeePWExportView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EmployeeGenPWList.");
                var ret = EmployeeGenPWList._employeePWExportView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return EmployeeGenPWList._employeePWExportView;
            }
        }
    });
})();