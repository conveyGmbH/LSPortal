// service for page: reportingList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("ReportingList", {
        _analysisListView: {
            get: function () {
                return AppData.getFormatView("OLELetter", 20458);
            }
        },
        analysisListView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = ReportingList._analysisListView.select(complete, error, {
                    LanguageID: AppData.getLanguageId()
                }, {
                    ordered: true,
                    orderAttribute: "RevisionNumber"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Reporting._analysisListView.");
                var ret = ReportingList._analysisListView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "EmpRoles.LGNTINITAPUserRole.");
                var ret = ReportingList._analysisListView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "EmpRoles.LGNTINITAPUserRole.");
                var ret = ReportingList._analysisListView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();