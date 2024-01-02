// service for page: esStaffAdministrationList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    var namespaceName = "EsStaffAdministrationList";

    WinJS.Namespace.define("EsStaffAdministrationList", {
        _employeeView: {
            get: function () {
                var ret = AppData.getFormatView("Mitarbeiter", 20609);
                ret.maxPageSize = 100;
                return ret;
            }
        },
        employeeView: {
            select: function (complete, error, restriction) {
                var ret;
                Log.call(Log.l.trace, namespaceName + ".employeeView.", "restriction=" + (restriction ? JSON.stringify(restriction) : ""));
                if (typeof restriction === "number") {
                    ret = EsStaffAdministrationList._employeeView.selectById(complete, error, restriction);
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
                Log.call(Log.l.trace, namespaceName + ".employeeView.");
                var ret = EsStaffAdministrationList._employeeView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".employeeView.");
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


