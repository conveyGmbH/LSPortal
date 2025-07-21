// controller for page: login
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dbinit.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
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
            AppData._persistentStates.allRecIds = {};
            AppData._userData = {};
            AppData._userRemoteData = {};
            AppData._contactData = {};
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
                }
            }, commandList]);

            AppData._isLoggingOut = false;

            var that = this;

            // TFA UI  Only initialize if we're actually on login page for login process
            var tfaContainer = pageElement.querySelector("#tfa-container");
            var isLoginProcess = false; // Flag to track if we're in login process

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
                     // Set flag to indicate we're starting login process
                    isLoginProcess = true;
                    Log.print(Log.l.info, "Login process started - isLoginProcess set to true");
                    Application.navigateById(Application.startPageId, event);
                    Log.ret(Log.l.trace);
                },
                clickAccount: function (event) {
                    Log.call(Log.l.trace, "Login.Controller.");
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
                    if (AppBar.busy || (that.binding.dataLogin.Login.length === 0 || that.binding.dataLogin.Password.length === 0 || !that.binding.isPrivacyPolicyFlag)) {
                        NavigationBar.disablePage("home");
                        NavigationBar.disablePage("localevents");
                        NavigationBar.disablePage("events");
                        NavigationBar.disablePage("mailing");
                        NavigationBar.disablePage("employee");
                        NavigationBar.disablePage("contacts");
                        NavigationBar.disablePage("reporting");
                        NavigationBar.disablePage("infodesk");
                        NavigationBar.disablePage("settings");
                        NavigationBar.disablePage("info");
                        NavigationBar.disablePage("search");
                    } else {
                        NavigationBar.enablePage("home");
                    }
                    if (!that.binding.dataLogin.Login || !that.binding.dataLogin.Password) {
                        that.binding.dataLogin.privacyPolicyFlag = false;
                        that.binding.dataLogin.privacyPolicydisabled = false;
                        that.binding.isPrivacyPolicyFlag = false;
                    }
                    var ret = AppBar.busy || (that.binding.dataLogin.Login.length === 0 || that.binding.dataLogin.Password.length === 0 || !that.binding.isPrivacyPolicyFlag);
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

            var openDb = function (complete, error) {
                var ret;
                Log.call(Log.l.info, "Login.Controller.");
                if (AppRepl.replicator &&
                    AppRepl.replicator.state === "running") {
                    Log.print(Log.l.info, "replicator still running - try later!");
                    ret = WinJS.Promise.timeout(500).then(function () {
                        that.openDb(complete, error);
                    });
                } else {
                    ret = AppData.openDB(function (json) {
                        AppBar.busy = false;
                        AppData._curGetUserDataId = 0;
                        AppData.getUserData();
                        AppData.getMessagesData();
                        complete(json);
                    }, function (curerr) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, curerr);
                        error(curerr);
                    }, function (res) {
                        if (res) {
                            that.binding.progress = {
                                percent: res.percent,
                                text: res.statusText,
                                show: 1
                            };
                        }
                    }, true);
                }
                Log.ret(Log.l.info);
                return ret;
            };
            that.openDb = openDb;

            //  (1)  var tfaVerify = function (sessionToken) {
        //             var ret = null;
        //             Log.call(Log.l.trace, namespaceName + ".Controller.");
                    
        //             // Only execute TFA verification if we're in an active login process
        //             if (isLoginProcess && tfaContainer && TwoFactorLib && typeof TwoFactorLib.verify2FA === "function") {
        //                 Log.print(Log.l.info, "Starting 2FA verification process for login - isLoginProcess: " + isLoginProcess + ", sessionToken: " + (sessionToken ? "present" : "missing"));

        //                  if (TwoFactorLib.setSessionPassword && that.binding.dataLogin.Password) {
        //                     TwoFactorLib.setSessionPassword(that.binding.dataLogin.Password);
        //                 }

        //                 // Hiermit soll die Oberfläche für die TFA-Authentifizierung (Popup-Dialog) erzeugt werden                        
        //                 ret = toWinJSPromise(TwoFactorLib.verify2FA(
        //                     tfaContainer, 
        //                     that.binding.dataLogin.Login, 
        //                     function setDBPassword(dbPassword) {
        //                         // Log.print(Log.l.info, "Password updated after 2FA verification");
        //                         Log.print(Log.l.info, "DB password received but not used for login");
        //                         that.binding.dataLogin.Password = dbPassword;

        //                         if (AppData._persistentStates && AppData._persistentStates.odata) {
        //                             AppData._persistentStates.odata.password = dbPassword;
        //                         }
        //                 }, 
        //                 Application.language, 
        //                 sessionToken
        //             )); 
        //             } else {
        //                 Log.print(Log.l.info, "TFA verification skipped - isLoginProcess: " + isLoginProcess + ", TFA Lib available: " + !!(tfaContainer && TwoFactorLib && typeof TwoFactorLib.verify2FA === "function"));
        //                 ret = WinJS.Promise.as();
        //             }
        //             Log.ret(Log.l.trace);
        //             return ret;
        //         }

        // ✅ FONCTION TFAVERIFY CORRIGÉE - À remplacer dans loginController.js
           
        //  (2) var tfaVerify = function (sessionToken) {
        //         var ret = null;
        //         Log.call(Log.l.trace, namespaceName + ".Controller.");
                
        //         // Only execute TFA verification if we're in an active login process
        //         if (isLoginProcess && tfaContainer && TwoFactorLib && typeof TwoFactorLib.verify2FA === "function") {
        //             Log.print(Log.l.info, "🔐 Starting 2FA verification for login");

        //             // Stocker le mot de passe ORIGINAL avant 2FA
        //             var originalPassword = that.binding.dataLogin.Password;
        //             Log.print(Log.l.info, "💾 Original password stored for login: " + (originalPassword ? "YES" : "NO"));

        //             if (TwoFactorLib.setSessionPassword && originalPassword) {
        //                 TwoFactorLib.setSessionPassword(originalPassword);
        //             }

        //             ret = toWinJSPromise(TwoFactorLib.verify2FA(
        //                 tfaContainer, 
        //                 that.binding.dataLogin.Login, 
        //                 function setDBPassword(dbPassword) {
        //                     // Utiliser le DBPassword pour le login final
        //                     Log.print(Log.l.info, "🔑 DB password received from 2FA - USING for login");
                            
        //                     // IMPORTANT: Mettre à jour le mot de passe pour le login final
        //                     that.binding.dataLogin.Password = dbPassword;

        //                     // Mettre à jour aussi les états persistants
        //                     if (AppData._persistentStates && AppData._persistentStates.odata) {
        //                         AppData._persistentStates.odata.password = dbPassword;
        //                     }

        //                     Log.print(Log.l.info, "Password updated for final login step");
        //                 }, 
        //                 Application.language, 
        //                 sessionToken
        //             )); 
        //         } else {
        //             Log.print(Log.l.info, "⏭️ Skipping 2FA verification - not required or not in login process");
        //             ret = WinJS.Promise.as();
        //         }
        //         Log.ret(Log.l.trace);
        //         return ret;
        //     }


            var tfaVerify = function (sessionToken) {
                var ret = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.");

                if (
                isLoginProcess &&
                tfaContainer &&
                TwoFactorLib &&
                typeof TwoFactorLib.verify2FA === "function"
                ) {
                Log.print(
                    Log.l.info,
                    "🔐 Starting 2FA verification for login"
                );

                var originalPassword = that.binding.dataLogin.Password;

                if (
                    TwoFactorLib.setSessionPassword &&
                    originalPassword
                ) {
                    TwoFactorLib.setSessionPassword(originalPassword);
                }

                ret = toWinJSPromise(
                    TwoFactorLib.verify2FA(
                    tfaContainer,
                    that.binding.dataLogin.Login,
                    function setDBPassword(dbPassword) {
                        Log.print(
                        Log.l.info,
                        "🔑 DB password received - updating for login: " +
                            (dbPassword ? "YES" : "NO")
                        );
                        // ✅ CRITIQUE: Mettre à jour le mot de passe immédiatement
                        that.binding.dataLogin.Password = dbPassword;
                    },
                    Application.language,
                    sessionToken
                    )
                );
                } else {
                ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            };

            var saveData = function (complete, error) {

                // Only proceed with login if we have valid credentials
                if (!that.binding.dataLogin.Login || !that.binding.dataLogin.Password) {
                    Log.print(Log.l.info, "No credentials provided - skipping login process");
                    isLoginProcess = false;
                    complete({});
                    return WinJS.Promise.as();
                }

                Log.print(Log.l.info, "Starting saveData with isLoginProcess: " + isLoginProcess);

                var err = null, hasTwoFactor = null, sessionToken = null; 
                Log.call(Log.l.trace, "Login.Controller.");
                that.binding.messageText = null;
                AppData.setErrorMsg(that.binding);
                AppBar.busy = true;
                that.binding.appSettings.odata.onlinePath = AppData._persistentStatesDefaults.odata.onlinePath;
                that.binding.appSettings.odata.registerPath = AppData._persistentStatesDefaults.odata.registerPath;
                var ret = Login.loginRequest.insert(function (json) {
                    // this callback will be called asynchronously
                    // when the response is available
                    Log.call(Log.l.trace, "loginRequest: success!");

                     if (json && json.success && json.user) {
                        // This is a 2FA backend response
                        Log.print(Log.l.info, "2FA Backend login response detected");
                        hasTwoFactor = json.user.requires2FA;
                        sessionToken = json.sessionToken;

                        // We still need to check for ODataLocation for WinJS compatibility
                        if (json.d && json.d.ODataLocation) {
                            var location = json.d.ODataLocation;
                            if (location !== AppData._persistentStatesDefaults.odata.onlinePath) {
                                that.binding.appSettings.odata.onlinePath = location + that.binding.appSettings.odata.onlinePath;
                                that.binding.appSettings.odata.registerPath = location + that.binding.appSettings.odata.registerPath;
                            }
                        }
                        Application.pageframe.savePersistentStates();
                    }
                        // We still need to check for ODataLocation for WinJS compatibility
                        else if (json && json.d && json.d.ODataLocation) {

                            // Legacy WinJS login response
                            Log.print(Log.l.info, "Legacy WinJS login response detected");
                            if (json.d.InactiveFlag) {
                                AppBar.busy = false;
                                isLoginProcess = false;
                                err = { status: 503, statusText: getResourceText("account.inactive") };
                                AppData.setErrorMsg(that.binding, err);
                                error(err);
                                return WinJS.Promise.as();
                            } else {
                                        hasTwoFactor = json.d.requires2FA || json.d.HasTwoFactor;
                                        sessionToken = json.d.sessionToken || json.d.SessionToken;
                                        Log.print(Log.l.info, "Legacy response - requires2FA: " + hasTwoFactor + ", sessionToken: " + sessionToken);
                                    

                                var location = json.d.ODataLocation;

                                if (location !== AppData._persistentStatesDefaults.odata.onlinePath) {
                                    that.binding.appSettings.odata.onlinePath = location + that.binding.appSettings.odata.onlinePath;
                                    that.binding.appSettings.odata.registerPath = location + that.binding.appSettings.odata.registerPath;
                                }
                                Application.pageframe.savePersistentStates();
                            }
                        } else {
                            AppBar.busy = false;
                            isLoginProcess = false;
                            err = { status: 404, statusText: getResourceText("login.unknown") };
                            AppData.setErrorMsg(that.binding, err);
                            error(err);
                        }
                    Log.print(Log.l.info, "Login processed - hasTwoFactor: " + hasTwoFactor + ", sessionToken: " + (sessionToken ? "present" : "missing"));

                    return WinJS.Promise.as();
                }, function (errorResponse) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    Log.print(Log.l.info, "loginRequest error: " + AppData.getErrorMsgFromResponse(errorResponse) + " ignored for compatibility!");
                    // ignore this error here for compatibility!
                    return WinJS.Promise.as();
                }, 
                {
                    LoginName: that.binding.dataLogin.Login
                }).then(function () {
                    // Only call 2FA if actually required AND we have sessionToken
                    Log.print(Log.l.info, "2FA Check - hasTwoFactor: " + hasTwoFactor + ", isLoginProcess: " + isLoginProcess + ", sessionToken: " + (sessionToken ? "present" : "missing"));

                    if (hasTwoFactor== true && isLoginProcess && sessionToken) {
                        Log.print(Log.l.info, "Calling 2FA verification with sessionToken: " + sessionToken);

                        return tfaVerify(sessionToken) || WinJS.Promise.as();
                    }else if (hasTwoFactor === true && isLoginProcess && !sessionToken) {
                        Log.print(Log.l.error, "2FA required but no sessionToken available - this should not happen");
                        AppBar.busy = false;
                        isLoginProcess = false;
                        err = { status: 500, statusText: "2FA session error - please try again" };
                        AppData.setErrorMsg(that.binding, err);
                        error(err);
                        return WinJS.Promise.as();
                    } 
                    else {
                        Log.print(Log.l.info, "Skipping 2FA verification - not required or not in login process");
                        return WinJS.Promise.as();
                    }
                })

                .then(function (tfaResult) {
                    Log.print(Log.l.info, "🔄 2FA Result received: " + (tfaResult ? "SUCCESS" : "NONE"));
    
                    if (!err) {
                        var dataLogin = {
                            Login: that.binding.dataLogin.Login,
                            Password: that.binding.dataLogin.Password,  // ✅ Utilise le mot de passe mis à jour
                            LanguageID: AppData.getLanguageId(),
                            Aktion: "Portal"
                        };

                        Log.print(Log.l.info, "🚀 Calling loginView.insert with password length: " + 
                            (dataLogin.Password ? dataLogin.Password.length : 0));
                        
                        return Login.loginView.insert(function (json) {
                            Log.call(Log.l.trace, "loginData: success!");
                            
                            if (json && json.d) {
                                dataLogin = json.d;
                                if (dataLogin.OK_Flag === "X" && dataLogin.MitarbeiterID) {
                                    // ✅ Sauvegarde uniquement le login, pas le DBPassword
                                    AppData._persistentStates.odata.login = that.binding.dataLogin.Login;
                                    // Ne pas sauvegarder le DBPassword dans les états persistants
                                    
                                    AppData.setRecordId("Mitarbeiter", dataLogin.MitarbeiterID);
                                    NavigationBar.enablePage("settings");
                                    NavigationBar.enablePage("info");
                                    AppBar.busy = false;
                                    isLoginProcess = false;
                                    Log.print(Log.l.info, "✅ Login completed successfully - redirecting to home");

                                } else {
                                    AppBar.busy = false;
                                    isLoginProcess = false;
                                    that.binding.messageText = dataLogin.MessageText;
                                    err = { status: 401, statusText: dataLogin.MessageText };
                                    AppData.setErrorMsg(that.binding, err);
                                    error(err);
                                }
                            } else {
                                AppBar.busy = false;
                                isLoginProcess = false;
                                err = { status: 404, statusText: "no data found" };
                                AppData.setErrorMsg(that.binding, err);
                                error(err);
                            }
                        }, function (errorResponse) {
                            AppBar.busy = false;
                            isLoginProcess = false;
                            err = errorResponse;
                            Log.print(Log.l.error, "❌ loginView.insert failed: " + JSON.stringify(errorResponse));
                            AppData.setErrorMsg(that.binding, errorResponse);
                            error(errorResponse);
                        }, dataLogin);
                    } else {
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
                                // kontaktanzahlView returns object already parsed from json file in response
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
                                error(errorResponse);
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, {
                                VeranstaltungID: AppData.getRecordId("Veranstaltung"), // 0
                                MandantWide: 1, // 0
                                IsForApp: 0
                            }).then(function () {
                                var colors = Colors.updateColors();
                                return (colors && colors._loadCssPromise) || WinJS.Promise.as();
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
                                if (json && json.d && json.d.results) {
                                    NavigationBar.showGroupsMenu(json.d.results, true);
                                } else {
                                    NavigationBar.showGroupsMenu([]);
                                }
                                complete(json);
                                return WinJS.Promise.as();
                            },
                                function (errorResponse) {
                                    // called asynchronously if an error occurs
                                    // or server returns response with an error status.
                                    AppData.setErrorMsg(that.binding, errorResponse);
                                    error(errorResponse);
                                    return WinJS.Promise.as();
                                });
                        } else {
                            return WinJS.Promise.as();
                        }
                    });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.saveData = saveData;

            if (AppData.prevLogin && AppData.prevPassword) {
                that.binding.dataLogin.Login = AppData.prevLogin;
                that.binding.dataLogin.Password = AppData.prevPassword;
                that.binding.hideLoginData = true;
                that.binding.dataLogin.privacyPolicyFlag = true;
                that.binding.dataLogin.privacyPolicydisabled = true;
                that.binding.isPrivacyPolicyFlag = true;
                AppData.prevLogin = null;
                AppData.prevPassword = null;

                // Set login process flag for automatic login
                isLoginProcess = true;

                isLoginProcess = true;
                Log.print(Log.l.info, "LOGIN PROCESS STARTED - isLoginProcess: " + isLoginProcess);
                Log.print(Log.l.info, "Current password length: " + (that.binding.dataLogin.Password ? that.binding.dataLogin.Password.length : 0));


                Log.print(Log.l.info, "Automatic login detected - isLoginProcess set to true");

                WinJS.Promise.timeout(0).then(function () {
                    Application.navigateById(Application.startPageId);
                });
            }

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
                Log.print(Log.l.trace, "Appheader refresh complete");
                Application.pageframe.hideSplashScreen();
            });
            Log.ret(Log.l.trace);
        })
    });
})();


