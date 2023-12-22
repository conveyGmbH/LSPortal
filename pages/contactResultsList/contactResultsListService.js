// service for page: contactResultsList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.min.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("ContactResultsList", {
        _eventId: 0,
        _orderAttribute: null,
        _orderDesc: false,
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
                    ret = AppData.call("PRC_SearchKontaktListe", {
                        pAttributeIdx: 0,
                        pVeranstaltungId: ContactResultsList._eventId, // Für Alle suchen 0 eintragen!
                        pSuchText: restriction
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        if (typeof complete === "function") {
                            complete(json);
                        }
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "call error");
                        if (typeof error === "function") {
                            error(errorResponse);
                        }
                    });
                } else {
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
