// service for page: clientmanagementlicenses
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("ClientManagementLicenses", {
        _mandantTempLizenzView: {
            get: function () {
                return AppData.getFormatView("MandantTempLizenz", 20591);
            }
        },
        mandantTempLizenzView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "ClientManagementLicenses.");
                var ret = ClientManagementLicenses._mandantTempLizenzView.select(complete, error, restriction, {
                        ordered: true,
                        orderAttribute: "MandantTempLizenzVIEWID",
                        desc: true
                    });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "ClientManagementLicenses.");
                var ret = ClientManagementLicenses._mandantTempLizenzView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "ClientManagementLicenses.");
                var ret = ClientManagementLicenses._mandantTempLizenzView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultRestriction: {
                VeranstaltungID: 0,
                NumLicenses: 0,
                InfoText: "",
                VeranstaltungName: "",
                VeranstaltungBeginn: new Date(),
                VeranstaltungEnde: new Date()
            }
        },
        _veranstaltungView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20588);
            }
        },
        veranstaltungView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "ClientManagementLicenses.");
                var ret = ClientManagementLicenses._veranstaltungView.select(complete, error, restriction, {
                        ordered: true,
                        orderAttribute: "VeranstaltungVIEWID",
                        desc: true
                    });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "ClientManagementLicenses.");
                var ret = ClientManagementLicenses._veranstaltungView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "ClientManagementLicenses.");
                var ret = ClientManagementLicenses._veranstaltungView.map;
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                VeranstaltungVIEWID: 0,
                Name: "",
                Startdatum: new Date(),
                Enddatum: new Date()
            }
        }
    });
})();