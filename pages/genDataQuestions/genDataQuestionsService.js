// service for page: infodeskEmpList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("GenDataQuestions", {
     _questionView: {
            get: function () {
                return AppData.getFormatView("Question", 20648);
            }
        },
     _questionTable: {
            get: function () {
                return AppData.getFormatView("Question", 0);
            }
        }
    });
    WinJS.Namespace.define("GenDataQuestions", {
        questionView: {
            select: function (complete, error, restriction, options) {
                if (!restriction) {
                    restriction = {
                        
                    };
                }
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "QuestionVIEWID",
                        desc: false
                    };
                }
                Log.call(Log.l.trace, "EventResourceAdministration.eventView.");

                var ret = GenDataQuestions._questionView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Events.eventView.");
                var ret = GenDataQuestions._questionView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Events.eventView.");
                var ret = GenDataQuestions._questionView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                QuestionTitle: ""
            },
            relationName: GenDataQuestions._questionView.relationName,
            pkName: GenDataQuestions._questionView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataQuestions._questionView.oDataPkName) {
                        ret = record[GenDataQuestions._questionView.oDataPkName];
                    }
                    if (!ret && GenDataQuestions._questionView.pkName) {
                        ret = record[GenDataQuestions._questionView.pkName];
                    }
                }
                return ret;
            }
        },
        questionTable: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EventSeries.seriesTable.");
                var ret = GenDataQuestions._questionTable.update(function () {
                    if (typeof complete === "function") {
                        complete();
                    }
                }, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error) {
                Log.call(Log.l.trace, "EventSeries.seriesTable.");
                var ret = GenDataQuestions._questionTable.insert(function () {
                    if (typeof complete === "function") {
                        complete();
                    }
                }, error, {
                        Titel: ""
                    });
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                var ret;
                Log.call(Log.l.trace, "EventSeries.seriesTable.");
                if (AppBar.scope && typeof AppBar.scope.scopeFromRecordId === "function") {
                    var record = AppBar.scope.scopeFromRecordId(recordId);
                    if (record && record.item) {
                        var pkName = GenDataQuestions._questionTable.relationName + "ID";
                        recordId = record.item[pkName];
                    } else {
                        recordId = 0;
                    }
                } else {
                    recordId = 0;
                }
                if (recordId) {
                    ret = GenDataQuestions._questionTable.deleteRecord(function () {
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
            relationName: GenDataQuestions._questionTable.relationName,
            pkName: GenDataQuestions._questionTable.oDataPkName,
            _pkName: GenDataQuestions._questionTable.pkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (GenDataQuestions._questionTable.pkName) {
                        ret = record[GenDataQuestions._questionTable.pkName];
                    }
                    if (!ret && GenDataQuestions._questionTable._pkName) {
                        ret = record[GenDataQuestions._questionTable._pkName];
                    }
                }
                return ret;
            }
        }
    });
})();


