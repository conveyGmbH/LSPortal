// service for page: reportingList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "ReportingList";

    WinJS.Namespace.define("ReportingList", {
        _analysisListView: {
            get: function () {
                return AppData.getFormatView("ExportType", 20669);
            }
        },
        analysisListView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".analysisListView.");
                var ret = ReportingList._analysisListView.select(complete, error, restriction,
                {
                    ordered: true,
                        orderAttribute: "Title"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".analysisListView.");
                var ret = ReportingList._analysisListView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, namespaceName + ".analysisListView.");
                var ret = ReportingList._analysisListView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, namespaceName + ".analysisListView.");
                var ret = ReportingList._analysisListView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();
