// service for page: mailingList
    /// <reference path="~/www/lib/convey/scripts/strings.js" />
    /// <reference path="~/www/lib/convey/scripts/logging.js" />
    /// <reference path="~/www/lib/convey/scripts/dataService.js" />

    (function () {
        "use strict";

        WinJS.Namespace.define("MailingList", {
            _maildokumentView: {
                get: function () {
                    return AppData.getFormatView("Maildokument"); 
                }
            },
            maildokumentView: {
                select: function (complete, error) {
                    Log.call(Log.l.trace, "MailingList.");
                    var ret = MailingList._maildokumentView.select(complete,
                        error,
                        { SpecType : 1 },
                        {
                            ordered: true,
                            orderAttribute: "MaildokumentID"
                        });
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                getNextUrl: function (response) {
                    Log.call(Log.l.trace, "MailingList.");
                    var ret = MailingList._maildokumentView.getNextUrl(response);
                    Log.ret(Log.l.trace);
                    return ret;
                },
                selectNext: function (complete, error, response, nextUrl) {
                    Log.call(Log.l.trace, "MailingList.");
                    var ret = MailingList._maildokumentView.selectNext(complete, error, response, nextUrl);
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                }
            }
        });
    })();
