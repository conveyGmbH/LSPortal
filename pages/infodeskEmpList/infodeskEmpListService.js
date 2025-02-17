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
                Log.call(Log.l.trace, "InfodeskEmpList.employeeSkillentryView.");
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
                Log.call(Log.l.trace, "InfodeskEmpList.employeeSkillentryView.");
                var ret = InfodeskEmpList._employeeSkillentryView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "InfodeskEmpList.employeeSkillentryView.");
                var ret = InfodeskEmpList._employeeSkillentryView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _employeeView: {
            get: function () {
                var ret = AppData.getFormatView("Mitarbeiter", 20699, false); // -> wichtig für später MitarbeiterView_20471 20676
                ret.maxPageSize = 20;
                return ret;
            }
        },
        employeeView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "InfodeskEmpList.employeeView.");
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
                Log.call(Log.l.trace, "InfodeskEmpList.employeeView.");
                var ret = InfodeskEmpList._employeeView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "InfodeskEmpList.employeeView.");
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
            OrderAttribute: "SortNachname",
            OrderDesc: true
        }, 
        _initBenAnwView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITBenAnw");
            }
        },
        initBenAnwView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "InfodeskEmpList.initBenAnwView.");
                var ret = InfodeskEmpList._initBenAnwView.select(complete, error, recordId, { ordered: true, orderByValue: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "InfodeskEmpList.initBenAnwView.");
                var ret = InfodeskEmpList._initBenAnwView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "InfodeskEmpList.initBenAnwView.");
                var ret = InfodeskEmpList._initBenAnwView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _userPhotoView: {
            get: function () {
                var ret = AppData.getFormatView("DOC1Mitarbeiter", 20555, false);
                ret.maxPageSize = 20;
                return ret;
            }
        },
        userPhotoView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "InfodeskEmpList.userPhotoView.");
                var ret = InfodeskEmpList._userPhotoView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: restriction.OrderAttribute, // in der Datenbank muss verbessert werden in Nachname
                    desc: restriction.OrderDesc
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "InfodeskEmpList.userPhotoView.");
                var ret = InfodeskEmpList._userPhotoView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "InfodeskEmpList.userPhotoView.");
                var ret = InfodeskEmpList._userPhotoView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _eventView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung2", 0);
            }
        },
        eventView: {
            fetchNext: function (results, url, complete, error) {
                Log.call(Log.l.trace, "InfodeskEmpList.eventView.");
                var nextJson = null;
                var ret = InfodeskEmpList._eventView.selectNext(function (json) {
                    nextJson = json;
                }, function (errorResponse) {
                    Log.print(Log.l.error, "error=" + AppData.getErrorMsgFromResponse(errorResponse));
                    if (typeof error === "function") {
                        error(errorResponse);
                    }
                }, null, url).then(function () {
                    if (nextJson && nextJson.d) {
                        results = results.concat(nextJson.d.results);
                        var nextUrl = InfodeskEmpList._eventView.getNextUrl(nextJson);
                        if (nextUrl) {
                            return InfodeskEmpList.eventView.fetchNext(results, nextUrl, complete, error);
                        } else {
                            nextJson.d.results = results;
                            if (typeof complete === "function") {
                                complete(nextJson);
                            }
                            return WinJS.Promise.as();
                        }
                    } else {
                        if (typeof complete === "function") {
                            complete(nextJson || {});
                        }
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            fetchAll: function (json, complete, error) {
                Log.call(Log.l.trace, "InfodeskEmpList.eventView.", "");
                var ret;
                var nextUrl = InfodeskEmpList._eventView.getNextUrl(json);
                if (nextUrl) {
                    ret = InfodeskEmpList.eventView.fetchNext(json.d.results, nextUrl, complete, error);
                } else {
                    if (typeof complete === "function") {
                        complete(json);
                    }
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            },
            select: function (complete, error) {
                Log.call(Log.l.trace, "InfodeskEmpList.eventView.");
                var nextJson = null;
                var ret = InfodeskEmpList._eventView.select(function (json) {
                    nextJson = json;
                }, error, null, {
                        ordered: true,
                        orderAttribute: "Name"
                    }).then(function () {
                        if (nextJson) {
                            return InfodeskEmpList.eventView.fetchAll(nextJson, complete, error);
                        } else {
                            if (typeof complete === "function") {
                                complete({});
                            }
                            return WinJS.Promise.as();
                        }
                    });
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Name: ""
            }
        }
    });
})();


