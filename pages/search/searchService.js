// service for page: search
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Search", {
        _contactView: {
            get: function() {
                return AppData.getFormatView("Kontakt", 20432, false);
            }
        },
        contactView: {
            select: function(complete, error, restrictions) {
                Log.call(Log.l.trace, "contactView.");
                var ret = Search._contactView.get(complete, error, restrictions);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                MitarbeiterID: "",
                KontaktVIEWID: "",
                CreatorSiteID: "",
                CreatorRecID: "",
                Firmenname: "",
                Position: "",
                Branche: "",
                Vorname: "",
                Name: "",
                AbteilungText: "",
                EMail: "",
                Strasse: "",
                PLZ: "",
                Stadt: "",
                INITLandID: "",
                VeranstaltungID: null, //Suche nach VeranstaltungID
                useErfassungsdatum: false,
                usemodifiedTS: false,
                Erfassungsart: 0,
                Bearbeitet: 0
            }
        },
        _Erfassungsart: 0,
        Erfassungsart: {
            get: function () {
                return Search._Erfassungsart;
            },
            set: function (value) {
                Search._Erfassungsart = value;
            }
        },
        Erfassungsart0: {
            get: function () {
                return this.Erfassungsart === 0;
            },
            set: function (checked) {
                if (checked) {
                    this.Erfassungsart = 0;
                }
            }
        },
        Erfassungsart1: {
            get: function () {
                return this.Erfassungsart === 1;
            },
            set: function (checked) {
                if (checked) {
                    this.Erfassungsart = 1;
                }
            }
        },
        Erfassungsart2: {
            get: function () {
                return this.Erfassungsart === 2;
            },
            set: function (checked) {
                if (checked) {
                    this.Erfassungsart = 2;
                }
            }
        },
        _Bearbeitet: 0,
        Bearbeitet: {
            get: function () {
                return Search._Bearbeitet;
            },
            set: function (value) {
                Search._Bearbeitet = value;
            }
        },
        Bearbeitet0: {
            get: function () {
                return this.Erfassungsart === 0;
            },
            set: function (checked) {
                if (checked) {
                    this.Erfassungsart = 0;
                }
            }
        },
        Bearbeitet1: {
            get: function () {
                return this.Erfassungsart === 1;
            },
            set: function (checked) {
                if (checked) {
                    this.Erfassungsart = 1;
                }
            }
        },
        Bearbeitet2: {
            get: function () {
                return this.Erfassungsart === 2;
            },
            set: function (checked) {
                if (checked) {
                    this.Erfassungsart = 2;
                }
            }
        },
        _employeeView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20495, false);
            }
        },
        employeeView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Search.");
                var ret = Search._employeeView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Nachname"
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Search.");
                var ret = Search._employeeView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Search.");
                var ret = Search._employeeView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                index: 0,
                MitarbeiterVIEWID: "",
                Vorname: "",
                Nachname: "",
                Login: "",
                fullName: ""
            }
        },
        _eventView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung2", 0);
            }
        },
        eventView: {
            fetchNext: function (results, url, complete, error) {
                Log.call(Log.l.trace, "Search.eventView.");
                var nextJson = null;
                var ret = Search._eventView.selectNext(function (json) {
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
                            var nextUrl = Search._eventView.getNextUrl(nextJson);
                            if (nextUrl) {
                                return Search.eventView.fetchNext(results, nextUrl, complete, error);
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
                var nextUrl = Search._eventView.getNextUrl(json);
                if (nextUrl) {
                    ret = Search.eventView.fetchNext(json.d.results, nextUrl, complete, error);
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
                Log.call(Log.l.trace, "Search.eventView.");
                var nextJson = null;
                var ret = Search._eventView.select(function (json) {
                    nextJson = json;
                },
                    error,
                    null,
                    {
                        ordered: true,
                        orderAttribute: "Name"
                    }).then(function () {
                        if (nextJson) {
                            return Search.eventView.fetchAll(nextJson, complete, error);
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
