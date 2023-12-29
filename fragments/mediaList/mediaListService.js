// service for page: mediaList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "MediaList";

    WinJS.Namespace.define("MediaList", {
        _eventDocView: {
            get: function() {
                return AppData.getFormatView("MandantDokument", 20633);
            }
        },
        _eventTextUsageId: -1,
        _eventId: -1,
        _eventSeriesId: -1,
        _showOnlyEventMedia: false,
        eventSeriesId: {
            get: function() {
                if (AppBar.scope && typeof AppBar.scope.getEventSeriesId === "function") {
                    MediaList._eventSeriesId = AppBar.scope.getEventSeriesId();
                }
                return MediaList._eventSeriesId;
            },
            set: function(value) {
                MediaList._eventSeriesId = value;
                if (AppBar.scope && typeof AppBar.scope.setEventSeriesId === "function") {
                    MediaList._eventSeriesId = AppBar.scope.setEventSeriesId(value);
                }
            }
        }
    });
    WinJS.Namespace.define("MediaList", {
        eventDocView: {
            select: function (complete, error, restriction, options) {
                var ret;
                if (typeof restriction === "number") {
                    Log.call(Log.l.trace, namespaceName + ".evenvtDocView.", "MandantDokumentVIEWID=" + restriction);
                    ret = MediaList._eventDocView.selectById(complete, error, restriction);
                } else {
                    if (!restriction) {
                        restriction = {
                            DokVerwendungID: MediaList._eventTextUsageId
                        };
                        if (MediaList._eventTextUsageId > 2 || MediaList._showOnlyEventMedia) {
                            if (MediaList._eventId > 0) {
                                restriction.VeranstaltungID = MediaList._eventId;
                            } else {
                                restriction.DokVerwendungID = -1;
                            }
                        } 
                        if (!MediaList._showOnlyEventMedia) {
                            restriction.VeranstaltungID = "NULL";
                            if (MediaList._eventTextUsageId === 2) {
                                if (MediaList.eventSeriesId > 0) {
                                    restriction.MandantSerieID = MediaList.eventSeriesId;
                                } else {
                                    restriction.DokVerwendungID = -1;
                                }
                            }
                        } else if (MediaList.eventSeriesId > 0) {
                            restriction.MandantSerieID = MediaList.eventSeriesId;
                        }
                    }
                    if (!options) {
                        options = {
                            ordered: true,
                            orderAttribute: "AddIndex",
                            desc: true
                        };
                    }
                    Log.call(Log.l.trace, namespaceName + ".evenvtDocView.",
                        "DokVerwendungID=" + restriction.DokVerwendungID +
                        " MandantSerieID=" + restriction.MandantSerieID +
                        " VeranstaltungID=" + restriction.VeranstaltungID);
                    ret = MediaList._eventDocView.select(complete, error, restriction, options);
                }
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".eventDocView.");
                var ret = MediaList._eventDocView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".eventDocView.");
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


