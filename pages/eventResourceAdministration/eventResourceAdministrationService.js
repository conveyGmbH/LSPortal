// service for page: eventResourceAdministration
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    /**
     * LangMandantDokumentVIEW_20628 darauf nur select
     * LangMandantDokument_odataView darauf update
     */
    WinJS.Namespace.define("EventResourceAdministration", {
        _LGNTINITDokVerwendungView: {
            get: function() {
                return AppData.getLgntInit("LGNTINITDokVerwendung");
            }
        },
        LGNTINITDokVerwendungView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, "EventResourceAdministration.LGNTINITDokVerwendungView.");
                var ret = EventResourceAdministration._LGNTINITDokVerwendungView.select(complete, error);
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "EventResourceAdministration.LGNTINITDokVerwendungView.");
                var ret = EventResourceAdministration._LGNTINITDokVerwendungView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "EventResourceAdministration.LGNTINITDokVerwendungView.");
                var ret = EventResourceAdministration._LGNTINITDokVerwendungView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _LangMandantDokumentTable: {
            get: function () {
                return AppData.getFormatView("LangMandantDokument", 0);
            }
        },
        _LangMandantDokumentView: {
            get: function () {
                return AppData.getFormatView("LangMandantDokument", 20628);
            }
        },
        LangMandantDokumentView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "EventResourceAdministration.LangMandantDokumentView.");
                var ret = EventResourceAdministration._LangMandantDokumentView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Sortierung",
                    desc: false
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "EventResourceAdministration.LangMandantDokumentView.");
                var ret = EventResourceAdministration._LangMandantDokumentTable.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


