// service for page: localEvents
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("PDFExport", {

        _pdfExportView: {
            get: function () {
                return AppData.getFormatView("LGNTINITExportField", 0);
            }
        },
        _pdfExportTable: {
            get: function () {
                return AppData.getFormatView("LGNTINITExportField", 0);
            }
        },
        pdfExportView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "PDFExport.");
                var ret = PDFExport._pdfExportView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, restriction) {
                Log.call(Log.l.trace, "PDFExport.");
                var ret = PDFExport._pdfExportTable.insert(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
               
            }
        },
        _pdfExportParamsView: {
            get: function () {
                return AppData.getFormatView("PDFExportParam", 20545);
            }
        },
        pdfExportParamsView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "PDFExport.");
                var ret = PDFExport._pdfExportParamsView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {

            }
        },
        _pdfExportParamView: {
            get: function () {
                return AppData.getFormatView("PDFExportParam", 0);
            }
        },
        _pdfExportParamTable: {
            get: function () {
                return AppData.getFormatView("PDFExportParam", 0);
            }
        },
        pdfExportParamView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "PDFExport.");
                var ret = PDFExport._pdfExportParamView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "PDFExport.");
                var ret = PDFExport._pdfExportParamView.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {

            }
        },
        _ExportKontaktDataView: {
            get: function () {
                return AppData.getFormatView("ExportKontaktData", 0);
            }
        },
        _ExportKontaktDataTable: {
            get: function () {
                return AppData.getFormatView("ExportKontaktData", 0);
            }
        },
        ExportKontaktDataView: {
            select: function (complete, error) {
                Log.call(Log.l.trace, "PDFExport.");
                var ret = PDFExport._ExportKontaktDataView.select(complete, error,
                    {
                        ordered: true,
                        orderAttribute: "ExportKontaktDataVIEWID",
                        desc: true
                    });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {

            }
        }
    });
})();