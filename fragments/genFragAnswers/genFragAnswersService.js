// service for page: GenFragEvents
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "GenFragAnswers";

    WinJS.Namespace.define("GenFragAnswers", {
        _answerView: {
            get: function () {
                return AppData.getFormatView("Answer", 20649);
            }
        },
        answerView: {
            select: function (complete, error, restriction, options) {
                Log.call(Log.l.trace, namespaceName + ".answerView.");
                if (!restriction) {
                    var master = Application.navigator.masterControl;
                    var recordId = master.controller && master.controller.curRecId;
                    restriction = {
                        QuestionID: recordId || 0,
                        LanguageSpecID: (AppBar.scope && AppBar.scope.binding && AppBar.scope.binding.languageId)
                    };
                }
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "AnswerIDX",
                        desc: false
                    };
                }
                var ret = GenFragAnswers._answerView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return GenFragAnswers._answerView.relationName;
                }
            },
            pkName: {
                get: function() {
                    return GenFragAnswers._answerView.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenFragAnswers._answerView.oDataPkName) {
                        ret = record[GenFragAnswers._answerView.oDataPkName];
                    }
                    if (!ret && GenFragAnswers._answerView.pkName) {
                        ret = record[GenFragAnswers._answerView.pkName];
                    }
                }
                return ret;
            }
        },
        _answerTable: {
            get: function () {
                return AppData.getFormatView("Answer", 0);
            }
        },
        answerTable: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".answerTable.");
                var ret = GenFragAnswers._answerTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return GenFragAnswers._answerTable.relationName;
                }
            },
            pkName: {
                get: function() {
                    return GenFragAnswers._answerTable.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenFragAnswers._answerTable.oDataPkName) {
                        ret = record[GenFragAnswers._answerTable.oDataPkName];
                    }
                    if (!ret && GenFragAnswers._answerTable.pkName) {
                        ret = record[GenFragAnswers._answerTable.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();