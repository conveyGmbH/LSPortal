// service for page: mailing
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    var namespaceName = "BarcodeAdministration";

    WinJS.Namespace.define(namespaceName, {
        _fragebogenZeileBCView: {
            get: function() {
                return AppData.getFormatView("NCHRFragenAntworten", 20525, false); //Ändern in Fragebogenzeilebcview
            }
        },
        fragebogenZeileBCView: {
            select: function (complete, error, restriction, options) {
                Log.call(Log.l.trace, namespaceName + ".fragebogenZeileBCView.");
                if (!options) {
                    options = {
                        ordered: true,
                        orderAttribute: "Sortierung"
                    };
                }
                var ret = BarcodeAdministration._fragebogenZeileBCView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, namespaceName + ".fragebogenZeileBCView.");
                var ret = BarcodeAdministration._fragebogenZeileBCView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, namespaceName + ".fragebogenZeileBCView.");
                var ret = BarcodeAdministration._fragebogenZeileBCView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: BarcodeAdministration._fragebogenZeileBCView.relationName,
            pkName: BarcodeAdministration._fragebogenZeileBCView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (BarcodeAdministration._fragebogenZeileBCView.oDataPkName) {
                        ret = record[BarcodeAdministration._fragebogenZeileBCView.oDataPkName];
                    }
                    if (!ret && BarcodeAdministration._fragebogenZeileBCView.pkName) {
                        ret = record[BarcodeAdministration._fragebogenZeileBCView.pkName];
                    }
                }
                return ret;
            },
            defaultValue: {
                Antwort01: "",
                Antwort02: "",
                Antwort03: "",
                Antwort04: "",
                Antwort05: "",
                Antwort06: "",
                Antwort07: "",
                Antwort08: "",
                Antwort09: ""
            }
        },
        _barcodeExportPdfView: {
            get: function () {
                return AppData.getFormatView("DOC3Fragebogen", 20557, false);
            }
        },
        barcodeExportPdfView: {
            select: function (complete, error, restriction, options) {
                Log.call(Log.l.trace, namespaceName + ".barcodeExportPdfView.");
                var ret = BarcodeAdministration._barcodeExportPdfView.select(complete, error, restriction, options);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();