// service for page: search
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Search", {
        _contactView: {
            get: function () {
                return AppData.getFormatView("Kontakt", 20432, false);
            }
        },
        contactView: {
            select: function (complete, error, restrictions) {
                Log.call(Log.l.trace, "contactView.");
                var ret = Search._contactView.get(complete, error, restrictions);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                MitarbeiterID: 0,
                KontaktVIEWID: "",
                CreatorSiteID: "",
                CreatorRecID: "",
                Firmenname: "",
                Vorname: "",
                Name: "",
                Email: "",
                Strasse: "",
                PLZ: "",
                Stadt: "",
                INITLandID: 0,
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
                    orderAttribute: "Login"
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
                MitarbeiterVIEWID: "",
                Vorname: "",
                Nachname: "",
                fullName: ""
            }
        }
    });
})();
