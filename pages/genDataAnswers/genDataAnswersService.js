// service for page: genDataAnswers
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />


(function () {
    "use strict";
    WinJS.Namespace.define("GenDataAnswers", {
        _answerView: {
            get: function () {
                return AppData.getFormatView("Answer", 20649);
            }
        },
        _answerTable: {
            get: function () {
                return AppData.getFormatView("Answer", 0);
            }
        },
        _questionID: 0
    });
    WinJS.Namespace.define("GenDataAnswers", {
        answerView: {
            select: function (complete, error, restriction, options) {
                if (!restriction) {
                    restriction = {
                        QuestionID: GenDataAnswers._questionID,
                        LanguageSpecID: AppData.getLanguageId()
                    };
                }
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "AnswerVIEWID",
                        desc: false
                    };
                }
                Log.call(Log.l.trace, "GenDataModHisto._benutzerView.");
                   
                var ret = GenDataAnswers._answerView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "GenDataModHisto._benutzerView.");
                var ret = GenDataAnswers._answerView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "GenDataModHisto._benutzerView.");
                var ret = GenDataAnswers._answerView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: GenDataAnswers._answerView.relationName,
            pkName: GenDataAnswers._answerView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataAnswers._answerView.oDataPkName) {
                        ret = record[GenDataAnswers._answerView.oDataPkName];
                    }
                    if (!ret && GenDataAnswers._answerView.pkName) {
                        ret = record[GenDataAnswers._answerView.pkName];
                    }
                }
                return ret;
            }
        },
        answerTable: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "GenDataModHisto._benutzerTable.");
                var ret = GenDataAnswers._answerTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: GenDataAnswers._answerTable.relationName,
            pkName: GenDataAnswers._answerTable.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataAnswers._answerTable.oDataPkName) {
                        ret = record[GenDataAnswers._answerTable.oDataPkName];
                    }
                    if (!ret && GenDataAnswers._answerTable.pkName) {
                        ret = record[GenDataAnswers._answerTable.pkName];
                    }
                }
                return ret;
            }
        }
    });
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
        _questionID: 0
    });
    WinJS.Namespace.define("GenDataAnswers", {
        questionView: {
            select: function (complete, error, restriction, options) {
                if (!restriction) {
                    restriction = {
                        QuestionVIEWID: GenDataAnswers._questionID
                    };
                }
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "QuestionVIEWID",
                        desc: false
                    };
                }
                Log.call(Log.l.trace, "GenDataModHisto._benutzerView.");

                var ret = GenDataAnswers._questionView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "GenDataModHisto._benutzerView.");
                var ret = GenDataAnswers._questionView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "GenDataModHisto._benutzerView.");
                var ret = GenDataAnswers._questionView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: GenDataAnswers._questionView.relationName,
            pkName: GenDataAnswers._questionView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataAnswers._questionView.oDataPkName) {
                        ret = record[GenDataAnswers._questionView.oDataPkName];
                    }
                    if (!ret && GenDataAnswers._questionView.pkName) {
                        ret = record[GenDataAnswers._questionView.pkName];
                    }
                }
                return ret;
            }
        },
        questionTable: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "GenDataModHisto._benutzerTable.");
                var ret = GenDataAnswers._questionTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = GenDataAnswers._questionTable.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: GenDataAnswers._questionTable.relationName,
            pkName: GenDataAnswers._questionTable.oDataPkName,
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
                QuestionTitle: ""
            }
        },
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, false, 20600);
            }
        },
        initSpracheView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = GenDataAnswers._initSpracheView.select(complete, error, restriction, { ordered: true });
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

