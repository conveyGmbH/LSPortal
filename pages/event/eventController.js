// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/event/eventService.js" />

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
                isProductMailOn: AppData._persistentStates.productMailOn,
                isNachbearbeitetFlagAutoSetToNull: AppData._persistentStates.nachbearbeitetFlagAutoSetToNull,
                isThankMailOn: AppData._persistentStates.thankYouMailOn,
                isPrivacyPolicySVGVisible: AppData._persistentStates.privacyPolicySVGVisible
            }, commandList]);

            var that = this;

            //select combo
            var initLand = pageElement.querySelector("#InitLand");
            var textComment = pageElement.querySelector(".input_text_comment");

            this.dispose = function () {
                if (initLand && initLand.winControl) {
                    initLand.winControl.data = null;
                }
            }

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
                var hidePageItem = true;
                switch (toggleId) {
                    case "showQuestionnaire":
                        pOptionTypeId = 20;
                        pageProperty = "questionnaire";
                        that.binding.isQuestionnaireVisible = checked;
                        AppData._persistentStates.hideQuestionnaire = !checked;
                        break;
                    case "showSketch":
                        pOptionTypeId = 21;
                        pageProperty = "sketch";
                        that.binding.isSketchVisible = checked;
                        AppData._persistentStates.hideSketch = !checked;
                        break;
                    case "showBarcodeScan":
                        pOptionTypeId = 23;
                        that.binding.isBarcodeScanVisible = checked;
                        AppData._persistentStates.hideBarcodeScan = !checked;
                        break;
                    case "showCamera":
                        pOptionTypeId = 24;
                        that.binding.isCameraVisible = checked;
                        AppData._persistentStates.hideCameraScan = !checked;
                        break;
                    case "productMail":
                        pOptionTypeId = 30;
                        that.binding.isProductMailOn = checked;
                        AppData._persistentStates.productMailOn = checked;
                        hidePageItem = false;
                        break;
                    case "thankMail":
                        pOptionTypeId = 31;
                        that.binding.isThankMailOn = checked;
                        AppData._persistentStates.thankYouMailOn = checked;
                        hidePageItem = false;
                        break;
                    case "showPrivacyPolicySVG":
                        pOptionTypeId = 34;
                        that.binding.isPrivacyPolicySVGVisible = checked;
                        if (!checked) {
                            that.binding.dataEvent.DatenschutzText = "";
                            that.binding.dataEvent.DatenschutzSVG = null;
                        } else {
                            that.binding.dataEvent.DatenschutzText = getResourceText("event.privacyPolicyStandartText");
                        }
                        if (!AppBar.modified) {
                            AppBar.modified = true;
                        }
                        AppData._persistentStates.privacyPolicySVGVisible = checked;
                        hidePageItem = false;
                        break;
                    case "nachbearbeitetFlagAutoSetToNull":
                        pOptionTypeId = 35;
                        that.binding.isNachbearbeitetFlagAutoSetToNull = checked;
                        AppData._persistentStates.nachbearbeitetFlagAutoSetToNull = checked;
                        hidePageItem = false;
                        break;
                }
                if (pOptionTypeId) {
                    var pValue;
                    // value: show => pValue: hide!
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
                    AppData.call("PRC_SETVERANSTOPTION", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pOptionTypeID: pOptionTypeId,
                        pValue: pValue
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
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
                        if (toggle) {
                            that.changeAppSetting(event.currentTarget.id, toggle.checked);
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
                        complete(dataEvent);
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
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.saveData = saveData;

            that.binding.dataEvent.dateBegin = getDateObject();
            that.binding.dataEvent.dateEnd = getDateObject();

            that.processAll().then(function () {
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



