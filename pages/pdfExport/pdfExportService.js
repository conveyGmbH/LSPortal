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
        _exportKontaktDataView: {
            get: function () {
                return AppData.getFormatView("DOC3ExportKontaktData", 20553);
            }
        },
        exportKontaktDataView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "PDFExport.");
                var ret = PDFExport._exportKontaktDataView.selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {

            }
        },
        _contactViewFormat: {
            get: function () {
                return AppData.getFormatView("DOC3ExportKontaktData", 20554);
            }
        },
        contactView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "contactView.");
                var ret = PDFExport._contactViewFormat.select(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "ContactList.");
                var ret = PDFExport._contactViewFormat.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "ContactList.");
                var ret = PDFExport._contactViewFormat.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();