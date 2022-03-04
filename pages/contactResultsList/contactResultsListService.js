// service for page: contactResultsList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("ContactResultsList", {
        _KontaktReport: {
            get: function () {
                var ret = AppData.getFormatView("KontaktReport", 0);
                ret.maxPageSize = 50;
                return ret;
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
                OrderDesc: false
            },
            defaultContactHeader: {
                Name: "",
                Vorname: "",
                Firmenname: "",
                EMail: "",
                Stadt: "",
                Land: "",
                Prio: "", 
                Typ: "", 
                Status: ""
            }
        },
        _mitarbeiterView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20453);
            }
        },
        mitarbeiterView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "mitarbeiterView.", "recordId=" + recordId);
                var ret = ContactResultsList._mitarbeiterView.selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();