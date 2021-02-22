// service for page: eventResourceAdministration
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    /**
     * LangMandantDokumentVIEW_20628 darauf nur select
     * LangMandantDokument_odataView darauf update
     */
    WinJS.Namespace.define("EventResourceAdministration", {
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
    WinJS.Namespace.define("EventResourceAdministration", {
        eventTextView: {
            select: function (complete, error, restriction, options) {
                if (!restriction) {
                    restriction = {
                        LanguageSpecID: AppData.getLanguageId(),
                        NameLanguageID: AppData.getLanguageId(),
                    };
                    if (EventResourceAdministration._eventTextUsageId && EventResourceAdministration._eventTextUsageId <= 2 ||
                        EventResourceAdministration._eventTextUsageId > 2 && EventResourceAdministration._eventId) {
                        restriction.DokVerwendungID = EventResourceAdministration._eventTextUsageId;
                        if (EventResourceAdministration._eventTextUsageId > 2) {
                            restriction.VeranstaltungID = EventResourceAdministration._eventId;
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
                    "NameLanguageID=" + restriction.NameLanguageID,
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


