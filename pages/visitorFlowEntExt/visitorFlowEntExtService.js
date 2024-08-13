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
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "VisitorFlowEntExt.CR_V_BereichView.");
                var ret = VisitorFlowEntExt._CR_V_BereichView.select(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;

            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "VisitorFlowEntExt.CR_V_BereichView.");
                var ret = VisitorFlowEntExt._CR_V_BereichView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "VisitorFlowEntExt.CR_V_BereichView.");
                var ret = VisitorFlowEntExt._CR_V_BereichView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "VisitorFlowEntExt.CR_V_BereichView.");
                var ret = VisitorFlowEntExt._CR_V_BereichView.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "VisitorFlowEntExt.CR_V_BereichView.");
                var ret = VisitorFlowEntExt._CR_V_BereichView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "VisitorFlowEntExt.CR_V_BereichView.");
                var ret = VisitorFlowEntExt._CR_V_BereichView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: {
                get: function() {
                    return VisitorFlowEntExt._CR_V_BereichView.relationName;
                }
            },
            pkName: {
                get: function() {
                    return VisitorFlowEntExt._CR_V_BereichView.oDataPkName;
                }
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (VisitorFlowEntExt._CR_V_BereichView.oDataPkName) {
                        ret = record[VisitorFlowEntExt._CR_V_BereichView.oDataPkName];
                    }
                    if (!ret && VisitorFlowEntExt._CR_V_FragengruppeView.pkName) {
                        ret = record[VisitorFlowEntExt._CR_V_BereichView.pkName];
                    }
                }
                return ret;
            },
            defaultValue: {
                VeranstaltungID: AppData.getRecordId("Veranstaltung"),
                TITLE : null,
                Limit: null
            }
        }
    });
})();


