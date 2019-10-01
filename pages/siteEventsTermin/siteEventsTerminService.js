// service for page: siteEventsNeuAus
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("SiteEventsTermin", {
        _VeranstaltungView: {
            get: function() {
                return AppData.getFormatView("Veranstaltung", 20564);
            }
        },
        VeranstaltungView: {
            select: function(complete, error, restriction) {
                Log.call(Log.l.trace, "ServicepartnerEventList.");
                var ret = SiteEventsTermin._VeranstaltungView.select(complete,
                    error,
                    restriction,
                    { ordered: true });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, "ServicepartnerEventList.");
                var ret = SiteEventsTermin._VeranstaltungView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function(complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "ServicepartnerEventList.");
                var ret = SiteEventsTermin._VeranstaltungView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Name: null
            }
        },
        defaultRestriction: {
            VeranstaltungName: "",
            VeranstaltungNameDisplay: "",
            FairVeranstalterID: 1, //deimos muss dann angepasst werden
            StartDatum: null,
            EndDatum: null
        }
    });
})();