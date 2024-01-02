// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/scripts/generalData.js" />

(function () {
    "use strict";
    var namespaceName = "EsVoucherUsers";

    WinJS.Namespace.define("EsVoucherUsers", {
        _voucherUpdateView: {
            get: function () {
                return AppData.getFormatView("Kontakt", 0);
            }
        },
        _voucherView: {
            get: function () {
                return AppData.getFormatView("Kontakt", 20611);
            }
        },
        voucherView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".voucherView.", "recordId=" + recordId);
                var ret = EsVoucherUsers._voucherView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".voucherView.", "recordId=" + recordId);
                var ret = EsVoucherUsers._voucherView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".voucherView.", "recordId=" + recordId);
                var ret = EsVoucherUsers._voucherUpdateView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Vorname: "",
                Name: "",
                VeranstaltungID: AppData.getRecordId("Veranstaltung")
            },
            defaultRestriction: {
                Vorname: "",
                Name: "",
                Firmenname: "",
                OrderAttribute: "Name",
                OrderDesc: true,
                Aktiv: [],
                bAndInEachRow: true,
                bUseOr: false
            }
        },
        _voucherUsersAllView: {
            get: function () {
                var ret = AppData.getFormatView("Kontakt", 20612, false);
                return ret;
            }
        },
        voucherUsersAllView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".voucherUsersAllView.", "restriction=" + (restriction ? JSON.stringify(restriction) : ""));
                var ret = EsVoucherUsers._voucherUsersAllView.select(complete, error, restriction, {
                    ordered: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".voucherUsersAllView.");
                var ret = EsVoucherUsers._voucherUsersAllView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".voucherUsersAllView.");
                var ret = EsVoucherUsers._voucherUsersAllView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return EsVoucherUsers._voucherUsersAllView;
            },
            defaultRestriction: {
                VeranstaltungID: AppData.getRecordId("Veranstaltung"),
                LanguageSpecID: AppData.getLanguageId()
            }
        }
    });
})();


