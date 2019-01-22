// service for page: siteEventsNeuAus
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("SiteEventsNeuAus", {
        _VeranstaltungView: {
            get: function() {
                return AppData.getFormatView("Veranstaltung", 20564);
            }
        },
        VeranstaltungView: {
            select: function(complete, error, restriction) {
                Log.call(Log.l.trace, "ServicepartnerEventList.");
                var ret = SiteEventsNeuAus._VeranstaltungView.select(complete,
                    error,
                    restriction,
                    { ordered: true });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, "ServicepartnerEventList.");
                var ret = SiteEventsNeuAus._VeranstaltungView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function(complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "ServicepartnerEventList.");
                var ret = SiteEventsNeuAus._VeranstaltungView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Name: null
            }
        },
        _initLandView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITLand");
            }
        },
        initLandView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "QuestionList.initFragengruppeView.");
                var ret = SiteEventsNeuAus._initLandView.select(complete, error, restriction, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "QuestionList.initFragengruppeView.");
                var ret = SiteEventsNeuAus._initLandView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "QuestionList.initFragengruppeView.");
                var ret = SiteEventsNeuAus._initLandView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        defaultRestriction: {
            VeranstaltungTerminID: 0,
            VeranstaltungName: "",
            FirmenName: "",
            Strasse: "",
            PLZ: "",
            Ort: "",
            Stadt: "",
            LandID: "",
            WebAdresse: "",
            LoginEmail: "",
            AppUser: "",
            OrderNumber: "",
            StandHall: "",
            StandNo: "",
            DisplayText: ""
}
    });
})();