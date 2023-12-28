// service for page: voucherAdministrationList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("VoucherAdministrationList", {
        _voucherOrderView: {
            get: function () {
                return AppData.getFormatView("ESVoucherOrder", 20608);
            }
        },
        voucherOrderView: {
            select: function (complete, error, restriction, options) {
                Log.call(Log.l.trace, "VoucherAdministrationList.");
                if (!restriction) {
                    restriction = {
                        LanguageSpecID: AppData.getLanguageId(),
                        VeranstaltungID: AppData.getRecordId("Veranstaltung")
                    };
                }
                if (!options) {
                    options = {
                        ordered: true,
                        desc: true
                    };
                }
                var ret = VoucherAdministrationList._voucherOrderView.select(complete, error, restriction, options);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "VoucherAdministrationList.VeranstaltunganlageView.");
                var ret = VoucherAdministrationList._voucherOrderView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "VoucherAdministrationList.VeranstaltunganlageView.");
                var ret = VoucherAdministrationList._voucherOrderView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "VoucherAdministrationList.VeranstaltunganlageView.");
                var ret = VoucherAdministrationList._voucherOrderView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();