﻿// service for page: contactResultsList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "ContactResultsCriteria";

    WinJS.Namespace.define("ContactResultsCriteria", {
        _contactView: {
            get: function () {
                return AppData.getFormatView("KontaktReport", 0);
            }
        },
        contactView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".contactView.", "recordId=" + recordId);
                var ret = ContactResultsCriteria._contactView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".contactView.");
                var ret = ContactResultsCriteria._contactView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                
            }
        },
        _kontaktKriterienView: {
            get: function () {
                return AppData.getFormatView("KontaktKriterien", 0);
            }
        },
        kontaktKriterienView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".kontaktKriterienView.", "recordId=" + recordId);
                var ret = ContactResultsCriteria._kontaktKriterienView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".kontaktKriterienView.");
                var ret = ContactResultsCriteria._kontaktKriterienView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _langINKontaktPrioView: {
            get: function () {
                return AppData.getFormatView("LangINKontaktPrio", 0);
            }
        },
        langINKontaktPrioView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".langINKontaktPrioView.", "restriction=" + (restriction ? JSON.stringify(restriction) : ""));
                var ret = ContactResultsCriteria._langINKontaktPrioView.select(complete, error, restriction, {
                    
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".langINKontaktPrioView.");
                var ret = ContactResultsCriteria._langINKontaktPrioView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".langINKontaktPrioView.");
                var ret = ContactResultsCriteria._langINKontaktPrioView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return ContactResultsCriteria.langINKontaktPrioView;
            }
        },
        _langINKontaktTypView: {
            get: function () {
                return AppData.getFormatView("LangINKontaktTyp", 0);
            }
        },
        langINKontaktTypView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".langINKontaktTypView.", "restriction=" + (restriction ? JSON.stringify(restriction) : ""));
                var ret = ContactResultsCriteria._langINKontaktTypView.select(complete, error, restriction, {
                    
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".langINKontaktTypView.");
                var ret = ContactResultsCriteria._langINKontaktTypView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".langINKontaktTypView.");
                var ret = ContactResultsCriteria._langINKontaktTypView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return ContactResultsCriteria._langINKontaktTypView;
            }
        }
    });
})();
