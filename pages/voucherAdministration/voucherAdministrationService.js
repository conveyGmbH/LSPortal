// service for page: voucherAdministration
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("VoucherAdministration", {
        _LangESArticleTypeView: {
            get: function () {
                return AppData.getFormatView("LangESArticleType", 20607, false);
            }
        },
        LangESArticleTypeView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "VoucherAdministration.");
                var ret = VoucherAdministration._LangESArticleTypeView.select(complete,
                    error, restriction,
                    { ordered: true });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "VoucherAdministration.");
                var ret = VoucherAdministration._LangESArticleTypeView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "VoucherAdministration.");
                var ret = VoucherAdministration._LangESArticleTypeView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "VoucherAdministration.");
                var ret = VoucherAdministration._LangESArticleTypeView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                
            }
        },
        defaultRestriction: {
            VeranstaltungID: 0,
            ArticleTypeID: 0,
            NumVouchers: 0,
            UserComment: ""
        },
        _VeranstaltungView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20564);
            }
        },
        VeranstaltungView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "VoucherAdministration.");
                var ret = VoucherAdministration._VeranstaltungView.select(complete, error, restriction,
                    {
                        desc: true,
                        ordered: true
                    });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();