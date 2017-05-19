// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Skillentry", {
        _skillentryline_E: {
            get: function() {
                return AppData.getFormatView("SkillEntryLine", 0);
            }
        },
        _skillentryline_L: {
            get: function() {
                return AppData.getFormatView("SkillEntryLine", 20464);
            }
        },
        skilltypeskillsView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Skillentry.");
                var ret = Skillentry._skillentryline_L.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Sortierung"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Skillentry.");
                var ret = Skillentry._skillentryline_L.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Skillentry.");
                var ret = Skillentry._skillentryline_L.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "Skillentry.");
                var ret = Skillentry._skillentryline_E.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


