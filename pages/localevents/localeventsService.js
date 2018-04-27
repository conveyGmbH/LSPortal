// service for page: localEvents
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("LocalEvents", {
        _VeranstaltungView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20542);
            }
        },
        _VeranstaltungTable: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 0);
            }
        },
        VeranstaltungView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "LocalEvents.");
                var ret = LocalEvents._VeranstaltungView.selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "LocalEvents.");
                var ret = LocalEvents._VeranstaltungTable.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, restriction) {
                Log.call(Log.l.trace, "LocalEvents.");
                var ret = LocalEvents._VeranstaltungTable.insert(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "LocalEvents.");
                var ret = LocalEvents._VeranstaltungTable.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Name: "",
                Startdatum: "",
                Enddatum: ""
            }
        }
    });
})();