// service for page: mailingList
    /// <reference path="~/www/lib/convey/scripts/strings.js" />
    /// <reference path="~/www/lib/convey/scripts/logging.js" />
    /// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("MailingTemplateEvent", {
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
                var ret = MailingTemplateEvent._VAMailLayoutVIEW.select(complete, error, restriction, {
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
                var ret = MailingTemplateEvent._VAMailLayoutVIEW.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "MailingTemplateEvent.");
                var ret = MailingTemplateEvent._VAMailLayoutVIEW.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "MailingTemplateEvent.");
                var ret = MailingTemplateEvent._VAMailLayoutOVIEW.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, restriction) {
                Log.call(Log.l.trace, "MailingTemplateEvent.");
                var ret = MailingTemplateEvent._VAMailLayoutOVIEW.insert(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "MailingTemplateEvent.");
                var ret = MailingTemplateEvent._VAMailLayoutOVIEW.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return MailingTemplateEvent._VAMailLayoutVIEW;
            },
            defaultRestriction: {
                TemplateName: "",
                MailTypeTitle: "",
                VeranstaltungName: "",
                UsedVeranstaltung: "",
                LangsAvailable: "",
                Erfassungsdatum: "",
                IsActive: 0
            },
            defaultContactHeader: {
            TemplateName: "",
            MailTypeTitle: "",
            VeranstaltungName: "",
            UsedVeranstaltung: "",
            LangsAvailable: "",
            Erfassungsdatum: "",
            IsActive: 0
            },
            insertRestriction: {
                TextName: "",
                VAMailTypeID: 0
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
                var ret = MailingTemplateEvent._initSpracheView.select(complete, error, restriction, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = MailingTemplateEvent._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = MailingTemplateEvent._initSpracheView.map;
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
                var ret = MailingTemplateEvent._LangVAMailTypeView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {

            }
        }
    });
})();
