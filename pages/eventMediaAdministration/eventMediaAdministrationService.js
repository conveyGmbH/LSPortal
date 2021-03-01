// service for page: eventMediaAdministration
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EventMediaAdministration", {
        _mediaTable: {
            get: function () {
                return AppData.getFormatView("MandantDokument", 0);
            }
        },
        _eventTextUsageId: -1,
        _eventId: -1
    });
    WinJS.Namespace.define("EventMediaAdministration", {
        mediaTable: {
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "mediaTable.");
                var ret = EventMediaAdministration._mediaTable.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


