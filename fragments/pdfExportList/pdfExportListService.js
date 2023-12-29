// service for page: reportingList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "PdfExportList";

    WinJS.Namespace.define("PdfExportList", {
        _pdfExportListView: {
            get: function () {
                return AppData.getFormatView("OLELetter", 20546);
            }
        },
        pdfExportListView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, namespaceName + ".pdfExportListView.");
                var ret = PdfExportList._pdfExportListView.select(complete, error, {
                    LanguageID: AppData.getLanguageId(),
                    OLELetterID: 29
                }, {
                        ordered: true,
                        orderAttribute: "OLELetterID",
                        desc: true
                    });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".pdfExportListView.");
                var ret = PdfExportList._pdfExportListView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, namespaceName + ".pdfExportListView.");
                var ret = PdfExportList._pdfExportListView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, namespaceName + ".pdfExportListView.");
                var ret = PdfExportList._pdfExportListView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();