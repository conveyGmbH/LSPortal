// service for page: clientmanagementList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "AdminAppHelpTextList";

    WinJS.Namespace.define("AdminAppHelpTextList", {
        _appHelpTextView: {
            get: function () {
                return AppData.getFormatView("LangAppHelpText", 20697);
            }
        },
        appHelpTextView: {
            select: function (complete, error, restriction, recordId) {
                Log.call(Log.l.trace, namespaceName + ".appHelpTextView.");
                var ret;
                if (recordId) {
                    ret = AdminAppHelpTextList._appHelpTextView.selectById(complete, error, recordId);
                } else {
                    ret = AdminAppHelpTextList._appHelpTextView.select(complete, error, restriction, {
                        ordered: true,
                        orderAttribute: "Title",
                        asc: true
                    });
                }

                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".appHelpTextView.");
                var ret = AdminAppHelpTextList._appHelpTextView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".appHelpTextView.");
                var ret = AdminAppHelpTextList._appHelpTextView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultRestriction: {
                Title: ""
            }
        },
        _initSpracheView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITSprache", false, true);
            }
        },
        initSpracheView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".initSpracheView.");
                var ret = AdminAppHelpTextList._initSpracheView.select(complete, error, recordId, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, namespaceName + ".initSpracheView.");
                var ret = AdminAppHelpTextList._initSpracheView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, namespaceName + ".initSpracheView.");
                var ret = AdminAppHelpTextList._initSpracheView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
    });
})();
