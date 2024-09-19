// service for page: StartQuestions
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "DiaYearRange";

    WinJS.Namespace.define("DiaYearRange", {
        _eventId: 0,
        _questionView: {
            get: function () {
                var ret = AppData.getFormatView("Veranstaltung", 20685);
                return ret;
            }
        },
        questionView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".questionView.");
                if (!restriction) {
                    restriction = {
                        VeranstaltungID: DiaYearRange._eventId
                    };
                }
                var ret = DiaYearRange._questionView.select(complete, error, restriction, { ordered: true, orderAttribute: "FragebogenVIEWID" });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".questionView.");
                var ret = DiaYearRange._questionView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".questionView.");
                var ret = DiaYearRange._questionView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {

            }
        }
    });
})();
