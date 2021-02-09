// service for page: mailing
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("MailingEdit", {
        _MaildokumentView: {
            get: function () {
                return AppData.getFormatView("VAMail", 0);
            }
        },
        _MaildokumentTable: {
            get: function () {
                return AppData.getFormatView("VAMail", 0);
            }
        },
        MaildokumentView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "Mailing.");
                var ret = MailingEdit._MaildokumentView.selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "Mailing.");
                var ret = MailingEdit._MaildokumentTable.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Mailing.");
                var ret = MailingEdit._MaildokumentTable.insert(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "Mailing.");
                var ret = MailingEdit._MaildokumentTable.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Beschreibung: "",
                Subject: "",
                Mailtext: "",
                CCAddr: "",
                BCCAddr: "",
                Sender: "",
                MemoSpec: "",
                SpecType: "",
                ReplyTo: "",
                VeranstaltungID: AppData.getRecordId("Veranstaltung"),
                INITSpracheID: 0,
                MailFooter: ""
            }
        },
        _VAMail: {
            get: function () {
                var ret = AppData.getFormatView("VAMail", 20623);
                ret.maxPageSize = 50;
                return ret;
            }
        },
        VAMail: {
            select: function (complete, error, restricion) {
                Log.call(Log.l.trace, "ContactResultsList.");
                var ret = MailingEdit._VAMail.select(complete, error, restricion);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _initSpracheView: {
            get: function () {
                return AppData.getFormatView("VAMail", 20632);
            }
        },
        initSpracheView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = MailingEdit._initSpracheView.select(complete, error, restriction, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = MailingEdit._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = MailingEdit._initSpracheView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _vAMailTemplateView: {
            get: function () {
                return AppData.getFormatView("VAMailLayout", 0);
            }
        },
        vAMailTemplateView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "MailingEdit._vAMailTemplateView.");
                var ret = MailingEdit._vAMailTemplateView.select(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "MailingEdit._vAMailTemplateView.");
                var ret = MailingEdit._vAMailTemplateView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "MailingEdit._vAMailTemplateView.");
                var ret = MailingEdit._vAMailTemplateView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _TestMailView: {
            get: function () {
                return AppData.getFormatView("Testmail", 0);
            }
        },
        TestMailView: {
            insert: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Mailing.");
                var ret = MailingEdit._TestMailView.insert(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultRestriction: {
                TestType: 2,
                TargetAddr: "",
                Vorname: "",
                Nachname: "",
                MailDokumentID: null,
                AnredeID: 0
            }
        }
    });
})();