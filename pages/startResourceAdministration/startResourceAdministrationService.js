// service for page: startResourceAdministration
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
    WinJS.Namespace.define("StartResourceAdministration", {
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, true);
            }
        },
        initSpracheView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "AppData._initSpracheView.");
                var ret = StartResourceAdministration._initSpracheView.select(complete, error, recordId, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "AppData._initSpracheView.");
                var ret = StartResourceAdministration._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "AppData._initSpracheView.");
                var ret = StartResourceAdministration._initSpracheView.map;
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
                return AppData.getFormatView("LangMandantDokument", 20628);
            }
        },
        _eventTextTable: {
            get: function () {
                return AppData.getFormatView("LangMandantDokument", 0);
            }
        },
        _eventTextUsageId: 2,
        _eventStartId: 1, /*muss von der Liste gesetzt werden*/
        _languageId: 1031
    });
    WinJS.Namespace.define("StartResourceAdministration", {
        eventSeriesView: {
            select: function(complete, error) {
                var restriction = {
                    LanguageSpecID: StartResourceAdministration._languageId
                };
                Log.call(Log.l.trace, "StartResourceAdministration.eventSeriesView.",
                    "LanguageSpecID=" + restriction.LanguageSpecID);
                var ret = StartResourceAdministration._eventSeriesView.select(complete, error, restriction, {
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
                        LanguageSpecID: StartResourceAdministration._languageId,
                        DokVerwendungID: StartResourceAdministration._eventTextUsageId
                    };
                    if (StartResourceAdministration._eventTextUsageId === 1) {
                        restriction.MandantStartID = StartResourceAdministration._eventStartId;
                        /*if (!restriction.MandantSerieID) {
                            restriction.DokVerwendungID = -1;
                        }*/
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
                Log.call(Log.l.trace, "StartResourceAdministration.eventView.",
                    "NameLanguageID=" + restriction.NameLanguageID,
                    "LanguageSpecID=" + restriction.LanguageSpecID,
                    "DokVerwendungID=" + restriction.DokVerwendungID);
                var ret = StartResourceAdministration._eventTextView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "StartResourceAdministration.eventView.");
                var ret = StartResourceAdministration._eventTextView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "StartResourceAdministration.eventView.");
                var ret = StartResourceAdministration._eventTextView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: StartResourceAdministration._eventTextView.relationName,
            pkName: StartResourceAdministration._eventTextView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (StartResourceAdministration._eventTextView.oDataPkName) {
                        ret = record[StartResourceAdministration._eventTextView.oDataPkName];
                    }
                    if (!ret && StartResourceAdministration._eventTextView.pkName) {
                        ret = record[StartResourceAdministration._eventTextView.pkName];
                    }
                }
                return ret;
            }
        },
        eventTextTable: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "StartResourceAdministration.eventTable.");
                var ret = StartResourceAdministration._eventTextTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: StartResourceAdministration._eventTextTable.relationName,
            pkName: StartResourceAdministration._eventTextTable.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (StartResourceAdministration._eventTextTable.oDataPkName) {
                        ret = record[StartResourceAdministration._eventTextTable.oDataPkName];
                    }
                    if (!ret && StartResourceAdministration._eventTextTable.pkName) {
                        ret = record[StartResourceAdministration._eventTextTable.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();


