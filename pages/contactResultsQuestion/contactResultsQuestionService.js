﻿// service for page: questionnaire
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    var namespaceName = "ContactResultsQuestion";

    WinJS.Namespace.define("ContactResultsQuestion", {
        _contactView: {
            get: function () {
                return AppData.getFormatView("Kontakt", 0);
            }
        },
        contactView: {
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".contactView.");
                var ret = ContactResultsQuestion._contactView.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _questionnaireView20433: {
            get: function () {
                var ret = AppData.getFormatView("Zeilenantwort", 20433);
                ret.maxPageSize = 10;
                return ret;
            }
        },
        _questionnaireView: {
            get: function () {
                return AppData.getFormatView("Zeilenantwort", 0);
            }
        },
        questionnaireView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".questionnaireView.");
                var ret = ContactResultsQuestion._questionnaireView20433.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Sortierung"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".questionnaireView.");
                var ret = ContactResultsQuestion._questionnaireView20433.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".questionnaireView.");
                var ret = ContactResultsQuestion._questionnaireView20433.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".questionnaireView.");
                var ret = ContactResultsQuestion._questionnaireView.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;

            }
        },
        _questionnaireDocView: {
            get: function () {
                return AppData.getFormatView("DOC1Zeilenantwort", 0);
            }
        },
        questionnaireDocView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".questionnaireDocView.", "recordId=" + recordId);
                var ret = ContactResultsQuestion._questionnaireDocView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".questionnaireDocView.");
                var ret = ContactResultsQuestion._questionnaireDocView.insertWithId(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _CR_VERANSTOPTION_View: {
            get: function () {
                return AppData.getFormatView("CR_VERANSTOPTION", 0, false);
            }
        },
        CR_VERANSTOPTION_ODataView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".CR_VERANSTOPTION_ODataView.");
                var ret = ContactResultsQuestion._CR_VERANSTOPTION_View.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "INITOptionTypeID"
                });
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();
