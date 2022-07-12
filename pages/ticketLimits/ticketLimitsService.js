// service for page: MailingProduct
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("TicketLimits", {
            _CRVeranstaltungBucketView: {
                get: function () {
                    return AppData.getFormatView("CRVeranstaltungBucket", 20660);
                }
            },
            _CRVeranstaltungBucketTable: {
                get: function () {
                    return AppData.getFormatView("CRVeranstaltungBucket", 0);
                }
            },
            CRVeranstaltungBucketView: {
                select: function (complete, error, restriction) {
                    Log.call(Log.l.trace, "MailingProduct.");
                    var ret = TicketLimits._CRVeranstaltungBucketView.select(complete, error, restriction, { ordered: true });
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                update: function (complete, error, recordId, viewResponse) {
                    Log.call(Log.l.trace, "MailingProduct.");
                    var ret = TicketLimits._CRVeranstaltungBucketTable.update(complete, error, recordId, viewResponse);
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                defaultValue: {
                    CRVeranstaltungBucketVIEWID: 0,
                    VeranstaltungID: 0,
                    ESBucketID: 0,
                    LocalLimit: 0,
                    LocalFree: 0,
                    BucketText: "",
                    BucketInfo: ""
                }
            }
    });
})();
