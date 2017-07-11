// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints,
// and then run "window.location.reload()" in the JavaScript Console.
/// <reference path="~/www/lib/WinJS/scripts/base.min.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/pageFrame.js" />
/// <reference path="~/www/scripts/generalData.js" />

(function() {
    "use strict";

    // default settings
    AppData.persistentStatesDefaults = {
        colorSettings: {
            // navigation-color with 100% saturation and brightness
            accentColor: "#ff3c00"
        },
        showAppBkg: false,
        logEnabled: false,
        logLevel: 3,
        logGroup: false,
        logNoStack: true,
        inputBorder: 1,
        odata: {
            https: true,
            hostName: "leadsuccess.convey.de",
            onlinePort: 443,
            urlSuffix: null,
            onlinePath: "odata_online", // serviceRoot online requests
            login: "",
            password: "",
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
        { id: "events", group: 2, svg: "question_and_answer", disabled: true },
        { id: "mailing", group: 3, svg: "mail", disabled: true },
        { id: "employee", group: 4, svg: "keys", disabled: true },
        { id: "contacts", group: 5, svg: "businesspeople2", disabled: true },
        { id: "search", group: 9, svg: "magnifying_glass", disabled: true },
        { id: "reporting", group: 6, svg: "chart_column", disabled: true },
        { id: "infodesk", group: 7, svg: "desk", disabled: true },
        { id: "info", group: 8, svg: "gearwheel", disabled: true }
    ];

    // static array of pages for the navigation bar
    Application.navigationBarPages = [
        { id: "start", group: -1, disabled: false },
        { id: "event", group: 2, disabled: false },
        { id: "questiongroup", group: 2, disabled: false },
        { id: "questionList", group: 2, disabled: false },
        { id: "skills", group: 2, disabled: false },
        { id: "mailing", group: -3, disabled: false },
        { id: "employee", group: 4, disabled: false },
        { id: "skillentry", group: 4, disabled: false },
        { id: "contact", group: 5, disabled: false },
        { id: "questionnaire", group: 5, disabled: false },
        { id: "sketch", group: 5, disabled: false },
        { id: "reporting", group: -6, disabled: false },
        { id: "infodesk", group: -7, disabled: false },
        { id: "info", group: 8, disabled: false },
        { id: "settings", group: 8, disabled: false },
        { id: "account", group: 8, disabled: false },
        { id: "search", group: -9, disabled: false}
    ];


    // static array of pages master/detail relations
    Application.navigationMasterDetail = [
        { id: "contact", master: "contactList" },
        { id: "questionnaire", master: "contactList" },
        { id: "sketch", master: "contactList" },
        { id: "photo", master: "contactList" },
        { id: "employee", master: "empList" },
        { id: "skillentry", master: "empList" },
        { id: "infodesk", master: "infodeskEmpList" }
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
        if (id === "events") {
            id = "event";
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

