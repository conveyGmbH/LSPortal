// service for page: HelpTextList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "HelpTextList";

    WinJS.Namespace.define("HelpTextList", {
        _helpTextView: {
            get: function () {
                return AppData.getFormatView("LangAppHelpText", 20696);
            }
        },
        helpTextView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, namespaceName + ".helpTextView.");
                var ret = HelpTextList._helpTextView.select(complete, error, {
                    LanguageSpecID: AppData.getLanguageId()
                }, {
                    ordered: true,
                    orderAttribute: "Title"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".helpTextView.");
                var ret = HelpTextList._helpTextView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".helpTextView.");
                var ret = HelpTextList._helpTextView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            get relationName() {
                return HelpTextList._helpTextView.relationName;
            },
            get pkName() {
                return HelpTextList._helpTextView.oDataPkName;
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (HelpTextList._helpTextView.oDataPkName) {
                        ret = record[HelpTextList._helpTextView.oDataPkName];
                    }
                    if (!ret && HelpTextList._helpTextView.pkName) {
                        ret = record[HelpTextList._helpTextView.pkName];
                    }
                }
                return ret;
            },
            defaultValue: {
                Title: ""
            }
        }
    });
})();
