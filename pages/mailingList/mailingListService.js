// service for page: mailingList
    /// <reference path="~/www/lib/convey/scripts/strings.js" />
    /// <reference path="~/www/lib/convey/scripts/logging.js" />
    /// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("MailingList", {
        _VAMail: {
            get: function () {
                var ret = AppData.getFormatView("VAMail", 20623);
                ret.maxPageSize = 50;
                return ret;
            },
            _eventId: 0
        },
        VAMail: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "ContactResultsList.");
                var ret = MailingList._VAMail.select(complete, error, restriction, {
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
                var ret = MailingList._VAMail.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "ContactResultsList.xLReportView.");
                var ret = MailingList._VAMail.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return MailingList._VAMail;
            },
            defaultRestriction: {
                MailTypeName: "",
                VeranstaltungName: "",
                Serie: "",
                TemplateName: "",
                LastModUTC: "",
                IsActive: "",
                VAMailTypeID: 0,
                Language: ""
            },
            defaultContactHeader: {
                MailTypeName: "",
                VeranstaltungName: "",
                Serie: "",
                TemplateName: "",
                LastModUTC: "",
                IsActive: "",
                VAMailTypeID: 0,
                Language: ""
            }
        },
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, true);
            }
        },
        initSpracheView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "AppData._initSpracheView.");
                var ret = MailingList._initSpracheView.select(complete, error, recordId, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "AppData._initSpracheView.");
                var ret = MailingList._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "AppData._initSpracheView.");
                var ret = MailingList._initSpracheView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
    });
})();
