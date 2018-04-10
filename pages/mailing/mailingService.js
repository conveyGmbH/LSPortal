// service for page: mailing
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Mailing", {
        _MaildokumentView: {
            get: function () {
                return AppData.getFormatView("Maildokument", 20527);
            }
        },
        _MaildokumentTable: {
            get: function () {
                return AppData.getFormatView("Maildokument", 0);
            }
        },
        MaildokumentView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "Mailing.");
                var ret = Mailing._MaildokumentView.selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "Mailing.");
                var ret = Mailing._MaildokumentTable.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Mailing.");
                var ret = Mailing._MaildokumentTable.insert(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "Mailing.");
                var ret = Mailing._MaildokumentTable.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Beschreibung: null,
                Subject: null,
                Mailtext: "",
                IsDefault: null,
                CCAddr: null,
                BCCAddr: null,
                Sender: null,
                MemoSpec: null,
                SpecType: null,
                ReplyTo: null,
                VeranstaltungID: 0,
                INITSpracheID: 0,
                MailFooter: null
            }
        },
        _FragebogenzeileView: {
            get: function () {
                return AppData.getFormatView("Fragebogenzeile", 20512);
            }
        },
        FragebogenzeileView: {
            select: function (complete, error, restricion) {
                Log.call(Log.l.trace, "Mailing.");
                var ret = Mailing._FragebogenzeileView.select(complete, error, restricion,
                    {
                        ordered: true,
                        orderAttribute: "SORTIERUNG",
                        desc: true
                    });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "Mailing.");
                var ret = Mailing._FragebogenzeileView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "Mailing.");
                var ret = Mailing._FragebogenzeileView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, true);
            }
        },
        initSpracheView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = Mailing._initSpracheView.select(complete, error, restriction, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = Mailing._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "Mailing._initSpracheView.");
                var ret = Mailing._initSpracheView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
    });
})();