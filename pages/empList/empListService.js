// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    var namespaceName = "EmpList";
    WinJS.Namespace.define("EmpList", {
        _employeeView: {
            get: function () {
                var ret = AppData.getFormatView("Mitarbeiter", 20471);
                // hung 12.04.24: problem that sometimes does not reload any more - set to higher maxPageSize
                ret.maxPageSize = 200;
                return ret;
            }
        },
        employeeView: {
            select: function (complete, error, restriction, options) {
                Log.call(Log.l.trace, namespaceName + ".employeeView.", "restriction=" + (restriction ? JSON.stringify(restriction) : ""));
                var ret;
                if (typeof restriction === "number") {
                    ret = EmpList._employeeView.selectById(complete, error, restriction);
                } else {
                    if (!options) {
                        options = {
                            ordered: true,
                            desc: restriction.OrderDesc,
                            orderAttribute: restriction.OrderAttribute
                        };
                    }
                    ret = EmpList._employeeView.select(complete, error, restriction, options);
                }
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".employeeView.");
                var ret = EmpList._employeeView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".employeeView.");
                var ret = EmpList._employeeView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return EmpList._employeeView.relationName;
                }
            },
            pkName: {
                get: function() {
                    return EmpList._employeeView.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EmpList._employeeView.oDataPkName) {
                        ret = record[EmpList._employeeView.oDataPkName];
                    }
                    if (!ret && EmpList._employeeView.pkName) {
                        ret = record[EmpList._employeeView.pkName];
                    }
                }
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
        }
    });
})();


