// service for page: EventsList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EventList", {
        _restriction: null,
        _iNOptionTypeValueView: {
            get: function () {
                return AppData.getFormatView("INOptionTypeValue", 20666);
            }
        },
        iNOptionTypeValueView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "iNOptionTypeValueView.");
                var ret = EventList._iNOptionTypeValueView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Idx"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _VeranstaltungView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20542);
            }
        },
        VeranstaltungView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "EventList.");
                if (EventList._restriction) {
                    restriction = EventList._restriction;
                }
                var ret = EventList._VeranstaltungView.select(complete, error, restriction, {
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
            }
        }
    });
})();