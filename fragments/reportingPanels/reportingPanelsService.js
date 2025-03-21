// service for page: contactResultsList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.min.js" />

(function () {
    "use strict";
    var namespaceName = "ReportingPanels";

    WinJS.Namespace.define("ReportingPanels", {
        _veranstaltungID: 0,
        _exportPDFView: {
            get: function () {
                return AppData.getFormatView("ExportPDF", 20700);
            }
        },
        exportPDFView: {
            select: function (complete, error, restriction, options) {
                Log.call(Log.l.trace, namespaceName + ".exportPDFView.");
                /**
                 *
                 * restriction = {
                        LanguageSpecID: AppData.getLanguageId()
                };
                 */
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "ReportName",
                        desc: false
                    };
                }
                var ret = ReportingPanels._exportPDFView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            get relationName() {
                return ReportingPanels._exportPDFView.relationName;
            },
            get pkName() {
                return ReportingPanels._exportPDFView.oDataPkName;
            },
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (ReportingPanels._exportPDFView.oDataPkName) {
                        ret = record[ReportingPanels._exportPDFView.oDataPkName];
                    }
                    if (!ret && ReportingPanels._exportPDFView.pkName) {
                        ret = record[ReportingPanels._exportPDFView.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();