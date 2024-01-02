// service for page: contactList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />


(function () {
    "use strict";
    WinJS.Namespace.define("GenDataModHisto", {
        _benutzerView: {
            get: function () {
                return AppData.getFormatView("Benutzer", 20642);
            }
        },
        _benutzerTable: {
            get: function () {
                return AppData.getFormatView("Benutzer", 0);
            }
        },
        benutzerView: {
            select: function (complete, error, restriction, options) {
                if (!restriction) {
                    var master = Application.navigator.masterControl;
                    var personId = master.controller && master.controller.binding && master.controller.binding.personId;
                    restriction = {
                        PersonID: personId || 0,
                        LanguageSpecID: AppData.getLanguageId()
                    };
                }
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "BenutzerVIEWID",
                        desc: false
                    };
                }
                Log.call(Log.l.trace, "GenDataModHisto._benutzerView.");
                   
                var ret = GenDataModHisto._benutzerView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "GenDataModHisto._benutzerView.");
                var ret = GenDataModHisto._benutzerView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "GenDataModHisto._benutzerView.");
                var ret = GenDataModHisto._benutzerView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return GenDataModHisto._benutzerView.relationName;
                }
            },
            pkName: {
                get: function() {
                    return GenDataModHisto._benutzerView.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataModHisto._benutzerView.oDataPkName) {
                        ret = record[GenDataModHisto._benutzerView.oDataPkName];
                    }
                    if (!ret && GenDataModHisto._benutzerView.pkName) {
                        ret = record[GenDataModHisto._benutzerView.pkName];
                    }
                }
                return ret;
            }
        },
        benutzerTable: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "GenDataModHisto._benutzerTable.");
                var ret = GenDataModHisto._benutzerTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return GenDataModHisto._benutzerTable.relationName;
                }
            },
            pkName: {
                get: function() {
                    return GenDataModHisto._benutzerTable.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataModHisto._benutzerTable.oDataPkName) {
                        ret = record[GenDataModHisto._benutzerTable.oDataPkName];
                    }
                    if (!ret && GenDataModHisto._benutzerTable.pkName) {
                        ret = record[GenDataModHisto._benutzerTable.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();

