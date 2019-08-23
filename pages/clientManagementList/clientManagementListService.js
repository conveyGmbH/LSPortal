// service for page: clientmanagementList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("ClientManagementList", {
        _fairMandantView: {
            get: function () {
                return AppData.getFormatView("FairMandant", 20582);
            }
        },
        fairMandantView: {
            select: function (complete, error, restriction, recordId) {
                Log.call(Log.l.trace, "ClientManagementList.");
                var ret;
                if (recordId) {
                    ret = ClientManagementList._fairMandantView.selectById(complete, error, recordId);
                } else {
                    ret = ClientManagementList._fairMandantView.select(complete, error, restriction, {
                        ordered: true,
                        orderAttribute: "Name",
                        asc: true
                    });
                }

                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "ClientManagementList.");
                var ret = ClientManagementList._fairMandantView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "ClientManagementList.");
                var ret = ClientManagementList._fairMandantView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultRestriction: {
                Name: "",
                Ansprechpartner: "",
                EMail: ""
            }
        },
    });
})();
