// general data services 
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/sqlite.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dbinit.js" />
/// <reference path="~/plugins/cordova-plugin-device/www/device.js" />
/// <reference path="~/www/pages/appHeader/appHeaderController.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("AppData", {
        _generalUserView: {
            get: function () {
                return AppData.getFormatView("Mitarbeiter", 20463);
            }
        },
        generalUserView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "AppData.generalUserView.", "recordId=" + recordId);
                var ret = AppData._generalUserView.selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            isLocal: {
                get: function () {
                    return AppData._generalUserView.isLocal;
                }
            }
        },
        _generalUserMessageVIEW: {
            get: function () {
                return AppData.getFormatView("Benutzer", 20562);
            }
        },
        generalUserMessageVIEW: {
            select: function (complete, error) {
                Log.call(Log.l.trace, "AppData.generalUserView.");
                var ret = AppData._generalUserMessageVIEW.select(complete, error);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _generalContactView: {
            get: function () {
                return AppData.getFormatView("Kontakt", 20434);
            }
        },
        generalContactView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "AppData.generalContactView.", "recordId=" + recordId);
                var ret = AppData._generalContactView.selectById(complete, error, recordId);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _curGetUserDataId: 0,
        _curGetContactDataId: 0,
        _contactData: {},
        _userData: {
            VeranstaltungName: "",
            Login: "",
            Present: 0,
            PublishFlag: 0,
            VeranstaltungTyp: 0
        },
        _userMessagesData: {
            MessagesCounter: 0
        },
        _photoData: null,
        _barcodeType: null,
        _barcodeRequest: null,
        getRecordId: function (relationName) {
            Log.call(Log.l.trace, "AppData.", "relationName=" + relationName);
            // check for initial values
            if (typeof AppData._persistentStates.allRecIds === "undefined") {
                AppData._persistentStates.allRecIds = {};
            }
            if (typeof AppData._persistentStates.allRecIds[relationName] === "undefined") {
                if (relationName === "Mitarbeiter") {
                    if (AppData._userData) {
                        AppData._persistentStates.allRecIds[relationName] = AppData._userData.MitarbeiterVIEWID;
                    }
                } else if (relationName === "IMPORT_CARDSCAN") {
                    if (AppData._contactData) {
                        AppData._persistentStates.allRecIds[relationName] = AppData._contactData.IMPORT_CARDSCANID;
                    }
                } else if (relationName === "Veranstaltung") {
                    if (AppData._userData) {
                        AppData._persistentStates.allRecIds[relationName] = AppData._userData.VeranstaltungID;
                    } else {
                        if (typeof AppData.getUserData === "function") {
                            AppData.getUserData();
                        }
                        Log.ret(Log.l.trace, "undefined");
                        return null;
                    }
                } else {
                    Log.ret(Log.l.trace, "undefined");
                    return null;
                }
            }
            var ret = AppData._persistentStates.allRecIds[relationName];
            Log.ret(Log.l.trace, ret);
            return ret;
        },
        setRecordId: function (relationName, newRecordId) {
            Log.call(Log.l.trace, "AppData.", "relationName=" + relationName + " newRecordId=" + newRecordId);
            // check for initial values
            if (typeof AppData._persistentStates.allRecIds === "undefined") {
                AppData._persistentStates.allRecIds = {};
            }
            if (typeof AppData._persistentStates.allRecIds[relationName] === "undefined" ||
                !newRecordId || AppData._persistentStates.allRecIds[relationName] !== newRecordId) {
                AppData._persistentStates.allRecIds[relationName] = newRecordId;
                if (relationName === "Mitarbeiter") {
                    delete AppData._persistentStates.allRecIds["Veranstaltung"];
                    if (typeof AppData.getUserData === "function") {
                        AppData.getUserData();
                    }
                } else if (relationName === "Kontakt") {
                    // delete relationships
                    delete AppData._persistentStates.allRecIds["Zeilenantwort"];
                    delete AppData._persistentStates.allRecIds["KontaktNotiz"];
                    delete AppData._persistentStates.allRecIds["IMPORT_CARDSCAN"];
                    delete AppData._persistentStates.allRecIds["DOC1IMPORT_CARDSCAN"];
                    delete AppData._persistentStates.allRecIds["ImportBarcodeScan"];
                    AppData._photoData = null;
                    AppData._barcodeType = null;
                    AppData._barcodeRequest = null;
                    if (typeof AppData.getContactData === "function") {
                        AppData.getContactData();
                    }
                }
                Application.pageframe.savePersistentStates();
            }
            Log.ret(Log.l.trace);
        },
        getRestriction: function (relationName) {
            Log.call(Log.l.trace, "AppData.", "relationName=" + relationName);
            if (typeof AppData._persistentStates.allRestrictions === "undefined") {
                AppData._persistentStates.allRestrictions = {};
            }
            Log.ret(Log.l.trace);
            return AppData._persistentStates.allRestrictions[relationName];
        },
        setRestriction: function (relationName, newRestriction) {
            Log.call(Log.l.trace, ".", "relationName=" + relationName);
            if (typeof AppData._persistentStates.allRestrictions === "undefined") {
                AppData._persistentStates.allRestrictions = {};
            }
            AppData._persistentStates.allRestrictions[relationName] = newRestriction;
            Application.pageframe.savePersistentStates();
            Log.ret(Log.l.trace);
        },
        cancelPromises: function() {
            Log.call(Log.l.trace, "AppData.");
            if (AppData._userRemoteDataPromise) {
                AppData._userRemoteDataPromise.cancel();
                AppData._userRemoteDataPromise = null;
            }
            if (AppData._messagesDataPromise) {
                AppData._messagesDataPromise.cancel();
                AppData._messagesDataPromise = null;
            }
            Log.ret(Log.l.trace);
        },
        checkForNavigateToLogin: function (errorResponse) {
            Log.call(Log.l.trace, "AppData.");
            if (errorResponse && (errorResponse.status === 401 || errorResponse.status === 404)) {
                var curPageId = Application.getPageId(Application.navigator._lastPage);
                var onLoginPage = curPageId === "dbinit" || curPageId === "login" || curPageId === "account";
                if (errorResponse.status === 401 && !onLoginPage) {
                    // user is not authorized to access this service
                    AppBar.scope.binding.generalData.notAuthorizedUser = true;
                    //var errorMessage = getResourceText("general.unauthorizedUser");
                    AppBar.scope.binding.generalData.oDataErrorMsg = getResourceText("general.unauthorizedUser") + "\n\nError: " + (errorResponse && errorResponse.statusText);
                    alert(AppBar.scope.binding.generalData.oDataErrorMsg);
                }
                AppData.cancelPromises();
                if (!onLoginPage) {
                    WinJS.Promise.timeout(0).then(function () {
                        Application.navigateById("login");
                    });
                }
            }
            Log.ret(Log.l.trace);
        },
        getUserData: function () {
            var ret;
            //AppData._userRemoteDataPromise = null;
            Log.call(Log.l.trace, "AppData.");
            var userId = AppData.getRecordId("Mitarbeiter");
            if (!AppData.appSettings.odata.login ||
                !AppData.appSettings.odata.password) {
                Log.print(Log.l.trace, "getUserData: no logon information provided!");
                ret = WinJS.Promise.as();
            } else if (userId && userId !== AppData._curGetUserDataId) {
                AppData._curGetUserDataId = userId;
                ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select generalUserView...");
                    return AppData.generalUserView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "generalUserView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d) {
                            var prevUserData = AppData._userData;
                            AppData._userData = json.d;
                            Log.print(Log.l.info, "set my VeranstaltungID=" + AppData._userData.VeranstaltungID);
                            AppData.setRecordId("Veranstaltung", AppData._userData.VeranstaltungID);
                            Log.print(Log.l.info, "set my FairMandantID=" + AppData._userData.FairMandantID);
                            if (!AppData.getRecordId("FairMandant")) {
                                AppData.setRecordId("FairMandant", AppData._userData.FairMandantID);
                            }
                            if (!AppData.generalUserView.isLocal) {
                                AppData._userData.AnzLokaleKontakte = AppData._userData.AnzVersendeteKontakte;
                            }
                            if (AppData._userData.Present === null) {
                                // preset with not-on-site!
                                AppData._userData.Present = 0;
                            }
                            if (AppData._userData.EventCount > 1 || AppData._userData.VeranstaltungTyp === 1) {
                                NavigationBar.enablePage("eventsList");
                            } else {
                                NavigationBar.disablePage("eventsList");
                            }
                            //#8443 Midi - Admin cant see it - global/siteadmin still can see it
                            if (AppData._userData.IsMidiAdmin) {
                                NavigationBar.disablePage("genDataSkillEntry");
                            } else {
                                NavigationBar.enablePage("genDataSkillEntry");
                            }
                            if (typeof AppHeader === "object" &&
                                AppHeader.controller && AppHeader.controller.binding) {
                                AppHeader.controller.binding.userData = AppData._userData;
                                AppHeader.controller.binding.userMessagesDataCount = AppData._userMessagesData.MessagesCounter;
                                AppHeader.controller.binding.showNameInHeader = AppData._persistentStates.showNameInHeader;
                                // Call in homeController
                                AppHeader.controller.loadData();
                            }
                            if (typeof AppBar === "object" && AppBar.scope) {
                                if (typeof AppBar.scope.updateActions === "function" &&
                                    (!prevUserData ||
                                        prevUserData.VeranstaltungName !== AppData._userData.VeranstaltungName ||
                                        prevUserData.userName !== AppData._userData.userName ||
                                        prevUserData.AnzLokaleKontakte !== AppData._userData.AnzLokaleKontakte)) {
                                    AppBar.scope.updateActions();
                                }
                                if (AppBar.scope.binding && AppBar.scope.binding.generalData) {
                                    AppBar.scope.binding.generalData.publishFlag = AppData._userData.PublishFlag;
                                }
                            }
                            AppData.appSettings.odata.timeZoneAdjustment = AppData._userData.TimeZoneAdjustment;
                            Log.print(Log.l.info, "timeZoneAdjustment=" + AppData.appSettings.odata.timeZoneAdjustment);
                        }
                        AppData._curGetUserDataId = 0;
                        //TEST
                        if (AppData._userRemoteDataPromise) {
                            Log.print(Log.l.info, "Cancelling previous userRemoteDataPromise");
                            AppData._userRemoteDataPromise.cancel();
                        }
                        var timeout = 30;
                        Log.print(Log.l.info, "getUserRemoteData: Now, wait for timeout=" + timeout + "s");
                        AppData._userRemoteDataPromise = WinJS.Promise.timeout(timeout * 1000).then(function () {
                            Log.print(Log.l.info, "getUserRemoteData: Now, timeout=" + timeout + "s is over!");
                            AppData._curGetUserRemoteDataId = 0;
                            AppData.getUserData();
                        });
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        Log.print(Log.l.error, "error in select generalUserView statusText=" + (errorResponse && errorResponse.statusText));
                        AppData.checkForNavigateToLogin(errorResponse);
                        AppData._curGetUserDataId = 0;
                    }, userId);
                });
            } else {
                ret = WinJS.Promise.as();
            }
            Log.ret(Log.l.trace);
            return ret;
        },
        getMessagesData: function () {
            var ret;
            AppData._messagesDataPromise = null;
            Log.call(Log.l.trace, "AppData.");
            if (!AppData.appSettings.odata.login ||
                !AppData.appSettings.odata.password) {
                Log.print(Log.l.trace, "getUserData: no logon information provided!");
                ret = WinJS.Promise.as();
            } else {
                ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select generalUserMessageVIEW...");
                    return AppData.generalUserMessageVIEW.select(function (json) {
                        Log.print(Log.l.trace, "generalUserMessageVIEW: success!");
                        if (json && json.d) {
                            var prevUserMessagesData = AppData._userMessagesData;
                            AppData._userMessagesData.MessagesCounter = json.d.results.length;

                            if (typeof AppHeader === "object" &&
                                AppHeader.controller && AppHeader.controller.binding) {
                                AppHeader.controller.binding.userMessagesDataCount = AppData._userMessagesData.MessagesCounter;
                                //AppHeader.controller.loadData();
                            }
                        }
                        if (AppData._messagesDataPromise) {
                            Log.print(Log.l.info, "Cancelling previous messagesDataPromise");
                            AppData._messagesDataPromise.cancel();
                        }
                        var timeout = 30;
                        Log.print(Log.l.info, "getMessagesData: Now, wait for timeout=" + timeout + "s");
                        AppData._messagesDataPromise = WinJS.Promise.timeout(timeout * 1000).then(function () {
                            Log.print(Log.l.info, "getMessagesData: Now, timeout=" + timeout + "s is over!");
                            AppData.getMessagesData();
                        });
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        Log.print(Log.l.error, "error in select generalUserMessageVIEW statusText=" + (errorResponse && errorResponse.statusText));
                        AppData.checkForNavigateToLogin(errorResponse);
                    });
                });
            }
            Log.ret(Log.l.trace);
            return ret;
        },
        getContactData: function () {
            var ret;
            Log.call(Log.l.trace, "AppData.");
            var contactId = AppData.getRecordId("Kontakt");
            if (!contactId) {
                AppData._contactData = {};
                ret = WinJS.Promise.as();
            } else if (!AppData.appSettings.odata.login ||
                !AppData.appSettings.odata.password) {
                Log.print(Log.l.trace, "getContactData: no logon information provided!");
                ret = WinJS.Promise.as();
            } else if (contactId !== AppData._curGetContactDataId) {
                AppData._curGetContactDataId = contactId;
                ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select generalContactView...");
                    return AppData.generalContactView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "generalContactView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d) {
                            var prevContactData = AppData._contactData;
                            AppData._contactData = json.d;
                            if (AppData._contactData) {
                                if (typeof AppBar === "object" &&
                                    AppBar.scope && AppBar.scope.binding && AppBar.scope.binding.generalData) {
                                    AppBar.scope.binding.generalData.contactDate = AppData._contactData.Erfassungsdatum;
                                    AppBar.scope.binding.generalData.contactId = AppData._contactData.KontaktVIEWID;
                                    if (typeof AppBar.scope.updateActions === "function" &&
                                        (!prevContactData ||
                                            prevContactData !== AppData._contactData)) {
                                        AppBar.scope.updateActions(true);
                                    }
                                }
                            }
                        }
                        AppData._curGetContactDataId = 0;
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        Log.print(Log.l.error, "error in select generalContactView statusText=" + errorResponse.statusText);
                        AppData._curGetContactDataId = 0;
                    }, contactId);
                });
            } else {
                ret = WinJS.Promise.as();
            }
            Log.ret(Log.l.trace);
            return ret;
        },
        getContactDate: function () {
            Log.call(Log.l.u1, "AppData.");
            var ret;
            if (AppData._contactData &&
                AppData._contactData.Erfassungsdatum) {
                ret = AppData._contactData.Erfassungsdatum;
            } else {
                ret = "";
            }
            Log.ret(Log.l.u1, ret);
            return ret;
        },
        getContactDateString: function () {
            Log.call(Log.l.u1, "AppData.");
            var ret;
            if (AppData._contactData &&
                AppData._contactData.Erfassungsdatum) {
                // value now in UTC ms!
                var msString = AppData._contactData.Erfassungsdatum.replace("\/Date(", "").replace(")\/", "");
                var milliseconds = parseInt(msString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                var date = new Date(milliseconds);
                ret = date.toLocaleDateString();
            } else {
                ret = "";
            }
            Log.ret(Log.l.u1, ret);
            return ret;
        },
        getContactTimeString: function () {
            Log.call(Log.l.u1, "AppData.");
            var ret;
            if (AppData._contactData &&
                AppData._contactData.Erfassungsdatum) {
                // value now in UTC ms!
                var msString = AppData._contactData.Erfassungsdatum.replace("\/Date(", "").replace(")\/", "");
                var milliseconds = parseInt(msString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                var date = new Date(milliseconds);
                var hours = date.getHours();
                var minutes = date.getMinutes();
                ret = ((hours < 10) ? "0" : "") + hours.toString() + ":" +
                    ((minutes < 10) ? "0" : "") + minutes.toString();
            } else {
                ret = "";
            }
            Log.ret(Log.l.u1, ret);
            return ret;
        },
        getPropertyFromInitoptionTypeID: function (item) {
            Log.call(Log.l.u1, "AppData.");
            var color;
            var property = "";
            switch (item.INITOptionTypeID || item.OptionTypeID) {
                case 10:
                    item.colorPickerId = "individualColors";
                    property = item.colorPickerId;
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.individualColors = true;
                    } else if (AppData._persistentStates.individualColors) {
                        AppData._persistentStates.individualColors = false;
                        WinJS.Promise.timeout(0).then(function () {
                            AppData._persistentStates.colorSettings = copyByValue(AppData.persistentStatesDefaults.colorSettings);
                            var colors = new Colors.ColorsClass(AppData._persistentStates.colorSettings);
                            var promise = colors._loadCssPromise || WinJS.Promise.timeout(0);
                            promise.then(function () {
                                AppBar.loadIcons();
                                NavigationBar.groups = Application.navigationBarGroups;
                            });
                        });
                    }
                    break;
                case 11:
                    if (AppData._persistentStates.individualColors) {
                        item.colorPickerId = "accentColor";
                        property = "accentColor";
                        if (!item.LocalValue && AppData.persistentStatesDefaults.colorSettings) {
                            color = AppData.persistentStatesDefaults.colorSettings[property];
                            item.LocalValue = color && color.replace("#", "");
                        }
                    }
                    break;
                case 12:
                    if (AppData._persistentStates.individualColors) {
                        item.colorPickerId = "backgroundColor";
                        property = "backgroundColor";
                        if (!item.LocalValue && AppData.persistentStatesDefaults.colorSettings) {
                            color = AppData.persistentStatesDefaults.colorSettings[property];
                            item.LocalValue = color && color.replace("#", "");
                        }
                    }
                    break;
                case 13:
                    if (AppData._persistentStates.individualColors) {
                        item.colorPickerId = "navigationColor";
                        property = "navigationColor";
                        if (!item.LocalValue && AppData.persistentStatesDefaults.colorSettings) {
                            color = AppData.persistentStatesDefaults.colorSettings[property];
                            item.LocalValue = color && color.replace("#", "");
                        }
                    }
                    break;
                case 14:
                    if (AppData._persistentStates.individualColors) {
                        item.colorPickerId = "textColor";
                        property = "textColor";
                        if (!item.LocalValue && AppData.persistentStatesDefaults.colorSettings) {
                            color = AppData.persistentStatesDefaults.colorSettings[property];
                            item.LocalValue = color && color.replace("#", "");
                        }
                    }
                    break;
                case 15:
                    if (AppData._persistentStates.individualColors) {
                        item.colorPickerId = "labelColor";
                        property = "labelColor";
                        if (!item.LocalValue && AppData.persistentStatesDefaults.colorSettings) {
                            color = AppData.persistentStatesDefaults.colorSettings[property];
                            item.LocalValue = color && color.replace("#", "");
                        }
                    }
                    break;
                case 16:
                    if (AppData._persistentStates.individualColors) {
                        item.colorPickerId = "tileTextColor";
                        property = "tileTextColor";
                        if (!item.LocalValue && AppData.persistentStatesDefaults.colorSettings) {
                            color = AppData.persistentStatesDefaults.colorSettings[property];
                            item.LocalValue = color && color.replace("#", "");
                        }
                    }
                    break;
                case 17:
                    if (AppData._persistentStates.individualColors) {
                        item.colorPickerId = "tileBackgroundColor";
                        property = "tileBackgroundColor";
                        if (!item.LocalValue && AppData.persistentStatesDefaults.colorSettings) {
                            color = AppData.persistentStatesDefaults.colorSettings[property];
                            item.LocalValue = color && color.replace("#", "");
                        }
                    }
                    break;
                case 18:
                    if (AppData._persistentStates.individualColors) {
                        if (AppData._persistentStates.manualTheme) {
                            if (item.LocalValue === "1") {
                                AppData._persistentStates.isDarkTheme = true;
                            } else {
                                AppData._persistentStates.isDarkTheme = false;
                            }
                            Colors.isDarkTheme = AppData._persistentStates.isDarkTheme;
                        }
                    }
                    break;
                case 19:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.showCameraQuestionnaire = true;
                    } else {
                        AppData._persistentStates.showCameraQuestionnaire = false;
                    }
                    break;
                case 20:
                    item.pageProperty = "questionnaire";
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.hideQuestionnaire = true;
                    } else {
                        AppData._persistentStates.hideQuestionnaire = false;
                    }
                    break;
                case 21:
                    item.pageProperty = "sketch";
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.hideSketch = true;
                    } else {
                        AppData._persistentStates.hideSketch = false;
                    }
                    break;
                case 23:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.hideBarcodeScan = true;
                    } else {
                        AppData._persistentStates.hideBarcodeScan = false;
                    }
                    break;
                case 24:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.hideCameraScan = true;
                    } else {
                        AppData._persistentStates.hideCameraScan = false;
                    }
                    break;
                case 30:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.productMailOn = true;
                    } else {
                        AppData._persistentStates.productMailOn = false;
                    }
                    break;
                case 31:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.thankYouMailOn = true;
                    } else {
                        AppData._persistentStates.thankYouMailOn = false;
                    }
                    break;
                case 34:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.privacyPolicySVGVisible = true;
                    } else {
                        AppData._persistentStates.privacyPolicySVGVisible = false;
                    }
                    break;
                case 35:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.nachbearbeitetFlagAutoSetToNull = true;
                    } else {
                        AppData._persistentStates.nachbearbeitetFlagAutoSetToNull = false;
                    }
                    break;
                case 38:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.showQRCode = true;
                    } else {
                        AppData._persistentStates.showQRCode = false;
                    }
                    break;
                case 39:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.showNameInHeader = true;
                    } else {
                        AppData._persistentStates.showNameInHeader = false;
                    }
                    break;
                case 44:
                    // Enable bzw. disable wird hier behandelt, da umgekehrte Logik mit Anzeigewert
                    if (parseInt(item.LocalValue) === 1 || parseInt(item.LocalValue) === 2) {
                        AppData._persistentStates.showvisitorFlow = parseInt(item.LocalValue);
                        // NavigationBar.enablePage("employee");
                        /* NavigationBar.enablePage("visitorFlowDashboard");
                        NavigationBar.enablePage("visitorFlowEntExt");
                        NavigationBar.enablePage("employeeVisitorFlow");/*pagename muss wahrscheinlich nochmal geändert werden, jenachdem wie die seite heisst*/
                    } else {
                        AppData._persistentStates.showvisitorFlow = 0;
                        //NavigationBar.disablePage("employeeVisitoFlow");
                        /*NavigationBar.disablePage("visitorFlowDashboard");
                        NavigationBar.disablePage("visitorFlowEntExt");
                        NavigationBar.disablePage("employeeVisitorFlow");*/
                    }
                    break;
                case 45:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.visitorFlowPremium = true;
                    } else {
                        AppData._persistentStates.visitorFlowPremium = false;
                    }
                    break;
                case 46:
                    if (AppData._persistentStates.individualColors) {
                        item.colorPickerId = "dashboardColor";
                        property = "dashboardColor";
                        if (!item.LocalValue && AppData.persistentStatesDefaults.colorSettings) {
                            color = AppData.persistentStatesDefaults.colorSettings[property];
                            item.LocalValue = color && color.replace("#", "");
                        }
                    }
                    break;
                case 47:
                    if (parseInt(item.LocalValue) === 1 || parseInt(item.LocalValue) === 2 || parseInt(item.LocalValue) === 3 || parseInt(item.LocalValue) === 4) {
                        AppData._persistentStates.showdashboardMesagoCombo = parseInt(item.LocalValue);
                        /* NavigationBar.enablePage("visitorFlowDashboard");
                         NavigationBar.enablePage("visitorFlowEntExt");
                         NavigationBar.enablePage("employeeVisitorFlow");/*pagename muss wahrscheinlich nochmal geändert werden, jenachdem wie die seite heisst*/
                    } else {
                        AppData._persistentStates.showdashboardMesagoCombo = 0;
                        /*NavigationBar.disablePage("visitorFlowDashboard");
                        NavigationBar.disablePage("visitorFlowEntExt");
                        NavigationBar.disablePage("employeeVisitorFlow");*/
                    }
                    break;
                case 49:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.sendMailPrivacypolicy = true;
                    } else {
                        AppData._persistentStates.sendMailPrivacypolicy = false;
                    }
                    break;
                case 50:
                    //if (item.LocalValue === "1") {
                    AppData._persistentStates.visitorFlowInterval = item.LocalValue;
                    /*} else {
                        AppData._persistentStates.visitorFlowInterval = false;
                    }*/
                    break;
                case 51:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.leadsuccessBasic = true;
                    } else {
                        AppData._persistentStates.leadsuccessBasic = false;
                    }
                    break;
                case 52:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.hideManually = true;
                    } else {
                        AppData._persistentStates.hideManually = false;
                    }
                    break;
                default:
                // defaultvalues
            }
            if (item.pageProperty) {
                if (item.LocalValue === "1") {
                    NavigationBar.disablePage(item.pageProperty);
                } else {
                    NavigationBar.enablePage(item.pageProperty);
                }
            }
            Log.ret(Log.l.u1, property);
            return property;
        },
        applyColorSetting: function (colorProperty, color) {
            Log.call(Log.l.u1, "AppData.", "colorProperty=" + colorProperty + " color=" + color);
            Colors[colorProperty] = color;
            switch (colorProperty) {
                case "accentColor":
                // fall through...
                case "navigationColor":
                    AppBar.loadIcons();
                    NavigationBar.groups = Application.navigationBarGroups;
                    break;
            }
            Log.ret(Log.l.u1);
        },
        getLogo: function () {
            switch (AppData._userData.VeranstaltungTyp) {
                case 0:
                    return "leadsuccess_white";
                case 1:
                    return "livebrigde_white_logo";
                case 2:
                    return "eventsuccess_white_logo";
                default:
                    return "leadsuccess_white";
            }
        },
        getSupportString: function () {
            if (AppData._userData.VeranstaltungTyp === 1) {
                return getResourceText("support.urllivebridge");
            } else {
                return getResourceText("support.urlleadsuccess");
            }
        },
        getEventColor: function () {
            if (!AppData._persistentStates.individualColors &&
                AppData._userData && typeof AppData._userData.VeranstaltungTyp === "number" &&
                AppData.persistentStatesDefaults.colorSettingsDefaults) {
                var dashboardColorType = 0;
                if (AppData._userData.VeranstaltungTyp === 0) {
                    //if(AppData._userData.isSupreme === "1")
                    switch (AppData._userData.IsSupreme) {
                        case "1":
                            // type 3 
                            dashboardColorType = 3;
                            break;
                        case "2":
                            // type 4
                            dashboardColorType = 4;
                            break;
                        default:
                    }
                }
                var colorSettings =
                    AppData.persistentStatesDefaults.colorSettingsDefaults[dashboardColorType ||
                    AppData._userData.VeranstaltungTyp] ||
                    AppData.persistentStatesDefaults.colorSettingsDefaults[0];
                if (colorSettings) {
                    AppData.persistentStatesDefaults.colorSettings = copyByValue(colorSettings);
                }
                return AppData.persistentStatesDefaults.colorSettings.accentColor;
            } else {
                return null;
            }
        },
        generalData: {
            get: function () {
                var data = AppData._persistentStates;
                data.logTarget = Log.targets.console;
                data.setRecordId = AppData.setRecordId;
                data.getRecordId = AppData.getRecordId;
                data.setRestriction = AppData.setRestriction;
                data.getRestriction = AppData.getRestriction;
                data.contactDateTime = (function () {
                    return (AppData.getContactDateString() + " " + AppData.getContactTimeString());
                })();
                data.eventId = AppData._userData.VeranstaltungID;
                data.eventName = AppData._userData.VeranstaltungName;
                data.userName = AppData._userData.Login;
                data.userPresent = AppData._userData.Present;
                data.publishFlag = AppData._userData.PublishFlag;
                data.exportPath = AppData._userData.VeranstText_1;
                data.contactDate = (AppData._contactData && AppData._contactData.Erfassungsdatum);
                data.contactId = (AppData._contactData && AppData._contactData.KontaktVIEWID);
                data.globalContactID = ((AppData._contactData && AppData._contactData.CreatorRecID)
                    ? (AppData._contactData.CreatorSiteID + "/" + AppData._contactData.CreatorRecID)
                    : "");
                data.on = getResourceText("settings.on");
                data.off = getResourceText("settings.off");
                data.yes = getResourceText("settings.yes");
                data.no = getResourceText("settings.no");
                data.filterOn = getResourceText("reporting.filterOn");
                data.filterOff = getResourceText("reporting.filterOff");
                data.dark = getResourceText("settings.dark");
                data.light = getResourceText("settings.light");
                data.system = getResourceText("settings.system");
                data.present = getResourceText("userinfo.present");
                data.absend = getResourceText("userinfo.absend");
                data.active = getResourceText("settings.active");
                data.inactive = getResourceText("settings.inactive");
                data.logo = AppData.getLogo();
                data.eventColor = AppData.getEventColor();
                return data;
            }
        },
        prevLogin: null,
        prevPassword: null,
        _initAnredeView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITAnrede");
            }
        },
        _initLandView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITLand");
            }
        },
        initAnredeView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "AppData.initAnredeView.");
                var ret = AppData._initAnredeView.select(complete, error, recordId, { ordered: true, orderByValue: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "AppData.initAnredeView.");
                var ret = AppData._initAnredeView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "AppData.initAnredeView.");
                var ret = AppData._initAnredeView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        initLandView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "AppData.initLandView.");
                var ret = AppData._initLandView.select(complete, error, recordId, { ordered: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "AppData.initLandView.");
                var ret = AppData._initLandView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "AppData.initLandView.");
                var ret = AppData._initLandView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        getOptions: function (complete, error, param) {
            Log.call(Log.l.trace, "AppData.getVAOptions.");
            var ret = AppData.call("PRC_GetOptions", {
                pVeranstaltungID: param["VeranstaltungID"] || 0,
                pMandantWide: param["MandantWide"] || 0,
                pIsForApp: param["IsForApp"] || 0
            }, function (json) {
                Log.print(Log.l.info, "call PRC_GetOptions: success! ");
                complete(json);
            }, function (err) {
                Log.print(Log.l.error, "call PRC_GetOptions: error");
                error(err);
            });
            Log.ret(Log.l.trace);
            return ret;
        },
        getHelpText: function (pageId) {
            Log.call(Log.l.trace, "AppData.getHelpText.");
            var result = null;
            var lang = AppData.getLanguageId();
            var ret = AppData.call("PRC_GetAppHelpText", {
                pAppProjectTitle: "Portal",
                pStartPageTitle: pageId,
                pLanguageSpecID: lang
            }, function (json) {
                Log.print(Log.l.info, "call PRC_GetAppHelpText: success! ");
                result = json && json.d && json.d.results && json.d.results[0];
            }, function (error) {
                Log.print(Log.l.error, "call PRC_GetAppHelpText: error");
            }, !AppData.getOnlineLogin(false) || !AppData.getOnlinePassword(false)).then(function () {
                return result;
            });
            Log.ret(Log.l.trace);
            return ret;
        },
        setHelpTextUserStatus: function (helpTextId, hidden) {
            Log.call(Log.l.trace, "AppData.setHelpTextUserStatus.");
            var result = null;
            var lang = AppData.getLanguageId();
            var ret = AppData.call("PRC_SetAppHelpTextUserStatus", {
                pAppHelpTextID: helpTextId,
                pHidden: hidden
            }, function (json) {
                Log.print(Log.l.info, "call PRC_SetAppHelpTextUserStatus: success! ");
                result = json && json.d && json.d.results && json.d.results[0];
            }, function (error) {
                Log.print(Log.l.error, "call PRC_SetAppHelpTextUserStatus: error");
            }).then(function () {
                return result;
            });
            Log.ret(Log.l.trace);
            return ret;
        },
        getLangSpecErrorMsg: function (resultMessageId) {
            Log.call(Log.l.trace, "AppData.getLangSpecErrorMsg.");
            var messageValue = "";
            var lang = AppData.getLanguageId();
            var ret = AppData.call("PRC_GetLangText", {
                pTextID: resultMessageId,
                pLanguageID: lang
            }, function (json) {
                Log.print(Log.l.info, "call PRC_GetLangText: success! ");
                messageValue = json && json.d && json.d.results && json.d.results[0] && json.d.results[0].ResultText;
            }, function (error) {
                Log.print(Log.l.error, "call PRC_GetLangText: error");

            }).then(function () {
                return messageValue;
            });
            Log.ret(Log.l.trace);
            return ret;
        },
        getErrorMsgFromErrorStack: function (errorMsg) {
            Log.call(Log.l.trace, "AppData.getLangSpecErrorMsg.");
            var ret;
            if (!errorMsg || !errorMsg.data || !errorMsg.data.error || !errorMsg.data.error.message) {
                ret = WinJS.Promise.as();
            } else {
                var resultMessageId = null;
                ret = AppData.call("PRC_GetErrorStack", {
                }, function (json) {
                    Log.print(Log.l.info, "call PRC_GetErrorStack: success! ");
                    //AppBar.modified = false;
                    if (json && json.d && json.d.results && json.d.results.length > 0) {
                        errorMsg.data.error.code = json.d.results[0].ResultCode;
                        if (json.d.results[0].ResultMessageID > 0) {
                            resultMessageId = json.d.results[0].ResultMessageID;
                            //errorMsg.data.error.message.value = AppData.getLangSpecErrorMsg(json.d.results[0].ResultMessageID, errorMsg);
                        } else {
                            errorMsg.data.error.message.value = json.d.results[0].ResultMessage;
                            AppData.setErrorMsg(AppBar.scope.binding, errorMsg);
                        }
                    }
                }, function (error) {
                    Log.print(Log.l.error, "call PRC_GetErrorStack: error");
                    //AppBar.modified = false;
                }).then(function () {
                    if (resultMessageId) {
                        return AppData.getLangSpecErrorMsg(resultMessageId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function (messageValue) {
                    if (messageValue) {
                        errorMsg.data.error.message.value = messageValue;
                    }
                });
            }
            Log.ret(Log.l.trace);
            return ret;
        }
    });

    // forward declarations used in binding converters
    WinJS.Namespace.define("Settings", {
        getInputBorderName: null
    });
    WinJS.Namespace.define("Info", {
        getLogLevelName: null
    });
    // usage of binding converters
    //
    //<span 
    //
    //       // display element if value is set:
    //
    //       data-win-bind="textContent: loginModel.userName; style.display: loginModel.userName Binding.Converter.toDisplay" 
    //
    WinJS.Namespace.define("Binding.Converter", {
        toLogLevelName: WinJS.Binding.converter(function (value) {
            return (typeof Info.getLogLevelName === "function" && Info.getLogLevelName(value));
        }),
        toInputBorderName: WinJS.Binding.converter(function (value) {
            return (typeof Settings.getInputBorderName === "function" && Settings.getInputBorderName(value));
        }),
        //@Hung:23.10.2020 convert the value(id) to icon
        /**
         * @member getIconFromID
         * @memberof Binding.Converter
         * @description Use the Binding.Converter.getIconFromID to covert a id value to icon:
         */
        getIconFromID: function (value, context) {
            var icon = null;
            if (value === 1) {
                icon = "users_relation";
            } else if (value === 2) {
                icon = "users3";
            } else if (value === 3) {
                //icon = "engineer";
                //CustomerGroupAdmin
                icon = "cust_admin";
            } else if (value === 4) {
                //icon = "user_smartphone";
                //APP-User
                icon = "local";
            } else if (value === 5) {
                //icon = "checkInOut";
                //SERVICE-User
                icon = "engineer";
            } else if (value === 6) {
                icon = "graphics_tablet";
            } else if (value === 7) {
                //Alles andere, d.h. User die in keine andere Kategorie fallen, also z.B. User ohne explizite Benutzergruppe
                icon = "benutzer_unknow";
            } else if (value === 8) {
                //icon = "clock";
                //VisitorFlow-Scanner
                icon = "visiterflow";
            } else if (value === 9) {
                //icon = "calendar_clock";
                //MidiAdminGroup
                icon = "midi_admin";
            } else if (value === 10) {
                //Temp-Admin
                icon = "tmp_admin";
            } else if (value === 11) {
                //Reporting
                icon = "reporting";
            } else if (value === 12) {
                //Kiosk-User
                icon = "kioskuser";
            } else if (value === 13) {
                //API-User
                icon = "api";
            } else if (value === 14) {
                //InfoDesk
                icon = "infodesk";
            } else if (value === 15) {
                //LiveBridge-User
                icon = "livebridge";
            } else if (value === 16) {
                //Nachbearbeitung
                icon = "revision";
            }
            return icon;
        }
    });

})();