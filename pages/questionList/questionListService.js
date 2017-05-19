// service for page: questionnaire
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("QuestionList", {
        _initFragengruppeView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITFragengruppe");
            }
        },
        initFragengruppeView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "QuestionList.initFragengruppeView.");
                var ret = QuestionList._initFragengruppeView.select(complete, error, recordId, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "QuestionList.initFragengruppeView.");
                var ret = QuestionList._initFragengruppeView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "QuestionList.initFragengruppeView.");
                var ret = QuestionList._initFragengruppeView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _questionView: {
            get: function () {
                return AppData.getFormatView("Fragen", 0);
            }
        },
        _questionListView: {
            get: function () {
                return AppData.getFormatView("FragenAntworten", 0);
            }
        },
        questionListView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "QuestionList.");
                var ret = QuestionList._questionListView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Sortierung"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "QuestionList.");
                var ret = QuestionList._questionListView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "QuestionList.");
                var ret = QuestionList._questionListView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "QuestionList.");
                var ret = QuestionList._questionListView.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;

            },
            insert: function (complete, error) {
                Log.call(Log.l.trace, "questionView.");
                var ret = QuestionList._questionView.insert(complete, error, {
                    FragengruppeID: 0
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "questionView.");
                var ret = QuestionList._questionView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();
