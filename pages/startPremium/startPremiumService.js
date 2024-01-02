// service for page: start
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("StartPremium", {
        _DOC3ExportPDF: {
            get: function () {
                return AppData.getFormatView("DOC3ExportPDF", 20661);
            }
        },
        DOC3ExportPDFView: {
            select: function(complete, error, restriction) {
                Log.call(Log.l.trace, "StartPremium.");
                var ret = StartPremium._DOC3ExportPDF.select(complete, error, restriction, {
                    ordered: false
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();
