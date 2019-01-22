// service for page: siteEventsList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("SiteEventsList", {
        _VeranstaltungView: {
            get: function() {
                return AppData.getFormatView("VeranstaltungTermin", 20568);
            }
        },
        VeranstaltungView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "ServicepartnerEventList.");
                var ret = SiteEventsList._VeranstaltungView.select(complete, error, restriction, { ordered: true });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, "ServicepartnerEventList.");
                var ret = SiteEventsList._VeranstaltungView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function(complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "ServicepartnerEventList.");
                var ret = SiteEventsList._VeranstaltungView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                VeranstaltungVIEWID: 0,
                Name: null,
                Startdatum: new Date(),
                Enddatum: new Date()
            }
        }
    });
})();