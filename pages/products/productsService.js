// service for page: MailingProductLine
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Products", {
        _MaildokumentView: {
            get: function () {
                return AppData.getFormatView("Maildokument", 20527);
            }
        },
        MaildokumentView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._MaildokumentView.select(complete, error, restriction, { ordered: true });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _MAILERZEILENView: {
            get: function () {
                return AppData.getFormatView("MAILERZEILEN", 20514);
            }
        },
        _MAILERZEILENTable: {
            get: function () {
                return AppData.getFormatView("MAILERZEILEN", 0);
            }
        },
        MAILERZEILENView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._MAILERZEILENView.select(complete,
                    error,
                    restriction,
                    {
                        ordered: true,
                        orderAttribute: "Sortierung"
                    });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._MAILERZEILENView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._MAILERZEILENView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Zeilentext: null,
                Inaktiv: null,
                Sortierung: null,
                FragenID: null,
                AntwortenID: null,
                ProduktID: null
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._MAILERZEILENTable.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._MAILERZEILENTable.insert(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._MAILERZEILENTable.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _ProduktTable: {
            get: function () {
                return AppData.getFormatView("Produkt", 0);
            }
        },
        ProduktView: {
            insert: function(complete, error, restriction) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._ProduktTable.insert(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            },
            deleteRecord: function(complete, error, recordId) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._ProduktTable.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                VeranstaltungID : null
            },
        },
        _ProduktnameView: {
            get: function () {
                return AppData.getFormatView("Produktname", 20516);
            }
        },
        _ProduktnameTable: {
            get: function () {
                return AppData.getFormatView("Produktname", 0);
            }
        },
        ProduktnameView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._ProduktnameView.select(complete,
                    error,
                    restriction,
                    {
                        ordered: true,
                        orderAttribute: "LanguageSpecID"
                    });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._ProduktnameView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._ProduktnameView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Name: null,
                LanguageSpecID: null,
                ProduktID: null
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._ProduktnameTable.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._ProduktnameTable.insert(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _FragenAntwortenView: {
            get: function () {
                return AppData.getFormatView("FragenAntworten", 0);
            }
        },
        FragenAntwortenView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "MailingProductLine.");
                var ret = Products._FragenAntwortenView.select(complete, error, restriction, { ordered: true });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._FragenAntwortenView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._FragenAntwortenView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultrestriction: {
                FragenAntwortenVIEWID: null,
                Fragestellung: null
            }
        },
        _FragenView: {
            get: function () {
                return AppData.getFormatView("Fragen", 20550);
            }
        },
        FragenView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "ProductQuestion.");
                var ret = Products._FragenView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Fragestellung"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "ProductQuestion._FragenView.");
                var ret = Products._FragenView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "ProductQuestion._FragenView.");
                var ret = Products._FragenView.map;
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                FragenVIEWID: null,
                Fragestellung: ""
            }
        },
        _AntwortenView: {
            get: function () {
                return AppData.getFormatView("Antworten", 20556);
            }
        },
        AntwortenView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._AntwortenView.select(complete, error, restriction, {
                   
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "Products._FragenView.");
                var ret = Products._AntwortenView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "Products._FragenView.");
                var ret = Products._AntwortenView.map;
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                AntwortenVIEWID: null,
                Fragestellung: ""
            }
        },
        _FragenAntwortenUpdateView: {
            get: function () {
                return AppData.getFormatView("Produkt", 20515);
            }
        },
        FragenAntwortenUpdateView: {
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "Products.");
                var ret = Products._FragenAntwortenUpdateView.update(complete, error, recordId, viewResponse);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();