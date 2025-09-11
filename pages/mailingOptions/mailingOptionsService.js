// service for page: mailingOptions
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("MailingOptions", {
        _eventId: 0,
        _mailId: 0,
        _connTypId: 0,
        _CR_VERANSTOPTION_View: {
            get: function () {
                return AppData.getFormatView("CR_VERANSTOPTION", 20668, false);
            }
        },
        CR_VERANSTOPTION_ODataView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "CR_VERANSTOPTION_ODataView.");
                var ret = MailingOptions._CR_VERANSTOPTION_View.select(complete,
                    error,
                    restriction,
                    {
                        ordered: true,
                        orderAttribute: "INITOptionTypeID"
                    });
                Log.ret(Log.l.trace);
                return ret;

            }
        },
        _VAMailServerView: {
            get: function () {
                return AppData.getFormatView("VAMailServer", 20705);
            }
        },
        _VAMailServerTable: {
            get: function () {
                return AppData.getFormatView("VAMailServer", 0);
            }
        },
        VAMailServerView: {
            select: function (complete, error, options) {
                Log.call(Log.l.trace, "MailingOptions.");
                var ret = MailingOptions._VAMailServerView.select(complete, error, options);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "MailingOptions.");
                var ret = MailingOptions._VAMailServerTable.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, restriction) {
                Log.call(Log.l.trace, "MailingOptions.");
                var ret = MailingOptions._VAMailServerTable.insert(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Mailserver: "",
                Username: "",
                Password: "",
                Protocol: ""
            }
        }
    });
})();
