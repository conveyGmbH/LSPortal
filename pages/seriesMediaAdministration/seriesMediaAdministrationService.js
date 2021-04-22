// service for page: eventMediaAdministration
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("SeriesMediaAdministration", {
        _mediaTable: {
            get: function () {
                return AppData.getFormatView("MandantDokument", 0);
            }
        },
        _eventTextUsageId: 2,
        _eventSeriesId: 1 /*muss von der Liste gesetzt werden*/
    });
    WinJS.Namespace.define("SeriesMediaAdministration", {
        mediaTable: {
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "mediaTable.");
                var ret = SeriesMediaAdministration._mediaTable.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


