// controller for page: recover
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/recover/recoverService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Recover", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Recover.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataRecover: getEmptyDefaultValue(Recover.recoverView.defaultValue),
                emailOkFlag: null,
                recoverOkFlag: null
            }, commandList]);

            var queryToken = Application.query && Application.query.Token;

            var that = this;

            var getEmailOkFlagObsolet = function () {
                if (that.binding.dataRecover &&
                    (that.binding.dataRecover.ErfassungsStatus === 1 ||
                        that.binding.dataRecover.Freischaltung > 0)) {
                    return 1;
                } else {
                    return null;
                }
            };
            this.getEmailOkFlagObsolet = getEmailOkFlagObsolet;

            var getEmailOkFlag = function () {
                if (that.binding.dataRecover && that.binding.dataRecover.ErfassungsStatus) {
                    return 1;
                } else {
                    return null;
                }
            };
            this.getEmailOkFlag = getEmailOkFlag;

            var getRecoverOkFlag = function () {
                if (that.binding.dataRecover &&
                    that.binding.dataRecover.Freischaltung === 3 &&
                    that.binding.dataRecover.ErfassungsStatus === 1) {
                    return 1;
                } else {
                    return null;
                }
            };
            this.getRecoverOkFlag = getRecoverOkFlag;

            var setDataRecover = function (newDataRecover) {
                var i, recoverEmail, recoverComplete;
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.dataRecover = newDataRecover;
                that.binding.emailOkFlag = that.getEmailOkFlag();
                that.binding.recoverOkFlag = that.getRecoverOkFlag();
                if (that.binding.dataRecover.ErfassungsStatus === 1 &&
                    that.binding.dataRecover.Freischaltung === 0) {
                    that.binding.dataRecover.Freischaltung = 2;
                    recoverEmail = pageElement.querySelectorAll(".recover-email");
                    if (recoverEmail && recoverEmail.length > 0) {
                        WinJS.UI.Animation.exitContent(recoverEmail, null).then(function () {
                            for (i = 0; i < recoverEmail.length; i++) {
                                if (recoverEmail[i].style) {
                                    recoverEmail[i].style.visibility = "hidden";
                                    recoverEmail[i].style.display = "none";
                                }
                            }
                        });
                    }
                }
                if (that.binding.dataRecover.Freischaltung === 3) {
                    recoverComplete = pageElement.querySelectorAll(".recover-complete");
                    if (recoverComplete && recoverComplete.length > 0) {
                        for (i = 0; i < recoverComplete.length; i++) {
                            if (recoverComplete[i].style) {
                                recoverComplete[i].style.display = "inline";
                                recoverComplete[i].style.visibility = "visible";
                            }
                        }
                        //WinJS.UI.Animation.enterContent(recoverComplete, null, { mechanism: "transition" });
                        WinJS.UI.Animation.slideUp(recoverComplete);
                    }
                }
                if (that.binding.dataRecover.MessageText) {
                    AppData.setErrorMsg(that.binding, that.binding.dataRecover.MessageText);
                }
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
            }
            this.setDataRecover = setDataRecover;

            // define handlers
            this.eventHandlers = {
                clickBackToLogin: function (event) {
                    Log.call(Log.l.trace, "Recover.Controller.");
                    that.binding.dataRecover.Token = "";
                    Application.query.Token = "";
                    Application.navigateById("login");
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Recover.Controller.");
                    that.saveData(function (response) {
                        // called asynchronously if ok
                    }, function (errorResponse) {
                        // called asynchronously on error
                    });
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "Recover.Controller.");
                    if (AppData.generalData.logOffOptionActive) {
                        var anchor = document.getElementById("menuButton");
                        var menu = document.getElementById("menu1").winControl;
                        var placement = "bottom";
                        menu.show(anchor, placement);
                    } else {
                        Application.navigateById("userinfo", event);
                    }
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "Recover.Controller.");
                    var confirmTitle = getResourceText("account.confirmLogOff");
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            Log.print(Log.l.trace, "clickLogoff: user choice OK");
                            AppData._persistentStates.veranstoption = {};
                            AppData._persistentStates.colorSettings = copyByValue(AppData.persistentStatesDefaults.colorSettings);
                            AppData._persistentStates.individualColors = false;
                            AppData._persistentStates.isDarkTheme = false;
                            var colors = new Colors.ColorsClass(AppData._persistentStates.colorSettings);
                            AppData._persistentStates.individualColors = false;
                            AppData._persistentStates.isDarkTheme = false;
                            Application.pageframe.savePersistentStates();
                            that.binding.doEdit = false;
                            that.binding.generalData.notAuthorizedUser = false;
                            that.binding.enableChangePassword = false;
                            Application.navigateById("login", event);
                        } else {
                            Log.print(Log.l.trace, "clickLogoff: user choice CANCEL");
                        }
                    });
                    /*AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }*/
                    Log.ret(Log.l.trace);
                },
                clickRecoverOk: function (event) {
                    Log.call(Log.l.trace, "Recover.Controller.");
                    var dataRecover = that.binding.dataRecover;
                    var errorMessage = null;
                    if (typeof dataRecover.Password === "string" && dataRecover.Password.length < 5) {
                        errorMessage = getResourceText("employee.alertPasswordShort");
                        Log.print(Log.l.error, errorMessage);
                        alert(errorMessage);
                        if (typeof error === "function") {
                            error(errorMessage);
                        }
                        return WinJS.Promise.wrapError(errorMessage);
                    }
                    if ((!dataRecover.Password || !dataRecover.Password2 ||
                        dataRecover.Password2 !== dataRecover.Password)) {
                        errorMessage = getResourceText("employee.alertPassword");
                        Log.print(Log.l.error, errorMessage);
                        alert(errorMessage);
                        if (typeof error === "function") {
                            error(errorMessage);
                        }
                        return WinJS.Promise.wrapError(errorMessage);
                    }
                    that.doPWReset(function (response) {
                        that.binding.dataRecover.Token = null;
                        delete Application.query.Token;
                        var state = {};
                        var title = "";
                        var location = window.location.href.split("?")[0] + "?" + createQueryStringFromParameters(Application.query);
                        window.history.replaceState(state, title, location);
                        confirmModal(null,
                            "Passwort erfolgreich geändert!",
                            "Ok",
                            null,
                            function (result) {
                                if (result)
                                    Application.navigateById("login");
                            },
                            null);
                    }, null, queryToken, "CONFIRM");
                    Log.ret(Log.l.trace);
                },
                changePassword: function (event) {
                    Log.call(Log.l.trace, "Recover.Controller.");
                    if (AppBar.notifyModified) {
                        that.binding.dataRecover.Password2 = "";
                    }
                    Log.ret(Log.l.trace);
                },
                clickRecoverCancel: function (event) {
                    Log.call(Log.l.trace, "Recover.Controller.");
                    that.binding.dataRecover.Token = "";
                    delete Application.query.Token;
                    var state = {};
                    var title = "";
                    var location = window.location.href.split("?")[0] + "?" + createQueryStringFromParameters(Application.query);
                    window.history.replaceState(state, title, location);
                    Application.navigateById("login");
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickBackToLogin: function () {
                    return false;
                },
                clickOk: function () {
                    var ret = AppBar.busy || (that.binding.dataRecover.Email.length === 0);
                    var recoverButton = pageElement.querySelector("#recoverButton");
                    if (recoverButton) {
                        recoverButton.disabled = ret;
                    }
                    return ret;
                },
                clickLogoff: function () {
                    var logoffbutton = document.getElementById("logoffbutton");
                    if (logoffbutton) {
                        logoffbutton.disabled = that.binding.generalData.notAuthorizedUser ? false : that.binding.generalData.logOffOptionActive ? false : true;
                    }
                    if (that.binding.generalData.notAuthorizedUser) {
                        return false;
                    }
                    return !that.binding.generalData.logOffOptionActive;
                },
                clickRecoverOk: function () {
                    /*var ret = !(that.binding.dataRecover.Password.length === 0 && that.binding.dataRecover.Password2.length === 0);
                    var recoverButtonOk = pageElement.querySelector("#recoverButtonOk");
                    if (recoverButtonOk) {
                        recoverButtonOk.disabled = ret;
                    }*/
                    return false;
                }
            }

            var saveData = function (complete, error) {
                var err;
                Log.call(Log.l.trace, "Recover.Controller.");
                that.binding.dataRecover.ErfassungsStatus = 0;
                AppData.setErrorMsg(that.binding);
                AppBar.busy = true;
                //PRC_RequestPWReset
                var ret = AppData.call("PRC_RequestPWReset", {
                    pEMail: that.binding.dataRecover.Email
                }, function (json) {
                    Log.print(Log.l.info, "call success! ");
                    AppData.prevLogin = AppData._persistentStates.odata.login;
                    AppData.prevPassword = AppData._persistentStates.odata.password;
                    AppBar.busy = false;
                    // this callback will be called asynchronously
                    // when the response is available
                    Log.print(Log.l.trace, "recoverData: success!");
                    // loginData returns object already parsed from json file in response
                    if (json && json.d && json.d.results && json.d.results.length > 0) {
                        //that.setDataRecover(json.d);
                        //Application.navigateById("login");
                        var result = json.d.results[0];
                        if (result && result.ResultCode === 0) {
                            confirmModal(null,
                                result.ResultMessage,
                                "OK",
                                null,
                                function (result) {
                                    if (result) {
                                        Log.print(Log.l.info, "call ok" + result);
                                        that.binding.emailOkFlag = true;
                                        var recoverComplete = pageElement.querySelectorAll(".recover-complete");
                                        if (recoverComplete && recoverComplete.length > 0) {
                                            for (var i = 0; i < recoverComplete.length; i++) {
                                                if (recoverComplete[i].style) {
                                                    recoverComplete[i].style.display = "inline";
                                                    recoverComplete[i].style.visibility = "visible";
                                                }
                                            }
                                            //WinJS.UI.Animation.enterContent(recoverComplete, null, { mechanism: "transition" });
                                            return WinJS.Promise.timeout(100).then(function() {
                                                WinJS.UI.Animation.slideUp(recoverComplete);
                                            });
                                        }
                                        AppBar.triggerDisableHandlers();
                                    }
                                });
                        }
                        if (result && result.ResultCode === 2) {
                            confirmModal(null,
                                result.ResultMessage,
                                "OK",
                                null,
                                function (result) {
                                    if (result) {
                                        Log.print(Log.l.info, "call ok" + result);
                                        //that.binding.emailOkFlag = true;
                                        //AppBar.triggerDisableHandlers();
                                    }
                                });
                        }
                    } else {
                        err = { status: 404, statusText: "result of PRC_RequestPWReset is empty" };
                        AppData.setErrorMsg(that.binding, err);
                        error(err);
                    }
                    return WinJS.Promise.as();
                }, function (err) {
                    Log.print(Log.l.error, "call error");
                    AppData.setErrorMsg(that.binding, err);
                }, true);
                /*var ret = Recover.recoverView.insert(function (json) {
                    AppBar.busy = false;
                    // this callback will be called asynchronously
                    // when the response is available
                    Log.print(Log.l.trace, "recoverData: success!");
                    // loginData returns object already parsed from json file in response
                    if (json && json.d) {
                        that.setDataRecover(json.d);
                    } else {
                        err = { status: 404, statusText: "no data found" };
                        AppData.setErrorMsg(that.binding, err);
                        error(err);
                    }
                    return WinJS.Promise.as();
                }, function (errorResponse) {
                    AppBar.busy = false;
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    AppData.setErrorMsg(that.binding, errorResponse);
                    error(errorResponse);
                    return WinJS.Promise.as();
                }, that.binding.dataRecover);*/
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            var doPWReset = function (complete, error, token, action) {
                Log.call(Log.l.trace, "AppData.getVAOptions.");
                var ret = AppData.call("PRC_DoPWReset", {
                    pTokenString: token,
                    pAction: action,
                    pNewPassword: action === "CONFIRM" ? that.binding.dataRecover.Password : null
                }, function (json) {
                    Log.print(Log.l.info, "call success! ");
                    var result = null;
                    AppBar.busy = false;
                    Log.print(Log.l.trace, "DoPWReset: success!");
                    if (json && json.d && json.d.results.length > 0) {
                        Log.print(Log.l.info, "call success! response=" + json.d.results[0]);
                        result = json.d.results[0];
                    }
                    if (typeof complete === "function") {
                        complete(result);
                    }
                }, function (err) {
                    Log.print(Log.l.error, "call error");
                    if (typeof error === "function") {
                        error(err);
                    }
                    AppData.setErrorMsg(that.binding, err);
                }, true);
                Log.ret(Log.l.trace);
                return ret;
            }
            this.doPWReset = doPWReset;

            that.setDataRecover(getEmptyDefaultValue(Recover.recoverView.defaultValue));
            that.binding.dataRecover.LanguageID = AppData.getLanguageId();
            Log.print(Log.l.trace, "LanguageID=" + that.binding.dataRecover.LanguageID);

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                AppBar.notifyModified = true;
            }).then(function () {
                Log.print(Log.l.trace, "Appheader refresh complete");
                Application.pageframe.hideSplashScreen();
            }).then(function () {
                //AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Binding wireup page complete");
                if (AppHeader && AppHeader.controller) {
                    return AppHeader.controller.loadData();
                } else {
                    return WinJS.Promise.as();
                }
            }).then(function () {
                if (!queryToken) {
                    return WinJS.Promise.as();
                }
                return that.doPWReset(function (response) {
                    if (response) {
                        if (response.ResultCode === 1330) {
                            return confirmModal(null,
                                response.ResultMessage + " Please request a reset again!",
                                "Ok",
                                null,
                                function(result) {
                                    if (result) {
                                        that.binding.dataRecover.Token = null;
                                        Application.query.Token = null;
                                        var state = {};
                                        var title = "";
                                        var location = window.location.href.split("?")[0] + "?" + createQueryStringFromParameters(Application.query);
                                        window.history.replaceState(state, title, location);
                                    }
                                });
                        }
                        that.binding.dataRecover.Token = queryToken;
                        that.binding.dataRecover.MatchedCustomer = response.MatchedCustomer;
                        that.binding.emailOkFlag = response;
                    }
                }, null, queryToken, "CHECK");
            });
            Log.ret(Log.l.trace);
        })
    });
})();


