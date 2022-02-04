// services for page: photo
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EventBaseLink", {
        _mandantStartView:{
            get: function () {
                return AppData.getFormatView("MandantStart", 0);
            }
        },
        mandantStartView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "mandantStartView.");
                var ret = EventBaseLink._mandantStartView.select(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.eventSpeakerTable.");
                var ret = EventBaseLink._mandantStartView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                MandantStartVIEWID: 0,
                StartUrl: ""
            }
        },
        _eventStartId: null /*muss von der Liste gesetzt werden*/
    });
})();
