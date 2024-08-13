// controller for page: dbinit
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dbinit.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/dbinit/dbinitService.js" />
/// <reference path="~/www/pages/home/homeService.js" />

(function () {
    "use strict";
    var namespaceName = "DBInit";

    WinJS.Namespace.define("DBInit", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Application.Controller.apply(this, [pageElement, {
                progress: {
                    percent: 0,
                    text: "",
                    show: null
                }
            }, commandList]);

            var that = this;

            var getStartPage = function() {
                var startPage;
                var userId = null;
                if (typeof AppData._persistentStates.allRecIds !== "undefined" &&
                    typeof AppData._persistentStates.allRecIds["Mitarbeiter"] !== "undefined") {
                    userId = AppData._persistentStates.allRecIds["Mitarbeiter"];
                    Log.print(Log.l.info, "userId=" + userId);
                }
                if (!userId ||
                    !that.binding.appSettings.odata.login ||
                    !that.binding.appSettings.odata.password/* ||
                    !that.binding.appSettings.odata.dbSiteId*/) {
                    startPage = "login";
                } else {
                    startPage = Application.startPageId;
                }
                return startPage;
            }
            var resultConverter = function (item, index) {
                var property = AppData.getPropertyFromInitoptionTypeID(item);
                if (property && property !== "individualColors" && (!item.pageProperty) && item.LocalValue) {
                    item.colorValue = "#" + item.LocalValue;
                    AppData.applyColorSetting(property, item.colorValue);
                }
            }
            this.resultConverter = resultConverter;
            // define handlers
            this.eventHandlers = {
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
            }

            var openDb = function () {
                var ret;
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppBar.busy = true;
                if (AppRepl.replicator &&
                    AppRepl.replicator.state === "running") {
                    Log.print(Log.l.info, "replicator still running - try later!");
                    ret = WinJS.Promise.timeout(500).then(function () {
                        return that.openDb();
                    });
                } else {
                    ret = AppData.openDB(function () {
                        AppBar.busy = false;
                        Log.print(Log.l.info, "openDB success!");
                        AppData._curGetUserDataId = 0;
                        AppData.getUserData();
                        AppData.getMessagesData();
                    }, function (err) {
                        AppBar.busy = false;
                        Log.print(Log.l.error, "openDB error!");
                        AppData.setErrorMsg(that.binding, err);
                    }, function (res) {
                        if (res) {
                            that.binding.progress = {
                                percent: res.percent,
                                text: res.statusText,
                                show: 1
                            }
                        }
                    }).then(function () {
                        AppData._persistentStates.hideQuestionnaire = false;
                        AppData._persistentStates.hideSketch = false;
                        AppData._persistentStates.productMailOn = true;
                        AppData._persistentStates.thankMailOn = true;
                        if (getStartPage() === Application.startPageId) {
                            // load color settings
                            Log.print(Log.l.trace, "calling select CR_VERANSTOPTION_ODataView...");
                            return DBInit.CR_VERANSTOPTION_ODataView.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "select CR_VERANSTOPTION_ODataView: success!");
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
                                //AppData.setErrorMsg(that.binding, errorResponse);
                                Log.print(Log.l.error, "error in select CR_VERANSTOPTION_ODataView statusText=" + (errorResponse && errorResponse.statusText));
                                if (errorResponse.status === 401 || errorResponse.status === 404) {
                                    WinJS.Promise.timeout(0).then(function () {
                                        Application.navigateById("login");
                                    });
                                }
                            }, { VeranstaltungID: AppData.getRecordId("Veranstaltung") }).then(function () {
                                var colors = Colors.updateColors();
                                return (colors && colors._loadCssPromise) || WinJS.Promise.as();
                            });
                        } else {
                            return WinJS.Promise.as();
                        }
                    }).then(function () {
                        if (getStartPage() === Application.startPageId) {
                            if (typeof Home === "object" && Home._actionsList) {
                                Home._actionsList = null;
                            }
                            Log.print(Log.l.trace, "calling select appListSpecView...");
                            return DBInit.appListSpecView.select(function(json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "select appListSpecView: success!");
                                // kontaktanzahlView returns object already parsed from json file in response
                                if (json && json.d && json.d.results) {
                                    NavigationBar.showGroupsMenu(json.d.results, true);
                                } else {
                                    NavigationBar.showGroupsMenu([]);
                                }
                            },
                            function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                Log.print(Log.l.error, "select appListSpecView: error!");
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                        } else {
                            return WinJS.Promise.as();
                        }
                    }).then(function () {
                        WinJS.Promise.timeout(0).then(function () {
                            // navigate async here to ensure load of navigation menu!
                            Application.navigateById(getStartPage());
                        });
                    });
                }
                Log.ret(Log.l.info);
                return ret;
            };
            that.openDb = openDb;

            var saveData = function (complete, error) {
                var err = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                that.binding.messageText = null;
                AppData.setErrorMsg(that.binding);
                AppBar.busy = true;
                var prevOnlinePath = that.binding.appSettings.odata.onlinePath;
                that.binding.appSettings.odata.onlinePath = AppData._persistentStatesDefaults.odata.onlinePath;
                that.binding.appSettings.odata.registerPath = AppData._persistentStatesDefaults.odata.registerPath;
                var ret = new WinJS.Promise.as().then(function () {
                    var languageId = AppData.getLanguageId();
                    Log.print(Log.l.trace, "calling PRC_GetLangText...");
                    return AppData.call("PRC_GetLangText", {
                        pLanguageID: languageId,
                        pTextTitle: 'login',
                        pResourceTypeID: 20004
                    }, function (json) {
                        Log.print(Log.l.info, "call PRC_GetLangText: success! ");
                        var results = json.d.results;
                        var myResourceStrings = '';
                        for (var i = 0; i < results.length; i++) {
                            myResourceStrings = myResourceStrings + results[i].ResultText + '\n';
                        }
                        Log.print(Log.l.trace, "myResourceStrings= " + myResourceStrings);
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "call PRC_GetLangText error: " +
                            AppData.getErrorMsgFromResponse(errorResponse) + " ignored for compatibility!");
                    }, true);
                }).then(function () {
                    Log.print(Log.l.trace, "calling insert loginRequest...");
                    return DBInit.loginRequest.insert(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "insert loginRequest: success!");
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
                                    that.binding.appSettings.odata.onlinePath =
                                        location + that.binding.appSettings.odata.onlinePath;
                                    that.binding.appSettings.odata.registerPath =
                                        location + that.binding.appSettings.odata.registerPath;
                                }
                                Application.pageframe.savePersistentStates();
                            }
                        } else {
                            AppBar.busy = false;
                            err = { status: 404, statusText: getResourceText("login.unknown") };
                            AppData.setErrorMsg(that.binding, err);
                            if (typeof error === "function") {
                                error(err);
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        Log.print(Log.l.info, "insert loginRequest error: " +
                            AppData.getErrorMsgFromResponse(errorResponse) + " ignored for compatibility!");
                        // ignore this error here for compatibility!
                    }, {
                        LoginName: that.binding.appSettings.odata.login
                    });
                }).then(function () {
                    if (!err && prevOnlinePath !== that.binding.appSettings.odata.onlinePath) {
                        var dataLogin = {
                            Login: that.binding.dataLogin.Login,
                            Password: that.binding.dataLogin.Password,
                            LanguageID: AppData.getLanguageId(),
                            Aktion: "Portal"
                        };
                        Log.print(Log.l.trace, "calling insert loginView...");
                        return DBInit.loginView.insert(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "insert loginView: success!");
                            // loginData returns object already parsed from json file in response
                            if (json && json.d) {
                                dataLogin = json.d;
                                if (dataLogin.OK_Flag === "X" && dataLogin.MitarbeiterID) {
                                    AppData._persistentStates.odata.login = that.binding.dataLogin.Login;
                                    AppData._persistentStates.odata.password = that.binding.dataLogin.Password;
                                    AppData.setRecordId("Mitarbeiter", dataLogin.MitarbeiterID);
                                    NavigationBar.enablePage("settings");
                                    NavigationBar.enablePage("info");
                                    Application.pageframe.savePersistentStates();
                                    AppBar.busy = false;
                                    AppData._curGetUserDataId = 0;
                                    AppData.getUserData();
                                    AppData.getMessagesData();
                                    if (typeof complete === "function") {
                                        complete(json);
                                    }
                                } else {
                                    AppBar.busy = false;
                                    that.binding.messageText = dataLogin.MessageText;
                                    err = { status: 401, statusText: dataLogin.MessageText };
                                    AppData.setErrorMsg(that.binding, err);
                                    if (typeof error === "function") {
                                        error(err);
                                    }
                                }
                            } else {
                                AppBar.busy = false;
                                Log.print(Log.l.error, "insert loginView: error no data found!");
                                err = { status: 404, statusText: "no data found" };
                                AppData.setErrorMsg(that.binding, err);
                                if (typeof error === "function") {
                                    error(err);
                                }
                            }
                        }, function (errorResponse) {
                            AppBar.busy = false;
                            err = errorResponse;
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            Log.print(Log.l.error, "insert loginView error: " +
                                AppData.getErrorMsgFromResponse(errorResponse));
                            AppData.setErrorMsg(that.binding, errorResponse);
                            if (typeof error === "function") {
                                error(errorResponse);
                            }
                        }, dataLogin);
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
                /*Test wenn Veranstaltung von anderen Browser geändert wird (wechsel)*/
                if (AppData._persistentStates.allRecIds && typeof AppData._persistentStates.allRecIds["Veranstaltung"] !== "undefined") {
                    delete AppData._persistentStates.allRecIds["Veranstaltung"];
                }
                Log.print(Log.l.trace, "Now calling saveData()");
                return that.saveData();
            }).then(function () {
                Log.print(Log.l.trace, "Now calling openDb()");
                return that.openDb();
            });
            Log.ret(Log.l.trace);
        })
    });
})();


