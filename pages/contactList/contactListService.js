// service for page: contactList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />


(function () {
    "use strict";

    var namespaceName = "ContactList";

    WinJS.Namespace.define("ContactList", {
        _contactView: {
            get: function () {
                var ret = AppData.getFormatView("Kontakt", 20454, false);
                ret.maxPageSize = 20;
                return ret;
            }
        },
        contactView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".contactView.");
                var ret;
                if (typeof restriction === "number") {
                    ret = ContactList._contactView.selectById(complete, error, restriction);
                } else {
                    ret = ContactList._contactView.select(complete, error, restriction, {
                        ordered: true,
                        orderAttribute: "Erfassungsdatum",
                        desc: true
                    });
                }
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".contactView.");
                var ret = ContactList._contactView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".contactView.");
                var ret = ContactList._contactView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _contactDocView: {
            get: function () {
                var ret = AppData.getFormatView("Kontakt", 20498, false);
                ret.maxPageSize = 20;
                return ret;
            }
        },
        contactDocView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".contactDocView.");
                var ret = ContactList._contactDocView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Erfassungsdatum",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".contactDocView.");
                var ret = ContactList._contactDocView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".contactDocView.");
                var ret = ContactList._contactDocView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _mitarbeiterView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20453);
            }
        },
        mitarbeiterView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".mitarbeiterView.", "recordId=" + recordId);
                var ret = ContactList._mitarbeiterView.selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();

