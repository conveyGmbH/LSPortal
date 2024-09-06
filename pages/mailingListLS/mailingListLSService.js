// service for page: mailingList
    /// <reference path="~/www/lib/convey/scripts/strings.js" />
    /// <reference path="~/www/lib/convey/scripts/logging.js" />
    /// <reference path="~/www/lib/convey/scripts/dataService.js" />

    (function () {
        "use strict";

        var namespaceName = "MailingListLS";

        WinJS.Namespace.define("MailingListLS", {
            _eventId: 0,
            _orderAttribute: "Subject",
            _orderDesc: true,
            _prevRestriction: "",
            _prevJson: null,
            _collator: null,
            _MaildokumentView: {
                get: function () {
                    var ret = AppData.getFormatView("Maildokument", 20527);
                    ret.maxPageSize = 20;
                    return ret;
                }
            },
            MaildokumentView: {
                select: function (complete, error, restriction, options) {
                    var ret;
                    Log.call(Log.l.trace, namespaceName + ".contactView.");
                    if (!MailingListLS._eventId) {
                        ret = new WinJS.Promise.as().then(function () {
                            if (typeof complete === "function") {
                                complete({});
                            }
                        });
                    } else if (restriction && typeof restriction === "string") {
                        var mainLanguage = Application.language.split("-")[0];
                        if (!MailingListLS._collator) {
                            MailingListLS._collator = new Intl.Collator(mainLanguage, {
                                sensitivity: "base"
                            });
                        }
                        if (MailingListLS._prevJson &&
                            MailingListLS._prevRestriction === restriction) {
                            Log.print(Log.l.info, "re-use previous PRC_SearchKontaktListe results!");
                            var json = MailingListLS._prevJson;
                            ret = new WinJS.Promise.as().then(function () {
                                if (json && json.d && json.d.results && json.d.results.length > 0 &&
                                    MailingListLS._orderAttribute) {
                                    Log.print(Log.l.info, "call sort orderAttribute=" + MailingListLS._orderAttribute);
                                    json.d.results.sort(MailingListLS._MaildokumentView.compare);
                                }
                                if (typeof complete === "function") {
                                    complete(json);
                                }
                            });
                        } else {
                           /**
                            Log.print(Log.l.info, "calling PRC_SearchKontaktListe...");
                            ret = AppData.call("PRC_SearchKontaktListe", {
                                pAttributeIdx: 0,
                                pVeranstaltungId: MailingListLS._eventId, // Für Alle suchen 0 eintragen!
                                pSuchText: restriction
                            }, function (json) {
                                Log.print(Log.l.info, "call PRC_SearchKontaktListe: success!");
                                // procedure call returns complete results set, but no nextUrl- and no orderBy-support!
                                MailingListLS._prevRestriction = restriction;
                                MailingListLS._prevJson = json;
                                if (json && json.d && json.d.results && json.d.results.length > 0 &&
                                    MailingListLS._orderAttribute) {
                                    Log.print(Log.l.info, "call sort orderAttribute=" + MailingListLS._orderAttribute);
                                    json.d.results.sort(MailingListLS._MaildokumentView.compare);
                                }
                                if (typeof complete === "function") {
                                    complete(json);
                                }
                            }, function (errorResponse) {
                                Log.print(Log.l.error, "call PRC_SearchKontaktListe: error");
                                if (typeof error === "function") {
                                    error(errorResponse);
                                }
                            });
                            */ 
                        }
                    } else {
                        MailingListLS._prevRestriction = "";
                        if (!restriction) {
                            restriction = {};
                        }
                        restriction.VeranstaltungID = MailingListLS._eventId;
                        if (MailingListLS._orderAttribute) {
                            options = {
                                ordered: true,
                                orderAttribute: MailingListLS._orderAttribute,
                                desc: MailingListLS._orderDesc
                            }
                        }
                        Log.print(Log.l.info, "calling select _contactResultsView... restriction=" +
                            (restriction ? JSON.stringify(restriction) : ""));
                        ret = MailingListLS._MaildokumentView.select(complete, error, restriction, options);
                    }
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                selectNext: function (complete, error, response, nextUrl) {
                    Log.call(Log.l.trace, namespaceName + ".contactResultsView.");
                    var ret = MailingListLS._MaildokumentView.selectNext(complete, error, response, nextUrl);
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                getNextUrl: function (response) {
                    Log.call(Log.l.trace, namespaceName + ".contactResultsView.");
                    var ret = MailingListLS._MaildokumentView.getNextUrl(response);
                    Log.ret(Log.l.trace);
                    return ret;
                },
                get relationName() {
                        return MailingListLS._MaildokumentView.relationName;
                },
                get pkName() {
                        return MailingListLS._MaildokumentView.oDataPkName;
                },
                getRecordId: function (record) {
                    var ret = null;
                    if (record) {
                        if (MailingListLS._MaildokumentView.oDataPkName) {
                            ret = record[MailingListLS._MaildokumentView.oDataPkName];
                        }
                        if (!ret && MailingListLS._MaildokumentView.pkName) {
                            ret = record[MailingListLS._MaildokumentView.pkName];
                        }
                    }
                    return ret;
                },
                compare: function (item1, item2) {
                    var attribName = MailingListLS._orderAttribute;
                    if (attribName) {
                        var value1 = item1[attribName] || "";
                        var value2 = item2[attribName] || "";
                        var attribSpecs = MailingListLS._MaildokumentView.attribSpecs;
                        var attribSpec = attribSpecs &&
                            attribSpecs.filter(function (item) {
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
                            return (MailingListLS._orderDesc ? (value2 - value1) : (value1 - value2));
                        } else if (attribTypeId === 5 || attribTypeId === 11) {
                            // numeric type
                            if (typeof value1 === "string") {
                                value1 = parseFloat(value1) || 0;
                            }
                            if (typeof value2 === "string") {
                                value2 = parseFloat(value1) || 0;
                            }
                            return (MailingListLS._orderDesc ? (value2 - value1) : (value1 - value2));
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
                            return (MailingListLS._orderDesc ? (value2 - value1) : (value1 - value2));
                        }
                        if (typeof value1 === "string") {
                            value1 = value1.toUpperCase();
                        }
                        if (typeof value2 === "string") {
                            value2 = value2.toUpperCase();
                        }
                        if (MailingListLS._collator) {
                            if (MailingListLS._orderDesc) {
                                return MailingListLS._collator.compare(value2, value1);
                            } else {
                                return MailingListLS._collator.compare(value1, value2);
                            }
                        } else {
                            if (value1 < value2) {
                                return (MailingListLS._orderDesc ? 1 : -1);
                            } else if (value1 > value2) {
                                return (MailingListLS._orderDesc ? -1 : 1);
                            }
                        }
                    }
                    return 0;
                },
                defaultRestriction: {
                    MaildokumentVIEWID: 0,
                    Beschreibung: "",
                    Subject: "",
                    OrderDesc: false
                }
            },
            _eventView: {
                get: function () {
                    return AppData.getFormatView("Veranstaltung2", 0);
                }
            },
            eventView: {
                fetchNext: function (results, url, complete, error) {
                    Log.call(Log.l.trace, "GenDataEmpList.eventView.", "url=" + url);
                    var nextJson = null;
                    var ret = MailingListLS._eventView.selectNext(function (json) {
                        nextJson = json;
                    },
                        function (errorResponse) {
                            Log.print(Log.l.error, "error=" + AppData.getErrorMsgFromResponse(errorResponse));
                            if (typeof error === "function") {
                                error(errorResponse);
                            }
                        },
                        null,
                        url).then(function () {
                            if (nextJson && nextJson.d) {
                                results = results.concat(nextJson.d.results);
                                var nextUrl = MailingListLS._eventView.getNextUrl(nextJson);
                                if (nextUrl) {
                                    return MailingListLS.eventView.fetchNext(results, nextUrl, complete, error);
                                } else {
                                    nextJson.d.results = results;
                                    if (typeof complete === "function") {
                                        complete(nextJson);
                                    }
                                    return WinJS.Promise.as();
                                }
                            } else {
                                if (typeof complete === "function") {
                                    complete(nextJson || {});
                                }
                                return WinJS.Promise.as();
                            }
                        });
                    Log.ret(Log.l.trace);
                    return ret;
                },
                fetchAll: function (json, complete, error) {
                    Log.call(Log.l.trace, "GenDataEmpList.eventView.", "");
                    var ret;
                    var nextUrl = MailingListLS._eventView.getNextUrl(json);
                    if (nextUrl) {
                        ret = MailingListLS.eventView.fetchNext(json.d.results, nextUrl, complete, error);
                    } else {
                        if (typeof complete === "function") {
                            complete(json);
                        }
                        ret = WinJS.Promise.as();
                    }
                    Log.ret(Log.l.trace);
                    return ret;
                },
                select: function (complete, error) {
                    Log.call(Log.l.trace, "GenDataEmpList.eventView.");
                    var nextJson = null;
                    var ret = MailingListLS._eventView.select(function (json) {
                        nextJson = json;
                    },
                        error,
                        null,
                        {
                            ordered: true,
                            orderAttribute: "Name"
                        }).then(function () {
                            if (nextJson) {
                                return MailingListLS.eventView.fetchAll(nextJson, complete, error);
                            } else {
                                if (typeof complete === "function") {
                                    complete({});
                                }
                                return WinJS.Promise.as();
                            }
                        });
                    Log.ret(Log.l.trace);
                    return ret;
                },
                defaultValue: {
                    Name: ""
                }
            }
        });
    })();
