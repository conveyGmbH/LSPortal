// service for page: eventSeriesAdministration
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("EventSeriesAdministration", {
        //MandantSerie_ODataVIEW
        _mandantSerie: {
            get: function () {
                return AppData.getFormatView("MandantSerie", 0);
            }
        },
        _eventSerieTable: {
            get: function () {
                return AppData.getFormatView("CR_VeranstaltungSerie", 0);
            }
        },
        _eventSerieUsageId: 0,
        _eventId: 0
    });
    WinJS.Namespace.define("EventSeriesAdministration", {
        mandantSerie: {
            select: function (complete, error, restriction, options) {
                Log.call(Log.l.trace, "EventSeriesAdministration.mandantSerie.");
                if (!options) {
                    options = {
                        //ordered: true,
                        //orderAttribute: "Sortierung",
                        desc: true
                    };
                }
                var ret = EventSeriesAdministration._mandantSerie.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        eventSerieTable: {
            select: function (complete, error, restriction, options) {
                if (!restriction) {
                    restriction = {
                        LanguageSpecID: AppData.getLanguageId()
                    };
                            restriction.VeranstaltungID = EventSeriesAdministration._eventId;
                        }
                if (!options) {
                    options = {
                        //ordered: true,
                        //orderAttribute: "Sortierung",
                        desc: true
                    };
                }
                Log.call(Log.l.trace, "EventSeriesAdministration.eventView.",
                    "LanguageSpecID=" + restriction.LanguageSpecID,
                    "VeranstaltungID=" + restriction.VeranstaltungID);
                var ret = EventSeriesAdministration._eventSerieTable.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "EventSeriesAdministration.eventView.");
                var ret = EventSeriesAdministration._eventSerieTable.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EventSeriesAdministration.eventView.");
                var ret = EventSeriesAdministration._eventSerieTable.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: EventSeriesAdministration._eventSerieTable.relationName,
            pkName: EventSeriesAdministration._eventSerieTable.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventSeriesAdministration._eventSerieTable.oDataPkName) {
                        ret = record[EventSeriesAdministration._eventSerieTable.oDataPkName];
                    }
                    if (!ret && EventSeriesAdministration._eventSerieTable.pkName) {
                        ret = record[EventSeriesAdministration._eventSerieTable.pkName];
                    }
                }
                return ret;
        },
        insert: function (complete, error) {
            Log.call(Log.l.trace, "EventSeriesAdministration.eventTable.");
            var ret = EventSeriesAdministration._eventSerieTable.insert(function () {
                if (typeof complete === "function") {
                    complete();
                }
            }, error, {
                    VeranstaltungID: EventSeriesAdministration._eventId,
                    MandantSerieID: 1,
                    SerieAnzeige: null
            });
            Log.ret(Log.l.trace);
            return ret;
        },
        update: function (complete, error, recordId, viewResponse) {
            Log.call(Log.l.trace, "EventSeriesAdministration.eventTable.");
            var ret = EventSeriesAdministration._eventSerieTable.update(complete, error, recordId, viewResponse);
            Log.ret(Log.l.trace);
            return ret;
        },
            deleteRecord: function(complete, error, recordId) {
                Log.call(Log.l.trace, "EventSeriesAdministration.eventTable.");
                var ret = EventSeriesAdministration._eventSerieTable.deleteRecord(function () {
                    if (typeof complete === "function") {
                        complete();
                    }
                }, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        relationName: EventSeriesAdministration._eventSerieTable.relationName,
        pkName: EventSeriesAdministration._eventSerieTable.oDataPkName,
        getRecordId: function (record) {
            var ret = null;
            if (record) {
                if (EventSeriesAdministration._eventSerieTable.oDataPkName) {
                    ret = record[EventSeriesAdministration._eventSerieTable.oDataPkName];
                }
                if (!ret && EventSeriesAdministration._eventSerieTable.pkName) {
                    ret = record[EventSeriesAdministration._eventSerieTable.pkName];
                }
            }
            return ret;
        }
    });
})();


