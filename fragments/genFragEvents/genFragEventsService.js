// service for page: GenFragEvents
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "GenFragEvents";

    WinJS.Namespace.define("GenFragEvents", {
        _BenutzerView: {
            get: function () {
                return AppData.getFormatView("Benutzer", 20677);
            }
        },
        _BenutzerTable: {
            get: function () {
                return AppData.getFormatView("Benutzer", 0);
            }
        },
        BenutzerView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".BenutzerView.");
                var ret = GenFragEvents._BenutzerView.select(complete, error, restriction, {
                    ordered: true,
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".BenutzerView.");
                var ret = GenFragEvents._BenutzerTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".BenutzerView.");
                var ret = GenFragEvents._BenutzerView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".BenutzerView.");
                var ret = GenFragEvents._BenutzerView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return GenFragEvents._BenutzerView.relationName;
                }
            },
            pkName: {
                get: function() {
                    return GenFragEvents._BenutzerView.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenFragEvents._BenutzerView.oDataPkName) {
                        ret = record[GenFragEvents._BenutzerView.oDataPkName];
                    }
                    if (!ret && GenFragEvents._BenutzerView.pkName) {
                        ret = record[GenFragEvents._BenutzerView.pkName];
                    }
                }
                return ret;
            },
            defaultValue: {
                BenutzerVIEWID: 0,
                VeranstaltungName: "",
                EndStartDatum: "",
                UserStatusID: "",
                AktivButtonShowFlag: "",
                UserStatusShowFlag: "",
                UserStatus: "",
                MitarbeiterID: 0
            }
        }
    });
})();