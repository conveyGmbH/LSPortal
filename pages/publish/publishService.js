// service for page: publish
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Publish", {
        _questionView: {
            get: function () {
                return AppData.getFormatView("Fragen", 0);
            }
        },
        questionView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "questionView.");
                var ret = Publish._questionView.select(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "questionView.");
                var ret = Publish._questionView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Aktionflag: ""
            }
        }
    });
})();


