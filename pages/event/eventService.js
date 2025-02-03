// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "Event";

    WinJS.Namespace.define("Event", {
        _eventView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung2", 0);
            }
        },
        eventView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "eventView.");
                var ret = Event._eventView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "eventView.");
                var ret = Event._eventView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Name: "",
                dateBegin: "",
                dateEnd: ""
            }
        },
        _CR_VERANSTOPTION_View: {
            get: function () {
                return AppData.getFormatView("CR_VERANSTOPTION", 20668, false);
            }
        },
        CR_VERANSTOPTION_ODataView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "CR_VERANSTOPTION_ODataView.");
                var ret = Event._CR_VERANSTOPTION_View.select(complete,
                    error,
                    restriction,
                    {
                        ordered: true,
                        orderAttribute: "INITOptionTypeID"
                    });
                Log.ret(Log.l.trace);
                return ret;

            },
            defaultValue: {
                isQuestionnaireVisible: "0",
                showCameraQuestionnaire: "0",
                isManuallyVisible: "0",
                isSketchVisible: "0",
                isCameraVisible: "0",
                isBarcodeScanVisible: "0",
                isPrivacyPolicySVGVisible: "0",
                isSendMailPrivacypolicy: "0",
                showQRCode: "0",
                showvisitorFlow: "0",
                isvisitorFlowVisible: "0",
                showNameInHeader: "0",
                visitorFlowPremium: "0",
                visitorFlowInterval: "0",
                isDashboardPremium: "0",
                showdashboardMesagoCombo: "0",
                showPremiumDashboardCombo: "0",
                leadsuccessBasic: "0",
                productMailOn: "0",
                thankYouMailOn: "0",
                nachbearbeitetFlagAutoSetToNull: "0"
            }
        },
        _appListSpecView: {
            get: function () {
                return AppData.getFormatView("AppListSpec", 20457);
            }
        },
        appListSpecView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, "appListSpecView.");
                var ret = Event._appListSpecView.select(complete, error);

                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _remoteKonfigurationView: {
            get: function () {
                return AppData.getFormatView("RemoteKonfiguration", 0, false);
            }
        },
        remoteKonfigurationView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "eventView.");
                var ret = Event._remoteKonfigurationView.select(complete, error, restriction,
                    {
                        ordered: true,
                        orderAttribute: "ShowText"
                    });
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "eventView.");
                var ret = Event._remoteKonfigurationView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                RemoteKonfigurationVIEWID: "",
                ComboText: "",
                ShowText: ""
            }
        },
        _iNOptionTypeValueView: {
            get: function () {
                return AppData.getFormatView("INOptionTypeValue", 20666);
            }
        },
        iNOptionTypeValueView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "iNOptionTypeValueView.");
                var ret = Event._iNOptionTypeValueView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Idx"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
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
                var ret = Event._initSpracheView.select(complete, error, recordId, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, namespaceName + ".initSpracheView.");
                var ret = Event._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, namespaceName + ".initSpracheView.");
                var ret = Event._initSpracheView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _pdfExportParamView: {
            get: function () {
                return AppData.getFormatView("PDFExportParam", 0);
            }
        },
        _pdfExportParamTable: {
            get: function () {
                return AppData.getFormatView("PDFExportParam", 0);
            }
        },
        pdfExportParamView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "PDFExport.");
                var ret = Event._pdfExportParamView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "PDFExport.");
                var ret = Event._pdfExportParamView.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                LanguageID: 0
            }
        }
    });
})();


