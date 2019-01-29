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
                { SendDayHook: "E", TITLE: "E" },
                { SendDayHook: "S", TITLE: "S" }
            ]);

            var that = this;

            var sendDayHook = pageElement.querySelector("#SendDayHook");
            var mailTypes = pageElement.querySelector("#MailTypes");

            this.dispose = function () {
                if (sendDayHook && sendDayHook.winControl) {
                    sendDayHook.winControl.data = null;
                }
            }

            var setDataMailingTypeData = function (newDataMailingTypeData) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.dataMailingTypeData = newDataMailingTypeData;
                if (that.binding.dataMailingTypeData.SendLater === "N") {
                    that.binding.dataMailingTypeData.SendLater = null;
                }
                if (sendDayHook && sendDayHook.winControl) {
                    if (!sendDayHook.winControl.data ||
                        sendDayHook.winControl.data && !sendDayHook.winControl.data.length) {
                        sendDayHook.winControl.data = that.sendDayHookList;
                        sendDayHook.value = newDataMailingTypeData.SendDayHook;
                    }
                }
               // if (toggle && toggle.winControl) {
                    if (that.binding.dataMailingTypeData.Enabled === "f")
                        that.binding.dataMailingTypeData.Enabled = null;
              
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
                        Log.print(Log.l.trace, "employee saved");
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee");
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
                    var toggle = event.currentTarget.winControl;
                    that.binding.dataMailingTypeData.Enabled = toggle.checked;
                    AppData.call("PRC_Check_All_Mailingdata",
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
                    return MailingTypes._MailTypeVIEW.select(function (json) {
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
                                });
                        }
                    },
                        function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                }).then(function () {
                    if (eventId && mailTypeId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select MailTypeVIEW_20570...");
                        return MailingTypes.cr_Event_MailTypeVIEW_20570.select(function(json) {
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "MMailTypeVIEW_20570: success!");
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
                }) /*.then(function () {
                    var empRolesFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("empRoles"));
                    if (empRolesFragmentControl && empRolesFragmentControl.controller) {
                        return empRolesFragmentControl.controller.loadData(recordId);
                    } else {
                        var parentElement = pageElement.querySelector("#emproleshost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "empRoles", { employeeId: recordId });
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                })*/.then(function() {
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
                var dataMailingTypeData = that.binding.dataMailingTypeData;
                if (dataMailingTypeData && AppBar.modified && !AppBar.busy) {
                        var recordId = getRecordId();
                        if (recordId) {
                            AppBar.busy = true;
                            ret = MailingTypes.cr_Event_MailTypeView.update(function (response) {
                                AppBar.busy = false;
                                // called asynchronously if ok
                                Log.print(Log.l.info, "mailTypesData update: success!");
                                AppBar.modified = false;
                                complete(response);
                            }, function (errorResponse) {
                                AppBar.busy = false;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                error(errorResponse);
                            }, recordId, dataMailingTypeData);
                        } else {
                            Log.print(Log.l.info, "not supported");
                            ret = WinJS.Promise.as();
                        }
                   
                } else if (AppBar.busy) {
                    ret = WinJS.Promise.timeout(100).then(function () {
                        return that.saveData(complete, error);
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        complete(dataMailingTypeData);
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
                return that.loadData(AppData.getRecordId("VeranstaltungTermin"), recordId);  //MailingTypes
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



