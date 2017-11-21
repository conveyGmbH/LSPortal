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
                dataEvent: getEmptyDefaultValue(Event.eventView.defaultValue)
            }, commandList]);

            var that = this;
            var showHideQuestionnaire = pageElement.querySelector("#showHideQuestionnaire");;
            var showHideSketchToggle = pageElement.querySelector("#showHideSketch");
            var showHideCamera = pageElement.querySelector("#showHideCamera");
            var showHideBarcodeScan = pageElement.querySelector("#showHideBarcodeScan");

            //27.12.2016 generate the string date
            var getDateObject = function(dateData) {
                var ret;
                if (dateData) {
                    var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                    var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    ret = new Date(milliseconds);
                } else {
                    ret = new Date();
                }
                return ret;
            };
            this.getDateObject = getDateObject;

            //03.01.2016 convert Date() to String
            var getDateData = function(dateObj) {
                if (!dateObj) {
                    dateObj = new Date();
                }
                var milliseconds = dateObj.getTime() + AppData.appSettings.odata.timeZoneAdjustment * 60000;
                var dateString = milliseconds.toString();
                return "/Date(" + dateString + ")/";
            };
            this.getDateData = getDateData;

            var setDataEvent = function(newDataEvent) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.dataEvent = newDataEvent;
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

            var changeColorSetting = function(pageProperty, status) {
                Log.call(Log.l.trace, "Settings.Controller.", "pageProperty=" + pageProperty + " color=" + status);
                var pOptionTypeId = null;
                var pValue = null;

                switch (pageProperty) {
                    case "showHideQuestionnaire":
                        pOptionTypeId = 20;
                        break;
                    case "showHideSketch":
                        pOptionTypeId = 21;
                        break;
                }
                if (typeof status === "boolean" && status) {
                    pValue = "1";
                } else {
                    pValue = "0";
                }

                if (pOptionTypeId) {
                    AppData.call("PRC_SETVERANSTOPTION",
                        {
                            pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                            pOptionTypeID: pOptionTypeId,
                            pValue: pValue
                        },
                        function (json) {
                            Log.print(Log.l.info, "call success! ");
                        },
                        function (error) {
                            Log.print(Log.l.error, "call error");
                        });
                   // that.applyColorSetting(colorProperty, color);
                    //Colors.updateColors();
                }

            };
            this.changeColorSetting = changeColorSetting;

            var changeAppSetting = function (pageProperty, status) {
                Log.call(Log.l.trace, "Settings.Controller.", "pageProperty=" + pageProperty + " color=" + status);
                var pOptionTypeId = null;
                var pValue = null;

                switch (pageProperty) {
                    case "showHideCamera":
                        pOptionTypeId = 23;
                        break;
                    case "showHideBarcodeScan":
                        pOptionTypeId = 24;
                        break;
                }
                if (typeof status === "boolean" && status) {
                    pValue = "1";
                } else {
                    pValue = "0";
                }

                if (pOptionTypeId) {
                    AppData.call("PRC_SETVERANSTOPTION",
                        {
                            pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                            pOptionTypeID: pOptionTypeId,
                            pValue: pValue
                        },
                        function (json) {
                            Log.print(Log.l.info, "call success! ");
                        },
                        function (error) {
                            Log.print(Log.l.error, "call error");
                        });
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
                clickShowHideQuestionnaire: function(event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    var toggle = event.currentTarget.winControl;
                    if (toggle) {
                        that.binding.isQuestionnaireVisible = toggle.checked;
                        AppData._persistentStates.hideQuestionnaire = !toggle.checked;
                    }
                    that.changeColorSetting(event.target.id, toggle.checked);
                    Log.ret(Log.l.trace);
                },
                clickShowHideSketch: function(event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    var toggle = event.currentTarget.winControl;
                    if (toggle) {
                        that.binding.isSketchVisible = toggle.checked;
                        AppData._persistentStates.hideSketch = !toggle.checked;
                    }
                    that.changeColorSetting(event.target.id, toggle.checked);
                    Log.ret(Log.l.trace);
                },
                clickShowHidebarcodeScan: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    var toggle = event.currentTarget.winControl;
                    if (toggle) {
                        that.binding.isBarcodeScanVisible = toggle.checked;
                        AppData._persistentStates.barcodeScanVisible = that.binding.isBarcodeScanVisible; //!toggle.checked
                    }
                    // that.changeColorSetting(event.target.id, toggle.checked);
                    that.changeAppSetting(event.target.id, toggle.checked);
                    Log.ret(Log.l.trace);
                },
                clickShowHideCamera: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    var toggle = event.currentTarget.winControl;
                    if (toggle) {
                        that.binding.isCameraVisible = toggle.checked;
                        AppData._persistentStates.cameraVisible = that.binding.isCameraVisible; //!toggle.checked
                    }
                    //that.changeColorSetting(event.target.id, toggle.checked);
                    that.changeAppSetting(event.target.id, toggle.checked);
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickOk: function() {
                    // always enabled!
                    return false;
                }
            };
            var loadData = function() {
                Log.call(Log.l.trace, "Event.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function() {
                    var recordId = getRecordId();
                    if (recordId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select eventView...");
                        return Event.eventView.select(function(json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "eventView: success!");
                            if (json && json.d) {
                                // now always edit!
                                that.setDataEvent(json.d);
                            }
                        }, function(errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, recordId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    showHideQuestionnaire.winControl.checked = !AppData._persistentStates.hideQuestionnaire;
                    showHideSketchToggle.winControl.checked = !AppData._persistentStates.hideSketch;
                    showHideCamera.winControl.checked = !AppData._persistentStates.cameraVisible;
                    showHideBarcodeScan.winControl.checked = !AppData._persistentStates.barcodeScanVisible;
                }).then(function () {
                    AppBar.notifyModified = true;
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;
            
            // save data
            var saveData = function(complete, error) {
                Log.call(Log.l.trace, "Event.Controller.");
                AppData.setErrorMsg(that.binding);
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
                        }, function(errorResponse) {
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
                    ret = WinJS.Promise.timeout(100).then(function() {
                        return that.saveData(complete, error);
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function() {
                        complete(dataEvent);
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.saveData = saveData;

            that.binding.dataEvent.dateBegin = getDateObject();
            that.binding.dataEvent.dateEnd = getDateObject();

            that.processAll().then(function() {
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



