// service for page: EventSession
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EventSession", {
        _BBBSessionView: {
            get: function () {
                return AppData.getFormatView("BBBSession", 20655);
            }
        },
        _BBBSessionODataView: {
            get: function () {
                return AppData.getFormatView("BBBSession", 0);
            }
        },
        BBBSessionODataView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "VoucherAdministrationList.");
                var ret = EventSession._BBBSessionView.select(complete, error, restriction, {
                    ordered: true,
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = EventSession._BBBSessionODataView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "VoucherAdministrationList.VeranstaltunganlageView.");
                var ret = EventSession._BBBSessionView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "VoucherAdministrationList.VeranstaltunganlageView.");
                var ret = EventSession._BBBSessionView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "VoucherAdministrationList.VeranstaltunganlageView.");
                var ret = EventSession._BBBSessionView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _eventId: null,
        _eventName: null
    });
})();