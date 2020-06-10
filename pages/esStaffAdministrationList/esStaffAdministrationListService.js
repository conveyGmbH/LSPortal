// service for page: esStaffAdministrationList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EsStaffAdministrationList", {
        _employeeView: {
            get: function () {
                var ret = AppData.getFormatView("Mitarbeiter", 20609);
                ret.maxPageSize = 100;
                return ret;
            }
        },
        employeeView: {
            select: function (complete, error, restriction, recordId) {
                Log.call(Log.l.trace, "EsStaffAdministrationList.");
                var ret;
                if (recordId) {
                    ret = EsStaffAdministrationList._employeeView.selectById(complete, error, recordId);
                } else {
                    ret = EsStaffAdministrationList._employeeView.select(complete, error, restriction, {
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
                Log.call(Log.l.trace, "EsStaffAdministrationList.");
                var ret = EsStaffAdministrationList._employeeView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EsStaffAdministrationList.");
                var ret = EsStaffAdministrationList._employeeView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultRestriction: {
                Vorname: "",
                Nachname: "",
                Login: "",
                Names: "",
                OrderAttribute: ["Nachname"],
                OrderDesc: true
            }
        }
    });
})();


