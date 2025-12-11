// service for page: info
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";
    var namespaceName = "ContactCrmExport";

    WinJS.Namespace.define(namespaceName, {
        _contactView: {
            get: function () {
                return AppData.getFormatView("Kontakt", 20456);
            }
        },
        contactView: {
            select: function(complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".contactView.", "recordId=" + recordId);
                var ret = Contact._contactViewFormat.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            },
            deleteRecord: function(complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".contactView.", "recordId=" + recordId);
                var ret = Contact._contactView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function(complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".contactView.", "recordId=" + recordId);
                var ret = Contact._contactView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            insert: function(complete, error, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".contactView.");
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
                Position: "",
                Branche: "",
                AbteilungText: "",
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
                HostName: "",
                INITAnredeID: 0,
                INITLandID: 0,
                CreatorSiteID: "",
                CreatorRecID: "",
                Nachbearbeitet: 1,
                IsIncomplete: null
            }
        }
    });
})();


