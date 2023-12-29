// service for page: EventSession
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "EventSession";

    WinJS.Namespace.define("EventSession", {
        _BBBSessionView: {
            get: function () {
                return AppData.getFormatView("BBBSession", 20655);
            }
        },
        _BBBSessionTable: {
            get: function () {
                return AppData.getFormatView("BBBSession", 0);
            }
        },
        BBBSessionView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".BBBSessionView.");
                var ret = EventSession._BBBSessionView.select(complete, error, restriction, {
                    ordered: true,
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".BBBSessionView.");
                var ret = EventSession._BBBSessionTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".BBBSessionView.");
                var ret = EventSession._BBBSessionView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, namespaceName + ".BBBSessionView.");
                var ret = EventSession._BBBSessionView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, namespaceName + ".BBBSessionView.");
                var ret = EventSession._BBBSessionView.map;
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Status: "",
                sessionEndBtn: false
            }
        },
        _eventId: null,
        _eventName: null
    });
})();