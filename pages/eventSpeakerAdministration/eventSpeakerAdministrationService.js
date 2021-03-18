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
                return AppData.getFormatView("Benutzer", 0); /*neue andere CR-Tabelle, benötigt aber noch Mitarbeiter, da Fremd-Primär!*/
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
                        // Wäre eine Kategorie nicht besser???
                        Vorname: "NULL", //???
                        Name: "NULL", //???
                        VeranstaltungID: EventSpeakerAdministration._eventId,
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
            },
            relationName: EventSpeakerAdministration._eventSpeakerVIEW.relationName,
            pkName: EventSpeakerAdministration._eventSpeakerVIEW.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventSpeakerAdministration._eventSpeakerVIEW.oDataPkName) {
                        ret = record[EventSpeakerAdministration._eventSpeakerVIEW.oDataPkName];
                    }
                    if (!ret && EventSpeakerAdministration._eventSpeakerVIEW.pkName) {
                        ret = record[EventSpeakerAdministration._eventSpeakerVIEW.pkName];
                    }
                }
                return ret;
            }
        },
        eventSpeakerTable: {
            insert: function (complete, error) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.eventSpeakerTable.");
                var recordId = 0;
                var err = { status: 0, statusText: "no record returned from insert!" };
                var ret = AppData.call("PRC_CreateEmptyMA", {
                    pVeranstaltungID: EventSpeakerAdministration._eventId
                },
                function(json) {
                    if (json && json.d && json.d.results && json.d.results[0]) {
                        recordId = json.d.results[0].NewMitarbeiterID;
                        Log.print(Log.l.trace, "call success! recordId=" + recordId);
                        if (!recordId) {
                            err.status = json.d.results[0].ResultCode;
                            err.statusText = json.d.results[0].ResultMessage;
                        }
                    }
                },
                function(errorResponse) {
                    Log.print(Log.l.error, "call error");
                    if (typeof error === "function") {
                        error(errorResponse);
                    }
                }).then(function() {
                    if (recordId) {
                        var newRecord = {
                            BenutzerVIEWID: recordId,
                            TagID: "TAGID"+recordId,
                            INITBenAnwID: 0,
                            AnredeID: 0,
                            LandID: 0
                        }
                        return EventSpeakerAdministration._eventSpeakerVIEW.insertWithId(complete, error, newRecord);
                    } else {
                        if (typeof error === "function") {
                            error(err);
                        }
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.eventSpeakerTable.");
                var ret = EventSpeakerAdministration._eventSpeakerTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.eventSpeakerTable.");
                // Mitarbeiter need to be deleted via DELETE Trigger!
                var ret = EventSpeakerAdministration._eventSpeakerTable.deleteRecord(function () {
                    if (typeof complete === "function") {
                        complete();
                    }
                }, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: EventSpeakerAdministration._eventSpeakerTable.relationName,
            pkName: EventSpeakerAdministration._eventSpeakerTable.pkName,
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
            }
        }
    });
})();


