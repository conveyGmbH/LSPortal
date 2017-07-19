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
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement) {
            Log.call(Log.l.trace, "Login.Controller.");
            // delete login data first
            AppData.appSettings.odata.login = null;
            AppData.appSettings.odata.password = null;
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
            }]);

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
                        default:
                            // defaultvalues
                    }
                    item.colorValue = "#" + item.LocalValue;
                    /*var childElement = pageElement.querySelector("#" + item.colorPickerId);
                    item.colorValue = "#" + item.LocalValue;
                    childElement.value = item.colorValue;
                    var pickerParent = pageElement.querySelector("#" + item.colorPickerId + "_picker");
                    if (pickerParent) {
                        var colorcontainer = pickerParent.querySelector(".color_container");
                        if (colorcontainer) {
                            var colorPicker = colorcontainer.colorPicker;
                            if (colorPicker) {
                                colorPicker.color = childElement.value;

                            }
                        }
                    }*/
                    that.applyColorSetting(item.colorPickerId, item.colorValue);
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
                            LanguageID: AppData.getLanguageId()
                        };
                        return Login.loginView.insert(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.call(Log.l.trace, "loginData: success!");
                            // loginData returns object already parsed from json file in response
                            if (json && json.d) {
                                dataLogin = json.d;
                                if (dataLogin.OK_Flag === "X" && dataLogin.MitarbeiterID) {
                                    that.binding.appSettings.odata.login = that.binding.dataLogin.Login;
                                    that.binding.appSettings.odata.password = that.binding.dataLogin.Password;
                                    AppData.setRecordId("Mitarbeiter", dataLogin.MitarbeiterID);
                                    NavigationBar.enablePage("settings");
                                    NavigationBar.enablePage("info");
                                    NavigationBar.enablePage("search");
                                    if (that.binding.appSettings.odata.useOffline) {
                                        AppData._persistentStates.odata.dbSiteId = dataLogin.Mitarbeiter_AnmeldungVIEWID;
                                        Application.pageframe.savePersistentStates();
                                        return that.openDb(complete, error);
                                    } else {
                                        AppBar.busy = false;
                                        AppData.setRecordId("Kontakt", dataLogin.KontaktID);
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
                        return Login.CR_VERANSTOPTION_ODataView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "Login: success!");
                            // CR_VERANSTOPTION_ODataView returns object already parsed from json file in response

                            if (json && json.d) {
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });

                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }).then(function () {
                            Colors.updateColors();
                            return WinJS.Promise.as();
                        });
                        return WinJS.Promise.as();
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
                AppBar.triggerDisableHandlers();
                Log.print(Log.l.trace, "Binding wireup page complete");
                Application.pageframe.hideSplashScreen();
            });
            Log.ret(Log.l.trace);
        })
    });
})();


