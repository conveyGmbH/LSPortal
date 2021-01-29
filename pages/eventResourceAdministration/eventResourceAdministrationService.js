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
                Log.call(Log.l.trace, "appInfoSpecView.");
                var ret = EventResourceAdministration._LGNTINITDokVerwendungView.select(complete, error);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _LangMandantDokumentVIEW: {
            get: function () {
                return AppData.getLgntInit("LangMandantDokument");
            }
        },
        _LangMandantDokumentVIEWFormat: {
            get: function () {
                return AppData.getFormatView("LangMandantDokument", 20628);
            }
        },
        LangMandantDokumentVIEW: {
            select: function (complete, error) {
                Log.call(Log.l.trace, "appInfoSpecView.");
                var ret = EventResourceAdministration._LangMandantDokumentVIEW.select(complete, error);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "contactView.");
                var ret = EventResourceAdministration._LangMandantDokumentVIEW.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        LangMandantDokumentVIEWFormat: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "appInfoSpecView.");
                var ret = EventResourceAdministration._LangMandantDokumentVIEWFormat.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Sortierung",
                    desc: false
                });
                Log.ret(Log.l.trace);
                return ret;
            }
        }

    });
})();


