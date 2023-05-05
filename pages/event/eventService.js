// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Event", {
        _eventId: 0,
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
                Name: ""
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
                isSketchVisible: "0",
                isCameraVisible: "0",
                isBarcodeScanVisible: "0",
                isDBSyncVisible: "0",
                isPrivacyPolicySVGVisible: "0",
                isSendMailPrivacypolicy: "0",
                showQRCode: "0",
                isvisitorFlowVisible: "0",
                isvisitorFlowVisibleAndLeadSuccess: "0",
                showNameInHeader: "0",
                visitorFlowFeature: "0",
                visitorFlowPremium: "0",
                visitorFlowInterval: "",
                dashboardMesagoFeature: false,
                isDashboardPremium: false,
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
                var ret = Event._iNOptionTypeValueView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
    });
})();


