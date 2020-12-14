// service for page: contactResultsList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("ContactResultsCriteria", {
        _contactView: {
            get: function () {
                return AppData.getFormatView("KontaktReport", 0);
            }
        },
        contactView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "contactView.");
                var ret = ContactResultsCriteria._contactView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "contactView.");
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
            select: function (complete, error, restriction) {
                // Log.call(Log.l.trace, "visitorFlowLevelView.", "restriction=" + restriction);
                Log.call(Log.l.trace, "kontaktKriterienView.", "restriction=" + restriction);
                var ret = ContactResultsCriteria._kontaktKriterienView.select(complete, error, restriction, {
                   
                });
                Log.ret(Log.l.trace);
                return ret;

            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "kontaktKriterienView.");
                var ret = ContactResultsCriteria._kontaktKriterienView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();