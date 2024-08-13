// service for page: seriesResourceAdministration
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    /**
     * LangMandantDokumentVIEW_20628 darauf nur select
     * neue view LangMandantDokumentVIEW_20634 
     * LangMandantDokument_odataView darauf update
     */
    WinJS.Namespace.define("SeriesResourceAdministration", {
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, true);
            }
        },
        initSpracheView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "AppData._initSpracheView.");
                var ret = SeriesResourceAdministration._initSpracheView.select(complete, error, recordId, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "AppData._initSpracheView.");
                var ret = SeriesResourceAdministration._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "AppData._initSpracheView.");
                var ret = SeriesResourceAdministration._initSpracheView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _eventTextUsageId: 2,
        _eventSeriesId: 1, /*muss von der Liste gesetzt werden*/
        _languageId: 1031,
        _eventSeriesView: {
            get: function () {
                return AppData.getFormatView("CR_VeranstaltungSerie", 20643);
            }
        },
        _eventTextView: {
            get: function () {
                return AppData.getFormatView("LangMandantDokument", 20628);
            }
        },
        _eventTextTable: {
            get: function () {
                return AppData.getFormatView("LangMandantDokument", 0);
            }
        },
        eventSeriesView: {
            select: function (complete, error, restriction) {
                if (!restriction) {
                    restriction = {
                        LanguageSpecID: SeriesResourceAdministration._languageId
                    };
                }
                Log.call(Log.l.trace, "SeriesResourceAdministration.eventSeriesView.",
                    "LanguageSpecID=" + restriction.LanguageSpecID);
                var ret = SeriesResourceAdministration._eventSeriesView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Titel",
                    desc: false
                });
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        eventTextView: {
            select: function (complete, error, restriction, options) {
                if (!restriction) {
                    restriction = {
                        LanguageSpecID: SeriesResourceAdministration._languageId,
                        DokVerwendungID: SeriesResourceAdministration._eventTextUsageId,
                        VeranstaltungID: "NULL"
                    };
                    if (SeriesResourceAdministration._eventTextUsageId === 2) {
                        restriction.MandantSerieID = SeriesResourceAdministration._eventSeriesId;
                        if (!restriction.MandantSerieID) {
                            restriction.DokVerwendungID = -1;
                        }
                    }
                }
                if (typeof restriction === "number") {
                    restriction = {
                        LangMandantDokumentVIEWID: restriction
                    };
                }
                if (typeof restriction === "object" &&
                    !restriction.NameLanguageID) {
                    restriction.NameLanguageID = AppData.getLanguageId();
                }
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "Sortierung",
                        desc: false
                    };
                }
                Log.call(Log.l.trace, "SeriesResourceAdministration.eventView.",
                    "NameLanguageID=" + restriction.NameLanguageID,
                    "LanguageSpecID=" + restriction.LanguageSpecID,
                    "DokVerwendungID=" + restriction.DokVerwendungID);
                var ret = SeriesResourceAdministration._eventTextView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "SeriesResourceAdministration.eventView.");
                var ret = SeriesResourceAdministration._eventTextView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "SeriesResourceAdministration.eventView.");
                var ret = SeriesResourceAdministration._eventTextView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return SeriesResourceAdministration._eventTextView.relationName;
                }
            },
            pkName: {
                get: function() {
                    return SeriesResourceAdministration._eventTextView.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (SeriesResourceAdministration._eventTextView.oDataPkName) {
                        ret = record[SeriesResourceAdministration._eventTextView.oDataPkName];
                    }
                    if (!ret && SeriesResourceAdministration._eventTextView.pkName) {
                        ret = record[SeriesResourceAdministration._eventTextView.pkName];
                    }
                }
                return ret;
            }
        },
        eventTextTable: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "SeriesResourceAdministration.eventTable.");
                var ret = SeriesResourceAdministration._eventTextTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return SeriesResourceAdministration._eventTextTable.relationName;
                }
            },
            pkName: {
                get: function() {
                    return SeriesResourceAdministration._eventTextTable.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (SeriesResourceAdministration._eventTextTable.oDataPkName) {
                        ret = record[SeriesResourceAdministration._eventTextTable.oDataPkName];
                    }
                    if (!ret && SeriesResourceAdministration._eventTextTable.pkName) {
                        ret = record[SeriesResourceAdministration._eventTextTable.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();


