﻿// controller for page: login
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

(function () {
    "use strict";

    WinJS.Namespace.define("Login", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Login.Controller.");
            // delete login data first
            AppData._persistentStates.odata.login = null;
            AppData._persistentStates.odata.password = null;
            AppData._persistentStates.odata.dbSiteId = null;
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
                    Password: ""
                },
                progress: {
                    percent: 0,
                    text: "",
                    show: null
                }
            }, commandList]);

            var that = this;

            // define handlers
            this.eventHandlers = {
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Login.Controller.");
                    Application.navigateById("start", event);
                    Log.ret(Log.l.trace);
                },
                clickAccount: function (event) {
                    Log.call(Log.l.trace, "Login.Controller.");
                    Application.navigateById("newAccount", event);
                    //
                    // remove this page from navigation history!
                    if (WinJS.Navigation.history &&
                        WinJS.Navigation.history.backStack) {
                        WinJS.Navigation.history.backStack.pop();
                    }
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickOk: function() {
                    if (AppBar.busy) {
                        NavigationBar.disablePage("start");
                    } else {
                        NavigationBar.enablePage("start");
                    }
                    return AppBar.busy;
                }
            };
            var applyColorSetting = function (colorProperty, color) {
                Log.call(Log.l.trace, "Settings.Controller.", "colorProperty=" + colorProperty + " color=" + color);

                Colors[colorProperty] = color;
                that.binding.generalData[colorProperty] = color;
                switch (colorProperty) {
                    case "accentColor":
                       /* that.createColorPicker("backgroundColor");
                        that.createColorPicker("textColor");
                        that.createColorPicker("labelColor");
                        that.createColorPicker("tileTextColor");
                        that.createColorPicker("tileBackgroundColor");
                        that.createColorPicker("navigationColor");*/
                        // fall through...
                    case "navigationColor":
                        AppBar.loadIcons();
                        NavigationBar.groups = Application.navigationBarGroups;
                        break;
                }
                Log.ret(Log.l.trace);
            }
            this.applyColorSetting = applyColorSetting;

            var resultConverter = function (item, index) {
                if (item.INITOptionTypeID > 10) {
                    switch (item.INITOptionTypeID) {
                        case 10:
                            item.colorPickerId = "individualColors";
                            break;
                        case 11:
                            item.colorPickerId = "accentColor";
                            break;
                        case 12:
                            item.colorPickerId = "backgroundColor";
                            break;
                        case 13:
                            item.colorPickerId = "navigationColor";
                            break;
                        case 14:
                            item.colorPickerId = "textColor";
                            break;
                        case 15:
                            item.colorPickerId = "labelColor";
                            break;
                        case 16:
                            item.colorPickerId = "tileTextColor";
                            break;
                        case 17:
                            item.colorPickerId = "tileBackgroundColor";
                            break;
                        case 20:
                            item.pageProperty = "questionnaire";
                            if (item.LocalValue === "0") {
                                AppData._persistentStates.hideQuestionnaire = true;
                            } else {
                                AppData._persistentStates.hideQuestionnaire = false;
                            }
                            break;
                        case 21:
                            item.pageProperty = "sketch";
                            if (item.LocalValue === "0") {
                                AppData._persistentStates.hideSketch = true;
                            } else {
                                AppData._persistentStates.hideSketch = false;
                            }
                            break;
                        default:
                            // defaultvalues
                    }
                    if (item.colorPickerId !== "individualColors" && (!item.pageProperty)) {
                        item.colorValue = "#" + item.LocalValue;
                        that.applyColorSetting(item.colorPickerId, item.colorValue);
                    } else {
                        // item.colorValue = "#" + item.LocalValue;
                        if (item.LocalValue === "1") {
                            that.binding.generalData.individualColors = true;
                        } else {
                            that.binding.generalData.individualColors = false;
                        }
                        //that.applyColorSetting(item.colorPickerId, item.LocalValue);
                    }
                    if (item.pageProperty) {
                        if (item.LocalValue === "1") {
                            NavigationBar.enablePage(item.pageProperty);
                        } else if (item.LocalValue === "0") {
                            NavigationBar.disablePage(item.pageProperty);
                        }
                    }
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

            var saveData = function(complete, error) {
                var err = null;
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
                    // loginData returns object already parsed from json file in response
                    if (json && json.d && json.d.ODataLocation) {
                        if (json.d.InactiveFlag) {
                            AppBar.busy = false;
                            err = { status: 503, statusText: getResourceText("account.inactive") };
                            AppData.setErrorMsg(that.binding, err);
                            error(err);
                        } else {
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
                    Log.print(Log.l.error, "loginRequest error: " + AppData.getErrorMsgFromResponse(errorResponse));
                    // ignore this error here for compatibility!
                    return WinJS.Promise.as();
                }, {
                    LoginName: that.binding.dataLogin.Login
                }).then(function () {
                    if (!err) {
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
                                if (dataLogin.OK_Flag === "X" && dataLogin.MitarbeiterID) {
                                    AppData._persistentStates.odata.login = that.binding.dataLogin.Login;
                                    AppData._persistentStates.odata.password = that.binding.dataLogin.Password;
                                    AppData.setRecordId("Mitarbeiter", dataLogin.MitarbeiterID);
                                    NavigationBar.enablePage("settings");
                                    NavigationBar.enablePage("info");
                                    if (that.binding.appSettings.odata.useOffline) {
                                        AppData._persistentStates.odata.dbSiteId = dataLogin.Mitarbeiter_AnmeldungVIEWID;
                                        Application.pageframe.savePersistentStates();
                                        return that.openDb(complete, error);
                                    } else {
                                        Application.pageframe.savePersistentStates();
                                        AppBar.busy = false;
                                        AppData._curGetUserDataId = 0;
                                        AppData.getUserData();
                                        complete(json);
                                        return WinJS.Promise.as();
                                    }
                                } else {
                                    AppBar.busy = false;
                                    that.binding.messageText = dataLogin.MessageText;
                                    err = { status: 401, statusText: dataLogin.MessageText };
                                    AppData.setErrorMsg(that.binding, err);
                                    error(err);
                                    return WinJS.Promise.as();
                                }
                            } else {
                                AppBar.busy = false;
                                err = { status: 404, statusText: "no data found" };
                                AppData.setErrorMsg(that.binding, err);
                                error(err);
                                return WinJS.Promise.as();
                            }
                        }, function (errorResponse) {
                            AppBar.busy = false;
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            error(errorResponse);
                            return WinJS.Promise.as();
                        }, dataLogin);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (!err) {
                        // load color settings
                        AppData._persistentStates.hideQuestionnaire = false;
                        AppData._persistentStates.hideSketch = false;
                        return Login.CR_VERANSTOPTION_ODataView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "Login: success!");
                            // CR_VERANSTOPTION_ODataView returns object already parsed from json file in response
                            if (json && json.d && json.d.results && json.d.results.length > 1) {
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                            } else {
                                AppData._persistentStates.individualColors = false;
                                AppData._persistentStates.colorSettings = copyByValue(AppData.persistentStatesDefaults.colorSettings);
                                var colors = new Colors.ColorsClass(AppData._persistentStates.colorSettings);
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }).then(function () {
                            Colors.updateColors();
                            return WinJS.Promise.as();
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (!err) {
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
                            return WinJS.Promise.as();
                        },
                            function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
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

            that.processAll().then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Binding wireup page complete");
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


