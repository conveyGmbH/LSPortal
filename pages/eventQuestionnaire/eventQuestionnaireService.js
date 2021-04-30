// service for page: eventSpeakerAdministration
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("EventQuestionnaire", {
        /**
         * Combobox
         */
        _questionTypeView: {
            get: function () {
                return AppData.getFormatView("LGNTINITQuestionType", 20651); /*View for Questiontyp*/
            }
        },
        _questionView: {
            get: function () {
                return AppData.getFormatView("Question", 20648); /*View for Question*/
            }
        },
        _vaQuestionTable: {
            get: function () {
                return AppData.getFormatView("Cr_VAQuestion", 0); /*Table for Crosstable*/
            }
        },
        _vaQuestionVIEW: {
            get: function () {
                return AppData.getFormatView("Cr_VAQuestion", 20652); /*View for Crosstable*/
            }
        },
        _eventId: 0
    });
    WinJS.Namespace.define("EventQuestionnaire", {
        questionTypeView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                if (!restriction) {
                    restriction = {
                        LanguageSpecID: AppData.getLanguageId()
                    };
                }
                var ret = EventQuestionnaire._questionTypeView.select(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        questionView: {
            select: function (complete, error, restriction, options) {
                Log.call(Log.l.trace, "EventQuestionnaire.seriesView.");
                if (!restriction) {
                    restriction = {
                    }
                }
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "QuestionVIEWID",
                        desc: false
                    };
                }
                var ret = EventQuestionnaire._questionView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        vaQuestionVIEW: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "EventQuestionnaire.eventView.",
                    "VeranstaltungID=" + EventQuestionnaire._eventId);
                if (!restriction) {
                    restriction = {
                        VeranstaltungID: EventQuestionnaire._eventId
                    };
                }
                var ret = EventQuestionnaire._vaQuestionVIEW.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Cr_VAQuestionVIEWID"
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "EventQuestionnaire.eventView.");
                var ret = EventQuestionnaire._vaQuestionVIEW.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EventQuestionnaire.eventView.");
                var ret = EventQuestionnaire._vaQuestionVIEW.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: EventQuestionnaire._vaQuestionVIEW.relationName,
            pkName: EventQuestionnaire._vaQuestionVIEW.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventQuestionnaire._vaQuestionVIEW.oDataPkName) {
                        ret = record[EventQuestionnaire._vaQuestionVIEW.oDataPkName];
                    }
                    if (!ret && EventQuestionnaire._vaQuestionVIEW.pkName) {
                        ret = record[EventQuestionnaire._vaQuestionVIEW.pkName];
                    }
                }
                return ret;
            }
        },
        vaQuestionTable: {
            insert: function (complete, error) {
                Log.call(Log.l.trace, "GenDataModDetails.adresseDOC");
                var ret = EventQuestionnaire._vaQuestionTable.insert(complete, error, { VeranstaltungID: EventQuestionnaire._eventId});
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.eventSpeakerTable.");
                var ret = EventQuestionnaire._vaQuestionTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.eventSpeakerTable.");
                // Mitarbeiter need to be deleted via DELETE Trigger!
                var ret = EventQuestionnaire._vaQuestionTable.deleteRecord(function () {
                    if (typeof complete === "function") {
                        complete();
                    }
                }, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: EventQuestionnaire._vaQuestionTable.relationName,
            pkName: EventQuestionnaire._vaQuestionTable.pkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventQuestionnaire._vaQuestionTable.oDataPkName) {
                        ret = record[EventQuestionnaire._vaQuestionTable.oDataPkName];
                    }
                    if (!ret && EventQuestionnaire._vaQuestionTable.pkName) {
                        ret = record[EventQuestionnaire._vaQuestionTable.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();