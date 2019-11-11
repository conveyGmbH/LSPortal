// service for page: mailingTrackingList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("MailingTrackingList", {
        _ExhibitorMailingStatusVItView: {
            get: function () {
                return AppData.getFormatView("ExhibitorMailingStatus", 20598);
            }
        },
        ExhibitorMailingStatusVIView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "MailingList.");
                var ret = MailingTrackingList._ExhibitorMailingStatusVItView.select(complete, error, restriction, { ordered: true });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "MailingList.");
                var ret = MailingTrackingList._ExhibitorMailingStatusVItView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "MailingList.");
                var ret = MailingTrackingList._ExhibitorMailingStatusVItView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                ExhibitorMailingStatustVIEWID: 0,
                MailType: null,
                FaiMandantVeranstID : 0,
                Status: null
            }
        }
    });
})();