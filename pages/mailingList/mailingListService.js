// service for page: mailingList
    /// <reference path="~/www/lib/convey/scripts/strings.js" />
    /// <reference path="~/www/lib/convey/scripts/logging.js" />
    /// <reference path="~/www/lib/convey/scripts/dataService.js" />

    (function () {
        "use strict";

        WinJS.Namespace.define("MailingList", {
            _MaildokumentView: {
                get: function () {
                    return AppData.getFormatView("Maildokument", 20527);
                }
            },
            MaildokumentView: {
                select: function (complete, error, restriction) {
                    Log.call(Log.l.trace, "MailingList.");
                    var ret = MailingList._MaildokumentView.select(complete, error, restriction, { ordered: true });
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                getNextUrl: function (response) {
                    Log.call(Log.l.trace, "MailingList.");
                    var ret = MailingList._MaildokumentView.getNextUrl(response);
                    Log.ret(Log.l.trace);
                    return ret;
                },
                selectNext: function (complete, error, response, nextUrl) {
                    Log.call(Log.l.trace, "MailingList.");
                    var ret = MailingList._MaildokumentView.selectNext(complete, error, response, nextUrl);
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                defaultValue: {
                    MaildokumentVIEWID: 0,
                    Beschreibung: "",
                    Subject: ""
                }
            }
        });
    })();
