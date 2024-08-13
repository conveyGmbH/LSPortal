// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/mailingTypes/mailingTypesService.js" />
/// <reference path="~/www/pages/siteEventsList/siteEventsListController.js" />
/// <reference path="~/www/fragments/empRoles/empRolesController.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("MailingTypes", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "MailingTypes.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataMailingTypeData: getEmptyDefaultValue(MailingTypes.cr_Event_MailTypeView.defaultValue),
                dataMailTypesData: getEmptyDefaultValue(MailingTypes.MailTypeVIEW.defaultValue)
            }, commandList]);

            this.sendDayHookList = new WinJS.Binding.List([
                { SendDayHook: null, TITLE: null },
                { SendDayHook: "E", TITLE: getResourceText("mailingTypes.eventEnde") }, 
                { SendDayHook: "S", TITLE: getResourceText("mailingTypes.eventStart") }
            ]);

            var that = this;

            var sendDayHook = pageElement.querySelector("#SendDayHook");
            var mailTypes = pageElement.querySelector("#MailTypes");

            var showDateRestrictions = function () {
                return WinJS.Promise.as().then(function () {
                    if (typeof that.binding.dataMailingTypeData.useSendStartTime == "undefined") {
                        that.binding.dataMailingTypeData.useSendStartTime = false;
                    }
                });
            }
            this.showDateRestrictions = showDateRestrictions;

            this.dispose = function () {
                if (sendDayHook && sendDayHook.winControl) {
                    sendDayHook.winControl.data = null;
                }
            }

            var resultConverter = function (item, index) {
                if (item.SendLater === "N") {
                    item.SendLater = null;
                }
                if (sendDayHook && sendDayHook.winControl) {
                    if (!sendDayHook.winControl.data ||
                        sendDayHook.winControl.data && !sendDayHook.winControl.data.length) {
                        sendDayHook.winControl.data = that.sendDayHookList;
                        sendDayHook.value = item.SendDayHook;
                    }
                }
                if (item.Enabled === "f") {
                    item.Enabled = null;
                }
                if (item.SendStartTime) {
                    item.useSendStartTime = true;
                    var dateString = item.SendStartTime.replace("\/Date(", "").replace(")\/", "");
                    var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;

                    // milliseconds to hour, minute
                    var hour = Math.floor(milliseconds / 3600000);
                    if (hour < 10) {
                        hour = "0" + hour;
                    }
                    milliseconds = milliseconds - hour * 3600000;
                    var minutes = Math.floor(milliseconds / 60000);
                    if (minutes < 10) {
                        minutes = "0" + minutes;
                    }
                    var rest = milliseconds - minutes * 60000;

                    if (rest === 0) {
                        item.SendStartTime = hour + ":" + minutes;
                    }
                } else {
                    item.useSendStartTime = false;
                }
            }
            this.resultConverter = resultConverter;

            var setDataMailingTypeData = function (newDataMailingTypeData) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.resultConverter(newDataMailingTypeData);
                that.binding.dataMailingTypeData = newDataMailingTypeData;
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
            }
            this.setDataMailingTypeData = setDataMailingTypeData;

            var getRecordId = function () {
                Log.call(Log.l.trace, "Employee.Controller.");
                var recordId = that.binding.dataMailingTypeData && that.binding.dataMailingTypeData.CR_Event_MailTypeVIEWID;
                if (!recordId) {
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        recordId = master.controller.binding.employeeId;
                    }
                }
                Log.ret(Log.l.trace, recordId);
                return recordId;
            }
            this.getRecordId = getRecordId;


            var deleteData = function (complete, error) {
                Log.call(Log.l.trace, "Employee.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var recordId = getRecordId();
                if (recordId) {
                    AppBar.busy = true;
                    ret = MailingTypes.cr_Event_MailTypeView.deleteRecord(function (response) {
                        AppBar.busy = false;
                        // called asynchronously if ok
                        that.setDataMailingTypeData(getEmptyDefaultValue(MailingTypes.cr_Event_MailTypeView.defaultValue));
                        if (typeof complete === "function") {
                            complete(response);
                        }
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (typeof error === "function") {
                            error(errorResponse);
                        }
                    }, recordId);
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.deleteData = deleteData;


            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "MailingTypes.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "MailingTypes.Controller.");
                    that.saveData(function (response) {
                        AppBar.busy = true;
                        Log.print(Log.l.trace, "MailingTypes saved");
                        var newMailType = getEmptyDefaultValue(MailingTypes.cr_Event_MailTypeView.defaultValue);
                        newMailType.MailTypeID = that.binding.dataMailingTypeData.MailTypeID;
                        newMailType.EventID = that.binding.dataMailingTypeData.EventID;
                        MailingTypes.cr_Event_MailTypeView.insert(function (json) {
                            AppBar.busy = false;
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.info, "MailingTypes insert: success!");
                            // MailingTypes returns object already parsed from json file in response
                            if (json && json.d) {
                                that.setDataMailingTypeData(json.d);
                                /* MailingTypes Liste neu laden und Selektion auf neue Zeile setzen */
                              /*  var master = Application.navigator.masterControl;
                                if (master && master.controller && master.controller.binding) {
                                    master.controller.binding.employeeId = that.binding.dataEmployee.MitarbeiterVIEWID;
                                    master.controller.loadData().then(function () {
                                        master.controller.selectRecordId(that.binding.dataEmployee.MitarbeiterVIEWID);
                                    });
                                }*/
                            }
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "error inserting employee");
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, newMailType);
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee");
                    });
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    var confirmTitle = getResourceText("employee.questionDelete");
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            Log.print(Log.l.trace, "clickDelete: user choice OK");
                            deleteData(function (response) {
                                /* Mitarbeiter Liste neu laden und Selektion auf neue Zeile setzen 
                                var master = Application.navigator.masterControl;
                                if (master && master.controller && master.controller.binding) {
                                    var prevSelIdx = master.controller.binding.selIdx;
                                    master.controller.loadData().then(function () {
                                        Log.print(Log.l.info, "master.controller.loadData: success!");
                                        master.controller.setSelIndex(prevSelIdx);
                                    });
                                }*/
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
                            Log.print(Log.l.trace, "clickDelete: user choice CANCEL");
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "MailingTypes.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "MailingType saved");
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving MailingType");
                    });
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "MailingTypes.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "MailingTypes.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "MailingTypes.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "MailingTypes.Controller.");
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
                changedMailType: function (event) {
                    Log.call(Log.l.trace, "MailingTypes.Controller.");
                    //AppBar.modified = true;
                    AppData.setRecordId("MailType", parseInt(event.currentTarget.value));
                    that.loadData(AppData.getRecordId("VeranstaltungTermin"), parseInt(event.currentTarget.value));
                    Log.ret(Log.l.trace);
                },
                changedMailTypeEnabledDisabled: function(event) {
                    Log.call(Log.l.trace, "MailingTypes.Controller.");
                    AppBar.modified = true;
                    var toggle = event.currentTarget;
                    if (toggle.checked) {
                        that.binding.dataMailingTypeData.Enabled = "1";
                    } else {
                        that.binding.dataMailingTypeData.Enabled = null;
                    }
                    AppData.call("PRC_Check_All_MailingdataRT",
                        {
                             pVeranstaltungTerminID: AppData.getRecordId("VeranstaltungTermin")
                        },
                        function(json) {
                            Log.print(Log.l.info, "call success! ");
                        },
                        function(error) {
                            Log.print(Log.l.error, "call error");
                        });
                    Log.ret(Log.l.trace);
                },
                clickSendStartTime: function (event) {
                    if (event.currentTarget) {
                        that.binding.dataMailingTypeData.useSendStartTime = event.currentTarget.checked;
                    }
                    AppBar.modified = true;
                    that.showDateRestrictions();
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
                clickNew: function () {
                    return false;
                    
                },
                clickDelete: function () {
                    if (that.binding.dataMailingTypeData && that.binding.dataMailingTypeData.CR_Event_MailTypeVIEWID && !AppBar.busy &&
                        that.binding.dataMailingTypeData.EventID === AppData.getRecordId("VeranstaltungTermin")) {
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding &&
                            master.controller.binding.eventId) {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                },
                clickOk: function () {
                    return AppBar.busy;
                }
            };

            var loadData = function (eventId, mailTypeId) {
                Log.call(Log.l.trace, "MailingTypes.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function() {
                    if (AppBar.modified) {
                        return that.saveData(function() {
                                Log.print(Log.l.trace, "saveData completed...");
                                var master = Application.navigator.masterControl;
                                if (master && master.controller) {
                                    master.controller.loadData().then(function() {
                                        master.controller.selectRecordId(eventId);
                                    });
                                }
                            },
                            function(errorResponse) {
                                Log.print(Log.l.error, "saveData error...");
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    Log.print(Log.l.trace, "calling select MailingTypes...");
                    return MailingTypes.MailTypeVIEW.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "MailingTypes: success!");
                        if (json && json.d && json.d.results.length > 0) {
                            // now always edit!
                            var firstItem = [{ MailTypeVIEWID: 0, Name: "" }];
                            var results = firstItem.concat(json.d.results);
                            if (mailTypes && mailTypes.winControl) {
                                //that.binding.dataMailTypesData = json.d.results
                                mailTypes.winControl.data = new WinJS.Binding.List(results);
                            }
                        } else {
                            AppData.call("PRC_InitCR_Event_MailType",
                                {
                                    pEventID: AppData.getRecordId("VeranstaltungTermin")
                                },
                                function (json) {
                                    Log.print(Log.l.info, "call success! ");
                                },
                                function (error) {
                                    Log.print(Log.l.error, "call error");
                                    AppData.setErrorMsg(that.binding, error);
                                });
                        }
                    },
                        function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                }).then(function () {
                        if (!mailTypeId) {
                            mailTypeId = AppData.getRecordId("MailType");
                        }
                    if (eventId && mailTypeId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select MailTypeVIEW_20570...");
                        return MailingTypes.cr_Event_MailTypeVIEW_20570.select(function(json) {
                                AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "MailTypeVIEW_20570: success!");
                                if (json && json.d && json.d.results.length > 0) {
                                    // now always edit!
                                    var recordId = json.d.results[0].MailTypeID;
                                    that.setDataMailingTypeData(json.d.results[0]);
                                    AppData.setRecordId("MailType", recordId);
                                    mailTypes.value = recordId;
                                } else {
                                    mailTypes.value = 0;
                                    that.setDataMailingTypeData(getEmptyDefaultValue(MailingTypes.cr_Event_MailTypeView.defaultValue));
                                    AppData.call("PRC_InitCR_Event_MailType",
                                        {
                                            pEventID: AppData.getRecordId("VeranstaltungTermin")
                                        },
                                        function(json) {
                                            Log.print(Log.l.info, "call success! ");
                                        },
                                        function(error) {
                                            Log.print(Log.l.error, "call error");
                                            AppData.setErrorMsg(that.binding, error);
                                        });
                                }

                            },
                            function(errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                            },
                            { EventID: eventId, MailTypeID: mailTypeId });
                    } else {
                        mailTypes.value = 0;
                        that.setDataMailingTypeData(getEmptyDefaultValue(MailingTypes.cr_Event_MailTypeView.defaultValue));
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    AppBar.notifyModified = true;
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            // save data
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "mailTypes.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var mailingTypeData = that.binding.dataMailingTypeData;
                if (mailingTypeData.SendStartTime !== null && mailingTypeData.SendStartTime.trim() === "") {
                    mailingTypeData.SendStartTime = null;
                }
                var matchValidTime;
                if (mailingTypeData.SendStartTime) {
                    matchValidTime = (mailingTypeData.SendStartTime).match(/^(0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/); //^([0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$
                }
                if (mailingTypeData.SendDay === null || mailingTypeData.SendDay === "") {
                    mailingTypeData.SendDay = 0;
                }
                var milliseconds = 0;
                if (matchValidTime === null) {
                    Log.print(Log.l.error, "invalid time");
                    alert(getResourceText("error.invalidTime"));
                    return WinJS.Promise.as();
                }

                if (mailingTypeData && AppBar.modified && !AppBar.busy) {
                        var recordId = getRecordId();
                        if (recordId) {
                            AppBar.busy = true;
                        AppData.call("PRC_UpdateCREventMailType",
                            {
                                pCREventMailTypeID: recordId,
                                pMailTypeID: mailingTypeData.MailTypeID,
                                pEventID: mailingTypeData.EventID,
                                pSendDay: parseInt(mailingTypeData.SendDay),
                                pSendDayHook: mailingTypeData.SendDayHook,
                                pSendLater: mailingTypeData.SendLater,
                                pSendStartTime: mailingTypeData.SendStartTime,
                                pOncePerType: mailingTypeData.OncePerType,
                                pCCAddr: mailingTypeData.CCAddr,
                                pBCCAddr: mailingTypeData.BCCAddr,
                                pFromAddr: mailingTypeData.FromAddr,
                                pReplyToAddr: mailingTypeData.ReplyToAddr,
                                pEnabled: mailingTypeData.Enabled
                            },
                            function (json) {
                                Log.print(Log.l.info, "call  PRC_UpdateCREventMailType: success!");
                                // milliseconds to hour, minute
                                AppBar.busy = false;
                                /*if (mailingTypeData.SendStartTime) {
                                var hour = Math.floor(milliseconds / 3600000);
                                if (hour < 10) {
                                    hour = "0" + hour;
                                }
                                milliseconds = milliseconds - hour * 3600000;
                                var minutes = Math.floor(milliseconds / 60000);
                                if (minutes < 10) {
                                    minutes = "0" + minutes;
                                }
                                var rest = milliseconds - minutes * 60000;

                                if (rest === 0) {
                                    that.binding.dataMailingTypeData.SendStartTime = hour + ":" + minutes;
                                }
                                }*/
                                AppBar.modified = false;
                            },
                            function (error) {
                                AppBar.busy = false;
                                Log.print(Log.l.error, "call error");
                            });
                        } else {
                            Log.print(Log.l.info, "not supported");
                            ret = WinJS.Promise.as();
                        }
                } else if (AppBar.busy) {
                    if (mailingTypeData.SendStartTime) {
                        var hour = Math.floor(milliseconds / 3600000);
                        if (hour < 10) {
                            hour = "0" + hour;
                        }
                        milliseconds = milliseconds - hour * 3600000;
                        var minutes = Math.floor(milliseconds / 60000);
                        if (minutes < 10) {
                            minutes = "0" + minutes;
                        }
                        var rest = milliseconds - minutes * 60000;

                        if (rest === 0) {
                            that.binding.dataMailingTypeData.SendStartTime = hour + ":" + minutes;
                        }
                    }
                   
                    ret = WinJS.Promise.timeout(100).then(function () {
                        return that.saveData(complete, error);
                    });
                } else {
                    if (mailingTypeData.SendStartTime) {
                        var hour = Math.floor(milliseconds / 3600000);
                        if (hour < 10) {
                            hour = "0" + hour;
                        }
                        milliseconds = milliseconds - hour * 3600000;
                        var minutes = Math.floor(milliseconds / 60000);
                        if (minutes < 10) {
                            minutes = "0" + minutes;
                        }
                        var rest = milliseconds - minutes * 60000;

                        if (rest === 0) {
                            that.binding.dataMailingTypeData.SendStartTime = hour + ":" + minutes;
                        }
                    }

                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete(mailingTypeData);
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                var recordId = null;
                if (AppData.getRecordId("MailType")) {
                    recordId = AppData.getRecordId("MailType");
                }
                that.loadData(AppData.getRecordId("VeranstaltungTermin"), recordId);  //MailingTypes
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
                return that.showDateRestrictions();
            });
            Log.ret(Log.l.trace);
        })
    });
})();



