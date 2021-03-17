// service for page: eventSpeakerAdministration
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("EventSpeakerAdministration", {
        /**
         * Combobox
         */
        _speakerView: {
            get: function () {
                return AppData.getFormatView("PersonAdresse", 20639); /*PersonAdresse*/
            }
        },
        _eventSpeakerTable: {
            get: function () {
                return AppData.getFormatView("Benutzer", 0); /*neue andere CR-Tabelle*/
            }
        },
        _eventSpeakerVIEW: {
            get: function () {
                return AppData.getFormatView("Benutzer", 20642); /*neue andere CR-Tabelle*/
            }
        },
        _eventId: 0
    });
    WinJS.Namespace.define("EventSpeakerAdministration", {
        speakerView: {
            select: function (complete, error, restriction, options) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.seriesView.");
                if (!restriction) {
                    restriction = {
                        LanguageSpecID: AppData.getLanguageId()
                    };
                }
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "PersonAdresseVIEWID",
                        desc: false
                    };
                }
                var ret = EventSpeakerAdministration._speakerView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        eventSpeakerVIEW: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.eventView.",
                    "VeranstaltungID=" + EventSpeakerAdministration._eventId);
                if (!restriction) {
                    restriction = {
                        VeranstaltungID: EventSpeakerAdministration._eventId,
                        Name: "NULL",
                        /*Vorname: "NULL",*/
                        LanguageSpecID: AppData.getLanguageId()
                    };
                }
                var ret = EventSpeakerAdministration._eventSpeakerVIEW.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "BenutzerVIEWID"
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.eventView.");
                var ret = EventSpeakerAdministration._eventSpeakerVIEW.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.eventView.");
                var ret = EventSpeakerAdministration._eventSpeakerVIEW.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }/*,
            insert: function (complete, error) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.eventTable.");
                var ret = EventSpeakerAdministration._eventSpeakerTable.insert(complete, error, {
                    VeranstaltungID: EventSpeakerAdministration._eventId
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.eventTable.");
                var ret = EventSpeakerAdministration._eventSpeakerTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function(complete, error, recordId) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.eventTable.");
                var ret = EventSpeakerAdministration._eventSpeakerTable.deleteRecord(function () {
                    if (typeof complete === "function") {
                        complete();
                    }
                }, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: EventSpeakerAdministration._eventSpeakerTable.relationName,
            pkName: EventSpeakerAdministration._eventSpeakerTable.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventSpeakerAdministration._eventSpeakerTable.oDataPkName) {
                        ret = record[EventSpeakerAdministration._eventSpeakerTable.oDataPkName];
                    }
                    if (!ret && EventSpeakerAdministration._eventSpeakerTable.pkName) {
                        ret = record[EventSpeakerAdministration._eventSpeakerTable.pkName];
                    }
                }
                return ret;
            }*/
        },
        eventSpeakerTable: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.eventTable.");
                var ret = EventSpeakerAdministration._eventSpeakerTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.eventTable.");
                var ret = EventSpeakerAdministration._eventSpeakerTable.deleteRecord(function () {
                    if (typeof complete === "function") {
                        complete();
                    }
                }, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


