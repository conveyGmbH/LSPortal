// service for page: reportingColumnList
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("ReportingColumnList",
        {
            _ExportReportColumn: {
                get: function() {
                    return AppData.getFormatView("ExportReportColumn", 20506);
                }
            },
            ExportReportColumn: {
                select: function(complete, error) {
                    Log.call(Log.l.trace, "Reporting.");
                    var ret = ReportingColumnList._ExportReportColumn.select(complete,
                        error,
                        {
                            LanguageSpecID: AppData.getLanguageId()
                        },
                        {
                            ordered: true
                        });
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                getNextUrl: function(response) {
                    Log.call(Log.l.trace, "Reporting._analysisListView.");
                    var ret = ReportingColumnList._ExportReportColumn.getNextUrl(response);
                    Log.ret(Log.l.trace);
                    return ret;
                },
                getResults: function() {
                    Log.call(Log.l.trace, "ReportingColumnList.LGNTINITRFeldTyp.");
                    var ret = ReportingColumnList._ExportReportColumn.results;
                    Log.ret(Log.l.trace);
                    return ret;
                },
                getMap: function() {
                    Log.call(Log.l.trace, "ReportingColumnList.LGNTINITRFeldTyp.");
                    var ret = ReportingColumnList._ExportReportColumn.map;
                    Log.ret(Log.l.trace);
                    return ret;
                }
            },
            _ExportReportColumnU: {
                get: function() {
                    return AppData.getFormatView("ExportReportColumn");
                }
            },
            ExportReportColumnU: {
                select: function(complete, error) {
                    Log.call(Log.l.trace, "Reporting.");
                    var ret = ReportingColumnList._ExportReportColumnU.select(complete,
                        error,
                        {
                        },
                        {
                            ordered: true
                        });
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                update: function(complete, error, recordId, viewResponse) {
                    Log.call(Log.l.trace, "Questionnaire.questionnaireView.");
                    var ret = ReportingColumnList._ExportReportColumnU.update(complete, error, recordId, viewResponse);
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;

                },
                defaultValue:
                {
                    ExportReportColumnVIEWID: "",
                    INITRFeldTypID: "",
                    VeranstaltungID: "",
                    FieldFlag: 1
                }
            },
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
                    var ret = ReportingColumnList._pdfExportView.select(complete, error, restriction);
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                insert: function (complete, error, restriction) {
                    Log.call(Log.l.trace, "PDFExport.");
                    var ret = ReportingColumnList._pdfExportTable.insert(complete, error, restriction);
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
                    var ret = ReportingColumnList._pdfExportParamsView.select(complete, error, restriction);
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
                    var ret = ReportingColumnList._pdfExportParamView.select(complete, error, restriction);
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                update: function (complete, error, recordId, viewResponse) {
                    Log.call(Log.l.trace, "PDFExport.");
                    var ret = ReportingColumnList._pdfExportParamView.update(complete, error, recordId, viewResponse);
                    // this will return a promise to controller
                    Log.ret(Log.l.trace);
                    return ret;
                },
                defaultValue: {
                    NameField1ID: 0,
                    NameField2ID: 0,
                    NameField3ID: 0,
                    NameField4ID: 0,
                    Separator: "_"
                }
            }   
        });
})();