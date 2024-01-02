// service for page: esStaffAdministrationList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    var namespaceName = "EsVoucherUsersList";

    WinJS.Namespace.define("EsVoucherUsersList", {
        _voucherView: {
            get: function () {
                var ret = AppData.getFormatView("Kontakt", 20611);
                ret.maxPageSize = 100;
                return ret;
            }
        },
        voucherView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".voucherView.", "restriction=" + (restriction ? JSON.stringify(restriction) : ""));
                var ret;
                if (typeof restriction === "number") {
                    ret = EsVoucherUsersList._voucherView.selectById(complete, error, restriction);
                } else {
                    ret = EsVoucherUsersList._voucherView.select(complete, error, restriction, {
                        ordered: true,
                        desc: restriction.OrderDesc,
                        orderAttribute: restriction.OrderAttribute
                    });
                }
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".voucherView.");
                var ret = EsVoucherUsersList._voucherView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".voucherView.");
                var ret = EsVoucherUsersList._voucherView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultRestriction: {
                Vorname: "",
                Nachname: "",
                Login: "",
                Names: "",
                OrderAttribute: ["Name"],
                OrderDesc: true
            }
        }
    });
})();


