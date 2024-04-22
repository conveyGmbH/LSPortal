// service for page: startContacts
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "StartContacts";

    WinJS.Namespace.define("StartContacts", {
        _veranstaltungView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20683);
            }
        },
        veranstaltungView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".veranstaltungView.");
                var ret = StartContacts._veranstaltungView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                AnzKontakte: 0
            }
        }
    });
})();
