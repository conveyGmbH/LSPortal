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
            MaildokumentView: {
                select: function (complete, error, restriction) {
                    Log.call(Log.l.trace, "MailingProduct.");
                    var ret = MailingProduct._MaildokumentView.select(complete, error, restriction, { ordered: true });
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                getNextUrl: function(response) {
                    Log.call(Log.l.trace, "MailingProduct.");
                    var ret = MailingProduct._MaildokumentView.getNextUrl(response);
                    Log.ret(Log.l.trace);
                    return ret;
                },
                selectNext: function(complete, error, response, nextUrl) {
                    Log.call(Log.l.trace, "MailingProduct.");
                    var ret = MailingProduct._MaildokumentView.selectNext(complete, error, response, nextUrl);
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                update: function (complete, error, recordId, viewResponse) {
                    Log.call(Log.l.trace, "MailingProduct.");
                    var ret = MailingProduct._MaildokumentViewO.update(complete, error, recordId, viewResponse);
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
                    MailFooter: null,
                    INITLanguageID: AppData.getLanguageId()
                }
            
            },
            _MaildokumentViewO: {
                get: function () {
                    return AppData.getFormatView("Maildokument");
                }
            },
            MaildokumentViewO: {
                select: function (complete, error, restriction) {
                    Log.call(Log.l.trace, "MailingProduct.");
                    var ret = MailingProduct._MaildokumentViewO.select(complete, error, restriction, { ordered: true });
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                }
            },
            _MAILERZEILENView: {
                get: function () {
                    return AppData.getFormatView("MAILERZEILEN", 20514);
                }
            },
            MAILERZEILENView: {
                select: function (complete, error, restriction) {
                    Log.call(Log.l.trace, "MailingProduct.");
                    var ret = MailingProduct._MAILERZEILENView.select(complete, error, restriction,
                        {
                        ordered: true,
                        orderAttribute: "MaildokumentID"
                        });
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                getNextUrl: function (response) {
                    Log.call(Log.l.trace, "MailingProduct.");
                    var ret = MailingProduct._MAILERZEILENView.getNextUrl(response);
                    Log.ret(Log.l.trace);
                    return ret;
                },
                selectNext: function (complete, error, response, nextUrl) {
                    Log.call(Log.l.trace, "MailingProduct.");
                    var ret = MailingProduct._MAILERZEILENView.selectNext(complete, error, response, nextUrl);
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                getMap: function () {
                    Log.call(Log.l.trace, "EmpRoles.LGNTINITAPUserRole.");
                    var ret = MailingProduct._MAILERZEILENView.map;
                    Log.ret(Log.l.trace);
                    return ret;
                },
                getResults: function () {
                    Log.call(Log.l.trace, "EmpRoles.LGNTINITAPUserRole.");
                    var ret = MailingProduct._MAILERZEILENView.results;
                    Log.ret(Log.l.trace);
                    return ret;
                },
            }
        /*
        update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "MailingProduct.");
                var ret = MailingProduct._MAILERZEILENView.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error) {
                Log.call(Log.l.trace, "MailingProduct.");
                var ret = MailingProduct._MAILERZEILENView.insert(complete, error, {
                    MAILERZEILENVIEWID: 0
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "MailingProduct.");
                var ret = MailingProduct._MAILERZEILENView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            }
        */
    });
})();
