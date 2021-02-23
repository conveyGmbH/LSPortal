// service for page: eventMediaAdministration
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    /**
     * LangMandantDokumentVIEW_20628 darauf nur select
     * LangMandantDokument_odataView darauf update
     */
    WinJS.Namespace.define("EventMediaAdministration", {
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
        _eventTextUsageId: 0,
        _eventId: 0
    });
    WinJS.Namespace.define("EventMediaAdministration", {
        eventTextView: {
            select: function (complete, error, restriction, options) {
                if (!restriction) {
                    restriction = {
                        LanguageSpecID: AppData.getLanguageId()
                    };
                    if (EventMediaAdministration._eventTextUsageId && EventMediaAdministration._eventTextUsageId <= 2 ||
                        EventMediaAdministration._eventTextUsageId > 2 && EventMediaAdministration._eventId) {
                        restriction.DokVerwendungID = EventMediaAdministration._eventTextUsageId;
                        if (EventMediaAdministration._eventTextUsageId > 2) {
                            restriction.VeranstaltungID = EventMediaAdministration._eventId;
                        }
                    }
                }
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "Sortierung",
                        desc: false
                    };
                }
                Log.call(Log.l.trace, "EventResourceAdministration.eventView.",
                    "LanguageSpecID=" + restriction.LanguageSpecID,
                    "DokVerwendungID=" + restriction.DokVerwendungID,
                    "VeranstaltungID=" + restriction.VeranstaltungID);
                var ret = EventMediaAdministration._eventTextView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultMediaAdministrationData: {
                MediaMetaTitle : "",
                MediaAltText: "",
                MediaFreitextKommentar: "",
                MediaName: "",
                LinkToFile: "",
                Categorie: ""
            }
            ,
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Events.eventView.");
                var ret = EventMediaAdministration._eventTextView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Events.eventView.");
                var ret = EventMediaAdministration._eventTextView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: EventMediaAdministration._eventTextView.relationName,
            pkName: EventMediaAdministration._eventTextView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventMediaAdministration._eventTextView.oDataPkName) {
                        ret = record[EventMediaAdministration._eventTextView.oDataPkName];
                    }
                    if (!ret && EventMediaAdministration._eventTextView.pkName) {
                        ret = record[EventMediaAdministration._eventTextView.pkName];
                    }
                }
                return ret;
            }
        },
        eventTextTable: {
            /*insert: function (complete, error) {
                Log.call(Log.l.trace, "EventResourceAdministration.eventTable.");
                var ret = EventResourceAdministration._eventTextTable.insert(function () {
                    if (typeof complete === "function") {
                        complete();
                    }
                }, error, {
                    insertFlag: 0
                });
                Log.ret(Log.l.trace);
                return ret;
            },*/
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EventResourceAdministration.eventTable.");
                var ret = EventMediaAdministration._eventTextTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: EventMediaAdministration._eventTextTable.relationName,
            pkName: EventMediaAdministration._eventTextTable.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventMediaAdministration._eventTextTable.oDataPkName) {
                        ret = record[EventMediaAdministration._eventTextTable.oDataPkName];
                    }
                    if (!ret && EventMediaAdministration._eventTextTable.pkName) {
                        ret = record[EventMediaAdministration._eventTextTable.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();


