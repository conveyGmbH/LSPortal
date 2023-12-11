// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EmpRoles", {
        _initAPUserRoleView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITAPUserRole");
            }
        },
        initAPUserRoleView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "EmpRoles.LGNTINITAPUserRole.");
                var ret = EmpRoles._initAPUserRoleView.select(complete, error, recordId, {
                     ordered: true
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "EmpRoles.LGNTINITAPUserRole.");
                var ret = EmpRoles._initAPUserRoleView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "EmpRoles.LGNTINITAPUserRole.");
                var ret = EmpRoles._initAPUserRoleView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _CR_MA_APUSERRoleView: {
            get: function () {
                return AppData.getFormatView("CR_MA_APUSERRole", 0, false);
            }
        },
        CR_MA_APUSERRoleView: {
            select: function (complete, error, restriction) {
                if (!restriction) {
                    restriction = EmpRoles.getRestriction();
                }
               // Log.call(Log.l.trace, "visitorFlowLevelView.", "restriction=" + restriction);
                Log.call(Log.l.trace, "employeeView.", "restriction=" + restriction);
                var ret = EmpRoles._CR_MA_APUSERRoleView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "INITAPUserRoleID"
                });
                Log.ret(Log.l.trace);
                return ret;

            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = EmpRoles._CR_MA_APUSERRoleView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        getRestriction: function () {
            var ret = null;
            var master = Application.navigator.masterControl;
            if (master && master.controller && master.controller.binding) {
                Log.print(Log.l.trace, "employeeId=" + master.controller.binding.employeeId);
                ret = {
                    MitarbeiterID: master.controller.binding.employeeId
                };
            }
            return ret;
        }
    });
})();


