// service for page: contactList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.min.js" />


(function () {
    "use strict";

    var namespaceName = "ContactList";

    WinJS.Namespace.define("ContactList", {
        _eventId: 0,
        _orderAttribute: "Erfassungsdatum",
        _orderDesc: true,
        _prevRestriction: "",
        _prevDocRestriction: "",
        _prevJson: null,
        _prevDocJson: null,
        _prevEventId: 0,
        _prevDocEventId: 0,
        _collator: null,
        _contactView: {
            get: function () {
                var ret = AppData.getFormatView("Kontakt", 20662);
                ret.maxPageSize = 20;
                return ret;
            }
        },
        contactView: {
            select: function (complete, error, restriction, options) {
                var ret;
                Log.call(Log.l.trace, namespaceName + ".contactView.");
                if (!ContactList._eventId) {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete({});
                        }
                    });
                } else if (restriction && typeof restriction === "number") {
                    ret = ContactList._contactView.selectById(complete, error, restriction);
                } else if (restriction && typeof restriction === "string") {
                    var mainLanguage = Application.language.split("-")[0];
                    if (!ContactList._collator) {
                        ContactList._collator = new Intl.Collator(mainLanguage, {
                            sensitivity: "base"
                        });
                    }
                    if (ContactList._prevJson &&
                        ContactList._prevRestriction === restriction &&
                        ContactList._prevEventId === ContactList._eventId) {
                        Log.print(Log.l.info, "re-use previous PRC_SearchKontaktListe results!");
                        var json = ContactList._prevJson;
                        ret = new WinJS.Promise.as().then(function () {
                            if (json && json.d && json.d.results && json.d.results.length > 0 &&
                                ContactList._orderAttribute) {
                                Log.print(Log.l.info, "call sort orderAttribute=" + ContactList._orderAttribute);
                                json.d.results.sort(ContactList.contactView.compare);
                            }
                            if (typeof complete === "function") {
                                complete(json);
                            }
                        });
                    } else {
                        Log.print(Log.l.info, "calling PRC_SearchKontaktListe...");
                        ret = AppData.call("PRC_SearchKontaktListe", {
                            pAttributeIdx: 0,
                            pVeranstaltungId: parseInt(ContactList._eventId), // Für Alle suchen 0 eintragen!
                            pSuchText: restriction
                        }, function (json) {
                            Log.print(Log.l.info, "call PRC_SearchKontaktListe: success!");
                            // procedure call returns complete results set, but no nextUrl- and no orderBy-support!
                            ContactList._prevRestriction = restriction;
                            ContactList._prevJson = json;
                            ContactList._prevEventId = ContactList._eventId;
                            // invalidate prev. doc result!
                            ContactList._prevDocJson = null;
                            if (json && json.d && json.d.results && json.d.results.length > 0 &&
                                ContactList._orderAttribute) {
                                Log.print(Log.l.info, "call sort orderAttribute=" + ContactList._orderAttribute);
                                json.d.results.sort(ContactList.contactView.compare);
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
                    }
                } else {
                    ContactList._prevRestriction = "";
                    if (!restriction) {
                        restriction = {};
                    }
                    /*if (restriction && !restriction.VeranstaltungID) {
                        restriction.VeranstaltungID = parseInt(ContactList._eventId);
                    }*/
                    restriction.VeranstaltungID = ContactList._eventId;
                    if (ContactList._orderAttribute) {
                        options = {
                        ordered: true,
                            orderAttribute: ContactList._orderAttribute,
                            desc: ContactList._orderDesc
                        }
                    }
                    Log.print(Log.l.info, "calling select _contactResultsView... restriction=" +
                        (restriction ? JSON.stringify(restriction) : ""));
                    ret = ContactList._contactView.select(complete, error, restriction, options);
                }
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".contactResultsView.");
                var ret = ContactList._contactView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".contactResultsView.");
                var ret = ContactList._contactView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function () {
                    return ContactList._contactView.relationName;
                }
            },
            pkName: {
                get: function () {
                    return ContactList._contactView.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (ContactList._contactView.oDataPkName) {
                        ret = record[ContactList._contactView.oDataPkName];
                    }
                    if (!ret && ContactList._contactView.pkName) {
                        ret = record[ContactList._contactView.pkName];
                    }
                }
                return ret;
            },
            compare: function (item1, item2) {
                var attribName = ContactList._orderAttribute;
                if (attribName) {
                    var value1 = item1[attribName] || "";
                    var value2 = item2[attribName] || "";
                    var attribSpecs = ContactList._contactView.attribSpecs;
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
                        return (ContactList._orderDesc ? (value2 - value1) : (value1 - value2));
                    } else if (attribTypeId === 5 || attribTypeId === 11) {
                        // numeric type
                        if (typeof value1 === "string") {
                            value1 = parseFloat(value1) || 0;
                        }
                        if (typeof value2 === "string") {
                            value2 = parseFloat(value1) || 0;
                        }
                        return (ContactList._orderDesc ? (value2 - value1) : (value1 - value2));
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
                        return (ContactList._orderDesc ? (value2 - value1) : (value1 - value2));
                    }
                    if (typeof value1 === "string") {
                        value1 = value1.toUpperCase();
                    }
                    if (typeof value2 === "string") {
                        value2 = value2.toUpperCase();
                    }
                    if (ContactList._collator) {
                        if (ContactList._orderDesc) {
                            return ContactList._collator.compare(value2, value1);
                        } else {
                            return ContactList._collator.compare(value1, value2);
                        }
                    } else {
                        if (value1 < value2) {
                            return (ContactList._orderDesc ? 1 : -1);
                        } else if (value1 > value2) {
                            return (ContactList._orderDesc ? -1 : 1);
                        }
                    }
                }
                return 0;
            },
            defaultRestriction: {
                Vorname: "",
                Nachname: "",
                OrderDesc: false
            }
        },
        _contactDocView: {
            get: function () {
                var ret = AppData.getFormatView("Kontakt", 20690, false);
                ret.maxPageSize = 20;
                return ret;
            }
        },
        contactDocView: {
            select: function (complete, error, restriction, options) {
                var ret;
                Log.call(Log.l.trace, namespaceName + ".contactDocView.");
                if (!ContactList._eventId) {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete({});
                        }
                    });
                } else if (restriction && typeof restriction === "string") {
                    var mainLanguage = Application.language.split("-")[0];
                    if (!ContactList._collator) {
                        ContactList._collator = new Intl.Collator(mainLanguage, {
                            sensitivity: "base"
                        });
                    }
                    if (ContactList._prevDocJson &&
                        ContactList._prevDocRestriction === restriction &&
                        ContactList._prevDocEventId === ContactList._eventId) {
                        Log.print(Log.l.info, "re-use previous PRC_SearchKontaktListDocs results!");
                        var json = ContactList._prevDocJson;
                        ret = new WinJS.Promise.as().then(function () {
                            if (json && json.d && json.d.results && json.d.results.length > 0 &&
                                ContactList._orderAttribute) {
                                Log.print(Log.l.info, "call sort orderAttribute=" + ContactList._orderAttribute);
                                json.d.results.sort(ContactList.contactView.compare);
                            }
                            if (typeof complete === "function") {
                                complete(json);
                            }
                        });
                    } else {
                        Log.print(Log.l.info, "calling PRC_SearchKontaktListDocs...");
                        ret = AppData.call("PRC_SearchKontaktListDocs", {
                            pAttributeIdx: 0,
                            pVeranstaltungId: parseInt(ContactList._eventId), // Für Alle suchen 0 eintragen!
                            pSuchText: restriction
                        }, function (json) {
                            Log.print(Log.l.info, "call PRC_SearchKontaktListDocs: success!");
                            // procedure call returns complete results set, but no nextUrl- and no orderBy-support!
                            ContactList._prevDocRestriction = restriction;
                            ContactList._prevDocJson = json;
                            ContactList._prevDocEventId = ContactList._eventId;
                            if (json && json.d && json.d.results && json.d.results.length > 0 &&
                                ContactList._orderAttribute) {
                                Log.print(Log.l.info, "call sort orderAttribute=" + ContactList._orderAttribute);
                                json.d.results.sort(ContactList.contactView.compare);
                            }
                            if (typeof complete === "function") {
                                complete(json);
                            }
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "call PRC_SearchKontaktListDocs: error");
                            if (typeof error === "function") {
                                error(errorResponse);
                            }
                        });
                    }
                } else {
                    ContactList._prevRestriction = "";
                    if (!restriction) {
                        restriction = {};
                    }
                    /*if (restriction && !restriction.VeranstaltungID) {
                        restriction.VeranstaltungID = parseInt(ContactList._eventId);
                    }*/
                    restriction.VeranstaltungID = ContactList._eventId;
                    if (ContactList._orderAttribute) {
                        options = {
                            ordered: true,
                            orderAttribute: ContactList._orderAttribute,
                            desc: ContactList._orderDesc
                        }
                    }
                    Log.print(Log.l.info, "calling select _contactResultsView... restriction=" +
                        (restriction ? JSON.stringify(restriction) : ""));
                    ret = ContactList._contactDocView.select(complete, error, restriction, options);
                }
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".contactDocView.");
                var ret = ContactList._contactDocView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".contactDocView.");
                var ret = ContactList._contactDocView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _mitarbeiterView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20453);
            }
        },
        mitarbeiterView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".mitarbeiterView.", "recordId=" + recordId);
                var ret = ContactList._mitarbeiterView.selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _eventView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung2", 0);
            }
        },
        eventView: {
            fetchNext: function(results, url, complete, error) {
                Log.call(Log.l.trace, namespaceName + ".eventView.");
                var nextJson = null;
                var ret = ContactList._eventView.selectNext(function(json) {
                        nextJson = json;
                    },
                    function(errorResponse) {
                        Log.print(Log.l.error, "error=" + AppData.getErrorMsgFromResponse(errorResponse));
                        if (typeof error === "function") {
                            error(errorResponse);
                        }
                    },
                    null,
                    url).then(function() {
                    if (nextJson && nextJson.d) {
                        results = results.concat(nextJson.d.results);
                        var nextUrl = ContactList._eventView.getNextUrl(nextJson);
                        if (nextUrl) {
                            return ContactList.eventView.fetchNext(results, nextUrl, complete, error);
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
            fetchAll: function(json, complete, error) {
                Log.call(Log.l.trace, "GenDataEmpList.eventView.", "");
                var ret;
                var nextUrl = ContactList._eventView.getNextUrl(json);
                if (nextUrl) {
                    ret = ContactList.eventView.fetchNext(json.d.results, nextUrl, complete, error);
                } else {
                    if (typeof complete === "function") {
                        complete(json);
                    }
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            },
            select: function(complete, error) {
                Log.call(Log.l.trace, "GenDataEmpList.eventView.");
                var nextJson = null;
                var ret = ContactList._eventView.select(function(json) {
                        nextJson = json;
                    },
                    error,
                    null,
                    {
                        ordered: true,
                        orderAttribute: "Name"
                    }).then(function() {
                    if (nextJson) {
                        return ContactList.eventView.fetchAll(nextJson, complete, error);
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

