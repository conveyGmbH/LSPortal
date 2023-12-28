// service for page: reportingList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "ReorderList";

    WinJS.Namespace.define(namespaceName, {
        _VeranstaltunganlageView: {
            get: function () {
                return AppData.getFormatView("Bestellung", 20569);
            }
        },
        VeranstaltunganlageView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".VeranstaltunganlageView.");
                var ret = ReorderList._VeranstaltunganlageView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "BestellungVIEWID",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".VeranstaltunganlageView.");
                var ret = ReorderList._VeranstaltunganlageView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, namespaceName + ".VeranstaltunganlageView.");
                var ret = ReorderList._VeranstaltunganlageView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, namespaceName + ".VeranstaltunganlageView.");
                var ret = ReorderList._VeranstaltunganlageView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();