// service for page: startContacts
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("StartContacts", {
        _mitarbeiterView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20453);
            }
        },
        mitarbeiterView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "mitarbeiterView.", "recordId=" + recordId);
                var ret = StartContacts._mitarbeiterView.selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                AnzKontakte: 0
            }
        }
    });
})();