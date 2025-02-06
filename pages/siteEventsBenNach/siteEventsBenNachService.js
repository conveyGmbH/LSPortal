// service for page: siteEventsNachBenNach
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("SiteEventsBenNach", {
        /*_VeranstaltungView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20564, false);
            }
        },*/
        VeranstaltungView: {               
            /*select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEventsBenNach._VeranstaltungView.select(complete,
                    error, restriction,
                    { ordered: true });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEventsBenNach._VeranstaltungView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEventsBenNach._VeranstaltungView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },*/
            defaultValue: {
                Name: null
            },
            defaultRestriction: {
                Name: null
            }
        }
    });
})();