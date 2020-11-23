// service for page: contactResultsList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("ContactResultsList", {
        _KontaktReport: {
            get: function () {
                return AppData.getFormatView("KontaktReport", 0);
            }
        },
        KontaktReport: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "ContactResultsList.");
                var ret = ContactResultsList._KontaktReport.select(complete, error, restriction, {
                    ordered: true,
                    desc: restriction.OrderDesc,
                    orderAttribute: restriction.OrderAttribute
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "ContactResultsList.");
                var ret = ContactResultsList._KontaktReport.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "ContactResultsList.xLReportView.");
                var ret = ContactResultsList._KontaktReport.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return ContactResultsList._KontaktReport;
            },
            defaultRestriction: {
                Vorname: "",
                Nachname: "",
                Login: "",
                Names: "",
                OrderAttribute: ["NichtLizenzierteApp", "Nachname"],
                OrderDesc: true
            }
        }
    });
})();