// services for page: photo
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "AdminAppHelpText";

    WinJS.Namespace.define("AdminAppHelpText", {
        _langAppHelpTextView:{
            get: function () {
                return AppData.getFormatView("LangAppHelpText", 20697);
            }
        },
        _langAppHelpTextOView: {
            get: function () {
                return AppData.getFormatView("LangAppHelpText", 0);
            }
        },
        langAppHelpTextView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".langAppHelpTextView.", "recordId=" + recordId);
                var ret = AdminAppHelpText._langAppHelpTextView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".langAppHelpTextView.", "recordId=" + recordId);
                var ret = AdminAppHelpText._langAppHelpTextView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".langAppHelpTextView.", "recordId=" + recordId);
                var ret = AdminAppHelpText._langAppHelpTextOView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                LangAppHelpTextVIEWID: 0,
                AppHelpTextID: 0,
                LanguageSpecID: 0,
                Title: "",
                MediaURL: "",
                SubTitle: "",
                BodyText: ""
            }
        }
    });
})();
