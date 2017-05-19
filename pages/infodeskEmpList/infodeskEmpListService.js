// service for page: infodeskEmpList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("InfodeskEmpList", {
        _employeeView: {
            get: function () {
                return AppData.getFormatView("SkillEntry", 20472, false); // -> wichtig für später MitarbeiterView_20471
            }
        },
        employeeView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "InfodeskEmpList.");
                var ret = InfodeskEmpList._employeeView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Login" // in der Datenbank muss verbessert werden in Nachname
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "InfodeskEmpList.");
                var ret = InfodeskEmpList._employeeView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "InfodeskEmpList.");
                var ret = InfodeskEmpList._employeeView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _initBenAnwView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITBenAnw");
            }
        },
        initBenAnwView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "initBenAnwView.");
                var ret = InfodeskEmpList._initBenAnwView.select(complete, error, recordId, { ordered: true, orderByValue: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "initBenAnwView.");
                var ret = InfodeskEmpList._initBenAnwView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "initBenAnwView.");
                var ret = InfodeskEmpList._initBenAnwView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


