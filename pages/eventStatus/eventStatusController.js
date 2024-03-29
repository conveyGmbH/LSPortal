﻿// controller for page: photo
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/eventStatus/eventStatus.js" />


(function () {
    "use strict";

    WinJS.Namespace.define("EventStatus", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "EventStatus.Controller.");
            Application.Controller.apply(this, [pageElement, {
                eventData: getEmptyDefaultValue(EventStatus.veranstaltungView.defaultValue),
                sessionData: getEmptyDefaultValue(EventStatus.BBBSessionODataView.defaultValue)
            }, commandList]);

            var that = this;

            var master = Application.navigator.masterControl;
            if (master && master.controller && master.controller.binding) {
                that.binding.eventName = master.controller.binding.eventName;
            }

            var requestSessionEndData = function () {
                Log.call(Log.l.trace, "EventStatus.Controller.");
                var eventSessionFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("eventSession"));
                if (eventSessionFragmentControl && eventSessionFragmentControl.controller) {
                    return eventSessionFragmentControl.controller.binding.selectedData;
                }
                Log.call(Log.l.trace, "EventStatus.Controller.");
            }
            this.requestSessionEndData = requestSessionEndData;

            var getModeratorData = function () {
                Log.call(Log.l.trace, "EventStatus.Controller.");
                var eventSessionFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("eventSession"));
                if (eventSessionFragmentControl && eventSessionFragmentControl.controller) {
                    return eventSessionFragmentControl.controller.binding.moderatorData;
                }
                Log.call(Log.l.trace, "EventStatus.Controller.");
            }
            this.getModeratorData = getModeratorData;

            var requestSessionEnd = function (complete, error) {
                Log.call(Log.l.trace, "Contact.Controller.");
                AppData.setErrorMsg(that.binding);
                var sessionEndData = that.requestSessionEndData();
                var moderatorData = that.getModeratorData();
                if (sessionEndData && sessionEndData.VeranstaltungID && moderatorData && moderatorData.UserToken) {
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_RequestSessionEnd", {
                        pVeranstaltungID: sessionEndData.VeranstaltungID,
                        pUserToken: moderatorData.UserToken
                    }, function (json) {
                        AppBar.busy = false;
                        Log.print(Log.l.trace, "PRC_RequestSessionEnd success!");
                        if (json && json.d && json.d.results) {
                            var eventSessionFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("eventSession"));
                            if (eventSessionFragmentControl && eventSessionFragmentControl.controller) {
                                return eventSessionFragmentControl.controller.loadData(sessionEndData.VeranstaltungID);
                            }
                            Log.call(Log.l.trace, "EventStatus.Controller.");
                        }
                        Log.ret(Log.l.trace);
                    }, function (error) {
                        Log.print(Log.l.error, "PRC_RequestSessionEnd error! ");
                    });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                }
                Log.ret(Log.l.trace);
            }
            this.requestSessionEnd = requestSessionEnd;

            var getSessionData = function () {
                Log.call(Log.l.trace, "EventStatus.Controller.");
                var eventSessionFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("eventSession"));
                if (eventSessionFragmentControl && eventSessionFragmentControl.controller) {
                    return eventSessionFragmentControl.controller.binding.selectedData;
                } else {
                    return WinJS.Promise.as();
                }
                Log.call(Log.l.trace, "EventStatus.Controller.");
            }
            this.getSessionData = getSessionData;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "EventStatus.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickDontShow: function (event) {
                    Log.call(Log.l.trace, "EventStatus.Controller.");
                    var checked = event.currentTarget.checked;
                    var sessionData = getSessionData();
                    if (checked) {
                        sessionData.DontShow = 1;
                    } else {
                        sessionData.DontShow = null;
                    }
                    var recordId = sessionData.BBBSessionVIEWID;
                    Log.call(Log.l.trace, "EventStatus.Controller.");
                    var ret = new WinJS.Promise.as().then(function () {
                        return EventStatus.BBBSessionODataView.update(function (json) {
                            AppBar.busy = false;
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.info, "BBBSessionODataView update: success!");
                            AppBar.modified = false;
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "error update BBBSessionODataView");
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, recordId, sessionData);
                    });
                    Log.ret(Log.l.trace);
                    return ret;
                },
                clickEndSession: function (event) {
                    Log.call(Log.l.trace, "EventStatus.Controller.");
                    var confirmTitle = getResourceText("eventStatus.confirmSessionEnd");
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            Log.print(Log.l.trace, "clickEndSession: user choice OK");
                            requestSessionEnd(function (response) {
                                // delete OK - goto start
                            }, function (errorResponse) {
                                // delete ERROR
                                var message = null;
                                Log.print(Log.l.error, "error status=" + errorResponse.status + " statusText=" + errorResponse.statusText);
                                if (errorResponse.data && errorResponse.data.error) {
                                    Log.print(Log.l.error, "error code=" + errorResponse.data.error.code);
                                    if (errorResponse.data.error.message) {
                                        Log.print(Log.l.error, "error message=" + errorResponse.data.error.message.value);
                                        message = errorResponse.data.error.message.value;
                                    }
                                }
                                if (!message) {
                                    message = getResourceText("error.delete");
                                }
                                alert(message);
                            });
                        } else {
                            Log.print(Log.l.trace, "clickEndSession: user choice CANCEL");
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "EventStatus.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "starturl saved");

                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee");
                    });
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "EventStatus.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "EventStatus.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "Account.Controller.");
                    AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickSave: function () {
                    if (that.binding.eventData.VeranstaltungVIEWID) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

            var loadData = function () {
                Log.call(Log.l.trace, "EventStatus.Controller.");
                var master = Application.navigator.masterControl;
                var recordId = null;
                that.binding.eventName = master.controller.binding.eventName;
                recordId = master.controller.binding.eventId;
                that.binding.eventId = recordId;

                AppData.setErrorMsg(that.binding);
                var ret;
                if (recordId) {
                    ret = new WinJS.Promise.as().then(function () {
                        return EventStatus.veranstaltungView.select(function (json) {
                            Log.print(Log.l.trace, "veranstaltungView: success!");
                            if (json && json.d) {
                                var result = json.d;
                                that.binding.eventData = result;
                                Log.print(Log.l.trace, "Data loaded");
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            that.loading = false;
                        }, recordId);
                    }).then(function () {
                        var eventSessionFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("eventSession"));
                        if (eventSessionFragmentControl && eventSessionFragmentControl.controller) {
                            eventSessionFragmentControl.controller.binding.recordId = 0;
                            return eventSessionFragmentControl.controller.loadData();
                        } else {
                            var parentElement = pageElement.querySelector("#eventSessionhost");
                            if (parentElement) {
                                return Application.loadFragmentById(parentElement, "eventSession", {});
                            } else {
                                return WinJS.Promise.as();
                            }
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                //return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();


