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

    Colors.corsAwareCssRuleAccess = true;

    // default settings
    AppData.persistentStatesDefaults = {
        colorSettingsDefaults: [
            {
                // LeadSuccess
                accentColor: "#fe3600"
            }, {
                // LiveBridge
                accentColor: "#07b9cb",
                textColor: "#2a2f3d",
                labelColor: "#2a2f3d",
                backgroundColor: "#f3fbfc",
                navigationColor: "#07b9cb",
                dashboardColor: "#38a2ad",
                tileTextColor: "#07b9cb",
                tileBackgroundColor: "#f3fbfc"
            }, {
                // EventSuccess
                accentColor: "#fe3600"
            }, {
                // Mesago Dashboard (Premium)
                accentColor: "#fe3600" //"#74b2e1"
            }, {
                // Mesago Dashboard (Supreme)
                accentColor: "#fe3600" //"#b26086"
            }
        ],
        colorSettings: {
            // navigation-color with 100% saturation and brightness
            // LeadSuccess
            accentColor: "#fe3600"
            //
            // LiveBridge
            // accentColor: "#07b9cb",
            // textColor: "#2a2f3d",
            // labelColor: "#2a2f3d",
            // backgroundColor: "#f3fbfc",
            // navigationColor: "#07b9cb",
            // dashboardColor: "#38a2ad",
            // tileTextColor: "#07b9cb",
            // tileBackgroundColor: "#f3fbfc"
        },
        showAppBkg: false,
        showBackButton: true,
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
        splitViewPaneWidth: 320,
        loadRemoteResource: true,
        expandSubMenuMode: "single",
        manualTheme: true,
        mandantOption: false
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
            serverFailure: false,
            corsQuirks: false
        }
    };

    // static array of menu groups for the split view pane
    Application.navigationBarGroups = [
        //Home-Startseite
        { id: "home", group: 1, svg: "home", disabled: true },
        //Administration Sideadmin ONLY
        { id: "administrationGrp", group: 41, svg: "administration", disabled: true, popup: true },
        { id: "siteevents", group: 13, svg: "mandant", disabled: true, predecGroup: 41 },
        { id: "clientManagementSearchList", group: 14, svg: "standpersonal", disabled: true, predecGroup: 41 },
        { id: "siteEventsRoleManagement", group: 81, svg: "standpersonal", disabled: true, predecGroup: 41 },
        // { id: "startTileAdministration", group: 61, svg: "home", disabled: true, predecGroup: 41 },
        { id: "adminAppHelpText", group: 81, svg: "standpersonal", disabled: true, predecGroup: 41 },
        //EventSuccess
        { id: "esStaffAdministration", group: 18, svg: "id_card", disabled: true },
        { id: "ticketLimits", group: 16, svg: "id_card", disabled: true },
        { id: "voucherAdministration", group: 16, svg: "gutschein1.1", disabled: true },
        { id: "esVoucherUsers", group: 19, svg: "voucher_contact", disabled: true },
        //LiveBridgeGrp
        { id: "liveBridgeGrp", group: 85, svg: "stammdaten", disabled: true, popup: true },
        { id: "eventBaseLink", group: 55, svg: "stammdaten", disabled: true, predecGroup: 85, label: "label.eventBaseLink", tooltip: "tooltip.eventBaseLink" },
        { id: "eventSeries", group: 52, svg: "stammdaten", disabled: true, predecGroup: 85 },
        { id: "genDataModDetails", group: 54, svg: "stammdaten", disabled: true, predecGroup: 85 },
        { id: "genDataAnswers", group: 56, svg: "stammdaten", disabled: true, predecGroup: 85 },
        //MasterData
        { id: "masterDataGrp", group: 23, svg: "stammdaten", disabled: true, popup: true }, 
        { id: "genDataEmployee", group: 74, svg: "stammdaten", disabled: true, predecGroup: 23 },  
        //{ id: "eventStarts", group: 55, svg: "Stammdaten", disabled: true, predecGroup: 23 },
        //{ id: "eventStartLang", group: 55, svg: "Stammdaten", disabled: true, predecGroup: 23 },
        //{ id: "startResourceAdministration", group: 55, svg: "Stammdaten", disabled: true, predecGroup: 23, label: "label.eventStarts", tooltip: "label.eventStarts" },
        //{ id: "startMediaAdministration", group: 55, svg: "Stammdaten", disabled: true, predecGroup: 23 },
        { id: "skills", group: 24, svg: "user_skills", disabled: true, predecGroup: 23 },
        // only visible in deimos and lstest, not in lsmain
        //{ id: "startPremium", group: 57, svg: "dashboard", disabled: true },
        //{ id: "dashboardFN", group: 57, svg: "dashboard", disabled: true },
        //VisitorFlow
        { id: "visitorFlowGrp", group: 28, svg: "lsvFlow", disabled: true, popup: true },
        { id: "visitorFlowDashboard", group: 20, svg: "dashboardVisitorFlow", disabled: true, predecGroup: 28 },
        { id: "visitorFlowEntExt", group: 22, svg: "window_gear", disabled: true, predecGroup: 28 },
        //Employee
        { id: "employeeGrp", group: 25, svg: "benutzerkonten", disabled: true, popup: true },
        { id: "employee", group: 5, svg: "keys", disabled: true, predecGroup: 25 },
        { id: "skills", group: 24, svg: "user_skills", disabled: true, predecGroup: 25 },
        //MyEvent
        { id: "myEvents", group: 53, svg: "keys", disabled: true, popup: true },
        //{ id: "localevents", group: 12, svg: "keys", disabled: true, predecGroup: 53 },
        { id: "eventGenSettings", group: 44, svg: "calendar_1", disabled: true, predecGroup: 53 },
        { id: "eventStatus", group: 73, svg: "calendar_1", disabled: true, predecGroup: 53 },
        //MyEventsLS
        { id: "MyEventsLSGrp", group: 62, svg: "keys", disabled: true, popup: true },
        { id: "localevents", group: 12, svg: "keys", disabled: true, predecGroup: 62 },
        { id: "events", group: 2, svg: "calendar_1", disabled: true, predecGroup: 62 },
        { id: "eventProducts", group: 46, svg: "box_open", disabled: true, predecGroup: 41 },
        //{ id: "eventResourceAdministration", group: 44, svg: "calendar_1", disabled: true, predecGroup: 53 },
        //{ id: "eventMediaAdministration", group: 44, svg: "calendar_1", disabled: true, predecGroup: 53 },
        //{ id: "eventSeriesAdministration", group: 44, svg: "calendar_1", disabled: true, predecGroup: 53 },
        //Leadsuccess Settings
        { id: "settingLeadsuccessGrp", group: 27, svg: "handshake", disabled: true, popup: true },
        //{ id: "localevents", group: 12, svg: "keys", disabled: true, predecGroup: 27 },
        //{ id: "events", group: 2, svg: "calendar_1", disabled: true, predecGroup: 27 },
        { id: "questionList", group: 3, svg: "question_and_answer", disabled: true, predecGroup: 27 },
        { id: "optQuestionList", group: 82, svg: "question_and_answer", disabled: true, predecGroup: 27 },
        { id: "mandatory", group: 30, svg: "pflichtFelder", disabled: true, predecGroup: 27 },
        //Contacts
        { id: "contactsEventsGrp", group: 29, svg: "contact_Ereignis", disabled: true, popup: true },
        { id: "contactResultsList", group: 42, svg: "calendar_1", disabled: true, predecGroup: 29 },
        { id: "search", group: 7, svg: "magnifying_glass", disabled: true, predecGroup: 29 },
        { id: "contacts", group: 6, svg: "businesspeople2", disabled: true, predecGroup: 29 },
        //Dashboards #8177
        //{ id: "dashBoard", group: 15, svg: "dashboard", disabled: true, popup: true },
        { id: "start", group: 15, svg: "dashboard", disabled: true},
        // only visible in deimos and lstest, not in lsmain
        //{ id: "startPremium", group: 57, svg: "dashboard", disabled: true, predecGroup: 15 },
        //{ id: "dashboardFN", group: 57, svg: "dashboard", disabled: true, predecGroup: 15 },
        //Mailing
        { id: "mailingGrp", group: 31, svg: "mailing", disabled: true, popup: true },
        { id: "mailing", group: 32, svg: "productmail", disabled: true, predecGroup: 31 },
        { id: "mailingOptions", group: 33, svg: "mailsettings", disabled: true, predecGroup: 31 },
        //AutomaticMails
        { id: "AutomaticMailsGrp", group: 63, svg: "mailing", disabled: true, popup: true },
        { id: "mailingList", group: -50, svg: "standardmail", disabled: true, predecGroup: 63 },
        { id: "mailingTemplateEvent", group: -51, svg: "standardmail", disabled: true, predecGroup: 63 },
        //Dashboards
        //{ id: "dashBoard", group: 19, svg: "dashboard", disabled: true },
        //Exports
        { id: "exportGrp", group: 34, svg: "export", disabled: true, popup: true },
        { id: "reporting", group: 8, svg: "download", disabled: true, predecGroup: 34 },
        { id: "reportingColumnList", group: 35, svg: "export_settings", disabled: true, predecGroup: 34 },
        //Infodesk
        { id: "infodesk", group: 9, svg: "about", disabled: true },
        //Options
        { id: "optionsGrp", group: 36, svg: "options", disabled: true, popup: true },
        { id: "info", group: 37, svg: "gearwheel", disabled: true, predecGroup: 36 },
        { id: "settings", group: 38, svg: "design", disabled: true, predecGroup: 36 },
        { id: "account", group: 39, svg: "konto", disabled: false, predecGroup: 36 },
        //Support
        { id: "support", group: -11, svg: "user_headset", disabled: true } /*40*/
        //{ id: "resourcesAdministration", group: 17, svg: "user_headset", disabled: true },
        //{ id: "search", group: 7, svg: "magnifying_glass", disabled: true },
        //{ id: "info", group: 10, svg: "gearwheel", disabled: true },
    ];

    // static array of pages for the navigation bar
    Application.navigationBarPages = [
        { id: "home", group: -1, disabled: false },
        { id: "start", group: 15, disabled: false },
        { id: "startPremium", group: 15, disabled: false },
        { id: "event", group: 2, disabled: false },
        //{ id: "products", group: 2, disabled: false },
        { id: "eventSeries", group: 52, disabled: false },
        { id: "seriesResourceAdministration", group: 52, disabled: false },
        { id: "seriesMediaAdministration", group: 52, disabled: false },
        //{ id: "eventStarts", group: 55, disabled: false },
        //{ id: "eventStartLang", group: 55, disabled: false },
        { id: "eventBaseLink", group: 55, disabled: false },
        { id: "startResourceAdministration", group: 55, disabled: false },
        { id: "startMediaAdministration", group: 55, disabled: false },
        { id: "genDataEmployee", group: 74, disabled: false },
        { id: "genDataUserInfo", group: 74, disabled: false },
        { id: "genDataSkillEntry", group: 74, disabled: false },
        { id: "employeeGenPWList", group: 74, disabled: false },
        { id: "genDataModDetails", group: 54, disabled: false },
	//{ id: "genDataModAnswers", group: 56, disabled: false },
	{ id: "genDataModHisto", group: 54, disabled: false },
        //{ id: "genDataAnswers", group: 56, disabled: false },
        { id: "skills", group: 24, disabled: false },
        { id: "eventGenSettings", group: 44, disabled: false },
        { id: "eventSeriesAdministration", group: 44, disabled: false },
        { id: "eventResourceAdministration", group: 44, disabled: false},
        { id: "eventMediaAdministration", group: 44, disabled: false },
        { id: "eventQuestionnaire", group: 44, disabled: false },
        { id: "eventSpeakerAdministration", group: 44, disabled: false },
        { id: "questionList", group: 3, disabled: false },
        { id: "questiongroup", group: 3, disabled: false },
        { id: "optQuestionList", group: 3, disabled: false },
		    { id: "optMandatoryFieldList", group: 3, disabled: false},
        { id: "mandatory", group: -30, disabled: false },
        //{ id: "visitorFlowEntExt", group: 3, disabled: false },
        { id: "mailing", group: 4, disabled: false },
        { id: "mailingOptions", group: 4, disabled: false },
		    { id: "mailingList", group: -50, disabled: false },
        { id: "mailingTemplateEvent", group: -51, disabled: false },
        //{ id: "mailingProduct", group: 4, disabled: false },
        { id: "employee", group: 5, disabled: false },
        { id: "skillentry", group: 5, disabled: false },
        { id: "employeeVisitorFlow", group: 5, disabled: false },
        { id: "employeeGenPWList", group: 5, disabled: false },
        { id: "contact", group: 6, disabled: false },
        { id: "questionnaire", group: 6, disabled: false },
        { id: "sketch", group: 6, disabled: false },
        { id: "search", group: -7, disabled: false },
        { id: "reporting", group: 8, disabled: false },
        { id: "reportingColumnList", group: 8, disabled: false },
        //{ id: "pdfExport", group: 8, disabled: false },
        { id: "infodesk", group: 9, disabled: false },
        { id: "info", group: 36, disabled: false }, /*10*/
        { id: "settings", group: 36, disabled: false }, /*10*/
        { id: "account", group: 36, disabled: false }, /*39*/
        //{ id: "support", group: -11, disabled: false },
        { id: "localevents", group: -12, disabled: false },
        { id: "siteevents", group: 13, disbaled: false },
        { id: "mailingTypes", group: 13, disabled: false },
        { id: "mailingTemplate", group: 13, disabled: false },
        { id: "clientManagementSearchList", group: 14, disabled: false },
        { id: "clientManagement", group: 75, disabled: false },
        { id: "clientManagementLicenses", group: 75, disabled: false },
        { id: "mailingTracking", group: 13, disabled: false },
        { id: "voucherAdministration", group: -16, disabled: false },
        { id: "resourcesAdministration", group: -17, disabled: false },
        { id: "esStaffAdministration", group: -18, disabled: false },
        { id: "esVoucherUsers", group: -19, disabled: false },
        { id: "visitorFlowDashboard", group: -20, disabled: true },
        { id: "visitorFlowEntExt", group: -22, disabled: true },
        { id: "contactResultsList", group: 29, disabled: true },
        //{ id: "contactResultsEvents", group: 68, disabled: false },
        { id: "contactResultsEdit", group: 68, disabled: false },
        //{ id: "contactResultsCriteria", group: 68, disabled: false },
        { id: "contactResultsQuestion", group: 68, disabled: false },
        { id: "contactResultsAttach", group: 68, disabled: false },
        { id: "startTileAdministration", group: 61, disabled: false },
        { id: "ticketLimits", group: -67, disabled: false },
        { id: "eventStatus", group: 73, disabled: false },
        { id: "eventCopy", group: 2, disabled: false },
        { id: "eventProducts", group: 46, disabled: false },
        { id: "siteeventsImport", group: 13, disabled: false },
        { id: "clientManagementSummarise", group: 75, disabled: false },
        { id: "adminAppHelpText", group: 76, disabled: false },
    ];


    // static array of pages master/detail relations
    Application.navigationMasterDetail = [
        { id: "contact", master: "contactList" },
        { id: "questionnaire", master: "contactList" },
        { id: "sketch", master: "contactList" },
        { id: "photo", master: "contactList" },
        { id: "employee", master: "empList" },
        { id: "skillentry", master: "empList" },
        { id: "employeeVisitorFlow", master: "empList" },
        { id: "infodesk", master: "infodeskEmpList" },
        { id: "mailingTypes", master: "siteEventsList" },
        { id: "mailingTemplate", master: "siteEventsList" },
        { id: "siteevents", master: "siteEventsList" },
        //{ id: "clientManagement", master: "clientManagementList" },
        //{ id: "clientManagementLicenses", master: "clientManagement" },
        { id: "mailingTracking", master: "mailingTrackingList" },
        { id: "esStaffAdministration", master: "esStaffAdministrationList" },
        { id: "esVoucherUsers", master: "esVoucherUsersList" },
        { id: "eventGenSettings", master: "eventsList" },
        { id: "eventResourceAdministration", master: "eventsList" },
        { id: "eventMediaAdministration", master: "eventsList" },
		    { id: "eventSeriesAdministration", master: "eventsList" },
		    { id: "eventQuestionnaire", master: "eventsList"},
        { id: "eventSpeakerAdministration", master: "eventsList"},
        { id: "genDataModDetails", master: "genDataModList" },
		    { id: "genDataModHisto", master: "genDataModList" },
        { id: "seriesResourceAdministration", master: "seriesList" },
        { id: "seriesMediaAdministration", master: "seriesList" },
        { id: "eventBaseLink", master: "startList" },
        { id: "startResourceAdministration", master: "startList" },
        { id: "startMediaAdministration", master: "startList" },
        //{ id: "genDataAnswers", master: "genDataQuestions" },
        { id: "startTileAdministration", master: "startTileAdministrationList" },
        { id: "mailing", master: "mailingListLS" },
        { id: "mailingOptions", master: "mailingListLS" },
        { id: "mailingList", master: "mailingVSList" },
        { id: "ticketLimits", master: "ticketLimitsList" },
        { id: "contactResultsList", master: "eventList" },
        { id: "eventStatus", master: "eventStatusList" },
        { id: "publish", master: "eventList" },
        { id: "event", master: "eventList" },
        { id: "eventCopy", master: "eventList" },
        { id: "siteeventsImport", master: "siteEventsList" },
        { id: "start", master: "eventList" },
        { id: "genDataEmployee", master: "genDataEmpList" },
        { id: "genDataUserInfo", master: "genDataEmpList" },
        { id: "genDataSkillEntry", master: "genDataEmpList" },
        { id: "employeeGenPWList", master: "genDataEmpList" },
        { id: "eventProducts", master: "eventList" }, 
        { id: "optQuestionList", master: "eventList" },
        { id: "questionList", master: "eventList" },
        { id: "questiongroup", master: "eventList" },
        { id: "optMandatoryFieldList", master: "eventList" },
        { id: "mandatory", master: "eventList" },
        { id: "reporting", master: "eventList" },
        { id: "reportingColumnList", master: "eventList" },
        { id: "contactResultsQuestion", master: "contactList" },
        { id: "contactResultsEdit", master: "contactList" },
        { id: "contactResultsAttach", master: "contactList" },
        //{ id: "contactResultsCriteria", master: "contactList" },
        //{ id: "contactResultsEvents", master: "contactList" },
        { id: "startPremium", master: "eventList" },
        { id: "adminAppHelpText", master: "adminAppHelpTextList" }
    ];

    // init page for app startup
    Application.initPage = Application.getPagePath("dbinit");
    // home page of app
    Application.startPage = Application.getPagePath("home");

    // new contact function select feature:
    Application.prevNavigateNewId = "newContact";
    // some more default page navigation handling
    Application.navigateByIdOverride = function (id, event) {
        Log.call(Log.l.trace, "Application.", "id=" + id);
        if (id === "dashBoard") {
            id = "start";
        } else if (id === "startPremium" && (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 3 || parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 4)) {
            id = "dashboardFN";
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
