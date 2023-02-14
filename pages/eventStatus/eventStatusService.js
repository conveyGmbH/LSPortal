// services for page: photo
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EventStatus", {
        _veranstaltungView:{
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20620);
            }
        },
        veranstaltungView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = EventStatus._veranstaltungView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                VeranstaltungVIEWID: 0,
                Name: ""
            }
        },
        _sessionEventId: null, /*muss von der Liste gesetzt werden*/

        _BBBSessionODataView: {
            get: function () {
                return AppData.getFormatView("BBBSession", 0);
            }
        },
        BBBSessionODataView: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "employeeView.");
                var ret = EventStatus._BBBSessionODataView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                DontShow: null
            }
        }
    });
})();
