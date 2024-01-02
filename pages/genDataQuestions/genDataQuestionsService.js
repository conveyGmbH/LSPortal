// service for page: infodeskEmpList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("GenDataQuestions", {
        _questionView: {
            get: function () {
                return AppData.getFormatView("Question", 20648);
            }
        },
        questionView: {
            select: function (complete, error, restriction, options) {
                Log.call(Log.l.trace, "GenDataQuestions.questionView.");
                if (!restriction) {
                    restriction = {
                        
                    };
                }
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "QuestionVIEWID",
                        desc: false
                    };
                }
                var ret = GenDataQuestions._questionView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "GenDataQuestions.questionView.");
                var ret = GenDataQuestions._questionView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "GenDataQuestions.questionView.");
                var ret = GenDataQuestions._questionView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return GenDataQuestions._questionView.relationName;
                }
            },
            pkName: {
                get: function() {
                    return GenDataQuestions._questionView.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataQuestions._questionView.oDataPkName) {
                        ret = record[GenDataQuestions._questionView.oDataPkName];
                    }
                    if (!ret && GenDataQuestions._questionView.pkName) {
                        ret = record[GenDataQuestions._questionView.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();


