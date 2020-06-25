// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/scripts/generalData.js" />

(function () {
    "use strict";

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
                Log.call(Log.l.trace, "EsStaffAdministration.");
                var ret = EsVoucherUsers._voucherView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "EsStaffAdministration.");
                var ret = EsVoucherUsers._voucherView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EsStaffAdministration.");
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
                OrderDesc: true
            }
        }
    });
})();


