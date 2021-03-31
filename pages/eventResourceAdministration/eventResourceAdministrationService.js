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
    WinJS.Namespace.define("EventResourceAdministration", {
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, true);
            }
        },
        initSpracheView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "AppData._initSpracheView.");
                var ret = EventResourceAdministration._initSpracheView.select(complete, error, recordId, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "AppData._initSpracheView.");
                var ret = EventResourceAdministration._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "AppData._initSpracheView.");
                var ret = EventResourceAdministration._initSpracheView.map;
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
        _eventTextUsageId: -1,
        _eventId: -1,
        _eventSeriesId: -1,
        _languageId: 1031
    });
    WinJS.Namespace.define("EventResourceAdministration", {
        eventSeriesView: {
            select: function(complete, error) {
                var restriction = {
                    LanguageSpecID: EventResourceAdministration._languageId,
                    VeranstaltungID: EventResourceAdministration._eventId
                };
                Log.call(Log.l.trace, "EventResourceAdministration.eventSeriesView.",
                    "LanguageSpecID=" + restriction.LanguageSpecID,
                    "VeranstaltungID=" + restriction.VeranstaltungID);
                var ret = EventResourceAdministration._eventSeriesView.select(complete, error, restriction, {
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
                        LanguageSpecID: EventResourceAdministration._languageId,
                        DokVerwendungID: EventResourceAdministration._eventTextUsageId
                    };
                    if (EventResourceAdministration._eventTextUsageId > 2) {
                        restriction.VeranstaltungID = EventResourceAdministration._eventId;
                        if (!restriction.VeranstaltungID) {
                            restriction.DokVerwendungID = -1;
                        }
                    } else if (EventResourceAdministration._eventTextUsageId === 2) {
                        restriction.MandantSerieID = EventResourceAdministration._eventSeriesId;
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
                Log.call(Log.l.trace, "EventResourceAdministration.eventView.",
                    "NameLanguageID=" + restriction.NameLanguageID,
                    "LanguageSpecID=" + restriction.LanguageSpecID,
                    "DokVerwendungID=" + restriction.DokVerwendungID,
                    "VeranstaltungID=" + restriction.VeranstaltungID);
                var ret = EventResourceAdministration._eventTextView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Events.eventView.");
                var ret = EventResourceAdministration._eventTextView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Events.eventView.");
                var ret = EventResourceAdministration._eventTextView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: EventResourceAdministration._eventTextView.relationName,
            pkName: EventResourceAdministration._eventTextView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventResourceAdministration._eventTextView.oDataPkName) {
                        ret = record[EventResourceAdministration._eventTextView.oDataPkName];
                    }
                    if (!ret && EventResourceAdministration._eventTextView.pkName) {
                        ret = record[EventResourceAdministration._eventTextView.pkName];
                    }
                }
                return ret;
            }
        },
        eventTextTable: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EventResourceAdministration.eventTable.");
                var ret = EventResourceAdministration._eventTextTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: EventResourceAdministration._eventTextTable.relationName,
            pkName: EventResourceAdministration._eventTextTable.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventResourceAdministration._eventTextTable.oDataPkName) {
                        ret = record[EventResourceAdministration._eventTextTable.oDataPkName];
                    }
                    if (!ret && EventResourceAdministration._eventTextTable.pkName) {
                        ret = record[EventResourceAdministration._eventTextTable.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();


