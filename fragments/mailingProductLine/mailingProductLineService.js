// service for page: MailingProductLine
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("MailingProductLine", {
        _MaildokumentView: {
            get: function () {
                return AppData.getFormatView("Maildokument", 20513);
            }
        },
        MaildokumentView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "MailingProduct.");
                var ret = MailingProductLine._MaildokumentView.select(complete, error, restriction, { ordered: true });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _MAILERZEILENView: {
            get: function () {
                return AppData.getFormatView("MAILERZEILEN");
            }
        },
        MAILERZEILENView: {
            select: function(complete, error, restriction) {
                Log.call(Log.l.trace, "MailingProductLine.");
                var ret = MailingProductLine._MAILERZEILENView.select(complete,
                    error,
                    restriction,
                    {
                        ordered: true,
                        orderAttribute: "MaildokumentID"
                    });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, "MailingProductLine.");
                var ret = MailingProductLine._MAILERZEILENView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function(complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "MailingProductLine.");
                var ret = MailingProductLine._MAILERZEILENView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function() {
                Log.call(Log.l.trace, "EmpRoles.LGNTINITAPUserRole.");
                var ret = MailingProductLine._MAILERZEILENView.map;
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function() {
                Log.call(Log.l.trace, "EmpRoles.LGNTINITAPUserRole.");
                var ret = MailingProductLine._MAILERZEILENView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Zeilentext: null,
                Inaktiv: null,
                Sortierung: null,
                FragenID: null,
                AntwortenID: null,
                ProduktID: null
            },
        },
            _MAILERZEILENU: {
                get: function () {
                    return AppData.getFormatView("MAILERZEILEN", 20514);
                }
            },
            MAILERZEILENU: {
                select: function (complete, error, restriction) {
                    Log.call(Log.l.trace, "MailingProductLine.");
                    var ret = MailingProductLine._MAILERZEILENU.select(complete, error, restriction,
                        {
                            ordered: true,
                            orderAttribute: "MaildokumentID"
                        });
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                update: function (complete, error, recordId, viewResponse) {
                    Log.call(Log.l.trace, "MailingProduct.");
                    var ret = MailingProductLine._MAILERZEILENU.update(complete, error, recordId, viewResponse);
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                }
        }
    });
})();
