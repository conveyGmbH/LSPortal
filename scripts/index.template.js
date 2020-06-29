// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints,
// and then run "window.location.reload()" in the JavaScript Console.
/// <reference path="~/www/lib/WinJS/scripts/base.min.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/pageFrame.js" />
/// <reference path="~/www/scripts/generalData.js" />

(function () {
    "use strict";

    // default settings
    AppData.persistentStatesDefaults = {
        colorSettings: {
            // navigation-color with 100% saturation and brightness
            accentColor: "#fe3600"
        },
        showAppBkg: false,
        turnThumbsLeft: false,
        logEnabled: false,
        logLevel: 3,
        logGroup: false,
        logNoStack: true,
        logWinJS: false,
        inputBorder: 1,
        inputBorderRadius: 2,
        inputBorderBottom: true,
        iconStrokeWidth: 150,
        navVertWidth: 300,
        loadRemoteResource: true,
        odata: {
            https: true,
            hostName: "leadsuccess.convey.de",
            onlinePort: 443,
            urlSuffix: null,
            onlinePath: "odata_online", // serviceRoot online requests
            login: "",
            password: "",
            privacyPolicyFlag: false,
            privacyPolicydisabled: true,
            registerPath: "odata_register", // serviceRoot register requests
            registerLogin: "AppRegister",
            registerPassword: "6530bv6OIUed3",
            useOffline: false,
            replActive: false,
            replInterval: 30,
            replPrevPostMs: 0,
            replPrevSelectMs: 0,
            replPrevFlowSpecId: 0,
            dbSiteId: 0,
            timeZoneAdjustment: 0,
            timeZoneRemoteAdjustment: null,
            timeZoneRemoteDiffMs: 0,
            serverFailure: false
        }
    };

    // static array of menu groups for the split view pane
    Application.navigationBarGroups = [
        { id: "start", group: 1, svg: "home", disabled: true },
        { id: "voucherAdministration", group: 16, svg: "Gutschein1.1", disabled: true },
        { id: "esStaffAdministration", group: 18, svg: "id_card", disabled: true },
        { id: "esVoucherUsers", group: 19, svg: "voucher_contact", disabled: true },
        //{ id: "resourcesAdministration", group: 17, svg: "user_headset", disabled: true },
        { id: "events", group: 2, svg: "calendar_1", disabled: true },
        { id: "localevents", group: 12, svg: "office_building", disabled: true },
        { id: "siteevents", group: 13, svg: "office_building", disabled: true },
        { id: "clientManagement", group: 14, svg: "voodoo_doll", disabled: true },
        { id: "questionList", group: 3, svg: "question_and_answer", disabled: true },
        { id: "mailing", group: 4, svg: "mail", disabled: true },
        { id: "employee", group: 5, svg: "keys", disabled: true },
        { id: "contacts", group: 6, svg: "businesspeople2", disabled: true },
        { id: "search", group: 7, svg: "magnifying_glass", disabled: true },
        { id: "reporting", group: 8, svg: "download", disabled: true },
        { id: "infodesk", group: 9, svg: "about", disabled: true },
        { id: "info", group: 10, svg: "gearwheel", disabled: true },
        { id: "support", group: 11, svg: "user_headset", disabled: true }
    ];

    // static array of pages for the navigation bar
    Application.navigationBarPages = [
        { id: "start", group: -1, disabled: false },
        { id: "home", group: -1, disabled: false },
        { id: "event", group: 2, disabled: false },
        //{ id: "products", group: 2, disabled: false },
        { id: "skills", group: 2, disabled: false },
        { id: "questionList", group: 3, disabled: false },
        { id: "questiongroup", group: 3, disabled: false },
        { id: "optQuestionList", group: 3, disabled: false },
        { id: "mandatory", group: 3, disabled: false },
        { id: "mailing", group: 4, disabled: false },
        { id: "mailingOptions", group: 4, disabled: false },
        //{ id: "mailingProduct", group: 4, disabled: false },
        { id: "employee", group: 5, disabled: false },
        { id: "skillentry", group: 5, disabled: false },
        { id: "employeeGenPWList", group: 5, disabled: false },
        { id: "contact", group: 6, disabled: false },
        { id: "questionnaire", group: 6, disabled: false },
        { id: "sketch", group: 6, disabled: false },
        { id: "search", group: -7, disabled: false },
        { id: "reporting", group: 8, disabled: false },
        { id: "reportingColumnList", group: 8, disabled: false },
        //{ id: "pdfExport", group: 8, disabled: false },
        { id: "infodesk", group: -9, disabled: false },
        { id: "info", group: 10, disabled: false },
        { id: "settings", group: 10, disabled: false },
        { id: "account", group: 10, disabled: false },
        { id: "support", group: -11, disabled: false },
        { id: "localevents", group: -12, disabled: false },
        { id: "siteevents", group: 13, disbaled: false },
        { id: "mailingTypes", group: 13, disabled: false },
        { id: "mailingTemplate", group: 13, disabled: false },
        { id: "clientManagement", group: 14, disabled: false },
        { id: "clientManagementLicenses", group: 14, disabled: false },
        //{ id: "mailingTracking", group: 13, disabled: false }
        { id: "voucherAdministration", group: -16, disabled: false },
        { id: "resourcesAdministration", group: -17, disabled: false },
        { id: "esStaffAdministration", group: 18, disabled: false },
        { id: "esVoucherUsers", group: 19, disabled: false }
    ];


    // static array of pages master/detail relations
    Application.navigationMasterDetail = [
        { id: "contact", master: "contactList" },
        { id: "questionnaire", master: "contactList" },
        { id: "sketch", master: "contactList" },
        { id: "photo", master: "contactList" },
        { id: "employee", master: "empList" },
        { id: "skillentry", master: "empList" },
        { id: "infodesk", master: "infodeskEmpList" },
        { id: "mailing", master: "mailingList" },
        { id: "mailingTypes", master: "siteEventsList" },
        { id: "mailingTemplate", master: "siteEventsList" },
        { id: "mailingTracking", master: "siteEventsList" },
        { id: "siteevents", master: "siteEventsList" },
        { id: "clientManagement", master: "clientManagementList" },
        { id: "clientManagementLicenses", master: "clientManagementList" },
        { id: "mailingTracking", master: "mailingTrackingList" },
        { id: "esStaffAdministration", master: "esStaffAdministrationList" },
        { id: "esVoucherUsers", master: "esVoucherUsersList" },
    ];

    // init page for app startup
    Application.initPage = Application.getPagePath("dbinit");
    // home page of app
    Application.startPage = Application.getPagePath("start");

    // new contact function select feature:
    Application.prevNavigateNewId = "newContact";
    // some more default page navigation handling
    Application.navigateByIdOverride = function (id, event) {
        Log.call(Log.l.trace, "Application.", "id=" + id);
        if (id === "start" && Application.getPageId(WinJS.Navigation.location) !== "home") {
            id = "home";
        } else if (id === "events") {
            id = "event";
        } else if (id === "serviceevents") {
            id = "questionList";
        } else if (id === "contacts") {
            AppData.setRestriction("Kontakt", {});
            id = "contact";
        } else if (id === "newAccount" || id === "userinfo") {
            id = "account";
        }
        Log.ret(Log.l.trace);
        return id;
    };

    // initiate the page frame class
    var pageframe = new Application.PageFrame("LeadSuccessPortal");
})();
