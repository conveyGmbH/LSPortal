// service for page: genDataAnswers
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />


(function () {
    "use strict";

    WinJS.Namespace.define("GenDataAnswers", {
        _questionView: {
            get: function () {
                return AppData.getFormatView("Question", 20648);
            }
        },
        _questionTable: {
            get: function () {
                return AppData.getFormatView("Question", 0);
            }
        },
        _questionId: 0
    });
    WinJS.Namespace.define("GenDataAnswers", {
        questionView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "GenDataAnswers.questionView.");
                var ret = GenDataAnswers._questionView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "GenDataAnswers.questionView.");
                var ret = GenDataAnswers._questionTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "GenDataAnswers.questionView.");
                var ret = GenDataAnswers._questionTable.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "GenDataAnswers.questionView.");
                var ret = GenDataAnswers._questionTable.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: GenDataAnswers._questionTable.relationName,
            pkName: GenDataAnswers._questionTable.pkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataAnswers._questionTable.oDataPkName) {
                        ret = record[GenDataAnswers._questionTable.oDataPkName];
                    }
                    if (!ret && GenDataAnswers._questionTable.pkName) {
                        ret = record[GenDataAnswers._questionTable.pkName];
                    }
                }
                return ret;
            },
            defaultValue: {
                QuestionCode: "",
                QuestionTitle: "",
                InActive: "",
                NumAnswers: 0,
                GroupText: ""
            }
        },
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, false, 20600);
            }
        },
        initSpracheView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = GenDataAnswers._initSpracheView.select(complete, error);
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = GenDataAnswers._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = GenDataAnswers._initSpracheView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
    WinJS.Namespace.define("GenDataAnswers", {
        _questionGroupTable: {
            get: function () {
                return AppData.getFormatView("QuestionGroup", 0);
            }
        }
    });
    WinJS.Namespace.define("GenDataAnswers", {
        questionGroupTable: {
            select: function (complete, error, restriction, options) {
                if (!restriction) {
                    restriction = {
                        
                    };
                }
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "QuestionGroupVIEWID",
                        desc: false
                    };
                }
                Log.call(Log.l.trace, "GenDataModHisto._benutzerView.");

                var ret = GenDataAnswers._questionGroupTable.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "GenDataModHisto._benutzerView.");
                var ret = GenDataAnswers._questionGroupTable.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "GenDataModHisto._benutzerView.");
                var ret = GenDataAnswers._questionGroupTable.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: GenDataAnswers._questionGroupTable.relationName,
            pkName: GenDataAnswers._questionGroupTable.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataAnswers._questionGroupTable.oDataPkName) {
                        ret = record[GenDataAnswers._questionGroupTable.oDataPkName];
                    }
                    if (!ret && GenDataAnswers._questionGroupTable.pkName) {
                        ret = record[GenDataAnswers._questionGroupTable.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();

