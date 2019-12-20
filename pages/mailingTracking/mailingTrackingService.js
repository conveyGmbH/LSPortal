// service for page: mailingTracking
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("MailingTracking", {
        _MailTrackingDialogView: {
            get: function () {
                return AppData.getFormatView("ExhibitorMailingStatus", 20599);
            }
        },
        MailTrackingDialogView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "MailingTracking.");
                var ret = MailingTracking._MailTrackingDialogView.selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                MailType: "",
                FairMandantVeranstID: 0,
                Status: "",
                UserMailAddress: "",
                SchedultedSendTS: "",
                SendCounter: "",
                SupportComment: "",
                LanguageSpecID: 0,
                ExhibitorCategory: ""
            }
        },
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, true);
            }
        },
        initSpracheView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = MailingTracking._initSpracheView.select(complete, error, restriction, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = MailingTracking._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = MailingTracking._initSpracheView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _FairMandantView: {
            get: function () {
                return AppData.getFormatView("FairMandantVeranst", 0);
            }
        },
        FairMandantView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "MailingTracking.");
                var ret = MailingTracking._FairMandantView.selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Name: ""
            }
        }
    });
})();