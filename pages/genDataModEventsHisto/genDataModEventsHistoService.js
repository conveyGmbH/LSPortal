// service for page: GenDataModEventsHisto
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />


(function () {
    "use strict";
    WinJS.Namespace.define("GenDataModEventsHisto", {
        _personId: -1,
        _eventId: -1,
        _contactView: {
            get: function () {
                return AppData.getFormatView("Benutzer", 20642);
            }
        },
        contactView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "contactView.");
                var ret = GenDataModEventsHisto._contactView.select(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "contactView.");
                var ret = GenDataModEventsHisto._contactView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {

            }
        },
        _incidentView: {
            get: function () {
                return AppData.getFormatView("Incident", 20621);
            }
        },
        incidentView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "incidentView.", "restriction=" + restriction);
                var ret = GenDataModEventsHisto._incidentView.select(complete, error, restriction, {
                    ordered: true,
                    desc: true
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "GenDataModEventsHisto.");
                var ret = GenDataModEventsHisto._incidentView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "GenDataModEventsHisto.");
                var ret = GenDataModEventsHisto._incidentView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();

