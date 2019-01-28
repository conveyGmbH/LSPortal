// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("MailingTemplate", {
        _MailLayoutView_20571: {
            get: function () {
                return AppData.getFormatView("MailLayout", 20571, false);
            }
        },
        MailLayoutView_20571: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "MailLayoutView_20571.");
                var ret = MailingTemplate._MailLayoutView_20571.select(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _MailLayoutView: {
            get: function () {
                return AppData.getFormatView("MailLayout", 0);
            }
        },
        MailLayoutView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "mailLayoutView.");
                var ret = MailingTemplate._MailLayoutView.select(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "mailLayoutView.");
                var ret = MailingTemplate._MailLayoutView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "mailLayoutView.");
                var ret = MailingTemplate._MailLayoutView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "mailLayoutView.");
                var ret = MailingTemplate._MailLayoutView.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: { 
                MailTextTemplate: "",
                Subject: ""
            }/*,
            defaultRestriction: {
                Vorname: "",
                Nachname: "",
                Login: "",
                Names: "",
                OrderAttribute: "Nachname",
                OrderDesc: true
            }*/
        },
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, true);
            }
        },
        initSpracheView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = MailingTemplate._initSpracheView.select(complete, error, restriction, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = MailingTemplate._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = MailingTemplate._initSpracheView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


