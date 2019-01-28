// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("MailingTypes", {
        _MailTypeVIEW: {
            get: function () {
                return AppData.getFormatView("MailType", 0, false);
            }
        },
        MailTypeVIEW: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = MailingTypes._MailTypeVIEW.select(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            },
            defaultValue: {
                MailTypeVIEWID: "",
                Name: ""
            }
        },
        _cr_Event_MailTypeVIEW_20570: {
            get: function () {
                return AppData.getFormatView("CR_Event_MailType", 20570, false);
            }
        },
        cr_Event_MailTypeVIEW_20570: {
            select: function(complete, error, recordId) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = MailingTypes._cr_Event_MailTypeVIEW_20570.select(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            }
        },
        _cr_Event_MailTypeView: {
            get: function () {
                return AppData.getFormatView("CR_Event_MailType", 0);
            }
        },
        cr_Event_MailTypeView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = MailingTypes._cr_Event_MailTypeView.select(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = MailingTypes._cr_Event_MailTypeView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = MailingTypes._cr_Event_MailTypeView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = MailingTypes._cr_Event_MailTypeView.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                //CR_Event_MailTypeVIEWID: 0,
                SendDay: null,
                SendDayHook: "",
                SendLater: "",
                SendStartTime: "",
                OncePerType: "",
                CCAddr: "",
                BCCAddr: "",
                FromAddr: "",
                ReplyToAddr: "",
                Enabled: false
            }/*,
            defaultRestriction: {
                Vorname: "",
                Nachname: "",
                Login: "",
                Names: "",
                OrderAttribute: "Nachname",
                OrderDesc: true
            }*/
        }
    });
})();


