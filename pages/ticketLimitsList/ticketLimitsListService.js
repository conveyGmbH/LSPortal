// service for page: mailingList
    /// <reference path="~/www/lib/convey/scripts/strings.js" />
    /// <reference path="~/www/lib/convey/scripts/logging.js" />
    /// <reference path="~/www/lib/convey/scripts/dataService.js" />

    (function () {
        "use strict";

        WinJS.Namespace.define("TicketLimitsList", {
            _CRVeranstaltungBucketView: {
                get: function () {
                    return AppData.getFormatView("CRVeranstaltungBucket", 20660);
                }
            },
            CRVeranstaltungBucketView: {
                select: function (complete, error, restriction) {
                    Log.call(Log.l.trace, "TicketLimitsList.");
                    var ret = TicketLimitsList._CRVeranstaltungBucketView.select(complete, error, restriction, { ordered: true });
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                getNextUrl: function (response) {
                    Log.call(Log.l.trace, "TicketLimitsList.");
                    var ret = TicketLimitsList._CRVeranstaltungBucketView.getNextUrl(response);
                    Log.ret(Log.l.trace);
                    return ret;
                },
                selectNext: function (complete, error, response, nextUrl) {
                    Log.call(Log.l.trace, "TicketLimitsList.");
                    var ret = TicketLimitsList._CRVeranstaltungBucketView.selectNext(complete, error, response, nextUrl);
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                defaultValue: {
                    CRVeranstaltungBucketVIEWID: 0,
                    VeranstaltungID: "",
                    ESBucketID: 0,
                    LocalLimit: 0,
                    LocalFree: 0,
                    BucketText : ""
                }
            }
        });
    })();
