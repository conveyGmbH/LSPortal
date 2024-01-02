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
    var namespaceName = "MediaText";

    WinJS.Namespace.define("MediaText", {
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, true);
            }
        },
        initSpracheView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".initSpracheView.");
                var ret = MediaText._initSpracheView.select(complete, error, recordId, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, namespaceName + ".initSpracheView.");
                var ret = MediaText._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, namespaceName + ".initSpracheView.");
                var ret = MediaText._initSpracheView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _docId: 0,
        _languageId: AppData.getLanguageId(),
        _eventTextView: {
            get: function () {
                return AppData.getFormatView("LangMandantDokument", 20634);
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
                Log.call(Log.l.trace, namespaceName + ".eventTextView.",
                    "LangMandantDokumentVIEWID=" + restriction.LangMandantDokumentVIEWID +
                    " NameLanguageID=" + restriction.NameLanguageID +
                    " LanguageSpecID=" + restriction.LanguageSpecID +
                    " MandantDokumentID=" + restriction.MandantDokumentID);
                var ret = MediaText._eventTextView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".eventTextView.");
                var ret = MediaText._eventTextView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".eventTextView.");
                var ret = MediaText._eventTextView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return MediaText._eventTextView.relationName;
                }
            },
            pkName: {
                get: function() {
                    return MediaText._eventTextView.oDataPkName;
                }
            },
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
        _eventTextTable: {
            get: function () {
                return AppData.getFormatView("LangMandantDokument", 0);
            }
        },
        eventTextTable: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".eventTextTable.");
                var ret = MediaText._eventTextTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return MediaText._eventTextTable.relationName;
                }
            },
            pkName: {
                get: function() {
                    return MediaText._eventTextTable.oDataPkName;
                }
            },
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


