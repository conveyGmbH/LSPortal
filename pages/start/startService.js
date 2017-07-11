// service for page: start
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Start", {
        _mitarbeiterView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20453);
            }
        },
        mitarbeiterView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "mitarbeiterView.", "recordId=" + recordId);
                var ret = Start._mitarbeiterView.selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _kontaktanzahlView: {
            get: function() {
                return AppData.getFormatView("Kontakt", 20455);
            }
        },
        kontaktanzahlView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, "kontaktanzahlView.");
                var ret = Start._kontaktanzahlView.select(complete, error, null, {
                    ordered: true,
                    orderAttribute: "KontaktVIEWID",
                    desc: false
                });
                    
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    
    });
})();
