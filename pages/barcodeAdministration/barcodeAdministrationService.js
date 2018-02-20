﻿// service for page: mailing
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("BarcodeAdministration", {
        _fragebogenZeileBCView: {
            get: function() {
                return AppData.getFormatView("NCHRFragenAntworten", 20525, false); //Ändern in Fragebogenzeilebcview
            }
        },
        fragebogenZeileBCView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "eventView.");
                var ret = BarcodeAdministration._fragebogenZeileBCView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Sortierung"
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Antwort01: "",
                Antwort02: "",
                Antwort03: "",
                Antwort04: "",
                Antwort05: "",
                Antwort06: "",
                Antwort07: "",
                Antwort08: "",
                Antwort09: ""
            }
        }
    });
})();