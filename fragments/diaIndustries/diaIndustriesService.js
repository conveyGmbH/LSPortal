﻿// service for page: StartQuestions
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "DiaIndustries";

    WinJS.Namespace.define("DiaIndustries", {
        _eventId: 0,
        _questionView: {
            get: function () {
                var ret = AppData.getFormatView("Veranstaltung", 20686);
                return ret;
            }
        },
        questionView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".questionView.");
                var ret = DiaIndustries._questionView.select(complete, error, restriction, { ordered: true, orderAttribute: "FragebogenVIEWID" });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".questionView.");
                var ret = DiaIndustries._questionView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".questionView.");
                var ret = DiaIndustries._questionView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {

            }
        }
    });
})();
