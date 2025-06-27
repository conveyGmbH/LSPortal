// service for page: clientmanagement
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "ClientManagement";

    WinJS.Namespace.define("ClientManagement", {
        _fairMandantView: {
            get: function () {
//                return AppData.getFormatView("FairMandant", 20582);
                return AppData.getFormatView("FairMandant", 20692);
            }
        },
        fairMandantView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".fairMandantView.", "recordId=" + recordId);
                var ret = ClientManagement._fairMandantView.selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Name: "",
                Ansprechpartner: "",
                EMail: "",
                NumLicenses: "",
                CustomerID: "",
                Strasse: "",
                PLZ: "",
                Stadt: "",
                LandID: "",
                TelefonFestnetz: "",
                DUNSNumber: "",
                WebAdresse: "",
                FairMandantID: "",
                LocationID: "",
                DefLanguageID: null
            }
        },
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, true);
        }
        },
        initSpracheView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".initSpracheView.");
                var ret = ClientManagement._initSpracheView.select(complete, error, recordId, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, namespaceName + ".initSpracheView.");
                var ret = ClientManagement._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, namespaceName + ".initSpracheView.");
                var ret = ClientManagement._initSpracheView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
            }
    });
})();
