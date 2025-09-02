// service for page: contactResultsList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    var namespaceName = "ContactResultsEvents";

    WinJS.Namespace.define("ContactResultsEvents", {
        _contactView: {
            get: function () {
                return AppData.getFormatView("Kontakt", 0);
            }
        },
        contactView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".contactView.");
                var ret = ContactResultsEvents._contactView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Vorname: "",
                Name: ""
            }
        },
        _incidentView: {
            get: function () {
                return AppData.getFormatView("Incident", 20621);
            }
        },
        incidentView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".incidentView.", "restriction=" + (restriction ? JSON.stringify(restriction) : ""));
                var ret = ContactResultsEvents._incidentView.select(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();