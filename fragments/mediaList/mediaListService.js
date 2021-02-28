// service for page: mediaList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("MediaList", {
        _eventDocView: {
            get: function() {
                return AppData.getFormatView("MandantDokument", 20633);
            }
        },
        _eventTextUsageId: -1,
        _eventId: -1
    });

    WinJS.Namespace.define("MediaList", {
        eventDocView: {
            select: function (complete, error, restriction, options) {
                var ret;
                if (typeof restriction === "number") {
                    ret = MediaList._eventDocView.selectById(complete, error, restriction);
                } else {
                    if (!restriction) {
                        restriction = {
                            DokVerwendungID: MediaList._eventTextUsageId
                        };
                        if (MediaList._eventTextUsageId > 2) {
                            restriction.VeranstaltungID = MediaList._eventId;
                            if (!restriction.VeranstaltungID) {
                                restriction.DokVerwendungID = -1;
                            }
                        }
                    }
                    if (!options) {
                        options = {
                            ordered: true,
                            orderAttribute: "ModifiedTS",
                            desc: true
                        };
                    }
                    Log.call(Log.l.trace, "MediaText.evenvtDocView.",
                        "DokVerwendungID=" + restriction.DokVerwendungID,
                        "VeranstaltungID=" + restriction.VeranstaltungID);
                    ret = MediaList._eventDocView.select(complete, error, restriction, options);
                }
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "MediaText.eventDocView.");
                var ret = MediaList._eventDocView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "MediaText.eventDocView.");
                var ret = MediaList._eventDocView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: MediaList._eventDocView.relationName,
            pkName: MediaList._eventDocView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (MediaList._eventDocView.oDataPkName) {
                        ret = record[MediaList._eventDocView.oDataPkName];
                    }
                    if (!ret && MediaList._eventDocView.pkName) {
                        ret = record[MediaList._eventDocView.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();


