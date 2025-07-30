// controller for page: account
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
/// <reference path="~/www/pages/account/accountService.js" />
/// <reference path="~/www/pages/home/homeService.js" />

(function () {
    "use strict";

    var namespaceName = "Account";

    WinJS.Namespace.define("Account", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                dataLogin: {
                    Login: AppData._persistentStates.odata.login,
                    Password: AppData._persistentStates.odata.password,
                    PrivacyPolicyFlag: true,
                    PrivacyPolicydisabled: true,
                    INITSpracheID: 0,
                    LocationID: null,
                    LanguageID: null
                },
                doEdit: false,
                progress: {
                    percent: 0,
                    text: "",
                    show: null
                },
                showLanguages: false,
                showServerList: false,
                showWaitCircle: false
            }, commandList]);

            if (typeof navigator.globalization === "object") {
                // use language from globalization in app context!
                Log.print(Log.l.info, "no language selection in app!");
            } else {
                this.binding.showLanguages = true;
            }

            // select combo
            var initSprache = pageElement.querySelector("#InitSprache");
            var globalUserServer = pageElement.querySelector("#GlobalUserServer");

            // TFA UI
            var tfaContainer = pageElement.querySelector("#tfa-container");

            var prevLogin = AppData._persistentStates.odata.login;
            var prevPassword = AppData._persistentStates.odata.password;
            var prevHostName = AppData._persistentStates.odata.hostName;
            var prevOnlinePort = AppData._persistentStates.odata.onlinePort;
            var prevOnlinePath = AppData._persistentStates.odata.onlinePath;
            if (!prevLogin || !prevPassword || !prevHostName) {
                // enable edit per default on empty settings
                this.binding.doEdit = true;
            }
            var portalLink = pageElement.querySelector("#portalLink");
            if (portalLink) {
                var portalLinkUrl = (AppData._persistentStates.odata.https ? "https://" : "http://") +
                    AppData._persistentStates.odata.hostName + getResourceText("account.portalPath");
                portalLink.innerHTML = "<a href=\"" + portalLinkUrl + "\">" + portalLinkUrl + "</a>";
            }
            var contentarea = pageElement.querySelector(".contentarea");

            var that = this;

            var privacyPolicyLink = pageElement.querySelector("#privacyPolicyLink");
            if (privacyPolicyLink) {
                privacyPolicyLink.innerHTML = "<a href=\"https://" + getResourceText("login.privacyPolicyLink") + "\" target=\"_blank\">" + getResourceText("login.privacyPolicyLink") + "</a>";
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
                clickBack: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (that.binding.doEdit && that.binding.count > 1) {
                        AppData.call("PRC_ChangeLoginServer", {
                            pNewLocationID: parseInt(that.binding.dataLogin.LocationID)
                        }, function (json) {
                            Log.print(Log.l.info, "call PRC_ChangeLoginServer success! json=" + (json ? JSON.stringify(json) : ""));
                            Application.navigateById(Application.startPageId, event);
                        }, function (error) {
                            Log.print(Log.l.error, "call PRC_ChangeLoginServer error=" + error);
                            AppData.setErrorMsg(that.binding, error);
                        });
                    } else {
                        if (!that.binding.doEdit && WinJS.Navigation.canGoBack === true) {
                            WinJS.Navigation.back(1).done();
                        } else {
                            Application.navigateById(Application.startPageId, event);
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                },
                clickChangeServer: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    AppData.call("PRC_ChangeLoginServer", {
                        pNewLocationID: parseInt(that.binding.dataLogin.LocationID)
                    }, function (json) {
                        Log.print(Log.l.info, "call PRC_ChangeLoginServer success! ");
                        Application.navigateById(Application.startPageId, event);
                    }, function (error) {
                        Log.print(Log.l.error, "callPRC_ChangeLoginServer error");
                        AppData.setErrorMsg(that.binding, error);
                    });
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickDoEdit: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            that.binding.doEdit = toggle.checked;
                        }
                        AppBar.triggerDisableHandlers();
                    }
                    Log.ret(Log.l.trace);
                },
                clickHttps: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (event.currentTarget && AppBar.notifyModified && that.binding.doEdit) {
                        var toggle = event.currentTarget.winControl;
                        if (toggle) {
                            that.binding.appSettings.odata.https = toggle.checked;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickPrivacyPolicy: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    AppData._persistentStates.privacyPolicyFlag = event.currentTarget.checked;
                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickOk: function () {
                    // work on user change handling!
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
                        that.binding.dataLogin.PrivacyPolicyFlag = false;
                        that.binding.dataLogin.PrivacyPolicydisabled = false;
                    }
                    return ret;
                },
                clickLogoff: function () {
                    return !AppData.getRecordId("Mitarbeiter");
                },
                clickChangeServer: function () {
                    if (!that.binding.doEdit) {
                        return true;
                    } else {
                        return (that.binding.count <= 1);
                    }
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
                if (initSprache && results) {
                    for (var i = 0; i < results.length; i++) {
                        var row = results[i];
                        if (row.IsActive === "1") {
                            Log.print(Log.l.info, "found LanguageId=" + row.LocationID);
                            that.binding.dataLogin.LocationID = row.LocationID;
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            var setLanguage = function (results) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (initSprache && results) {
                    for (var i = 0; i < results.length; i++) {
                        var row = results[i];
                        if (row.LanguageID === AppData.getLanguageId()) {
                            Log.print(Log.l.info, "found LanguageId=" + row.LanguageID);
                            that.binding.dataLogin.INITSpracheID = row.INITSpracheID;
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            var getLanguage = function () {
                var ret = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var results = Account.initSpracheView.getResults();
                var map = Account.initSpracheView.getMap();
                if (map && results) {
                    var curIndex = map[that.binding.dataLogin.INITSpracheID];
                    if (typeof curIndex !== "undefined") {
                        var row = results[curIndex];
                        Log.print(Log.l.info, "found LanguageId=" + row.LanguageID);
                        ret = row.LanguageID;
                    }
                }
                Log.ret(Log.l.trace);
                return ret;
            }

            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!Account.initSpracheView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initSpracheView...");
                        //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                        return Account.initSpracheView.select(function (json) {
                            Log.print(Log.l.trace, "initSpracheView: success!");
                            if (json && json.d) {
                                var results = json.d.results;
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initSprache && initSprache.winControl) {
                                    initSprache.winControl.data = new WinJS.Binding.List(results);
                                    setLanguage(results);
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initSprache && initSprache.winControl) {
                            var results = Account.initSpracheView.getResults();
                            initSprache.winControl.data = new WinJS.Binding.List(results);
                            setLanguage(results);
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (that.binding.dataLogin.Login && that.binding.dataLogin.Password) {
                        return Account.GlobalUserServersVIEW.select(function (json) {
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
                                if (globalUserServer && globalUserServer.winControl) {
                                    globalUserServer.winControl.data = new WinJS.Binding.List(results);
                                    setServerList(results);
                                }
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
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var tfaStatus = function () {
                var ret = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                
                if (tfaContainer && TwoFactorLib && typeof TwoFactorLib.getStatus === "function") {
                    // Hiermit soll die Oberfläche für TFA-Administration erzeugt werden
                    // in that.binding.dataLogin.Password steht initial das vom User eingegebene Password
                    // im Fall TFA soll that.binding.dataLogin.Password überschrieben werden mit dem "Token-Password"
                    // User muss für TFA-Änderungen explizit in einem weiteren Input-Element nochmal "sein Password" eingeben, 
                    // unabhängig davon was gerade in that.binding.dataLogin.Password steht!
                    ret = toWinJSPromise(TwoFactorLib.getStatus(
                        tfaContainer, 
                        that.binding.dataLogin.Login,
                        that.binding.dataLogin.Password, 

                        function setDBPassword(dbPassword) { 
                            that.binding.dataLogin.Password = dbPassword;
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
            
            var tfaVerify = function() {
                var ret = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.");

                if (tfaContainer && TwoFactorLib && typeof TwoFactorLib.verify2FA === "function") {
                    // Hiermit soll die Oberfläche für die TFA-Authentifizierung (Popup-Dialog) erzeugt werden
                    // IMPORTANT: Pass original password, handle dbPassword for API calls only
                    ret = toWinJSPromise(TwoFactorLib.verify2FA(
                        tfaContainer, 
                        that.binding.dataLogin.Login, 
                        that.binding.dataLogin.Password, 
                            function setDBPassword(dbPassword) {

                            that.binding.dataLogin.Password = dbPassword;

                    }, Application.language, that.binding.appSettings.odata.hostName));
                } else {
                    Log.print(Log.info, "No twofactorLib was found");
                }
                Log.ret(Log.l.trace);
                return ret;
            }

            var saveData = function (complete, error) {
                var err = null, response = null, ret = null, hasTwoFactor = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (contentarea) {
                    contentarea.scrollTop = 0;
                }
                var newLanguageId = getLanguage();
                var prevLanguageId = AppData._persistentStates.languageId;
                if (newLanguageId !== prevLanguageId) {
                    AppData._persistentStates.languageId = newLanguageId;
                    Application.pageframe.savePersistentStates();
                }
                if (!that.binding.doEdit && newLanguageId === prevLanguageId && prevPassword === that.binding.dataLogin.Password) {
                    ret = WinJS.Promise.as();
                    complete({});
                } else {
                    that.binding.messageText = null;
                    AppData.setErrorMsg(that.binding);
                    AppData.cancelPromises();
                    AppBar.busy = true;
                    that.binding.appSettings.odata.onlinePath = "odata_online";//AppData._persistentStatesDefaults.odata.onlinePath;
                    that.binding.appSettings.odata.registerPath = "odata_register";//AppData._persistentStatesDefaults.odata.registerPath;
                    ret = Account.loginRequest.insert(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "loginRequest: success!");
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
                                //if (location !== AppData._persistentStatesDefaults.odata.onlinePath) {
                                if (location !== "odata_online") {
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
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        Log.print(Log.l.info, "loginRequest error: " + AppData.getErrorMsgFromResponse(errorResponse) + " ignored for compatibility!");
                        // ignore this error here for compatibility!
                    }, {
                        LoginName: that.binding.dataLogin.Login
                    }).then(function () {
                        // nur aufrufen wenn in DB TFA eingetragen ist
                        // und Login  geändert wurde
                        if (hasTwoFactor && (prevLogin !== that.binding.dataLogin.Login)) {
                            return tfaVerify().then(function (tfaResult) {
                                that.binding.showWaitCircle = true;
                                // now wait 5s for the DB-USer to be changed....
                                return WinJS.Promise.timeout(5000).then(function () {
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
                        } else if (err) {
                            that.binding.showWaitCircle = false;
                            return WinJS.Promise.as();
                        } else {
                            var dataLogin = {
                                Login: that.binding.dataLogin.Login,
                                Password: that.binding.dataLogin.Password,
                                LanguageID: getLanguage(),
                                Aktion: "Portal"
                            };
                            return Account.loginView.insert(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "loginView: success!");
                                // loginData returns object already parsed from json file in response
                                if (json && json.d) {
                                    dataLogin = json.d;
                                    if (dataLogin.OK_Flag === "X" && dataLogin.MitarbeiterID) {
                                        AppData._persistentStates.odata.login = that.binding.dataLogin.Login;
                                        AppData._persistentStates.odata.password = that.binding.dataLogin.Password;
                                        NavigationBar.enablePage("settings");
                                        NavigationBar.enablePage("info");
                                        response = json;
                                        AppData._persistentStates.languageId = dataLogin.LanguageID;
                                        //AppData.setRecordId("Kontakt", dataLogin.KontaktID);
                                        Application.pageframe.savePersistentStates();
                                        return WinJS.Promise.as();
                                    } else {
                                        that.binding.showWaitCircle = false;
                                        AppBar.busy = false;
                                        that.binding.messageText = dataLogin.MessageText;
                                        err = { status: 401, statusText: dataLogin.MessageText };
                                        AppData.setErrorMsg(that.binding, err);
                                        error(err);
                                        return WinJS.Promise.as();
                                    }
                                } else {
                                    that.binding.showWaitCircle = false;
                                    AppBar.busy = false;
                                    err = { status: 404, statusText: "no data found" };
                                    AppData.setErrorMsg(that.binding, err);
                                    error(err);
                                    return WinJS.Promise.as();
                                }
                            }, function (errorResponse) {
                                that.binding.showWaitCircle = false;
                                AppBar.busy = false;
                                err = errorResponse;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                error(errorResponse);
                                return WinJS.Promise.as();
                            }, dataLogin);
                        }
                    }).then(function () {
                        if (!err) {
                            // load color settings
                            //AppData._persistentStates.hideQuestionnaire = false;
                            //AppData._persistentStates.hideSketch = false;
                            return AppData.getOptions(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "CR_VERANSTOPTION_ODataView: success!");
                                // CR_VERANSTOPTION_ODataView returns object already parsed from json file in response
                                if (json && json.d && json.d.results && json.d.results.length > 1) {
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                    });
                                    Application.pageframe.savePersistentStates();
                                }
                            }, function (errorResponse) {
                                that.binding.showWaitCircle = false;
                                AppBar.busy = false;
                                err = errorResponse;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                error(errorResponse);
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, {
                                VeranstaltungID: AppData.getRecordId("Veranstaltung"), //0
                                MandantWide: 1, //0
                                IsForApp: 0
                            }).then(function () {
                                var colors = Colors.updateColors();
                                return (colors && colors._loadCssPromise) || WinJS.Promise.as();
                            });
                        } else {
                            that.binding.showWaitCircle = false;
                            return WinJS.Promise.as();
                        }
                    }).then(function () {
                        if (!err) {
                            if (typeof Home === "object" && Home._actionsList) {
                                Home._actionsList = null;
                            }
                            return Account.appListSpecView.select(function (json) {
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
                                that.binding.showWaitCircle = false;
                                AppBar.busy = false;
                                err = errorResponse;
                                AppData.setErrorMsg(that.binding, errorResponse);
                                error(errorResponse);
                                return WinJS.Promise.as();
                            });
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
                            that.binding.showWaitCircle = false;
                            complete(response);
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.saveData = saveData;

            // initialer TFA-Aufruf beim Laden der Seite
            // Nur wenn Login und Passwort ausgefüllt sind

            if(that.binding.dataLogin.Login && that.binding.dataLogin.Password){
                tfaStatus();
            }else{
                Log.print(Log.l.trace, "No  2FA status, if not login");
            }

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
                if (AppHeader && AppHeader.controller) {
                    return AppHeader.controller.loadData();
                } else {
                    return WinJS.Promise.as();
                }
            }).then(function () {
                Log.print(Log.l.trace, "Appheader refresh complete");
                Application.pageframe.hideSplashScreen();
            });
            Log.ret(Log.l.trace);
        })
    });
})();


