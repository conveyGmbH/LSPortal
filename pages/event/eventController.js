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
                veranstOption: getEmptyDefaultValue(Event.CR_VERANSTOPTION_ODataView.defaultValue),
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
                visitorFlowInterval: AppData._persistentStates.visitorFlowInterval || "",
                dashboardMesagoFeature: AppHeader.controller.binding.userData.SiteAdmin,
                isDashboardPremium: AppData._persistentStates.showdashboardMesagoCombo === 1 ? true : false,
                qrcodetext: getResourceText("event.show2D-Code"),
                barcodetext: getResourceText("event.showBar-Code"),
                nametext: getResourceText("event.showNameInHeader"),
                userNametext: getResourceText("event.showUsernameInHeader"),
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
                    //visitorFlow.selectedIndex = AppData._persistentStates.showvisitorFlow;
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
                    //premiumDashboardCombo.selectedIndex = that.binding.veranstOption.showdashboardMesagoCombo;
                }
            };
            this.creatingPremiumDashboardComboCategory = creatingPremiumDashboardComboCategory;

            var getEventId = function () {
                Log.print(Log.l.trace, "getEventId Event._eventId=" + Event._eventId);
                return Event._eventId;
            }
            this.getEventId = getEventId;

            var setEventId = function (value) {
                Log.print(Log.l.trace, "setEventId Event._eventId=" + value);
                Event._eventId = value;
            }
            this.setEventId = setEventId;


            var master = Application.navigator.masterControl;
            if (master &&
                master.controller &&
                master.controller.binding &&
                master.controller.binding.eventId) {
                that.setEventId(master.controller.binding.eventId);
            }

            var setDataEvent = function (newDataEvent) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.dataEvent = newDataEvent;
                if (that.binding.dataEvent.DatenschutzText === null) {
                    that.binding.dataEvent.DatenschutzText = "";
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

            var getRecordId = function () {
                Log.call(Log.l.trace, "Event.Controller.");
                var recordId = AppData.getRecordId("Veranstaltung");
                if (!recordId) {
                    that.setDataEvent(getEmptyDefaultValue(Event.eventView.defaultValue));
                }
                Log.ret(Log.l.trace, recordId);
                return recordId;
            };
            this.getRecordId = getRecordId;

            var changeEvent = function (eventID) {
                Log.call(Log.l.trace, "LocalEvents.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_ChangeUserVeranstaltung", {
                    pNewVeranstaltungID: eventID,
                    pLoginName: AppData._persistentStates.odata.login
                }, function (json) {
                    Log.print(Log.l.info, "call success! ");
                    AppData.prevLogin = AppData._persistentStates.odata.login;
                    AppData.prevPassword = AppData._persistentStates.odata.password;
                    Application.navigateById("login");
                }, function (error) {
                    Log.print(Log.l.error, "call error");
                });
                Log.ret(Log.l.trace);
            }
            this.changeEvent = changeEvent;

            var getDeleteEventData = function (eventID) {
                Log.call(Log.l.trace, "LocalEvents.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    // var curScope = that.deleteEventData;
                    var curScope = that.binding.dataEvent;
                    if (curScope) {
                        var confirmTitle = getResourceText("localevents.labelDelete") + ": " + curScope.Name +
                            "\r\n" + getResourceText("localevents.eventDelete");
                        confirm(confirmTitle, function (result) {
                            if (result) {
                                AppBar.busy = true;
                                AppData.setErrorMsg(that.binding);
                                AppData.call("PRC_DeleteVeranstaltung", {
                                    pVeranstaltungID: eventID
                                }, function (json) {
                                    Log.print(Log.l.info, "call success! ");
                                    AppBar.busy = false;
                                    var master = Application.navigator.masterControl;
                                    master.controller.loadData();
                                }, function (error) {
                                    AppBar.busy = false;
                                    Log.print(Log.l.error, "call error");
                                });
                            } else {
                                Log.print(Log.l.trace, "clickDelete: event choice CANCEL");
                            }
                        });
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.getDeleteEventData = getDeleteEventData;

            var changeSetting = function (toggleId, checked) {
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
                        that.binding.veranstOption.isQuestionnaireVisible = checked;
                        hidePageItem = true;
                        break;
                    case "showSketch":
                        pOptionTypeId = 21;
                        that.binding.veranstOption.isSketchVisible = checked;
                        hidePageItem = true;
                        break;
                    case "showBarcodeScan":
                        pOptionTypeId = 23;
                        that.binding.veranstOption.isBarcodeScanVisible = checked;
                        hidePageItem = true;
                        break;
                    case "showCamera":
                        pOptionTypeId = 24;
                        that.binding.veranstOption.isCameraVisible = checked;
                        hidePageItem = true;
                        break;
                    case "showPrivacyPolicySVG":
                        pOptionTypeId = 34;
                        that.binding.veranstOption.isPrivacyPolicySVGVisible = checked;
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
                        that.binding.veranstOption.showQRCode = checked;
                        break;
                    case "showNameInHeader":
                        pOptionTypeId = 39;
                        that.binding.veranstOption.showNameInHeader = checked;
                        break;
                    case "showvisitorFlowCombo":
                        pOptionTypeId = 44;
                        //that.binding.veranstOption.showvisitorFlow = parseInt(item.LocalValue);
                        that.binding.veranstOption.isvisitorFlowVisible = parseInt(item.LocalValue);
                        pValue = item.LocalValue;
                        pValueIsSet = true;
                        break;
                    case "visitorFlowPremium":
                        pOptionTypeId = 45;
                        that.binding.veranstOption.visitorFlowPremium = checked;
                        break;
                    case "showdashboardMesagoCombo":
                        pOptionTypeId = 47;
                        //AppData._persistentStates.showdashboardMesagoCombo
                        //that.binding.veranstOption.isDashboardPremium = parseInt(that.binding.veranstOption.showdashboardMesagoCombo) === 1 ? true : false;
                        if (dashboardMesagoCombo && dashboardMesagoCombo.winControl) {
                            //dashboardMesagoCombo.winControl.data = new WinJS.Binding.List(dashboardMesagoComboCategory);
                            //dashboardMesagoCombo.selectedIndex = AppData._persistentStates.showdashboardMesagoCombo;
                        }
                        pValue = checked;
                        pValueIsSet = true;
                        break;
                    case "showPremiumDashboardCombo":
                        pOptionTypeId = 48;
                        that.binding.veranstOption.showPremiumDashboardCombo = checked;
                        pValue = checked;
                        pValueIsSet = true;
                        break;
                    case "sendMailPrivacypolicy":
                        pOptionTypeId = 49;
                        that.binding.veranstOption.isSendMailPrivacypolicy = checked;
                        break;
                    case "visitorFlowInterval":
                        pOptionTypeId = 50;
                        that.binding.veranstOption.visitorFlowInterval = checked;
                        pValueIsSet = true;
                        pValue = checked;
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
                    var eventId = that.getEventId();
                    AppData.call("PRC_SETVERANSTOPTION", {
                        pVeranstaltungID: eventId, // Hier muss die ID aus Liste kommen
                        pOptionTypeID: pOptionTypeId,
                        pValue: pValue
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    }).then(function () {
                        // rufe nochmal funktion changeAppSetting - Bedingung muss erfüllt sein
                        if (callChangeAppSettingNext && toggleIdNext) {
                            that.changeSetting(toggleIdNext, checkedNext);
                        }
                    });
                }
            };
            this.changeSetting = changeSetting;

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
                        that.binding.veranstOption.isQuestionnaireVisible = checked;
                        AppData._persistentStates.hideQuestionnaire = !checked;
                        hidePageItem = true;
                        break;
                    case "showSketch":
                        pOptionTypeId = 21;
                        pageProperty = "sketch";
                        that.binding.veranstOption.isSketchVisible = checked;
                        AppData._persistentStates.hideSketch = !checked;
                        hidePageItem = true;
                        break;
                    case "showBarcodeScan":
                        pOptionTypeId = 23;
                        that.binding.veranstOption.isBarcodeScanVisible = checked;
                        AppData._persistentStates.hideBarcodeScan = !checked;
                        hidePageItem = true;
                        break;
                    case "showCamera":
                        pOptionTypeId = 24;
                        that.binding.veranstOption.isCameraVisible = checked;
                        AppData._persistentStates.hideCameraScan = !checked;
                        hidePageItem = true;
                        break;
                    case "showPrivacyPolicySVG":
                        pOptionTypeId = 34;
                        that.binding.veranstOption.isPrivacyPolicySVGVisible = checked;
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
                        that.binding.veranstOption.showQRCode = checked;
                        AppData._persistentStates.showQRCode = checked;
                        break;
                    case "showNameInHeader":
                        pOptionTypeId = 39;
                        that.binding.veranstOption.showNameInHeader = checked;
                        AppData._persistentStates.showNameInHeader = checked;
                        WinJS.Promise.timeout(0).then(function () {
                            AppData.getUserData();
                        });
                        break;
                    case "showvisitorFlowCombo":
                        pOptionTypeId = 44;
                        that.binding.veranstOption.isvisitorFlowVisible = checked;
                        AppData._persistentStates.showvisitorFlowAndLeadSuccess = checked;
                        pValue = that.binding.isvisitorFlowVisible;
                        pValueIsSet = true;
                        break;
                    case "visitorFlowPremium":
                        pOptionTypeId = 45;
                        that.binding.veranstOption.visitorFlowPremium = checked;
                        AppData._persistentStates.visitorFlowPremium = checked;
                        break;
                    case "showdashboardMesagoCombo":
                        pOptionTypeId = 47;
                        AppData._persistentStates.showdashboardMesagoCombo = checked;
                        that.binding.veranstOption.isDashboardPremium = parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 1 ? true : false;
                        if (!that.binding.isDashboardPremium) {
                            AppData._persistentStates.showPremiumDashboardCombo = null;
                        }
                        pValue = checked;
                        pValueIsSet = true;
                        break;
                    case "showPremiumDashboardCombo":
                        pOptionTypeId = 48;
                        AppData._persistentStates.showPremiumDashboardCombo = checked;
                        pValue = checked;
                        pValueIsSet = true;
                        break;
                    case "sendMailPrivacypolicy":
                        pOptionTypeId = 49;
                        that.binding.veranstOption.isSendMailPrivacypolicy = checked;
                        AppData._persistentStates.sendMailPrivacypolicy = checked;
                        break;
                    case "visitorFlowInterval":
                        pOptionTypeId = 50;
                        that.binding.veranstOption.visitorFlowInterval = checked;
                        AppData._persistentStates.visitorFlowInterval = checked;
                        pValueIsSet = true;
                        pValue = checked;
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
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"), // AppData.getRecordId("Veranstaltung") Hier muss die ID aus Liste kommen
                        pOptionTypeID: pOptionTypeId,
                        pValue: pValue
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    }).then(function () {
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
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    var recordId = that.getEventId();
                    if (recordId) {
                        that.getDeleteEventData(recordId);
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    Application.navigateById("localeventsCreate", event);
                    Log.ret(Log.l.trace);
                },
                clickChange: function (event) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    var recordId = that.getEventId();
                    if (recordId) {
                        that.changeEvent(recordId);
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
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickChangeAppSetting: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    var target = event.currentTarget || event.target;
                    //AppBar.modified = true;
                    if (target) {
                        var toggle = target.winControl;
                        //var target = event.target || event.currentTarget;
                        var targetId = target.id;
                        if (toggle) {
                            var value;
                            if (targetId.includes("Combo")) {
                                value = target.value;
                            } else {
                                value = toggle.checked;
                            }
                            that.changeSetting(target.id, value);
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
                clickOk: function () {
                    // always enabled!
                    return false;
                },
                clickChange: function () {
                    var master = Application.navigator.masterControl;
                    if (master &&
                        master.controller &&
                        master.controller.binding &&
                        master.controller.binding.count &&
                        master.controller.binding.count > 1) {
                        if (master.controller.binding.eventId && AppData.generalData.eventId !== master.controller.binding.eventId) {
                        return false;
                    } else {
                        return true;
                    }
                    } else {
                        return true;
                    }
                }
            };

            var resultConverterOption = function (item, index) {
                that.getPropertyFromInitoptionTypeID(item);
            }
            this.resultConverterOption = resultConverterOption;

            var getPropertyFromInitoptionTypeID = function (item) {
                Log.call(Log.l.u1, "AppData.");
                var color;
                var property = "";
                switch (item.INITOptionTypeID) {
                    case 19:
                        // feature obsolete
                        if (item.LocalValue === "1") {
                            //AppData._persistentStates.hideCameraQuestionnaire = true;
                        } else {
                            //AppData._persistentStates.hideCameraQuestionnaire = false;
                        }
                        break;
                    case 20:
                        item.pageProperty = "questionnaire";
                        if (item.LocalValue === "1") {
                            that.binding.veranstOption.isQuestionnaireVisible = false;
                        } else {
                            that.binding.veranstOption.isQuestionnaireVisible = true;
                        }
                        break;
                    case 21:
                        item.pageProperty = "sketch";
                        if (item.LocalValue === "1") {
                            that.binding.veranstOption.isSketchVisible = false;
                        } else {
                            that.binding.veranstOption.isSketchVisible = true;
                        }
                        break;
                    case 23:
                        if (item.LocalValue === "1") {
                            that.binding.veranstOption.isBarcodeScanVisible = false;
                        } else {
                            that.binding.veranstOption.isBarcodeScanVisible = true;
                        }
                        break;
                    case 24:
                        if (item.LocalValue === "1") {
                            that.binding.veranstOption.isCameraVisible = false;
                        } else {
                            that.binding.veranstOption.isCameraVisible = true;
                        }
                        break;
                    case 30:
                        if (item.LocalValue === "1") {
                            that.binding.veranstOption.productMailOn = true;
                        } else {
                            that.binding.veranstOption.productMailOn = false;
                        }
                        break;
                    case 31:
                        if (item.LocalValue === "1") {
                            that.binding.veranstOption.thankYouMailOn = true;
                        } else {
                            that.binding.veranstOption.thankYouMailOn = false;
                        }
                        break;
                    case 34:
                        if (item.LocalValue === "1") {
                            that.binding.veranstOption.isPrivacyPolicySVGVisible = true;
                        } else {
                            that.binding.veranstOption.isPrivacyPolicySVGVisible = false;
                        }
                        break;
                    case 35:
                        if (item.LocalValue === "1") {
                            that.binding.veranstOption.nachbearbeitetFlagAutoSetToNull = true;
                        } else {
                            that.binding.veranstOption.nachbearbeitetFlagAutoSetToNull = false;
                        }
                        break;
                    case 38:
                        if (item.LocalValue === "1") {
                            that.binding.veranstOption.showQRCode = true;
                        } else {
                            that.binding.veranstOption.showQRCode = false;
                        }
                        break;
                    case 39:
                        if (item.LocalValue === "1") {
                            that.binding.veranstOption.showNameInHeader = true;
                        } else {
                            that.binding.veranstOption.showNameInHeader = false;
                        }
                        break;
                    case 44:
                        // Enable bzw. disable wird hier behandelt, da umgekehrte Logik mit Anzeigewert
                        if (parseInt(item.LocalValue) === 1 || parseInt(item.LocalValue) === 2) {
                            that.binding.veranstOption.showvisitorFlow = parseInt(item.LocalValue);
                            that.binding.veranstOption.isvisitorFlowVisible = parseInt(item.LocalValue);
                            //AppData._persistentStates.showvisitorFlow = parseInt(item.LocalValue);
                            // NavigationBar.enablePage("employee");
                            /* NavigationBar.enablePage("visitorFlowDashboard");
                            NavigationBar.enablePage("visitorFlowEntExt");
                            NavigationBar.enablePage("employeeVisitorFlow");/*pagename muss wahrscheinlich nochmal geändert werden, jenachdem wie die seite heisst*/
                        } else {
                            that.binding.veranstOption.showvisitorFlow = 0;
                            that.binding.veranstOption.isvisitorFlowVisible = 0;
                            //NavigationBar.disablePage("employeeVisitoFlow");
                            /*NavigationBar.disablePage("visitorFlowDashboard");
                            NavigationBar.disablePage("visitorFlowEntExt");
                            NavigationBar.disablePage("employeeVisitorFlow");*/
                        }
                        /*if (visitorFlow && visitorFlow.winControl) {
                            // visitorFlow.winControl.data = new WinJS.Binding.List(exhibitorCategory);
                            visitorFlow.selectedIndex = AppData._persistentStates.showvisitorFlow;
                        }*/
                        break;
                    case 45:
                        if (item.LocalValue === "1") {
                            that.binding.veranstOption.visitorFlowPremium = true;
                        } else {
                            that.binding.veranstOption.visitorFlowPremium = false;
                        }
                        break;
                    case 47:
                        if (parseInt(item.LocalValue) === 1 || parseInt(item.LocalValue) === 2 || parseInt(item.LocalValue) === 3 || parseInt(item.LocalValue) === 4) {
                            that.binding.veranstOption.showdashboardMesagoCombo = parseInt(item.LocalValue);
                        } else {
                            that.binding.veranstOption.showdashboardMesagoCombo = 0;
                        }
                        break;
                    case 49:
                        if (item.LocalValue === "1") {
                            that.binding.veranstOption.sendMailPrivacypolicy = true;
                        } else {
                            that.binding.veranstOption.sendMailPrivacypolicy = false;
                        }
                        break;
                    case 50:
                        that.binding.veranstOption.visitorFlowInterval = item.LocalValue;
                        break;
                    default:
                    // defaultvalues
                }
                Log.ret(Log.l.u1, property);
                return property;
            }
            this.getPropertyFromInitoptionTypeID = getPropertyFromInitoptionTypeID;

            var loadData = function () {
                Log.call(Log.l.trace, "Event.Controller.");
                AppData.setErrorMsg(that.binding);
                that.binding.veranstOption = getEmptyDefaultValue(Event.CR_VERANSTOPTION_ODataView.defaultValue);
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
                    return Event.iNOptionTypeValueView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "initLandView: success!");
                        if (json && json.d && json.d.results) {
                            // Now, we call WinJS.Binding.List to get the bindable list
                            var results = json.d.results;
                            if (dashboardMesagoCombo && dashboardMesagoCombo.winControl) {
                                dashboardMesagoCombo.winControl.data = new WinJS.Binding.List(results);
                                //dashboardMesagoCombo.selectedIndex = parseInt(AppData._userData.IsSupreme) - 1;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, { LanguageSpecID: AppData.getLanguageId() });
                }).then(function () {
                    //load of format relation record data
                    that.remoteServerList = new WinJS.Binding.List([Event.remoteKonfigurationView.defaultValue]);
                    initServer.winControl.data = new WinJS.Binding.List();
                    Log.print(Log.l.trace, "calling select eventView...");
                    return Event.remoteKonfigurationView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "eventView: success!");
                        if (json && json.d) {
                            // now always edit!
                            var results = json.d.results;
                            results.forEach(function (item, index) {
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
                    var recordId = getEventId();
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
                    var recordId = getEventId();
                    if (recordId) {
                        return Event.CR_VERANSTOPTION_ODataView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "Account: success!");
                            // CR_VERANSTOPTION_ODataView returns object already parsed from json file in response
                            if (json && json.d && json.d.results && json.d.results.length > 1) {
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverterOption(item, index);
                                });
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, { VeranstaltungID: recordId });
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
                AppBar.busy = false;
                var err = null;
                var ret;
                var dataEvent = that.binding.dataEvent;
                if (dataEvent && AppBar.modified && !AppBar.busy) {
                    /*Erstmal ignorieren!*/
                    var visitorFlowInterval = changeSetting("visitorFlowInterval", that.binding.visitorFlowInterval);
                    dataEvent.Startdatum = getDateData(that.binding.dataEvent.dateBegin);
                    dataEvent.Enddatum = getDateData(that.binding.dataEvent.dateEnd);
                    var recordId = getEventId();
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
                            var recordId = getEventId();
                            // load color settings
                            // beim reload prüfen ob die Veranstaltung in der ich gerade bin oder nicht
                            // wenn ja dann nehme funktion von generaldata, sonst diese hier

                            return Event.CR_VERANSTOPTION_ODataView.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "Account: success!");
                                // CR_VERANSTOPTION_ODataView returns object already parsed from json file in response
                                // Mit neuen VIEW vorher prüfen ob das die VeranstaltungID in der ich gerade angemeldet bin oder irgendeine andere vom Mandant.
                                if (json && json.d && json.d.results && json.d.results.length > 1) {
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverterOption(item, index);
                                    });
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, { VeranstaltungID: recordId }).then(function () {
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
                                if (json && json.d && json.d.results) {
                                    NavigationBar.showGroupsMenu(json.d.results, true);
                                } else {
                                    NavigationBar.showGroupsMenu([]);
                                }
                                if (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 2) {
                                    that.changeMenuLabel("startPremium", getResourceText("label.startSurpreme")); //
                                } else if (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 1) {
                                    that.changeMenuLabel("startPremium", getResourceText("label.startPremium")); //getResourceText()
                                } else if (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 3) {
                                    that.changeMenuLabel("dashboardFN", getResourceText("label.dashboardFNPremium")); //getResourceText()
                                } else if (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 4) {
                                    that.changeMenuLabel("dashboardFN", getResourceText("label.dashboardFNSupreme")); //getResourceText()
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
                that.creatingVisitorFlowCategory();
            })/*.then(function () {
                that.creatingPremiumDashboardComboCategory();
            })*/.then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();



