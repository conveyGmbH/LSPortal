// service for page: contactResultsList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.min.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("ContactResultsList", {
        _eventId: 0,
        _orderAttribute: "Erfassungsdatum",
        _orderDesc: true,
        _prevRestriction: "",
        _prevJson: null,
        _collator: null,
        _contactResultsView: {
            get: function () {
                var ret = AppData.getFormatView("Kontakt", 20662);
                //ret.maxPageSize = 20;
                return ret;
            }
        }
    });
    WinJS.Namespace.define("ContactResultsList", {
        contactResultsView: {
            select: function (complete, error, restriction, options) {
                var ret;
                Log.call(Log.l.trace, "ContactResultsList.");
                if (restriction && typeof restriction === "string") {
                    var mainLanguage = Application.language.split("-")[0];
                    if (!ContactResultsList._collator) {
                        ContactResultsList._collator = new Intl.Collator(mainLanguage, {
                            sensitivity: "base"
                        });
                    }
                    if (ContactResultsList._prevJson &&
                        ContactResultsList._prevRestriction === restriction) {
                        Log.print(Log.l.info, "re-use previous PRC_SearchKontaktListe results!");
                        var json = ContactResultsList._prevJson;
                        ret = new WinJS.Promise.as().then(function () {
                            if (json && json.d && json.d.results && json.d.results.length > 0 &&
                                ContactResultsList._orderAttribute) {
                                Log.print(Log.l.info, "call sort orderAttribute=" + ContactResultsList._orderAttribute);
                                json.d.results.sort(ContactResultsList.contactResultsView.compare);
                            }
                            if (typeof complete === "function") {
                                complete(json);
                            }
                        });
                    } else {
                        ret = AppData.call("PRC_SearchKontaktListe", {
                            pAttributeIdx: 0,
                            pVeranstaltungId: ContactResultsList._eventId, // Für Alle suchen 0 eintragen!
                            pSuchText: restriction
                        }, function (json) {
                            Log.print(Log.l.info, "call PRC_SearchKontaktListe success!");
                            // procedure call returns complete results set, but no nextUrl- and no orderBy-support!
                            ContactResultsList._prevRestriction = restriction;
                            ContactResultsList._prevJson = json;
                            if (json && json.d && json.d.results && json.d.results.length > 0 &&
                                ContactResultsList._orderAttribute) {
                                Log.print(Log.l.info, "call sort orderAttribute=" + ContactResultsList._orderAttribute);
                                json.d.results.sort(ContactResultsList.contactResultsView.compare);
                            }
                            if (typeof complete === "function") {
                                complete(json);
                            }
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "call error");
                            if (typeof error === "function") {
                                error(errorResponse);
                            }
                        });
                    }
                } else {
                    ContactResultsList._prevRestriction = "";
                    if (ContactResultsList._eventId) {
                        if (!restriction) {
                            restriction = {};
                        }
                        restriction.VeranstaltungID = ContactResultsList._eventId;
                    }
                    if (ContactResultsList._orderAttribute) {
                        options = {
                            ordered: true,
                            orderAttribute: ContactResultsList._orderAttribute,
                            desc: ContactResultsList._orderDesc
                        }
                    }
                    ret = ContactResultsList._contactResultsView.select(complete, error, restriction, options);
                }
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function(complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "ContactResultsList.");
                var ret = ContactResultsList._contactResultsView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function(response) {
                Log.call(Log.l.trace, "ContactResultsList.");
                var ret = ContactResultsList._contactResultsView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: ContactResultsList._contactResultsView.relationName,
            pkName: ContactResultsList._contactResultsView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (ContactResultsList._contactResultsView.oDataPkName) {
                        ret = record[ContactResultsList._contactResultsView.oDataPkName];
                    }
                    if (!ret && ContactResultsList._contactResultsView.pkName) {
                        ret = record[ContactResultsList._contactResultsView.pkName];
                    }
                }
                return ret;
            },
            compare: function (item1, item2) {
                var attribName = ContactResultsList._orderAttribute;
                if (attribName) {
                    var value1 = item1[attribName] || "";
                    var value2 = item2[attribName] || "";
                    var attribSpecs = ContactResultsList._contactResultsView.attribSpecs;
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
                        return (ContactResultsList._orderDesc ? (value2 - value1) : (value1 - value2));
                    } else if (attribTypeId === 5 || attribTypeId === 11) {
                        // numeric type
                        if (typeof value1 === "string") {
                            value1 = parseFloat(value1) || 0;
                        }
                        if (typeof value2 === "string") {
                            value2 = parseFloat(value1) || 0;
                        }
                        return (ContactResultsList._orderDesc ? (value2 - value1) : (value1 - value2));
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
                        return (ContactResultsList._orderDesc ? (value2 - value1) : (value1 - value2));
                    } 
                    if (typeof value1 === "string") {
                        value1 = value1.toUpperCase();
                    }
                    if (typeof value2 === "string") {
                        value2 = value2.toUpperCase();
                    }
                    if (ContactResultsList._collator) {
                        if (ContactResultsList._orderDesc) {
                            return ContactResultsList._collator.compare(value2, value1);
                        } else {
                            return ContactResultsList._collator.compare(value1, value2);
                        }
                    } else {
                        if (value1 < value2) {
                            return (ContactResultsList._orderDesc ? 1 : -1);
                        } else if (value1 > value2) {
                            return (ContactResultsList._orderDesc ? -1 : 1);
                        }
                    }
                }
                return 0;
            }
        }
    });
    WinJS.Namespace.define("ContactResultsList.Binding.Converter", {
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
        }),
        toStatusColor: WinJS.Binding.converter(function(value) {
            if  (value === getResourceText("contactResultsCriteria.incomplete")) {
                return "red";
            }
            if (value === getResourceText("contactResultsCriteria.partialcomplete")) {
                return "orange";
            }
            return "green";
        })
    });
})();
