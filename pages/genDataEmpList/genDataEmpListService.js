﻿// service for page: event
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
        _eventView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung2", 0);
            }
        },
        employeeView: {
            select: function (complete, error, restriction, recordId) {
                Log.call(Log.l.trace, "GenDataEmpList.employeeView.");
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
                Log.call(Log.l.trace, "GenDataEmpList.employeeView.");
                var ret = GenDataEmpList._employeeView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "GenDataEmpList.employeeView.");
                var ret = GenDataEmpList._employeeView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultRestriction: {
                Vorname: "",
                Nachname: "",
                Login: "",
                Name: "",
                OrderAttribute: "Nachname",
                OrderDesc: false
            }
        },
        eventView: {
            fetchNext: function (results, url, complete, error) {
                Log.call(Log.l.trace, "GenDataEmpList.eventView.");
                var nextJson = null;
                var ret = GenDataEmpList._eventView.selectNext(function (json) {
                    nextJson = json;
                }, function (errorResponse) {
                    Log.print(Log.l.error, "error=" + AppData.getErrorMsgFromResponse(errorResponse));
                    if (typeof error === "function") {
                        error(errorResponse);
                    }
                }, null, url).then(function() {
                    if (nextJson && nextJson.d) {
                        results = results.concat(nextJson.d.results);
                        var nextUrl = GenDataEmpList._eventView.getNextUrl(nextJson);
                        if (nextUrl) {
                            return GenDataEmpList.eventView.fetchNext(results, nextUrl, complete, error);
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
                Log.call(Log.l.trace, "GenDataEmpList.eventView.", "");
                var ret;
                var nextUrl = GenDataEmpList._eventView.getNextUrl(json);
                if (nextUrl) {
                    ret = GenDataEmpList.eventView.fetchNext(json.d.results, nextUrl, complete, error);
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
                Log.call(Log.l.trace, "GenDataEmpList.eventView.");
                var nextJson = null;
                var ret = GenDataEmpList._eventView.select(function(json) {
                    nextJson = json;
                }, error, null, {
                    ordered: true,
                    orderAttribute: "Name"
                }).then(function () {
                    if (nextJson) {
                        return GenDataEmpList.eventView.fetchAll(nextJson, complete, error);
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


