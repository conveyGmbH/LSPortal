// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EmpSkills", {
        _skilltypeView: {
            get: function () {
                return AppData.getFormatView("SkillType", 0);
            }
        },
        _skilltypeskillsView: {
            get: function () {
                return AppData.getFormatView("SkillTypeSkills", 0);
            }
        },
        skilltypeskillsView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Skills.");
                var ret = EmpSkills._skilltypeskillsView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Sortierung"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Skills.");
                var ret = EmpSkills._skilltypeskillsView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Skills.");
                var ret = EmpSkills._skilltypeskillsView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "Skills.");
                var ret = EmpSkills._skilltypeskillsView.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error) {
                Log.call(Log.l.trace, "skilltypeView.");
                var ret = EmpSkills._skilltypeView.insert(complete, error, {
                    FragengruppeID: 0
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "skilltypeView.");
                var ret = EmpSkills._skilltypeView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


