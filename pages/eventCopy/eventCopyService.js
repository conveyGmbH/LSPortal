﻿// service for page: EventCopy
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EventCopy", {
        _eventId: 0,
        _VeranstaltungView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20542);
            }
        },
        VeranstaltungView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "EventList.");
                var ret = EventCopy._VeranstaltungView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Startdatum",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "EventList.");
                var ret = EventCopy._VeranstaltungView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EventList.");
                var ret = EventCopy._VeranstaltungView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                VeranstaltungVIEWID: 0,
                Name: ""
            }
        }
    });
})();


