// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("UserMessages", {
        _userId: 0,
        _userMessageView: {
            get: function () {
                return AppData.getFormatView("BenutzerNachricht", 20595, false);
            }
        },
        userMessageView: {
            select: function(complete, error, restriction, options) {
                Log.call(Log.l.trace, "eventView.");
                if (!restriction) {
                    restriction = {
                        BenutzerID: UserMessages._userId,
                        InfoText: "NOT NULL"
                    };
                }
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "SendTS",
                        desc: true
                    };
                }
                var ret = UserMessages._userMessageView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, "ContactList.");
                var ret = UserMessages._userMessageView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function(complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "ContactList.");
                var ret = UserMessages._userMessageView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _userMessageTable: {
            get: function () {
                return AppData.getFormatView("BenutzerNachricht", 0, false);
            }
        },
        userMessageTable: {
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "loginView.");
                var ret = UserMessages._userMessageTable.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


