// service for page: infodeskEmpList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("InfodeskEmpList", {
        _employeeSkillentryView: {
            get: function () {
                var ret = AppData.getFormatView("SkillEntry", 20472, false); // -> wichtig für später MitarbeiterView_20471
                ret.maxPageSize = 20;
                return ret;
            }
        },
        employeeSkillentryView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "InfodeskEmpList.");
                var ret = InfodeskEmpList._employeeSkillentryView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: restriction.OrderAttribute, // in der Datenbank muss verbessert werden in Nachname
                    desc: restriction.OrderDesc
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "InfodeskEmpList.");
                var ret = InfodeskEmpList._employeeSkillentryView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "InfodeskEmpList.");
                var ret = InfodeskEmpList._employeeSkillentryView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _employeeView: {
            get: function () {
                var ret = AppData.getFormatView("Mitarbeiter", 20471, false); // -> wichtig für später MitarbeiterView_20471
                ret.maxPageSize = 20;
                return ret;
            }
        },
        employeeView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "InfodeskEmpList.");
                var ret = InfodeskEmpList._employeeView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: restriction.OrderAttribute,
                    desc: restriction.OrderDesc
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
        defaultValue: {
            Names: ""
        },
        defaultRestriction: {
            Aktiv: "",
            bAndInEachRow: true,
            bUseOr: false,
            countCombobox: 0,
            Vorname: "",
            Nachname: "",
            Login: "",
            Names: "",
            SkillType1Sortierung: 0,
            SkillType2Sortierung: 0,
            SkillType3Sortierung: 0,
            SkillType4Sortierung: 0,
            SkillType5Sortierung: 0,
            SkillTypeID: {},
            Sortierung: {},
            OrderAttribute: "Nachname",
            OrderDesc: true
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
        },
        _userPhotoView: {
            get: function () {
                return AppData.getFormatView("DOC1Mitarbeiter", 0);
            }
        },
        userPhotoView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "userPhotoView.");
                var ret = InfodeskEmpList._userPhotoView.select(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "ContactList.");
                var ret = InfodeskEmpList._userPhotoView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "ContactList.");
                var ret = InfodeskEmpList._userPhotoView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


