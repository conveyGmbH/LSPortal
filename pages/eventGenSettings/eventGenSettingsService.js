// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EventGenSettings", {
        _conferenceExhibitorView: {
            get: function() {
                return AppData.getFormatView("ConferenceExhibitor", 0, false);
            },
            _eventId: 0,
            _conferenceId: 0
        },
        conferenceExhibitorView: {
            select: function (complete, error, restriction, options) {
                if (!restriction) {
                    restriction = {
                        ConferenceExhibitorVIEWID: EventGenSettings._conferenceId
                    };
                    
                }
                if (!options) {
                    options = {
                        //ordered: true,
                        //orderAttribute: "Sortierung",
                        desc: true
                    };
                }
                Log.call(Log.l.trace, "EventSeriesAdministration.eventView.",
                    "LanguageSpecID=" + restriction.LanguageSpecID,
                    "VeranstaltungID=" + restriction.VeranstaltungID);
                var ret = EventGenSettings._conferenceExhibitorView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "eventView.");
                var ret = EventGenSettings._conferenceExhibitorView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Name: "",
                VideoBackgroundColor: ""
            },
            newEventDefault: {
                VeranstaltungName: ""
            },
            relationName: {
                get: function() {
                    return EventGenSettings._conferenceExhibitorView.relationName;
                }
            },
            pkName: {
                get: function() {
                    return EventGenSettings._conferenceExhibitorView.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (EventGenSettings._conferenceExhibitorView.oDataPkName) {
                        ret = record[EventGenSettings._conferenceExhibitorView.oDataPkName];
                    }
                    if (!ret && EventGenSettings._conferenceExhibitorView.pkName) {
                        ret = record[EventGenSettings._conferenceExhibitorView.pkName];
                    }
                }
                return ret;
            }
        },
        _mandantStartView: {
            get: function () {
                return AppData.getFormatView("MandantStart", 0);
            }
        },
        mandantStartView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "mandantStartView.");
                var ret = EventGenSettings._mandantStartView.select(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                StartUrl: ""
            }
        }
    });
})();