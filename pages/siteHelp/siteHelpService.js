// service for page: start
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("SiteHelp", {
        _VeranstaltungView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20564);
            }
        }
        
    });
})();
