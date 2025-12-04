// service for page: contactResultsList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.min.js" />

(function () {
    "use strict";
    var namespaceName = "ClientManagementEvents";

    WinJS.Namespace.define("ClientManagementEvents", {
        _fairMandantId: 0,
        _orderAttribute: "Name",
        _orderDesc: true,
        _prevRestriction: "",
        _prevJson: null,
        _collator: null,
        _FilterOption: "ALL",
        _Filter: 0,
        Filter: {
            get: function () {
                return ClientManagementEvents._Filter;
            },
            set: function (value) {
                ClientManagementEvents._Filter = value;
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
                var ret;
                Log.call(Log.l.trace, namespaceName + ".fairMandantView.");
                if (restriction && typeof restriction === "string") {
                    var mainLanguage = Application.language.split("-")[0];
                    if (!ClientManagementEvents._collator) {
                        ClientManagementEvents._collator = new Intl.Collator(mainLanguage, {
                            sensitivity: "base"
                        });
                    }
                    if (ClientManagementEvents._prevJson &&
                        ClientManagementEvents._prevRestriction === restriction) {
                        Log.print(Log.l.info, "re-use previous PRC_GetFMVList results!");
                        var json = ClientManagementEvents._prevJson;
                        ret = new WinJS.Promise.as().then(function () {
                            if (json && json.d && json.d.results && json.d.results.length > 0 &&
                                ClientManagementEvents._orderAttribute) {
                                Log.print(Log.l.info, "call sort orderAttribute=" + ClientManagementEvents._orderAttribute);
                                json.d.results.sort(ClientManagementEvents.fairMandantView.compare);
                            }
                            if (typeof complete === "function") {
                                complete(json);
                            }
                        });
                    } else {
                        Log.print(Log.l.info, "calling PRC_GetFMVList...");
                        ret = AppData.call("PRC_GetFMVList", {
                            pSearchString: restriction,
                            pSearchOptions: ClientManagementEvents._FilterOption
                        }, function (json) {
                            Log.print(Log.l.info, "call PRC_GetFMVList: success!");
                            // procedure call returns complete results set, but no nextUrl- and no orderBy-support!
                            ClientManagementEvents._prevRestriction = restriction;
                            ClientManagementEvents._prevJson = json;
                            if (json && json.d && json.d.results && json.d.results.length > 0 &&
                                ClientManagementEvents._orderAttribute) {
                                Log.print(Log.l.info, "call sort orderAttribute=" + ClientManagementEvents._orderAttribute);
                                json.d.results.sort(ClientManagementEvents.fairMandantView.compare);
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
                    }
                } else {
                    ClientManagementEvents._prevRestriction = "";
                    if (!restriction) {
                        restriction = {};
                    }
                    if (ClientManagementEvents._orderAttribute) {
                        options = {
                            ordered: true,
                            orderAttribute: ClientManagementEvents._orderAttribute,
                            desc: ClientManagementEvents._orderDesc
                        }
                    }
                    Log.print(Log.l.info, "calling select _fairMandantView... restriction=" +
                        (restriction ? JSON.stringify(restriction) : ""));
                    ret = ClientManagementEvents._fairMandantView.select(complete, error, restriction, options);
                }
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function(complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".fairMandantView.");
                var ret = ClientManagementEvents._fairMandantView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, namespaceName + ".fairMandantView.");
                var ret = ClientManagementEvents._fairMandantView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            get relationName() {
                return ClientManagementEvents._fairMandantView.relationName;
            },
            get pkName() {
                return ClientManagementEvents._fairMandantView.oDataPkName;
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (ClientManagementEvents._fairMandantView.oDataPkName) {
                        ret = record[ClientManagementEvents._fairMandantView.oDataPkName];
                    }
                    if (!ret && ClientManagementEvents._fairMandantView.pkName) {
                        ret = record[ClientManagementEvents._fairMandantView.pkName];
                    }
                }
                return ret;
            },
            compare: function (item1, item2) {
                var attribName = ClientManagementEvents._orderAttribute;
                if (attribName) {
                    var value1 = item1[attribName] || "";
                    var value2 = item2[attribName] || "";
                    var attribSpecs = ClientManagementEvents._fairMandantView.attribSpecs;
                    var attribSpec = attribSpecs &&
                        attribSpecs.filter(function(item) {
                            return (item.ODataAttributeName === attribName);
                        })[0];
                    var attribTypeId = attribSpec && attribSpec.AttribTypeID;
                    if (attribTypeId === 1 || attribTypeId === 2 || attribTypeId === 4 || attribTypeId === 10) {
                        // integer type
                        if (typeof value1 === "string") {
                            value1 = parseInt(value1) || 0;
                        }
                        if (typeof value2 === "string") {
                            value2 = parseInt(value1) || 0;
                        }
                        return (ClientManagementEvents._orderDesc ? (value2 - value1) : (value1 - value2));
                    } else if (attribTypeId === 5 || attribTypeId === 11) {
                        // numeric type
                        if (typeof value1 === "string") {
                            value1 = parseFloat(value1) || 0;
                        }
                        if (typeof value2 === "string") {
                            value2 = parseFloat(value1) || 0;
                        }
                        return (ClientManagementEvents._orderDesc ? (value2 - value1) : (value1 - value2));
                    } else if (attribTypeId === 6 || attribTypeId === 7 || attribTypeId === 8) {
                        // timestamp type
                        if (value1) {
                            var date1 = getDateObject(value1);
                            value1 = date1 && date1.getTime();
                        } else {
                            value1 = 0;
                        }
                        if (value2) {
                            var date2 = getDateObject(value2);
                            value2 = date2 && date2.getTime();
                        } else {
                            value2 = 0;
                        }
                        return (ClientManagementEvents._orderDesc ? (value2 - value1) : (value1 - value2));
                    } 
                    if (typeof value1 === "string") {
                        value1 = value1.toUpperCase();
                    }
                    if (typeof value2 === "string") {
                        value2 = value2.toUpperCase();
                    }
                    if (ClientManagementEvents._collator) {
                        if (ClientManagementEvents._orderDesc) {
                            return ClientManagementEvents._collator.compare(value2, value1);
                        } else {
                            return ClientManagementEvents._collator.compare(value1, value2);
                        }
                    } else {
                        if (value1 < value2) {
                            return (ClientManagementEvents._orderDesc ? 1 : -1);
                        } else if (value1 > value2) {
                            return (ClientManagementEvents._orderDesc ? -1 : 1);
                        }
                    }
                }
                return 0;
            }
        }
    });
    WinJS.Namespace.define("ClientManagementEvents.Binding.Converter", {
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
