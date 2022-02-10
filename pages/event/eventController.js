// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/event/eventService.js" />
/// <reference path="~/www/pages/home/homeService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("Event", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Event.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataEvent: getEmptyDefaultValue(Event.eventView.defaultValue),
                isQuestionnaireVisible: !AppData._persistentStates.hideQuestionnaire,
                isSketchVisible: !AppData._persistentStates.hideSketch,
                isCameraVisible: !AppData._persistentStates.hideCameraScan,
                isBarcodeScanVisible: !AppData._persistentStates.hideBarcodeScan,
                isDBSyncVisible: AppHeader.controller.binding.userData.SiteAdmin,
                isPrivacyPolicySVGVisible: AppData._persistentStates.privacyPolicySVGVisible,
                isSendMailPrivacypolicy: AppData._persistentStates.sendMailPrivacypolicy,
                showQRCode: AppData._persistentStates.showQRCode,
                isvisitorFlowVisible: AppData._persistentStates.showvisitorFlow,
                isvisitorFlowVisibleAndLeadSuccess: AppData._persistentStates.showvisitorFlowAndLeadSuccess,
                showNameInHeader: AppData._persistentStates.showNameInHeader,
                visitorFlowFeature: AppHeader.controller.binding.userData.SiteAdmin,
                visitorFlowPremium: AppData._persistentStates.visitorFlowPremium,
                dashboardMesagoFeature: AppHeader.controller.binding.userData.SiteAdmin,
                isDashboardPremium: AppData._persistentStates.showdashboardMesagoCombo === 1 ? true:false,
                actualYear: new Date().getFullYear()
            }, commandList]);

            var that = this;

            //select combo
            var initLand = pageElement.querySelector("#InitLand");
            var initServer = pageElement.querySelector("#InitServer");
            var visitorFlow = pageElement.querySelector("#showvisitorFlowCombo");
            var dashboardMesagoCombo = pageElement.querySelector('#showdashboardMesagoCombo');
            var premiumDashboardCombo = pageElement.querySelector('#showPremiumDashboardCombo');
            var textComment = pageElement.querySelector(".input_text_comment");

            this.dispose = function () {
                if (initLand && initLand.winControl) {
                    initLand.winControl.data = null;
                }
                if (initServer && initServer.winControl) {
                    initServer.winControl.data = null;
                }
                if (visitorFlow && visitorFlow.winControl) {
                    visitorFlow.winControl.data = null;
            }
                if (dashboardMesagoCombo && dashboardMesagoCombo.winControl) {
                    dashboardMesagoCombo.winControl.data = null;
                }
            }

            var creatingVisitorFlowCategory = function () {
                Log.call(Log.l.trace, "Event.Controller.");
                var exhibitorCategory = [
                    {
                        value: 0,
                        TITLE: "LeadSuccess"
                    },
                    {
                        value: 1,
                        TITLE: "VisitorFlow"
                    },
                    {
                        value: 2,
                        TITLE: "LeadSuccess/VisitorFlow"
                    }
                ];
                if (visitorFlow && visitorFlow.winControl) {
                    visitorFlow.winControl.data = new WinJS.Binding.List(exhibitorCategory);
                    visitorFlow.selectedIndex = AppData._persistentStates.showvisitorFlow;
                }
            };
            this.creatingVisitorFlowCategory = creatingVisitorFlowCategory;

            var creatingDashboardMesagoComboCategory = function () {
                Log.call(Log.l.trace, "Event.Controller.");
                var dashboardMesagoComboCategory = [
                    {
                        value: 0,
                        TITLE: ""
                    },
                    {
                        value: 1,
                        TITLE: getResourceText("label.startPremium")/*"Premium"*/
                    },
                    {
                        value: 2,
                        TITLE: getResourceText("label.startSurpreme")/*"Supreme"*/
                    },
                    {
                        value: 3,
                        TITLE: getResourceText("label.startPremium1")/*"Premium"*/
                    },
                    {
                        value: 4,
                        TITLE: getResourceText("label.startPremium2")/*"Premium"*/
                    }
                ];
                if (dashboardMesagoCombo && dashboardMesagoCombo.winControl) {
                    dashboardMesagoCombo.winControl.data = new WinJS.Binding.List(dashboardMesagoComboCategory);
                    dashboardMesagoCombo.selectedIndex = AppData._persistentStates.showdashboardMesagoCombo;
                }
            };
            this.creatingDashboardMesagoComboCategory = creatingDashboardMesagoComboCategory;

            var creatingPremiumDashboardComboCategory = function () {
                Log.call(Log.l.trace, "Event.Controller.");
                var premiumDashboardComboCategory = [
                    {
                        value: 0,
                        TITLE: getResourceText("label.startPremiumStandard")
                    },
                    {
                        value: 1,
                        TITLE: getResourceText("label.startPremium1")/*"Premium"*/
                    },
                    {
                        value: 2,
                        TITLE: getResourceText("label.startPremium2")/*"Supreme"*/
                    }
                ];
                if (premiumDashboardCombo && premiumDashboardCombo.winControl) {
                    premiumDashboardCombo.winControl.data = new WinJS.Binding.List(premiumDashboardComboCategory);
                    premiumDashboardCombo.selectedIndex = AppData._persistentStates.showPremiumDashboardCombo;
                }
            };
            this.creatingPremiumDashboardComboCategory = creatingPremiumDashboardComboCategory;

            var setDataEvent = function (newDataEvent) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.dataEvent = newDataEvent;
                if (that.binding.dataEvent.DatenschutzText === null) {
                    that.binding.dataEvent.DatenschutzText = "";
                    //that.binding.dataEvent.privacyPolicyStandartText = getResourceText("event.privacyPolicyStandartText");
                    //that.binding.dataEvent.DatenschutzText = getResourceText("event.privacyPolicyStandartText");
                }
                if (textComment) {
                    if (that.binding.dataEvent.DatenschutzText) {
                        WinJS.Utilities.addClass(textComment, "input_text_comment_big");
                    } else {
                        WinJS.Utilities.removeClass(textComment, "input_text_comment_big");
                    }
                }
                // convert Startdatum 
                that.binding.dataEvent.dateBegin = getDateObject(newDataEvent.Startdatum);
                // convert Enddatum 
                that.binding.dataEvent.dateEnd = getDateObject(newDataEvent.Enddatum);
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
            };
            this.setDataEvent = setDataEvent;

            var getRecordId = function() {
                Log.call(Log.l.trace, "Event.Controller.");
                var recordId = AppData.getRecordId("Veranstaltung");
                if (!recordId) {
                    that.setDataEvent(getEmptyDefaultValue(Event.eventView.defaultValue));
                }
                Log.ret(Log.l.trace, recordId);
                return recordId;
            };
            this.getRecordId = getRecordId;

            var changeAppSetting = function (toggleId, checked) {
                Log.call(Log.l.trace, "Settings.Controller.", "toggleId=" + toggleId + " checked=" + checked);
                var pOptionTypeId = null;
                var pageProperty = null;
                var hidePageItem = false;
                var pValue;
                var pValueIsSet = false;
                var callChangeAppSettingNext = false;
                var toggleIdNext = null;
                var checkedNext = null;
                switch (toggleId) {
                    case "showQuestionnaire":
                        pOptionTypeId = 20;
                        pageProperty = "questionnaire";
                        that.binding.isQuestionnaireVisible = checked;
                        AppData._persistentStates.hideQuestionnaire = !checked;
                        hidePageItem = true;
                        break;
                    case "showSketch":
                        pOptionTypeId = 21;
                        pageProperty = "sketch";
                        that.binding.isSketchVisible = checked;
                        AppData._persistentStates.hideSketch = !checked;
                        hidePageItem = true;
                        break;
                    case "showBarcodeScan":
                        pOptionTypeId = 23;
                        that.binding.isBarcodeScanVisible = checked;
                        AppData._persistentStates.hideBarcodeScan = !checked;
                        hidePageItem = true;
                        break;
                    case "showCamera":
                        pOptionTypeId = 24;
                        that.binding.isCameraVisible = checked;
                        AppData._persistentStates.hideCameraScan = !checked;
                        hidePageItem = true;
                        break;
                    case "showPrivacyPolicySVG":
                        pOptionTypeId = 34;
                        that.binding.isPrivacyPolicySVGVisible = checked;
                        AppData._persistentStates.privacyPolicySVGVisible = checked;
                        if (!checked) {
                            that.binding.dataEvent.DatenschutzText = "";
                            that.binding.dataEvent.DatenschutzSVG = null;
                            callChangeAppSettingNext = true;
                            toggleIdNext = "sendMailPrivacypolicy";
                            checkedNext = checked;
                        } else {
                            that.binding.dataEvent.DatenschutzText = getResourceText("event.privacyPolicyStandartText");
                        }
                        if (!AppBar.modified) {
                            AppBar.modified = true;
                        }
                        break;
                    case "showQRCode":
                        pOptionTypeId = 38;
                        that.binding.showQRCode = checked;
                        AppData._persistentStates.showQRCode = checked;
                        break;
                    case "showNameInHeader":
                        pOptionTypeId = 39;
                        that.binding.showNameInHeader = checked;
                        AppData._persistentStates.showNameInHeader = checked;
                        WinJS.Promise.timeout(0).then(function() {
                            AppData.getUserData();
                        });
                        break;
                    /*case "showvisitorFlow":
                        pOptionTypeId = 44;
                        that.binding.isvisitorFlowVisible = checked;
                        AppData._persistentStates.showvisitorFlow = checked;
                        //var pValue;
                        if (!that.binding.isvisitorFlowVisible) {
                            that.binding.isvisitorFlowVisibleAndLeadSuccess = checked;
                            AppData._persistentStates.showvisitorFlowAndLeadSuccess = checked;
                            pValue = "0";
                        } else {
                            pValue = "1";
                        }
                        /*if (pValue === "1") {
                            NavigationBar.enablePage("visitorFlowDashboard");
                            NavigationBar.enablePage("visitorFlowEntExt"); 
                            NavigationBar.enablePage("employeeVisitorFlow");
                        } else {
                            NavigationBar.disablePage("visitorFlowDashboard");
                            NavigationBar.disablePage("visitorFlowEntExt");
                            NavigationBar.disablePage("employeeVisitorFlow");
                        }
                        //AppData._persistentStates.showvisitorFlowAndLeadSuccess = checked;
                        break;
                    case "showvisitorFlowAndLeadSuccess":
                        pOptionTypeId = 44;
                        that.binding.isvisitorFlowVisibleAndLeadSuccess = checked;
                        AppData._persistentStates.showvisitorFlowAndLeadSuccess = checked;
                        //AppData._persistentStates.showvisitorFlowAndLeadSuccess = checked;
                        if (that.binding.isvisitorFlowVisibleAndLeadSuccess) {
                            pValue = "2";
                        } else {
                            if (that.binding.isvisitorFlowVisible) {
                            pValue = "1";
                            } else {
                                pValue = "0";
                        }
                        }
                        pValueIsSet = true;
                        break;*/
                    case "showvisitorFlowCombo":
                        pOptionTypeId = 44;
                        that.binding.isvisitorFlowVisible = checked;
                        AppData._persistentStates.showvisitorFlowAndLeadSuccess = checked;
                        pValue = that.binding.isvisitorFlowVisible;
                        pValueIsSet = true;
                        break;
                    case "visitorFlowPremium":
                        pOptionTypeId = 45;
                        that.binding.visitorFlowPremium = checked;
                        AppData._persistentStates.visitorFlowPremium = checked;
                        break;
                    case "showdashboardMesagoCombo":
                        pOptionTypeId = 47;
                        //that.binding.visitorFlowPremium = checked;
                        AppData._persistentStates.showdashboardMesagoCombo = checked;
                        that.binding.isDashboardPremium = parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 1 ? true : false;
                        if (!that.binding.isDashboardPremium) {
                            AppData._persistentStates.showPremiumDashboardCombo = null;
                        }
                        pValue = checked;
                        pValueIsSet = true;
                        break;
                    case "showPremiumDashboardCombo":
                        pOptionTypeId = 48;
                        //that.binding.visitorFlowPremium = checked;
                        AppData._persistentStates.showPremiumDashboardCombo = checked;
                        //that.binding.isDashboardPremium = parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 1 ? true : false;
                        pValue = checked;
                        pValueIsSet = true;
                        break;
                    case "sendMailPrivacypolicy":
                        pOptionTypeId = 49;
                        /*****/
                        that.binding.isSendMailPrivacypolicy = checked;
                        AppData._persistentStates.sendMailPrivacypolicy = checked;
                        break;
                }
                if (pOptionTypeId) {
                    // value: show => pValue: hide!
                    if (!pValueIsSet) {
                    if (hidePageItem) {
                        if (!checked) {
                            pValue = "1";
                        } else {
                            pValue = "0";
                        }
                    } else {
                        if (checked) {
                            pValue = "1";
                        } else {
                            pValue = "0";
                        }
                    }
                    }
                    AppData.call("PRC_SETVERANSTOPTION", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pOptionTypeID: pOptionTypeId,
                        pValue: pValue
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    }).then(function() {
                        // rufe nochmal funktion changeAppSetting - Bedingung muss erfüllt sein
                        if (callChangeAppSettingNext && toggleIdNext) {
                            that.changeAppSetting(toggleIdNext, checkedNext);
                        }
                    });
                    if (pageProperty) {
                        if (pValue === "1") {
                            NavigationBar.disablePage(pageProperty);
                        } else {
                            NavigationBar.enablePage(pageProperty);
                        }
                    }
                }
            };
            this.changeAppSetting = changeAppSetting;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    that.saveData(function (response) {
                        // called asynchronously if ok
                        that.loadData();
                    }, function (errorResponse) {
                        // error already displayed
                    });
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function(event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickChangeAppSetting: function(event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    if (event.currentTarget) {
                        var toggle = event.currentTarget.winControl;
                        var target = event.target || event.currentTarget;
                        var targetId = event.currentTarget.id;
                        if (toggle) {
                            var value; 
                            if (targetId.includes("Combo")) {
                                value = target.value;
                            } else {
                                value = toggle.checked;
                            }
                            that.changeAppSetting(event.currentTarget.id, value);
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                blockEnterKey: function (event) {
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickOk")
                            AppBar.commandList[i].key = null;
                    }

                },
                releaseEnterKey: function (event) {
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickOk")
                            AppBar.commandList[i].key = WinJS.Utilities.Key.enter;
                    }
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
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
                clickOk: function() {
                    // always enabled!
                    return false;
                }
            };
            var resultConverter = function (item, index) {
                var property = AppData.getPropertyFromInitoptionTypeID(item);
                /*if (property && property !== "individualColors" && (!item.pageProperty) && item.LocalValue) {
                    item.colorValue = "#" + item.LocalValue;
                    AppData.applyColorSetting(property, item.colorValue);
                }*/

            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, "Event.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!AppData.initLandView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initLandData...");
                        //@nedra:25.09.2015: load the list of INITLand for Combobox
                        return AppData.initLandView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "initLandView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initLand && initLand.winControl) {
                                    initLand.winControl.data = new WinJS.Binding.List(json.d.results);
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initLand && initLand.winControl &&
                            (!initLand.winControl.data || !initLand.winControl.data.length)) {
                            initLand.winControl.data = new WinJS.Binding.List(AppData.initLandView.getResults());
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    //load of format relation record data
                    that.remoteServerList = new WinJS.Binding.List([Event.remoteKonfigurationView.defaultValue]);
                    // that.employees = new WinJS.Binding.List([Search.employeeView.defaultValue]);
                    initServer.winControl.data = new WinJS.Binding.List();
                    Log.print(Log.l.trace, "calling select eventView...");
                    return Event.remoteKonfigurationView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "eventView: success!");
                        if (json && json.d) {
                            // now always edit!
                            var results = json.d.results;
                            //that.setDataEvent(json.d);
                            results.forEach(function (item, index) {
                                //that.resultConverter(item, index);
                                that.remoteServerList.push(item);
                            });
                            if (initServer && initServer.winControl) {
                                initServer.winControl.data = that.remoteServerList;
                            }
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                }).then(function () {
                    var recordId = getRecordId();
                    if (recordId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select eventView...");
                        return Event.eventView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "eventView: success!");
                            if (json && json.d) {
                                // now always edit!
                                that.setDataEvent(json.d);
                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, recordId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    AppBar.notifyModified = true;
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            // save data
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Event.Controller.");
                AppData.setErrorMsg(that.binding);
                var err = null;
                var ret;
                var dataEvent = that.binding.dataEvent;
                if (dataEvent && AppBar.modified && !AppBar.busy) {
                    dataEvent.Startdatum = getDateData(that.binding.dataEvent.dateBegin);
                    dataEvent.Enddatum = getDateData(that.binding.dataEvent.dateEnd);
                    var recordId = getRecordId();
                    if (recordId) {
                        AppBar.busy = true;
                        AppBar.triggerDisableHandlers();
                        ret = Event.eventView.update(function (response) {
                            AppBar.busy = false;
                            AppBar.triggerDisableHandlers();
                            // called asynchronously if ok
                            Log.print(Log.l.info, "eventData update: success!");
                            AppBar.modified = false;
                            AppData.getUserData();
                            complete(response);
                        }, function (errorResponse) {
                            AppBar.busy = false;
                            AppBar.triggerDisableHandlers();
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            error(errorResponse);
                        }, recordId, dataEvent);
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
                        //complete(dataEvent);
                    }).then(function () {
                        if (!err) {
                            // load color settings
                           // AppData._persistentStates.hideQuestionnaire = false;
                           // AppData._persistentStates.hideSketch = false;
                            return Event.CR_VERANSTOPTION_ODataView.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "Account: success!");
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
                        if (typeof Home === "object" && Home._actionsList) {
                            Home._actionsList = null;
                        }
                        return Event.appListSpecView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "appListSpecView: success!");
                            // kontaktanzahlView returns object already parsed from json file in response
                            if (json && json.d && json.d.results) {
                                NavigationBar.showGroupsMenu(json.d.results, true);
                            } else {
                                NavigationBar.showGroupsMenu([]);
                            }
                                if (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 2) {
                                    that.changeMenuLabel("startPremium", getResourceText("label.startSurpreme")); //
                                } else if (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 1) {
                                    that.changeMenuLabel("startPremium", getResourceText("label.startPremium")); //getResourceText()
                                } else {
                                    Log.print(Log.l.trace, "Unknown value of IsSupreme Flag");
                                }
                            complete(json);
                            return WinJS.Promise.as();
                        }, function (errorResponse) {
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
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.saveData = saveData;

            that.binding.dataEvent.dateBegin = getDateObject();
            that.binding.dataEvent.dateEnd = getDateObject();

            function changeMenuLabel(myEntry, myLabel) {
                for (var i = 0; i < Application.navigationBarGroups.length; i++) {
                    if (Application.navigationBarGroups[i].id === myEntry) {
                        Application.navigationBarGroups[i].label = myLabel;
                        break;
                    }
                }
                NavigationBar.groups = Application.navigationBarGroups;
            }
            this.changeMenuLabel = changeMenuLabel;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                that.creatingVisitorFlowCategory();
            }).then(function () {
                that.creatingDashboardMesagoComboCategory();
            }).then(function () {
                that.creatingPremiumDashboardComboCategory();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();



