// service for page: SeriesList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EventProducts", {
        _VeranstaltungView: {
            //"MandantSerie", 0 - Serienliste
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20542);
            }
        },
        VeranstaltungView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "EventProducts.");
                
                var ret = EventProducts._VeranstaltungView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Sortierung",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "EventProducts.");
                var ret = EventProducts._VeranstaltungView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "EventProducts.");
                var ret = EventProducts._VeranstaltungView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _veranstaltungId: 0
    });
})();