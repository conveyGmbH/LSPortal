// service for page: siteeventsImport
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("SiteeventsImport", {
        _importfileView: {
            get: function () {
                return AppData.getFormatView("Import_File", 0, false);
            }
        },
        importfileView: {
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteeventsImport._importfileView.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultRestriction: {
                INITImportFileTypeID: 1,
                Import_Title: "",
                EventID: 0
            }
        },
        _doc3import_file: {
            get: function () {
                return AppData.getFormatView("DOC3Import_File", 0);
            }
        },
        doc3import_file: {
            insert: function (complete, error, viewRecord) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteeventsImport._doc3import_file.insertWithId(complete, error, viewRecord);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultRestriction: {
                DOC3Import_FileVIEWID: 0,
                wFormat: 0,
                szOriFileNameDOC1: "",
                DocContentDOCCNT1: "",
                ContentEncoding: 0
            }
        },
        _Import_FileVIEW: {
            get: function () {
                return AppData.getFormatView("Import_File", 20667);
            }
        },
        Import_FileVIEW: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "SiteeventsImport.");
                var ret = SiteeventsImport._Import_FileVIEW.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Erfasstam", //Zeitpunkt des Uploads
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "SiteeventsImport.");
                var ret = SiteeventsImport._Import_FileVIEW.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "SiteeventsImport.");
                var ret = SiteeventsImport._Import_FileVIEW.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Import_Title: "",
                Erfasser: "",
                Erfasstam: "",
                Startts: "",
                Endts: "",
                INITImportstatusID: "",
                NumFailedLines: "",
                NumOKLines: ""
            }
        }
    });
})();