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
                },
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
            }   
        });
})();