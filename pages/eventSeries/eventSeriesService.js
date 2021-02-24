// service for page: EventSeries
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EventSeries", {
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, true);
            }
        },
        initSpracheView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "EventSeries._initSpracheView.");
                var ret = EventSeries._initSpracheView.select(complete, error, recordId, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "EventSeries._initSpracheView.");
                var ret = EventSeries._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "EventSeries._initSpracheView.");
                var ret = EventSeries._initSpracheView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _seriesTable: {
            get: function () {
                return AppData.getFormatView("MandantSerie", 0);
            }
        },
        _seriesView: {
            get: function () {
                return AppData.getFormatView("LangMandantSerie", 20629);
            }
        }
    });
    WinJS.Namespace.define("EventSeries", {
        seriesTable: {
            select: function (complete, error, restriction, options) {
                Log.call(Log.l.trace, "EventSeries.seriesTable.");
                var ret = EventSeries._seriesTable.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "EventSeries.seriesTable.");
                var ret = EventSeries._seriesTable.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EventSeries.seriesTable.");
                var ret = EventSeries._seriesTable.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "EventSeries.seriesTable.");
                var ret = EventSeries._seriesTable.deleteRecord(function () {
                    if (typeof complete === "function") {
                        complete();
                    }
                }, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EventSeries.seriesTable.");
                var ret = EventSeries._seriesTable.update(function () {
                    if (typeof complete === "function") {
                        complete();
                    }
                }, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error) {
                Log.call(Log.l.trace, "EventSeries.seriesTable.");
                var ret = EventSeries._seriesTable.insert(function () {
                    if (typeof complete === "function") {
                        complete();
                    }
                }, error, {
                    Titel: ""
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: EventSeries._seriesTable.relationName
        },
        seriesView: {
            select: function (complete, error, restriction, options) {
                Log.call(Log.l.trace, "EventSeries.seriesView.");
                if (!restriction) {
                    restriction = {
                        MandantSerieID: EventSeries._eventId,
                        NameLanguageID: AppData.getLanguageId(),
                        LanguageSpecID: EventSeries._languageId
                    };
                }
                /*if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "Sortierung",
                        desc: false
                    };
                }*/
                var ret = EventSeries._seriesView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "EventSeries.seriesView.");
                var ret = EventSeries._seriesView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EventSeries.seriesView.");
                var ret = EventSeries._seriesView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: EventSeries._seriesView.relationName,
            pkName: EventSeries._seriesView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventSeries._seriesView.oDataPkName) {
                        ret = record[EventSeries._seriesView.oDataPkName];
                    }
                    if (!ret && EventSeries._seriesView.pkName) {
                        ret = record[EventSeries._seriesView.pkName];
                    }
                }
                return ret;
            }
        },
        _eventId: 0,
        _languageId: 1031
    });
})();


