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
        _langSeriesTable: {
            get: function () {
                return AppData.getFormatView("LangMandantSerie", 0);
            }
        },
        _langSeriesView: {
            get: function () {
                return AppData.getFormatView("LangMandantSerie", 20629);
            }
        },
        seriesView: {
            select: function (complete, error, restriction, options) {
                Log.call(Log.l.trace, "EventSeries.seriesView.");
                if (!restriction) {
                    restriction = {
                        NameLanguageID: AppData.getLanguageId(),
                        LanguageSpecID: EventSeries._languageId
                    };
                }
                if (!options) {
                    options = {
                        ordered: true
                    };
                }
                var ret = EventSeries._langSeriesView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "EventSeries.seriesView.");
                var ret = EventSeries._langSeriesView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EventSeries.seriesView.");
                var ret = EventSeries._langSeriesView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return EventSeries._langSeriesView.relationName;
                }
            },
            pkName: {
                get: function() {
                    return EventSeries._langSeriesView.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventSeries._langSeriesView.oDataPkName) {
                        ret = record[EventSeries._langSeriesView.oDataPkName];
                    }
                    if (!ret && EventSeries._langSeriesView.pkName) {
                        ret = record[EventSeries._langSeriesView.pkName];
                    }
                }
                return ret;
            }
        },
        seriesTable: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EventSeries.seriesTable.");
                var ret = EventSeries._langSeriesTable.update(function () {
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
            deleteRecord: function (complete, error, recordId) {
                var ret;
                Log.call(Log.l.trace, "EventSeries.seriesTable.");
                if (AppBar.scope && typeof AppBar.scope.scopeFromRecordId === "function") {
                    var record = AppBar.scope.scopeFromRecordId(recordId);
                    if (record && record.item) {
                        var pkName = EventSeries._seriesTable.relationName + "ID";
                        recordId = record.item[pkName];
                    } else {
                        recordId = 0;
                    }
                } else {
                    recordId = 0;
                }
                if (recordId) {
                    ret = EventSeries._seriesTable.deleteRecord(function () {
                        if (typeof complete === "function") {
                            complete();
                        }
                    }, error, recordId);
                } else {
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return EventSeries._langSeriesTable.relationName;
                }
            },
            pkName: {
                get: function() {
                    return EventSeries._langSeriesTable.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventSeries._langSeriesTable.oDataPkName) {
                        ret = record[EventSeries._langSeriesTable.oDataPkName];
                    }
                    if (!ret && EventSeries._langSeriesTable.pkName) {
                        ret = record[EventSeries._langSeriesTable.pkName];
                    }
                }
                return ret;
            }
        },
        _languageId: 1031
    });
})();


