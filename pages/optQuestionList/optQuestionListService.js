﻿// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("OptQuestionList", {
        _CR_OptFragenAntwortenVIEW: {
            get: function () {
                return AppData.getFormatView("CR_OptFragenAntworten", 0);
            }
        },
        CR_OptFragenAntwortenVIEW: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "OptQuestionList.CR_V_FragengruppeView.");
                var ret = OptQuestionList._CR_OptFragenAntwortenVIEW.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "CR_OptFragenAntwortenVIEWID"
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "OptQuestionList.CR_V_FragengruppeView.");
                var ret = OptQuestionList._CR_OptFragenAntwortenVIEW.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "OptQuestionList.CR_V_FragengruppeView.");
                var ret = OptQuestionList._CR_OptFragenAntwortenVIEW.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "OptQuestionList.CR_V_FragengruppeView.");
                var ret = OptQuestionList._CR_OptFragenAntwortenVIEW.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "OptQuestionList.CR_V_FragengruppeView.");
                var ret = OptQuestionList._CR_OptFragenAntwortenVIEW.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "OptQuestionList.CR_V_FragengruppeView.");
                var ret = OptQuestionList._CR_OptFragenAntwortenVIEW.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return OptQuestionList._CR_OptFragenAntwortenVIEW.relationName;
                }
            },
            pkName: {
                get: function() {
                    return OptQuestionList._CR_OptFragenAntwortenVIEW.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (OptQuestionList._CR_OptFragenAntwortenVIEW.oDataPkName) {
                        ret = record[OptQuestionList._CR_OptFragenAntwortenVIEW.oDataPkName];
                    }
                    if (!ret && OptQuestionList._CR_OptFragenAntwortenVIEW.pkName) {
                        ret = record[OptQuestionList._CR_OptFragenAntwortenVIEW.pkName];
                    }
                }
                return ret;
            },
            defaultValue: {
                CR_OptFragenAntwortenVIEWID: 0,
                FragenID: 2376,
                SelektierteFragenID: 0,
                SortIndex: 0
            }
        },
        _questionListView: {
            get: function () {
                var ret = AppData.getFormatView("FragenAntworten", 0);
                ret.maxPageSize = 100;
                return ret;
            }
        },
        questionListView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "QuestionList.");
                var ret = OptQuestionList._questionListView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Sortierung"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "QuestionList.");
                var ret = OptQuestionList._questionListView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "QuestionList.");
                var ret = OptQuestionList._questionListView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                FragenAntwortenVIEWID: 0,
                Fragestellung: ""
            }
        }
    });
})();


