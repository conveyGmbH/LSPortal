// controller for page: login
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/winjs-es6promise.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dbinit.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/replService.js" />
/// <reference path="~/www/lib/twoFactorLib/scripts/twoFactorLib.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/login/loginService.js" />
/// <reference path="~/www/pages/home/homeService.js" />

(function () {
    "use strict";

    var namespaceName = "Login";

    WinJS.Namespace.define("Login", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Login.Controller.");
            // delete login data first
            AppData._persistentStates.odata.login = null;
            AppData._persistentStates.odata.password = null;
            AppData._persistentStates.odata.dbSiteId = null;
            AppData._persistentStates.visitorFlowInterval = null;
            AppData._persistentStates.allRestrictions = {};
            var allRecIds = {};
            // #8650 Merke ID von Terminliste und Ausstellerliste
            if (AppData._persistentStates.allRecIds &&
                AppData._persistentStates.allRecIds.PRC_GetExhibitorList) {
                allRecIds.PRC_GetExhibitorList = AppData._persistentStates.allRecIds.PRC_GetExhibitorList;
            }
            if (AppData._persistentStates.allRecIds &&
                AppData._persistentStates.allRecIds.VeranstaltungTermin) {
                allRecIds.VeranstaltungTermin = AppData._persistentStates.allRecIds.VeranstaltungTermin;
            }
            if (typeof AppData._persistentStates.allRecIds === "undefined") {
                AppData._persistentStates.allRecIds = {};
            } else {
                AppData._persistentStates.allRecIds = allRecIds;
            }
            AppData._userData = AppData._userDataDefault;
            AppData._userRemoteData = {};
            AppData._contactData = AppData._contactDataDefault;
            AppData._photoData = null;
            AppData._barcodeType = null;
            AppData._barcodeRequest = null;
            Application.pageframe.savePersistentStates();

            Application.Controller.apply(this, [pageElement, {
                dataLogin: {
                    Login: "",
                    Password: "",
                    privacyPolicyFlag: false,
                    privacyPolicydisabled: false
                },
                isPrivacyPolicyFlag: AppData._persistentStates.privacyPolicyFlag,
                hideLoginData: false,
                progress: {
                    percent: 0,
                    text: "",
                    show: null
                },
                showWaitCircle: false
            }, commandList]);

            var that = this;

            // TFA UI
            var tfaContainer = pageElement.querySelector("#tfa-container");

            var privacyPolicyLink = pageElement.querySelector("#privacyPolicyLink");
            if (privacyPolicyLink) {
                privacyPolicyLink.innerHTML = "<a class=\"checkbox\" href=\"https://" + getResourceText("login.privacyPolicyLink") + "\" target=\"_blank\">" + getResourceText("login.privacyPolicy") + "</a>";
            }

            this.dispose = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (tfaContainer && TwoFactorLib && typeof TwoFactorLib.clear === "function") {
                    TwoFactorLib.clear(tfaContainer);
                }
                Log.ret(Log.l.trace);
            }

            // define handlers
            this.eventHandlers = {
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Login.Controller.");
                    that.saveData(function (response) {
                        // called asynchronously if ok
                        var splitviewPaneWrapper = document.querySelector(".win-splitview-panewrapper");
                        if (splitviewPaneWrapper && splitviewPaneWrapper.style) {
                            splitviewPaneWrapper.style.width = "";
                            splitviewPaneWrapper.style.maxWidth = "";
                        }
                        Application.navigateById(Application.startPageId);
                    }, function (errorResponse) {
                        // already handled
                    });
                    Log.ret(Log.l.trace);
                },
                clickAccount: function (event) {
                    Log.call(Log.l.trace, "Login.Controller.");
                    Application.navigateById("newAccount", event, true);
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Login.Controller.");
                    //ignore that here!
                    Application.navigateById("newAccount", event, true);
                    Log.ret(Log.l.trace);
                },
                clickPrivacyPolicy: function (event) {
                    Log.call(Log.l.trace, "Login.Controller.");
                    if (event && event.currentTarget) {
                        that.binding.isPrivacyPolicyFlag = event.currentTarget.checked;
                        AppData._persistentStates.privacyPolicyFlag = event.currentTarget.checked;
                        AppBar.triggerDisableHandlers();
                    }
                    Log.ret(Log.l.trace);
                },
                clickPasswordRecovery: function (event) {
                    Log.call(Log.l.trace, "Login.Controller");
                    Application.navigateById("recover", event, true);
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickOk: function () {
                    var ret = AppBar.busy || !that.binding.dataLogin.Login || !that.binding.dataLogin.Password || !that.binding.isPrivacyPolicyFlag;
                    if (ret) {
                        NavigationBar.disablePage("home");
                        NavigationBar.disablePage("localevents");
                        NavigationBar.disablePage("siteevents");
                        NavigationBar.disablePage("events");
                        NavigationBar.disablePage("questionList");
                        NavigationBar.disablePage("mailing");
                        NavigationBar.disablePage("employee");
                        NavigationBar.disablePage("contacts");
                        NavigationBar.disablePage("reporting");
                        NavigationBar.disablePage("infodesk");
                        NavigationBar.disablePage("settings");
                        NavigationBar.disablePage("info");
                        NavigationBar.disablePage("search");
                        NavigationBar.disablePage("support");
                    } else {
                        NavigationBar.enablePage("home");
                    }
                    if (!that.binding.dataLogin.Login || !that.binding.dataLogin.Password) {
                        that.binding.dataLogin.privacyPolicyFlag = false;
                        that.binding.dataLogin.privacyPolicydisabled = false;
                        that.binding.isPrivacyPolicyFlag = false;
                    }
                    var loginButton = pageElement.querySelector("#loginButton");
                    if (loginButton) {
                        loginButton.disabled = ret;
                    }
                    return ret;
                }
            };

            var resultConverter = function (item, index) {
                var property = AppData.getPropertyFromInitoptionTypeID(item);
                if (property && property !== "individualColors" && (!item.pageProperty) && item.LocalValue) {
                    item.colorValue = "#" + item.LocalValue;
                    AppData.applyColorSetting(property, item.colorValue);
                }
            }
            this.resultConverter = resultConverter;

            var setServerList = function (results) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (results) {
                    for (var i = 0; i < results.length; i++) {
                        var row = results[i];
                        if (row.IsActive === "1") {
                            Log.print(Log.l.info, "found LanguageId=" + row.LocationID);
                            if (AppHeader && AppHeader.controller && AppHeader.controller.binding) {
                                AppHeader.controller.binding.LocationID = row.LocationID;
                                AppHeader.controller.binding.ServerName = row.LocationName;
                            }
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }

            var tfaVerify = function () {
                var ret = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.");

                if (tfaContainer && TwoFactorLib && typeof TwoFactorLib.verify2FA === "function") {
                    // Hiermit soll die Oberfläche für die TFA-Authentifizierung (Popup-Dialog) erzeugt werden
                    ret = toWinJSPromise(
                        TwoFactorLib.verify2FA(
                            tfaContainer, 
                            that.binding.dataLogin.Login,
                            that.binding.dataLogin.Password,
                            
                            function setDBPassword(dbPassword) {
                                that.binding.dataLogin.Password = dbPassword;
                                
                                console.log('verify2FA loaded');
                            },                    
                    Application.language, 
                    that.binding.appSettings.odata.hostName
                ));
                } else {
                    Log.print(Log.info, "No twofactorLib was found");
                }
                Log.ret(Log.l.trace);
                return ret;
            }

            var saveData = function (complete, error) {
                var err = null, response = null, hasTwoFactor = null;
                Log.call(Log.l.trace, "Login.Controller.");
                var ret;
                if (!AppBar.modified) {
                    ret = WinJS.Promise.as();
                    complete({});
                } else {
                    that.binding.messageText = null;
                    AppData.setErrorMsg(that.binding);
                    that.binding.appSettings.odata.onlinePath = AppData._persistentStatesDefaults.odata.onlinePath;
                    that.binding.appSettings.odata.registerPath = AppData._persistentStatesDefaults.odata.registerPath;
                    AppData.cancelPromises();
                    AppBar.busy = true;
                    ret = Login.loginRequest.insert(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.call(Log.l.trace, "loginRequest: success!");
                        // loginData returns object already parsed from json file in response
                        if (json && json.d && json.d.ODataLocation) {
                            if (json.d.InactiveFlag) {
                                AppBar.busy = false;
                                err = { status: 503, statusText: getResourceText("account.inactive") };
                                AppData.setErrorMsg(that.binding, err);
                                error(err);
                            } else {
                                hasTwoFactor = json.d.HasTwoFactor;
                                var location = json.d.ODataLocation;
                                if (location !== AppData._persistentStatesDefaults.odata.onlinePath) {
                                    that.binding.appSettings.odata.onlinePath = location + that.binding.appSettings.odata.onlinePath;
                                    that.binding.appSettings.odata.registerPath = location + that.binding.appSettings.odata.registerPath;
                                }
                                Application.pageframe.savePersistentStates();
                            }
                        } else {
                            AppBar.busy = false;
                            err = { status: 404, statusText: getResourceText("login.unknown") };
                            AppData.setErrorMsg(that.binding, err);
                            error(err);
                        }
                        return WinJS.Promise.as();
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        Log.print(Log.l.info, "loginRequest error: " + AppData.getErrorMsgFromResponse(errorResponse) + " ignored for compatibility!");
                        // ignore this error here for compatibility!
                        return WinJS.Promise.as();
                    }, {
                        LoginName: that.binding.dataLogin.Login
                    }).then(function () {
                        // nur aufrufen wenn in DB TFA eingetragen ist
                        if (hasTwoFactor) {
                            return tfaVerify().then(function (tfaResult) {
                                that.binding.showWaitCircle = true;
                                // now wait 1s for the DB-USer to be changed....
                                return WinJS.Promise.timeout(2000).then(function () {
                                    return WinJS.Promise.as(tfaResult);
                                });
                            }) || WinJS.Promise.as();
                        } else {
                            return WinJS.Promise.as();
                        }
                    }).then(function (tfaResult) {
                        if (tfaResult && tfaResult.status !== "success") {
                            // Behandlung TFA-Result-Fehler..
                            // besser Fehler message-text in übergebener language
                            that.binding.showWaitCircle = false;
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, tfaResult.message);
                            err = { status: 401, statusText: tfaResult.message };
                            return WinJS.Promise.as();
                        } else if (!err) {
                            var dataLogin = {
                                Login: that.binding.dataLogin.Login,
                                Password: that.binding.dataLogin.Password,
                                LanguageID: AppData.getLanguageId(),
                                Aktion: "Portal"
                            };
                            return Login.loginView.insert(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.call(Log.l.trace, "loginData: success!");
                                // loginData returns object already parsed from json file in response
                                if (json && json.d) {
                                    dataLogin = json.d;
                                    AppBar.modified = false;
                                    if (dataLogin.OK_Flag === "X" && dataLogin.MitarbeiterID) {
                                        AppData._persistentStates.odata.login = that.binding.dataLogin.Login;
                                        AppData._persistentStates.odata.password = that.binding.dataLogin.Password;
                                        AppData.setRecordId("Mitarbeiter", dataLogin.MitarbeiterID);
                                        AppData.setRecordId("Veranstaltung2", null);
                                        response = json;
                                    } else {
                                        that.binding.showWaitCircle = false;
                                        AppBar.busy = false;
                                        that.binding.messageText = dataLogin.MessageText;
                                        err = { status: 401, statusText: dataLogin.MessageText };
                                        AppData.setErrorMsg(that.binding, err);
                                        error(err);
                                    }
                                } else {
                                    that.binding.showWaitCircle = false;
                                    AppBar.busy = false;
                                    err = { status: 404, statusText: "no data found" };
                                    AppData.setErrorMsg(that.binding, err);
                                    error(err);
                                }
                            }, function (errorResponse) {
                                that.binding.showWaitCircle = false;
                                AppBar.busy = false;
                                err = errorResponse;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                error(errorResponse);
                            }, dataLogin);
                        } else {
                            that.binding.showWaitCircle = false;
                            return WinJS.Promise.as();
                        }
                    }).then(function () {
                        if (!err) {
                            AppData._curGetUserDataId = 0;
                            AppData.getMessagesData();
                            return AppData.getUserData();
                        } else {
                            return WinJS.Promise.as();
                        }
                    }).then(function () {
                        if (!err) {
                            // load color settings
                            AppData._persistentStates.hideQuestionnaire = false;
                            AppData._persistentStates.hideSketch = false;
                            AppData._persistentStates.productMailOn = true;
                            AppData._persistentStates.thankMailOn = true;
                            Application.pageframe.savePersistentStates();
                            return AppData.getOptions(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "Login: success!");
                                // CR_VERANSTOPTION_ODataView returns object already parsed from json file in response
                                if (json && json.d && json.d.results && json.d.results.length > 1) {
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                    });
                                    Application.pageframe.savePersistentStates();
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppBar.busy = false;
                                that.binding.showWaitCircle = false;
                                err = errorResponse;
                                error(errorResponse);
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, {
                                VeranstaltungID: AppData.getRecordId("Veranstaltung"), // 0
                                MandantWide: 1, // 0
                                IsForApp: 0
                            }).then(function () {
                                var colors = Colors.updateColors();
                                return (colors && colors._loadCssPromise) || WinJS.Promise.as();
                            }).then(function () {
                                AppBar.loadIcons();
                                NavigationBar.groups = Application.navigationBarGroups;
                                if (AppHeader &&
                                    AppHeader.controller &&
                                    typeof AppHeader.controller.reloadMenu === "function") {
                                    AppHeader.controller.reloadMenu();
                                }
                                return WinJS.Promise.as();
                            });
                        } else {
                            return WinJS.Promise.as();
                        }
                    }).then(function () {
                        if (!err) {
                            if (typeof Home === "object" && Home._actionsList) {
                                Home._actionsList = null;
                            }
                            return Login.appListSpecView.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "appListSpecView: success!");
                                // kontaktanzahlView returns object already parsed from json file in response
                                AppBar.busy = false;
                                NavigationBar.enablePage("home");
                                NavigationBar.enablePage("localevents");
                                NavigationBar.enablePage("siteevents");
                                NavigationBar.enablePage("events");
                                NavigationBar.enablePage("questionList");
                                NavigationBar.enablePage("mailing");
                                NavigationBar.enablePage("employee");
                                NavigationBar.enablePage("contacts");
                                NavigationBar.enablePage("reporting");
                                NavigationBar.enablePage("infodesk");
                                NavigationBar.enablePage("settings");
                                NavigationBar.enablePage("info");
                                NavigationBar.enablePage("search");
                                NavigationBar.enablePage("support");
                                if (json && json.d && json.d.results) {
                                    NavigationBar.showGroupsMenu(json.d.results);
                                } else {
                                    NavigationBar.showGroupsMenu([]);
                                }
                                return WinJS.Promise.as();
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppBar.busy = false;
                                that.binding.showWaitCircle = false;
                                err = errorResponse;
                                AppData.setErrorMsg(that.binding, errorResponse);
                                error(errorResponse);
                                return WinJS.Promise.as();
                            });
                        } else {
                            return WinJS.Promise.as();
                        }
                    }).then(function () {
                        if (!err) {
                            return DBInit.GlobalUserServersVIEW.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "GlobalUserServersVIEW: success!");
                                if (json && json.d && json.d.results && json.d.results.length) {
                                    that.binding.count = json.d.results.length;
                                    if (that.binding.count > 1) {
                                        that.binding.showServerList = true;
                                    }
                                    //that.nextDocUrl = Account.GlobalUserServersRT.getNextUrl(json);
                                    var results = json.d.results;
                                    setServerList(results);
                                } else {
                                    Log.print(Log.l.trace, "GlobalUserServersVIEW: no data found!");
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                Log.print(Log.l.error, "Account.GlobalUserServersVIEW: error!");
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, null);
                        } else {
                            return WinJS.Promise.as();
                        }
                    }).then(function () {
                        if (!err) {
                            that.binding.showWaitCircle = false;
                            complete(response);
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.saveData = saveData;

            that.processAll().then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Binding wireup page complete");
                if (AppHeader && AppHeader.controller) {
                    return AppHeader.controller.loadData();
                } else {
                    return WinJS.Promise.as();
                }
            }).then(function () {
                AppData._persistentStates.individualColors = false;
                AppData._persistentStates.colorSettings = copyByValue(AppData.persistentStatesDefaults.colorSettings);
                //new Colors.ColorsClass(AppData._persistentStates.colorSettings);
                var colors =  Colors.updateColors();
                Application.pageframe.savePersistentStates();
                return (colors && colors._loadCssPromise) || WinJS.Promise.timeout(0);
            }).then(function () {
                AppBar.loadIcons();
                NavigationBar.groups = Application.navigationBarGroups;
                if (AppHeader &&
                    AppHeader.controller &&
                    typeof AppHeader.controller.reloadMenu === "function") {
                    AppHeader.controller.reloadMenu();
                }
                Log.print(Log.l.trace, "Appheader refresh complete");
                Application.pageframe.hideSplashScreen();
                if (AppData.prevLogin && AppData.prevPassword) {
                    // Wechsel des Mandanten: sofort Login ausführen
                    that.binding.dataLogin.Login = AppData.prevLogin;
                    that.binding.dataLogin.Password = AppData.prevPassword;
                    that.binding.hideLoginData = true;
                    that.binding.dataLogin.privacyPolicyFlag = true;
                    that.binding.dataLogin.privacyPolicydisabled = true;
                    that.binding.isPrivacyPolicyFlag = true;
                    AppData.prevLogin = null;
                    AppData.prevPassword = null;
                    AppBar.modified = true;
                    that.eventHandlers.clickOk();
                }
            });
            Log.ret(Log.l.trace);
        })
    });
})();

