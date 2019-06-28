// service for page: siteEvents
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("SiteEvents", {
        _VeranstaltungView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20564);
            }
        },
        VeranstaltungView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._VeranstaltungView.select(complete,
                    error, restriction,
                    {
                        ordered: true,
                        orderAttribute: "Firmenname"
                    });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._VeranstaltungView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._VeranstaltungView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Firmenname: null,
                StandHall: null,
                StandNo: null,
                Adminuser: null,
                OrderedApp: null,
                DeviceNotLicensed: null,
                DeviceLicensed: null,
                LULUsers: null
            }
        },
        defaultRestriction: {
            Name: null,
            bAndInEachRow: true,
            bUseOr: false
        },
        _registrationView: {
            get: function () {
                var ret = AppData.getFormatView("Mitarbeiter_Anschrift", 20524, false);
                return ret;
            }
        },
        registrationView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._registrationView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Mitarbeiter_AnschriftVIEWID",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._registrationView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._registrationView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return SiteEvents._registrationView;
            }
        },
        _OIMPImportJobView: {
            get: function () {
                var ret = AppData.getFormatView("OIMPImportJob", 20580, false);
                return ret;
            }
        },
        OIMPImportJobView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._OIMPImportJobView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "OIMPImportJobVIEWID",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._OIMPImportJobView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._OIMPImportJobView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return SiteEvents._OIMPImportJobView;
            }
        }
    });
})();