// service for page: contactResultsList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.min.js" />

(function () {
    "use strict";
    var namespaceName = "ClientManagementSummarise";
    var maxRows = 100;

    WinJS.Namespace.define(namespaceName, {
        _eventId: 0,
        _restriction: null,
        _orderAttribute: "Name",
        _orderDesc: true,
        _FilterOption: "ALL",
        _Filter: 0,
        Filter: {
            get: function () {
                return ClientManagementSummarise._Filter;
            },
            set: function (value) {
                ClientManagementSummarise._Filter = value;
            }
        },
        Filter0: {
            get: function () {
                return this.Filter === 0;
            },
            set: function (checked) {
                if (checked) {
                    this.Filter = 0;
                }
            }
        },
        Filter1: {
            get: function () {
                return this.Filter === 1;
            },
            set: function (checked) {
                if (checked) {
                    this.Filter = 1;
                }
            }
        },
        Filter2: {
            get: function () {
                return this.Filter === 2;
            },
            set: function (checked) {
                if (checked) {
                    this.Filter = 2;
                }
            }
        },
        _fairMandantView: {
            get: function () {
                var ret = AppData.getFormatView("FairMandantVeranst", 20694);
                //ret.maxPageSize = 20;
                return ret;
            }
        },
        fairMandantView: {
            select: function (complete, error, restriction, options) {
                Log.call(Log.l.trace, namespaceName + ".fairMandantView.");
                ClientManagementSummarise._restriction = restriction ? restriction : null;
                var ret = AppData.call("PRC_GetFMVList", {
                    pSearchString: ClientManagementSummarise._restriction,
                    pSearchOptions: ClientManagementSummarise._FilterOption,
                    pFirstRowNum: 1,
                    pOrderAttribute: ClientManagementSummarise._orderAttribute,
                    pOrderDesc: ClientManagementSummarise._orderDesc ? 1 : 0
                }, function (json) {
                    Log.print(Log.l.info, "call PRC_GetFMVList: success!");
                    // procedure call returns complete results set, but no nextUrl- and no orderBy-support!
                    if (json &&
                        json.d &&
                        json.d.results &&
                        json.d.results.length === maxRows) {
                        json.d.__next = maxRows + 1;
                    }
                    if (typeof complete === "function") {
                        complete(json);
                    }
                }, function (errorResponse) {
                    Log.print(Log.l.error, "call PRC_GetFMVList: error");
                    if (typeof error === "function") {
                        error(errorResponse);
                    }
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function(complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".fairMandantView.");
                if (!nextUrl) {
                    if (typeof complete === "function") {
                        complete({});
                    }
                    Log.ret(Log.l.trace, "NULL param");
                    return WinJS.Promise.as();
                }
                var ret = AppData.call("PRC_GetFMVList", {
                    pSearchString: ClientManagementSummarise._restriction,
                    pSearchOptions: ClientManagementSummarise._FilterOption,
                    pFirstRowNum: nextUrl,
                    pOrderAttribute: ClientManagementSummarise._orderAttribute,
                    pOrderDesc: ClientManagementSummarise._orderDesc ? 1 : 0
                }, function (json) {
                    Log.print(Log.l.info, "call PRC_GetFMVList: success!");
                    // procedure call now returns max. 100 rows of results set!
                    if (json &&
                        json.d &&
                        json.d.results &&
                        json.d.results.length === maxRows) {
                        json.d.__next = nextUrl + maxRows;
                    }
                    if (typeof complete === "function") {
                        complete(json);
                    }
                }, function (errorResponse) {
                    Log.print(Log.l.error, "call PRC_GetFMVList: error");
                    if (typeof error === "function") {
                        error(errorResponse);
                    }
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, namespaceName + ".fairMandantView.");
                var ret = response && response.d && response.d.__next;
                Log.ret(Log.l.trace);
                return ret;
            },
            get relationName() {
                return ClientManagementSummarise._fairMandantView.relationName;
            },
            get pkName() {
                return ClientManagementSummarise._fairMandantView.relationName + "VIEWID";
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (ClientManagementSummarise.fairMandantView.pkName) {
                        ret = record[ClientManagementSummarise.fairMandantView.pkName];
                    }
                }
                return ret;
            }
        }
    });
    WinJS.Namespace.define("ClientManagementSummarise.Binding.Converter", {
        toLocalDateTimeString: WinJS.Binding.converter(function (value) {
            if (value) {
                var date = getDateObject(value);
                if (date) {
                    return  moment(date).local().format('DD.MM.YYYY HH:mm');
                } else {
                    return "";
                }
            } else {
                return "";
            }
        })
    });
})();
