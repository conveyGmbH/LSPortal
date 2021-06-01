// service for page: contactList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />


(function () {
    "use strict";
    WinJS.Namespace.define("GenDataModList", {
        _personAdresseView: {
            get: function () {
                return AppData.getFormatView("PersonAdresse", 20636);
            }
        },
        _personAdresseTable: {
            get: function () {
                return AppData.getFormatView("PersonAdresse", 0);
            }
        },
        _personAdresseId: 0,
        _personId: 0,
        _adresseId: 0,
        _initPersonKategorieId: 0,
    });
    WinJS.Namespace.define("GenDataModList", {
        personAdresseView: {
            select: function (complete, error, restriction, options) {
                if (!restriction) {
                    restriction = {
                        LanguageID: AppData.getLanguageId()
                    };
                }
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "PersonAdresseVIEWID",
                        desc: false
                    };
                }
                Log.call(Log.l.trace, "EventResourceAdministration.eventView.");
                   
                var ret = GenDataModList._personAdresseView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Events.eventView.");
                var ret = GenDataModList._personAdresseView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Events.eventView.");
                var ret = GenDataModList._personAdresseView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: GenDataModList._personAdresseView.relationName,
            pkName: GenDataModList._personAdresseView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataModList._personAdresseView.oDataPkName) {
                        ret = record[GenDataModList._personAdresseView.oDataPkName];
                    }
                    if (!ret && GenDataModList._personAdresseView.pkName) {
                        ret = record[GenDataModList._personAdresseView.pkName];
                    }
                }
                return ret;
            }
        },
        personAdresseTable: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EventResourceAdministration.eventTable.");
                var ret = GenDataModList._personAdresseTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                var ret;
                Log.call(Log.l.trace, "EventSeries.seriesTable.");
                if (recordId) {
                    ret = GenDataModList._personAdresseTable.deleteRecord(function () {
                        if (typeof complete === "function") {
                            complete();
                        }
                    }, error, recordId);
                } else {
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: GenDataModList._personAdresseTable.relationName,
            pkName: GenDataModList._personAdresseTable.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataModList._personAdresseTable.oDataPkName) {
                        ret = record[GenDataModList._personAdresseTable.oDataPkName];
                    }
                    if (!ret && GenDataModList._personAdresseTable.pkName) {
                        ret = record[GenDataModList._personAdresseTable.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();

