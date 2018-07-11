// services for page: contact
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Contact", {
        _contactView: {
            get: function () {
                return AppData.getFormatView("Kontakt", 0);
            }
        },
        _contactViewFormat: {
            get: function () {
                return AppData.getFormatView("Kontakt", 20456);
            }
        },
        contactView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "contactView.");
                var ret = Contact._contactViewFormat.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, "contactView.");
                var ret = Contact._contactView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, "contactView.");
                var ret = Contact._contactView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "contactView.");
                var ret = Contact._contactView.insert(complete, error, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Titel: "",
                Vorname: "",
                Vorname2: "",
                Name: "",
                Firmenname: "",
                Strasse: "",
                PLZ: "",
                Stadt: "",
                TelefonFestnetz: "",
                TelefonMobil: "",
                Fax: "",
                EMail: "",
                Bemerkungen: "",
                WebAdresse: "",
                Freitext1: "",
                Freitext3: "",
                HostName: (window.device && window.device.uuid),
                INITAnredeID: 0,
                INITLandID: 0,
                CreatorSiteID: "",
                CreatorRecID: "",
                Nachbearbeitet: 1
            }
        },
        _cardScanView: {
            get: function () {
                return AppData.getFormatView("DOC1IMPORT_CARDSCAN", 0);
            }
        },
        cardScanView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "cardScanView.");
                var ret = Contact._cardScanView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _mandatoryView: {
            get: function () {
                return AppData.getFormatView("PflichtFelder", 20503, false);
            }
        },
        mandatoryView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "MandatoryList.");
                var ret = Contact._mandatoryView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "PflichtFelderVIEWID"
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _exportKontaktDataView: {
            get: function () {
                return AppData.getFormatView("DOC3ExportKontaktData", 20553);
            }
        },
        exportKontaktDataView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "PDFExport.");
                var ret = Contact._exportKontaktDataView.select(complete, error, restriction);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {

            }
        }
    });
})();
