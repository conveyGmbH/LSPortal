// service for page: eventMediaAdministration
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("StartMediaAdministration", {
        _mediaTable: {
            get: function () {
                return AppData.getFormatView("MandantDokument", 0);
            }
        },
        _eventTextUsageId: 1,
        _eventStartId: 1 /*muss von der Liste gesetzt werden*/
    });
    WinJS.Namespace.define("StartMediaAdministration", {
        mediaTable: {
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "mediaTable.");
                var ret = StartMediaAdministration._mediaTable.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


