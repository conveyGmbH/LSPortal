// service for page: mailingList
    /// <reference path="~/www/lib/convey/scripts/strings.js" />
    /// <reference path="~/www/lib/convey/scripts/logging.js" />
    /// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("MailingTemplateEventEdit", {
        _VAMailLayoutOVIEW: {
            get: function () {
                var ret = AppData.getFormatView("VAMailLayout", 0);
                ret.maxPageSize = 50;
                return ret;
            }
        },
        _VAMailLayoutVIEW: {
            get: function () {
                var ret = AppData.getFormatView("VAMailLayout", 20627);
                return ret;
            }
        },
        VAMailLayout: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "MailingTemplateEvent.");
                var ret = MailingTemplateEventEdit._VAMailLayoutVIEW.select(complete, error, restriction, {
                    ordered: true,
                    desc: restriction.OrderDesc,
                    orderAttribute: restriction.OrderAttribute
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "MailingTemplateEvent.");
                var ret = MailingTemplateEventEdit._VAMailLayoutVIEW.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "MailingTemplateEvent.");
                var ret = MailingTemplateEventEdit._VAMailLayoutVIEW.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "MailingTemplateEvent.");
                var ret = MailingTemplateEventEdit._VAMailLayoutOVIEW.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, restriction) {
                Log.call(Log.l.trace, "MailingTemplateEvent.");
                var ret = MailingTemplateEventEdit._VAMailLayoutOVIEW.insert(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return MailingTemplateEventEdit._VAMailLayoutVIEW;
            },
            getRestriction: {
                Subject: "",
                MailText: "",
                TextName: "",
                AddICSVariant: 0
            },    
            setRestriction: {
                TextName: "",
                VAMailTypeID: 0
            },
            getLayoutActive: {
                IsActive: null
            }
        },
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, false, 20600);
            }
        },
        initSpracheView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = MailingTemplateEventEdit._initSpracheView.select(complete, error, restriction, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = MailingTemplateEventEdit._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = MailingTemplateEventEdit._initSpracheView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _LangVAMailTypeView: {
            get: function () {
                return AppData.getFormatView("LangVAMailType", 20631);
            }
        },
        LangVAMailTypeView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "PDFExport.");
                var ret = MailingTemplateEventEdit._LangVAMailTypeView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {

            }
        },
        _VAMailTextOVIEW: {
            get: function () {
                return AppData.getFormatView("VAMailText", 0);
            }
        },
        VAMailTextView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "MailingTemplateEvent.");
                var ret = MailingTemplateEventEdit._VAMailTextOVIEW.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "MailingTemplateEvent.");
                var ret = MailingTemplateEventEdit._VAMailTextOVIEW.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return MailingTemplateEventEdit._VAMailLayoutVIEW;
            },
            getRestriction: {
                Subject: "",
                MailText: ""
            }
        },
    });
})();
