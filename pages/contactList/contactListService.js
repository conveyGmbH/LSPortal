// service for page: contactList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />


(function () {
    "use strict";

    WinJS.Namespace.define("ContactList", {
        _contactView: {
            get: function () {
                return AppData.getFormatView("Kontakt", 20454, false);
            }
        },
        contactView: {
            select: function (complete, error, restriction, recordId) {
                Log.call(Log.l.trace, "ContactList.");
                var ret;
                if (recordId) {
                    ret = ContactList._contactView.selectById(complete, error, recordId);
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
                Log.call(Log.l.trace, "ContactList.");
                var ret = ContactList._contactView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "ContactList.");
                var ret = ContactList._contactView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _contactDocView: {
            get: function () {
                return AppData.getFormatView("Kontakt", 20498, false);
            }
        },
        contactDocView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "ContactList.");
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
                Log.call(Log.l.trace, "ContactList.");
                var ret = ContactList._contactDocView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "ContactList.");
                var ret = ContactList._contactDocView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();

