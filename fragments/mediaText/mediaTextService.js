// service for page: eventResourceAdministration
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
    WinJS.Namespace.define("MediaText", {
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, true);
            }
        },
        initSpracheView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "AppData._initSpracheView.");
                var ret = MediaText._initSpracheView.select(complete, error, recordId, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "AppData._initSpracheView.");
                var ret = MediaText._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "AppData._initSpracheView.");
                var ret = MediaText._initSpracheView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _eventSeriesView: {
            get: function () {
                return AppData.getFormatView("CR_VeranstaltungSerie", 20643);
            }
        },
        _eventTextView: {
            get: function () {
                return AppData.getFormatView("LangMandantDokument", 20634);
            }
        },
        _eventTextTable: {
            get: function () {
                return AppData.getFormatView("LangMandantDokument", 0);
            }
        },
        _eventTextUsageId: -1,
        _eventId: -1,
        _docId: 0,
        _languageId: AppData.getLanguageId(),
        _eventSeriesId: -1,
        eventSeriesId: {
            get: function() {
                if (AppBar.scope && typeof AppBar.scope.getEventSeriesId === "function") {
                    MediaText._eventSeriesId = AppBar.scope.getEventSeriesId();
                }
                return MediaText._eventSeriesId;
            },
            set: function(value) {
                MediaText._eventSeriesId = value;
                if (AppBar.scope && typeof AppBar.scope.setEventSeriesId === "function") {
                    MediaText._eventSeriesId = AppBar.scope.setEventSeriesId(value);
                }
            }
        }
    });
    WinJS.Namespace.define("MediaText", {
        eventSeriesView: {
            select: function(complete, error) {
                var restriction;
                if (MediaText._eventId > 0) {
                    restriction = {
                    LanguageSpecID: MediaText._languageId,
                    VeranstaltungID: MediaText._eventId
                };
                } else if (MediaText._eventSeriesId > 0) {
                    restriction = {
                        LanguageSpecID: MediaText._languageId,
                        MandantSerieID: 1
                    };
                } else {
                    restriction = {
                        LanguageSpecID: MediaText._languageId,
                        VeranstaltungID: MediaText._eventId,
                        MandantSerieID: MediaText._eventSeriesId
                    };
                }
                Log.call(Log.l.trace, "EventResourceAdministration.eventSeriesView.",
                    "LanguageSpecID=" + restriction.LanguageSpecID,
                    "VeranstaltungID=" + MediaText._eventId,
                    "MandantSerieID=" + restriction.MandantSerieID);
                var ret = MediaText._eventSeriesView.select(complete, error, restriction, {
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
                        LanguageSpecID: MediaText._languageId,
                        MandantDokumentID: MediaText._docId ? MediaText._docId : -1
                    };
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
                Log.call(Log.l.trace, "MediaText.eventTextView.",
                    "NameLanguageID=" + restriction.NameLanguageID,
                    "LanguageSpecID=" + restriction.LanguageSpecID,
                    "MandantDokumentID=" + restriction.MandantDokumentID);
                var ret = MediaText._eventTextView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "MediaText.eventTextView.");
                var ret = MediaText._eventTextView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "MediaText.eventTextView.");
                var ret = MediaText._eventTextView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: MediaText._eventTextView.relationName,
            pkName: MediaText._eventTextView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (MediaText._eventTextView.oDataPkName) {
                        ret = record[MediaText._eventTextView.oDataPkName];
                    }
                    if (!ret && MediaText._eventTextView.pkName) {
                        ret = record[MediaText._eventTextView.pkName];
                    }
                }
                return ret;
            }
        },
        eventTextTable: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "MediaText.eventTextTable.");
                var ret = MediaText._eventTextTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: MediaText._eventTextTable.relationName,
            pkName: MediaText._eventTextTable.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (MediaText._eventTextTable.oDataPkName) {
                        ret = record[MediaText._eventTextTable.oDataPkName];
                    }
                    if (!ret && MediaText._eventTextTable.pkName) {
                        ret = record[MediaText._eventTextTable.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();


