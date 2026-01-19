// service for page: contactResultsList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.min.js" />

(function () {
    "use strict";
    var namespaceName = "ClientManagementSearchList";
    var maxRows = 100;

    WinJS.Namespace.define(namespaceName, {
        _eventId: 0,
        _restriction: null,
        _orderAttribute: "Name",
        _orderDesc: 0,
        _FilterOption: "ALL",
        _Filter: 0,
        Filter: {
            get: function () {
                var filter = ClientManagementSearchList._Filter;
                if (typeof ClientManagementSearchList._Filter === "string") {
                    filter = parseInt(ClientManagementSearchList._Filter);
                }
                return filter;
            },
            set: function (value) {
                ClientManagementSearchList._Filter = value;
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
                var ret = AppData.getFormatView("FairMandant", 20692);
                //ret.maxPageSize = 20;
                return ret;
            }
        },
        fairMandantView: {
            select: function (complete, error, restriction, options) {
                Log.call(Log.l.trace, namespaceName + ".fairMandantView.");
                ClientManagementSearchList._restriction = restriction ? restriction : null;
                var ret = AppData.call("PRC_GetMandantList", {
                    pSearchString: ClientManagementSearchList._restriction,
                    pSearchOptions: ClientManagementSearchList._FilterOption,
                    pFirstRowNum: 1,
                    pOrderAttribute: ClientManagementSearchList._orderAttribute,
                    pOrderDesc: ClientManagementSearchList._orderDesc ? 1 : 0
                }, function (json) {
                    Log.print(Log.l.info, "call PRC_GetMandantList: success!");
                    // procedure call now returns max. 100 rows of results set!
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
                    Log.print(Log.l.error, "call PRC_GetMandantList: error");
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
                var ret = AppData.call("PRC_GetMandantList", {
                    pSearchString: ClientManagementSearchList._restriction,
                    pSearchOptions: ClientManagementSearchList._FilterOption,
                    pFirstRowNum: nextUrl,
                    pOrderAttribute: ClientManagementSearchList._orderAttribute,
                    pOrderDesc: ClientManagementSearchList._orderDesc ? 1 : 0
                }, function (json) {
                    Log.print(Log.l.info, "call PRC_GetMandantList: success!");
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
                    Log.print(Log.l.error, "call PRC_GetMandantList: error");
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
                Log.ret(Log.l.trace, ret);
                return ret;
            },
            get relationName() {
                return ClientManagementSearchList._fairMandantView.relationName;
            },
            get pkName() {
                return ClientManagementSearchList._fairMandantView.relationName + "VIEWID";
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (ClientManagementSearchList.fairMandantView.pkName) {
                        ret = record[ClientManagementSearchList.fairMandantView.pkName];
                    }
                }
                return ret;
            }
        }
    });
    WinJS.Namespace.define("ClientManagementSearchList.Binding.Converter", {
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
