// service for page: event
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/scripts/generalData.js" />

(function () {
    "use strict";
    var namespaceName = "EsStaffAdministration";

    WinJS.Namespace.define("EsStaffAdministration", {
        _employeeView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20609);
            }
        },
        employeeView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".employeeView.", "recordId=" + recordId);
                var ret = EsStaffAdministration._employeeView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;

            },
            deleteRecord: function (complete, error, recordId) {
                Log.call(Log.l.trace, namespaceName + ".employeeView.", "recordId=" + recordId);
                var ret = EsStaffAdministration._employeeView.deleteRecord(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            update: function (complete, error, recordId, viewResponse) {
                Log.call(Log.l.trace, namespaceName + ".employeeView.", "recordId=" + recordId);
                var ret = EsStaffAdministration._employeeView.update(complete, error, recordId, viewResponse);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Vorname: "",
                Nachname: "",
                Login: AppData.generalData.userName || "",
                LogInNameBeforeAtSymbole: "",
                LogInNameAfterAtSymbole: "", 
                Password: "",
                VeranstaltungID: AppData.getRecordId("Veranstaltung"),
                //INITAPUserRoleID: 3,
                Password2: "",
                ArticleTypeID: 0
            },
            defaultRestriction: {
                Vorname: "",
                Nachname: "",
                Login: "",
                Names: "",
                Firma: "",
                OrderAttribute: "Nachname",
                OrderDesc: true,
                Aktiv: [],
                bAndInEachRow: true,
                bUseOr: false
            }
        },
        _pdfView: {
            get: function () {
                return AppData.getFormatView("DOC3ExportPDF", 20610);
            }
        },
        pdfView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, namespaceName + ".pdfView.", "restriction=" + (restriction ? JSON.stringify(restriction) : ""));
                var ret = EsStaffAdministration._pdfView.select(complete, error, restriction);
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();


