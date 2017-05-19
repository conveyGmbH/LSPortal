// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Questiongroup", {
        _initFragengruppeView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITFragengruppe");
            }
        },
        initFragengruppeView: {
            clear: function() {
                Questiongroup._initFragengruppeView.clear();
            }
        },
        _CR_V_FragengruppeView: {
            get: function () {
                return AppData.getFormatView("CR_V_Fragengruppe", 0);
            }
        },
        CR_V_FragengruppeView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Questiongroup.CR_V_FragengruppeView.");
                var ret = Questiongroup._CR_V_FragengruppeView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "TITLE"
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "Questiongroup.CR_V_FragengruppeView.");
                var ret = Questiongroup._CR_V_FragengruppeView.deleteRecord(function () {
                    Questiongroup.initFragengruppeView.clear();
                    if (typeof complete === "function") {
                        complete();
                    }
                }, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "Questiongroup.CR_V_FragengruppeView.");
                var ret = Questiongroup._CR_V_FragengruppeView.update(function () {
                    Questiongroup.initFragengruppeView.clear();
                    if (typeof complete === "function") {
                        complete();
                    }
                }, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error) {
                Log.call(Log.l.trace, "Questiongroup.CR_V_FragengruppeView.");
                var ret = Questiongroup._CR_V_FragengruppeView.insert(function () {
                    Questiongroup.initFragengruppeView.clear();
                    if (typeof complete === "function") {
                        complete();
                    }
                }, error, {
                    FragengruppeID: 0
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Questiongroup.CR_V_FragengruppeView.");
                var ret = Questiongroup._CR_V_FragengruppeView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Questiongroup.CR_V_FragengruppeView.");
                var ret = Questiongroup._CR_V_FragengruppeView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


