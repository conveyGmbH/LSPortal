// service for page: reporting
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Reporting", {
        _initLandView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITLand");
            }
        },
        initLandView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "QuestionList.initFragengruppeView.");
                var ret = Reporting._initLandView.select(complete, error, restriction, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "QuestionList.initFragengruppeView.");
                var ret = Reporting._initLandView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "QuestionList.initFragengruppeView.");
                var ret = Reporting._initLandView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _analysisListView: {
            get: function() {
                return AppData.getFormatView("OLELetter", 20458);
            }
        },
        analysisListView: {
            select: function(complete, error) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._analysisListView.select(complete, error, {
                    LanguageID: AppData.getLanguageId()
                }, {
                    ordered: true,
                    orderAttribute: "OLELetterID"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, "Reporting._analysisListView.");
                var ret = Reporting._analysisListView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "EmpRoles.LGNTINITAPUserRole.");
                var ret = Reporting._analysisListView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "EmpRoles.LGNTINITAPUserRole.");
                var ret = Reporting._analysisListView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _xLAuswertungView: {
            get: function() {
                return AppData.getFormatView("Kontakt", 20459);
            }
        },
        xLAuswertungView: {
            select: function(complete, error, restriction) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._xLAuswertungView.select(complete, error, restriction, {
                   
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function(complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._xLAuswertungView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._xLAuswertungView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function() {
                return Reporting._xLAuswertungView;
            }
        },

        _xLReportView: {
            get: function() {
                return AppData.getFormatView("Kontakt", 20460);
            }
        },
        xLReportView: {
            select: function(complete, error, restriction) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._xLReportView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "ContactID"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function(complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._xLReportView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, "Reporting.xLReportView.");
                var ret = Reporting._xLReportView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function() {
                return Reporting._xLReportView;
            }
        },
        _xLAuswertungViewNoQuest: {
            get: function() {
                return AppData.getFormatView("Kontakt", 20461);
            }
        },
        xLAuswertungViewNoQuest: {
            select: function(complete, error, restriction) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._xLAuswertungViewNoQuest.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "KontaktID"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function(complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._xLAuswertungViewNoQuest.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, "Reporting._xLAuswertungViewNoQuest.");
                var ret = Reporting._xLAuswertungViewNoQuest.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function() {
                return Reporting._xLAuswertungViewNoQuest;
            }
        },
        _xLReportViewNoQuest: {
            get: function() {
                return AppData.getFormatView("Kontakt", 20462);
            }
        },
        xLReportViewNoQuest: {
            select: function(complete, error, restriction) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._xLReportViewNoQuest.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "ContactID"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function(complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._xLReportViewNoQuest.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, "Reporting._xLReportViewNoQuest.");
                var ret = Reporting._xLReportViewNoQuest.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function() {
                return Reporting._xLReportViewNoQuest;
            }
        },
        _landHistoDe: {
            get: function () {
                return AppData.getFormatView("INITLand", 20466);
            }
        },
        landHistoDe: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._landHistoDe.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "INITLandVIEWID"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._landHistoDe.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Reporting._xLReportViewNoQuest.");
                var ret = Reporting._landHistoDe.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return Reporting._landHistoDe;
            }
        },
        _landHistoEn: {
            get: function () {
                return AppData.getFormatView("INITLand", 20468);
            }
        },
        landHistoEn: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._landHistoEn.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "INITLandVIEWID"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._landHistoEn.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Reporting._xLReportViewNoQuest.");
                var ret = Reporting._landHistoEn.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return Reporting._landHistoEn;
            }
        },
        _mitarbeiterHistoDe: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20467);
            }
        },
        mitarbeiterHistoDe: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._mitarbeiterHistoDe.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "MitarbeiterVIEWID"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._mitarbeiterHistoDe.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Reporting._xLReportViewNoQuest.");
                var ret = Reporting._mitarbeiterHistoDe.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return Reporting._mitarbeiterHistoDe;
            }
        },
        _mitarbeiterHistoEn: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20469);
            }
        },
        mitarbeiterHistoEn: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._mitarbeiterHistoEn.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "MitarbeiterVIEWID"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._mitarbeiterHistoEn.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Reporting._xLReportViewNoQuest.");
                var ret = Reporting._mitarbeiterHistoEn.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return Reporting._mitarbeiterHistoEn;
            }
        },
        _exportTemplate: {
            get: function () {
                return AppData.getFormatView("DOC3OLELetter", 0, false);
            }
        },
        exportTemplate: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._exportTemplate.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "DOC3OLELetterVIEWID"
                });
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _reportLand: {
            get: function () {
                return AppData.getFormatView("Kontakt", 20473);
            }
        },
        reportLand: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._reportLand.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Anzahl",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._reportLand.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Reporting._reportLand.");
                var ret = Reporting._reportLand.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return Reporting._reportLand;
            }
        },
        _reportMitarbeiter: {
            get: function () {
                return AppData.getFormatView("Kontakt", 20474);
            }
        },
        reportMitarbeiter: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._reportMitarbeiter.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "KontaktVIEWID"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._reportMitarbeiter.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Reporting._reportMitarbeiter.");
                var ret = Reporting._reportMitarbeiter.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return Reporting._reportMitarbeiter;
            }
        },
        _employeeView: {
            get: function() {
                return AppData.getFormatView("Mitarbeiter", 0, false);
            }
        },
        employeeView: {
            select: function(complete, error, restriction) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._employeeView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Nachname"
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._employeeView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function(complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = Reporting._employeeView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                MitarbeiterVIEWID: "0",
                Vorname: "",
                Nachname: "",
                fullName: ""
            }
        },
        defaultrestriction: {
            ErfasserID: null,
            InitLandID: null,
            //ReportErfassungsdatum: null,
            showErfassungsdatum: false,
            ModifiedTs: null
        }
    });
})();


