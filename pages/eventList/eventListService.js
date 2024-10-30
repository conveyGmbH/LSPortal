// service for page: EventsList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EventList", {
        _restriction: null,
        _orderAttribute: "StartDatum",
        _orderDesc: true,
       _VeranstaltungView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20542);
            }
        },
        VeranstaltungView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "EventList.");
                if (!restriction) {
                    if (EventList._restriction) {
                        restriction = EventList._restriction;
                    }
                }
                var ret;
                if (typeof restriction === "number") {
                    ret = EventList._VeranstaltungView.selectById(complete, error, restriction);
                } else {
                    ret = EventList._VeranstaltungView.select(complete, error, restriction, {
                        ordered: true,
                        orderAttribute: EventList._orderAttribute,
                        desc: EventList._orderDesc
                    });
                }
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "EventList.");
                var ret = EventList._VeranstaltungView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EventList.");
                var ret = EventList._VeranstaltungView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventList._VeranstaltungView.oDataPkName) {
                        ret = record[EventList._VeranstaltungView.oDataPkName];
                    }
                    if (!ret && EventList._VeranstaltungView.pkName) {
                        ret = record[EventList._VeranstaltungView.pkName];
                    }
                }
                return ret;
            }
        },
        _appListSpecView: {
            get: function () {
                return AppData.getFormatView("AppListSpec", 20457);
            }
        },
        appListSpecView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, "appListSpecView.");
                var ret = Event._appListSpecView.select(complete, error);

                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();
