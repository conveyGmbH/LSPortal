// service for page: eventSeriesAdministration
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    /**
     * LangMandantDokumentVIEW_20628 darauf nur select
     * LangMandantDokument_odataView darauf update
     */
    WinJS.Namespace.define("EventSeriesAdministration", {
        _eventSerieTable: {
            get: function () {
                return AppData.getFormatView("MandantSerie", 0);
            }
        },
        _eventSerieUsageId: 0,
        _eventId: 0
    });
    WinJS.Namespace.define("EventSeriesAdministration", {
        eventSerieTable: {
            select: function (complete, error, restriction, options) {
                if (!restriction) {
                    restriction = {
                        LanguageSpecID: AppData.getLanguageId()
                    };
                    if (EventSeriesAdministration._eventSerieUsageId && EventSeriesAdministration._eventSerieUsageId <= 2 ||
                        EventSeriesAdministration._eventSerieUsageId > 2 && EventSeriesAdministration._eventId) {
                        restriction.DokVerwendungID = EventSeriesAdministration._eventSerieUsageId;
                        if (EventSeriesAdministration._eventSerieUsageId > 2) {
                            restriction.VeranstaltungID = EventSeriesAdministration._eventId;
                        }
                    }
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
                    "DokVerwendungID=" + restriction.DokVerwendungID,
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
            }
        },
        insert: function (complete, error) {
            Log.call(Log.l.trace, "EventSeriesAdministration.eventTable.");
            var ret = EventSeriesAdministration._eventSerieTable.insert(function () {
                if (typeof complete === "function") {
                    complete();
                }
            }, error, {
                insertFlag: 0
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


