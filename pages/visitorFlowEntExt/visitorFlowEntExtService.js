// service for page: visitorFlowEntExt
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("VisitorFlowEntExt", {
        _CR_V_BereichView: {
            get: function () {
                return AppData.getFormatView("CR_V_Bereich", 0);
            }
        },
        CR_V_BereichView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "visitorFlowEntExtView.");
                var ret = VisitorFlowEntExt._CR_V_BereichView.select(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "visitorFlowEntExtView.");
                var ret = VisitorFlowEntExt._CR_V_BereichView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "visitorFlowEntExtView.");
                var ret = VisitorFlowEntExt._CR_V_BereichView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "visitorFlowEntExtView.");
                var ret = VisitorFlowEntExt._CR_V_BereichView.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                VeranstaltungID: AppData.getRecordId("Veranstaltung"),
                TITLE : null,
                Eingang : null,
                Ausgang : null
            }
        }
    });
})();


