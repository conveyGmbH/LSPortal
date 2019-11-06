// service for page: StartQuestions
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("StartQuestions", {
        _questionView: {
            get: function () {
                var ret = AppData.getFormatView("Fragebogen", 20597);
                return ret;
            }
        },
        questionView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "questionView.");
                var ret = StartQuestions._questionView.select(complete, error, restriction, { ordered: true, orderAttribute: "FragebogenVIEWID" });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "questionView.");
                var ret = StartQuestions._questionView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "questionView.");
                var ret = StartQuestions._questionView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {

            }
        }
    });
})();