// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "UserMessages";

    WinJS.Namespace.define("UserMessages", {
        _userId: 0,
        _userMessageView: {
            get: function () {
                return AppData.getFormatView("BenutzerNachricht", 20595, false);
            }
        },
        _userMessageTable: {
            get: function () {
                return AppData.getFormatView("BenutzerNachricht", 0, false);
            }
        },
        userMessageView: {
            select: function(complete, error, restriction, options) {
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
                Log.call(Log.l.trace, namespaceName + ".userMessageView.", "restriction=" + JSON.stringify(restriction));
                var ret = UserMessages._userMessageView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".userMessageTable.");
                var ret = UserMessages._userMessageTable.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, namespaceName + ".userMessageView.");
                var ret = UserMessages._userMessageView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function(complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".userMessageView.");
                var ret = UserMessages._userMessageView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
    });
})();


