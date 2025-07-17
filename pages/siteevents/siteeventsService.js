// service for page: siteEvents
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("SiteEvents", {
        _VeranstaltungView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20564);
            }
        },
        VeranstaltungView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._VeranstaltungView.select(complete,error, restriction,{
                        ordered: true,
                        orderAttribute: "Firmenname",
                        desc: false
                    });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._VeranstaltungView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._VeranstaltungView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Firmenname: null,
                StandHall: null,
                StandNo: null,
                Adminuser: null,
                OrderedApp: null,
                DeviceNotLicensed: null,
                DeviceLicensed: null,
                LULUsers: null
            }
        },
        defaultRestriction: {
            VeranstaltungTerminID: AppData.getRecordId("VeranstaltungTermin"),
            Name: null,
            bAndInEachRow: true,
            bUseOr: false,
            OrderAttribute: "FairMandant_Name",
            OrderType: "asc"
        },
        defaultHeaderRestriction: {
            FairMandant_Name: "",
            FairMandant_Ansprechpartner: "",
            AdminLoginList: "",
            AdminContactList: "",
            StandHall: "",
            StandNo: "",
            NumUsers: "",
            NumUsedUsers: "",
            NumLockedContacts: "",
            NumActiveUsers: "",
            NumContacts: "",
            NumContactsBC: "",
            NumContactsVC: "",
            NumContactsMan: "",
            NumExports: "",
            LastExportTS: "",
            FBStatus: "",
            NumSentEmails: "",
            PortalLoginTS: "",
            FairMandant_CustomerID: "",
            StandSize: "",
            DUNSNumber: "",
            Auswertungsvariante: "",
            OrderNumber: "",
            Servername: "",
			ProductList: "",
			MailCategory: ""
        },
        defaultHeaderLabelRestriction: {
            FairMandant_NameLabel: "",
            FairMandant_AnsprechpartnerLabel: "",
            AdminLoginList: "",
            AdminContactList:"",
            StandHallLabel: "",
            StandNoLabel: "",
            NumUsersLabel: "",
            NumUsedUsersLabel: "",
            NumLockedContactsLabel: "",
            NumActiveUsersLabel: "",
            NumContacts: "",
            NumContactsBCLabel: "",
            NumContactsVCLabel: "",
            NumContactsManLabel: "",
            NumExportsLabel: "",
            LastExportTSLabel: "",
            FBStatusLabel: "",
            NumSentEmailsLabel: "",
            PortalLoginTSLabel: "",
            FairMandant_CustomerID: "",
            StandSize: "",
            DUNSNumber: "",
            Auswertungsvariante: "",
            OrderNumber: "",
            Servername:"",
			ProductList: "",
			MailCategory: ""
        },
        _registrationView: {
            get: function () {
                var ret = AppData.getFormatView("Mitarbeiter_Anschrift", 20524, false);
                return ret;
            }
        },
        registrationView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._registrationView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Mitarbeiter_AnschriftVIEWID",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._registrationView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._registrationView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return SiteEvents._registrationView;
            }
        },
        _registrationEnglishView: {
            get: function () {
                var ret = AppData.getFormatView("Mitarbeiter_Anschrift", 20587, false);
                return ret;
            }
        },
        registrationEnglishView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._registrationEnglishView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Mitarbeiter_AnschriftVIEWID",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._registrationEnglishView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._registrationEnglishView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return SiteEvents._registrationEnglishView;
            }
        },
        _registrationFranzView: {
            get: function () {
                var ret = AppData.getFormatView("Mitarbeiter_Anschrift", 20592, false);
                return ret;
            }
        },
        registrationFranzView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._registrationFranzView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Mitarbeiter_AnschriftVIEWID",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._registrationFranzView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._registrationFranzView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return SiteEvents._registrationFranzView;
            }
        },
        _registrationItalienView: {
            get: function () {
                var ret = AppData.getFormatView("Mitarbeiter_Anschrift", 20593, false);
                return ret;
            }
        },
        registrationItalienView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._registrationItalienView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Mitarbeiter_AnschriftVIEWID",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._registrationItalienView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._registrationItalienView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return SiteEvents._registrationItalienView;
            }
        },
        _OIMPImportJobView: {
            get: function () {
                var ret = AppData.getFormatView("OIMPImportJob", 20580, false);
                return ret;
            }
        },
        OIMPImportJobView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._OIMPImportJobView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "OIMPImportJobVIEWID",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._OIMPImportJobView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._OIMPImportJobView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return SiteEvents._OIMPImportJobView;
            }
        },

        _OIMPImportJobEnglishView: {
            get: function () {
                var ret = AppData.getFormatView("OIMPImportJob", 20586, false);
                return ret;
            }
        },
        OIMPImportJobEnglishView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._OIMPImportJobEnglishView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "OIMPImportJobVIEWID",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._OIMPImportJobEnglishView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._OIMPImportJobEnglishView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return SiteEvents._OIMPImportJobEnglishView;
            }
        },

        _OIMPImportJobItalienView: {
            get: function () {
                var ret = AppData.getFormatView("OIMPImportJob", 20590, false);
                return ret;
            }
        },
        OIMPImportJobItalienView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._OIMPImportJobItalienView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "OIMPImportJobVIEWID",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._OIMPImportJobItalienView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._OIMPImportJobItalienView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return SiteEvents._OIMPImportJobItalienView;
            }
        },

        _OIMPImportJobFranzView: {
            get: function () {
                var ret = AppData.getFormatView("OIMPImportJob", 20589, false);
                return ret;
            }
        },
        OIMPImportJobFranzView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._OIMPImportJobFranzView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "OIMPImportJobVIEWID",
                    desc: true
                });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._OIMPImportJobFranzView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._OIMPImportJobFranzView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            getDbView: function () {
                return SiteEvents._OIMPImportJobFranzView;
            }
        },
        _importfileView: {
            get: function () {
                return AppData.getFormatView("Import_File", 0, false);
            }
        },
        importfileView: {
            insert: function (complete, error, viewResponse) {
                Log.call(Log.l.trace, "SiteEvents.");
                var ret = SiteEvents._importfileView.insert(complete, error, viewResponse);
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
                var ret = SiteEvents._doc3import_file.insertWithId(complete, error, viewRecord);
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
        _DOC3ExportPDF: {
            get: function () {
                return AppData.getFormatView("DOC3ExportPDF", 20661);
            }
        },
        DOC3ExportPDFView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Reporting.");
                var ret = SiteEvents._DOC3ExportPDF.select(complete,
                    error,
                    restriction,
                    {
                        ordered: false
                    });
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();
