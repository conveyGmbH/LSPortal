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
                return AppData.getFormatView("Kontakt", 20662);
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
        eventView: {
            select: function (complete, error, contactId) {
                Log.call(Log.l.trace, namespaceName + "eventView.", "contactId=" + contactId);
                return AppData.call("PRC_GetCopyToVAList", {
                    pKontaktID: contactId
                }, function (json) {
                    Log.print(Log.l.info, "call PRC_GetCopyToVAList: success!");
                    // procedure call returns complete results set, but no nextUrl- and no orderBy-support!
                    if (typeof complete === "function") {
                        complete(json);
                    }
                }, function (errorResponse) {
                    Log.print(Log.l.error, "call PRC_GetCopyToVAList: error");
                    if (typeof error === "function") {
                        error(errorResponse);
                    }
                });
            },
            defaultValue: {
                VeranstaltungID: 0,
                Name: "",
                LiveStartTS: "",
                LiveEndTS: ""
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
                var ret = ContactResultsEvents._incidentView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "IncidentVIEWID",
                    desc: true
                });
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();