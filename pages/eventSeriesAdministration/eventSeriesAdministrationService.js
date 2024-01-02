// service for page: eventSeriesAdministration
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("EventSeriesAdministration", {
        _eventId: 0,
        _seriesView: {
            get: function () {
                return AppData.getFormatView("MandantSerie", 0);
            }
        },
        _eventSeriesTable: {
            get: function () {
                return AppData.getFormatView("CR_VeranstaltungSerie", 0);
            }
        },
        seriesView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, "EventSeriesAdministration.seriesView.");
                var ret = EventSeriesAdministration._seriesView.select(complete, error);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        eventSeriesTable: {
            select: function (complete, error) {
                Log.call(Log.l.trace, "EventSeriesAdministration.eventView.",
                    "VeranstaltungID=" + EventSeriesAdministration._eventId);
                var ret = EventSeriesAdministration._eventSeriesTable.select(complete, error, {
                    VeranstaltungID: EventSeriesAdministration._eventId
                }, {
                    ordered: true,
                    orderAttribute: "CR_VeranstaltungSerieVIEWID"
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "EventSeriesAdministration.eventView.");
                var ret = EventSeriesAdministration._eventSeriesTable.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EventSeriesAdministration.eventView.");
                var ret = EventSeriesAdministration._eventSeriesTable.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error) {
                Log.call(Log.l.trace, "EventSeriesAdministration.eventTable.");
                var ret = EventSeriesAdministration._eventSeriesTable.insert(complete, error, {
                    VeranstaltungID: EventSeriesAdministration._eventId
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EventSeriesAdministration.eventTable.");
                var ret = EventSeriesAdministration._eventSeriesTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function(complete, error, recordId) {
                Log.call(Log.l.trace, "EventSeriesAdministration.eventTable.");
                var ret = EventSeriesAdministration._eventSeriesTable.deleteRecord(function () {
                    if (typeof complete === "function") {
                        complete();
                    }
                }, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return EventSeriesAdministration._eventSeriesTable.relationName;
                }
            },
            pkName: {
                get: function() {
                    return EventSeriesAdministration._eventSeriesTable.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventSeriesAdministration._eventSeriesTable.oDataPkName) {
                        ret = record[EventSeriesAdministration._eventSeriesTable.oDataPkName];
                    }
                    if (!ret && EventSeriesAdministration._eventSeriesTable.pkName) {
                        ret = record[EventSeriesAdministration._eventSeriesTable.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();


