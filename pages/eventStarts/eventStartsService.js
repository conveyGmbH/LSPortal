// service for page: EventStarts
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EventStarts", {
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, true);
            }
        },
        initSpracheView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "EventStarts._initSpracheView.");
                var ret = EventStarts._initSpracheView.select(complete, error, recordId, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "EventStarts._initSpracheView.");
                var ret = EventStarts._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "EventStarts._initSpracheView.");
                var ret = EventStarts._initSpracheView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _startsTable: {
            get: function () {
                return AppData.getFormatView("MandantStart", 0); 
            }
        },
        _langStartsTable: {
            get: function () {
                return AppData.getFormatView("LangMandantSerie", 0); //LangMandantStart?
            }
        },
        _langStartsView: {
            get: function () {
                return AppData.getFormatView("LangMandantSerie", 20629); //LangMandantStart..?
            }
        }
    });
    WinJS.Namespace.define("EventStarts", {
        startsView: {
            select: function (complete, error, restriction, options) {
                Log.call(Log.l.trace, "EventStarts.seriesView.");
                if (!restriction) {
                    restriction = {
                        NameLanguageID: AppData.getLanguageId(),
                        LanguageSpecID: EventStarts._languageId
                    };
                }
                if (!options) {
                    options = {
                        ordered: true
                    };
                }
                var ret = EventStarts._langStartsView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "EventStarts.seriesView.");
                var ret = EventStarts._langStartsView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EventStarts.seriesView.");
                var ret = EventStarts._langStartsView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: EventStarts._langStartsView.relationName,
            pkName: EventStarts._langStartsView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventStarts._langStartsView.oDataPkName) {
                        ret = record[EventStarts._langStartsView.oDataPkName];
                    }
                    if (!ret && EventStarts._langStartsView.pkName) {
                        ret = record[EventStarts._langStartsView.pkName];
                    }
                }
                return ret;
            }
        },
        startsTable: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EventStarts.startsTable.");
                var ret = EventStarts._langStartsTable.update(function () {
                    if (typeof complete === "function") {
                        complete();
                    }
                }, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error) {
                Log.call(Log.l.trace, "EventStarts.startsTable.");
                var ret = EventStarts._startsTable.insert(function () {
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
                Log.call(Log.l.trace, "EventStarts.startsTable.");
                if (AppBar.scope && typeof AppBar.scope.scopeFromRecordId === "function") {
                    var record = AppBar.scope.scopeFromRecordId(recordId);
                    if (record && record.item) {
                        var pkName = EventStarts._startsTable.relationName + "ID";
                        recordId = record.item[pkName];
                    } else {
                        recordId = 0;
                    }
                } else {
                    recordId = 0;
                }
                if (recordId) {
                    ret = EventStarts._startsTable.deleteRecord(function () {
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
            relationName: EventStarts._langStartsTable.relationName,
            pkName: EventStarts._langStartsTable.oDataPkName,
            _pkName: EventStarts._langStartsTable.pkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventStarts.startsTable.pkName) {
                        ret = record[EventStarts.startsTable.pkName];
                    }
                    if (!ret && EventStarts.startsTable._pkName) {
                        ret = record[EventStarts.startsTable._pkName];
                    }
                }
                return ret;
            }
        },
        _languageId: 1031
    });
})();


