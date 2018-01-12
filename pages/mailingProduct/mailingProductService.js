// service for page: MailingProduct
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

        WinJS.Namespace.define("MailingProduct", {
            _MaildokumentView: {
                get: function() {
                    return AppData.getFormatView("Maildokument", 20513);
                }
            },
            _MaildokumentTable: {
                get: function () {
                    return AppData.getFormatView("Maildokument", 0);
                }
            },
            MaildokumentView: {
                select: function (complete, error, restriction) {
                    Log.call(Log.l.trace, "MailingProduct.");
                    var ret = MailingProduct._MaildokumentView.select(complete, error, restriction, { ordered: true });
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                update: function (complete, error, recordId, viewResponse) {
                    Log.call(Log.l.trace, "MailingProduct.");
                    var ret = MailingProduct._MaildokumentTable.update(complete, error, recordId, viewResponse);
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                defaultValue: {
                    MaildokumentVIEWID: 0,
                    Beschreibung: "Product Selection Mail",
                    Subject: "",
                    Mailtext: "",
                    IsDefault: null,
                    CCAddr: null,
                    BCCAddr: null,
                    Sender: null,
                    MemoSpec: null,
                    SpecType: 2,
                    ReplyTo: "",
                    VeranstaltungID: "",
                    INITSpracheID: 0,
                    MailFooter: null
                }
            }
    });
})();
