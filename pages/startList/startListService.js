// service for page: StartList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("StartList", {
        _MandantStartView: {
            //"MandantSerie", 0 - Serienliste
            get: function () {
                return AppData.getFormatView("MandantStart", 0);
            }
        },
        MandantStartView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "StartList.");
                
                var ret = StartList._MandantStartView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Titel", // fehlt erstmal Sortierung- wird höchstwahrscheinlich gebraucht wie bei serie
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "StartList.");
                var ret = StartList._MandantStartView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "StartList.");
                var ret = StartList._MandantStartView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            _languageId: 1031
        }
    });
})();