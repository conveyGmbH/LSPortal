// service for page: mailing
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Mailing", {
        _MaildokumentTable: {
            get: function () {
                return AppData.getFormatView("Maildokument", 0);
            }
        },
        MaildokumentView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "Mailing.");
                var ret = Mailing._MaildokumentTable.selectById(complete, error, recordId);
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
            defaultValue: {
                Beschreibung: null,
                Subject: null,
                Mailtext: null,
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
        }
    });
})();