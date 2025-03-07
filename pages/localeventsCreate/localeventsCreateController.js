﻿// controller for page: localEvents
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/localEvents/localEventsService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("LocalEventsCreate", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "LocalEventsCreate.Controller.");
            Application.Controller.apply(this,
                [pageElement, {
                    eventData: copyByValue(LocalEventsCreate.VeranstaltungView.defaultValue),
                    actualYear: null
                }, commandList]
            );
            this.binding.eventData.dateBegin = new Date();
            this.binding.eventData.dateEnd = new Date();

            var that = this;

            var resultConverter = function (item, index) {
                // Bug: textarea control shows 'null' string on null value in Internet Explorer!
                if (item.DatenschutzText === null) {
                    item.DatenschutzText = "";
                }
                // convert Startdatum 
                item.dateBegin = getDateObject(item.Startdatum);
                // convert Enddatum 
                item.dateEnd = getDateObject(item.Enddatum);
                if (item.dateBegin) {
                    item.actualYear = item.dateBegin.getFullYear();
                } 
            }
            this.resultConverter = resultConverter;

            var setDataEvent = function (newDataEvent) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.resultConverter(newDataEvent);
                that.binding.eventData = newDataEvent;
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
            };
            this.setDataEvent = setDataEvent;

            var getEventData = function() {
                var dataEvent = that.binding.eventData;
                dataEvent.StartDatum = getDateIsoString(dataEvent.dateBegin);
                dataEvent.EndDatum = getDateIsoString(dataEvent.dateEnd);
                if (typeof dataEvent.LeadSuccessMobileApp === "string") {
                    dataEvent.LeadSuccessMobileApp = parseInt(dataEvent.LeadSuccessMobileApp);
                }
                if (typeof dataEvent.MobilerBarcodescanner === "string") {
                    dataEvent.MobilerBarcodescanner = parseInt(dataEvent.MobilerBarcodescanner);
                }
                return dataEvent;
            }
            this.getEventData = getEventData;
            
            var insertData = function() {
                Log.call(Log.l.trace, "LocalEventsCreate.Controller.");
                AppData.setErrorMsg(that.binding);
                var dataEvent = getEventData();
                Log.call(Log.l.trace, "PDFExport.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_CreateUserVeranstaltung",
                    {
                        pVeranstaltungName: dataEvent.VeranstaltungName,
                        pStartDatumString: dataEvent.StartDatum,
                        pEndDatumString: dataEvent.EndDatum,
                        pAppUser: dataEvent.LeadSuccessMobileApp,
                        pScanUser: dataEvent.MobilerBarcodescanner

                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        AppBar.busy = false;
                        if (json.d.results[0].ResultCode > 0) {
                            var confirmTitle = json.d.results[0].ResultMessage;
                            confirm(confirmTitle,
                                function(result) {
                                    if (result) {
                                        Log.print(Log.l.trace, "ERROR: ");
                                        Application.navigateById("localevents");
                                    } else {
                                        Log.print(Log.l.trace, "ERROR: ");
                                        Application.navigateById("localevents");
                                    }
                                });
                        } else {
                            Application.navigateById("localevents");
                        }
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "call error");
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                Log.ret(Log.l.trace);
            }
            this.insertData = insertData;
            
            var createUsers = function() {
                Log.call(Log.l.trace, "LocalEventsCreate.Controller.");
                AppData.call("PRC_CreateUserVeranstaltung",
                    {
                        pVeranstaltungID: dataEvent.VeranstaltungName,
                        pFairMandantID: dataEvent.StartDatum,
                        pLoginName: dataEvent.EndDatum,
                        pOrderedUser: dataEvent.LeadSuccessMobileApp

                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        AppBar.busy = false;
                        Application.navigateById("localevents");
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "call error");
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                Log.ret(Log.l.trace);
            }
            this.createUsers = createUsers;

            // Then, do anything special on this page
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "LocalEventsCreate.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "LocalEventsCreate.Controller.");
                    AppBar.busy = true;
                    that.insertData();
                    Log.ret(Log.l.trace);
                },
                clickCreateUsers: function (event) {
                    Log.call(Log.l.trace, "LocalEventsCreate.Controller.");
                    AppBar.busy = true;
                    that.createUsers();
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "LocalEventsCreate.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "LocalEventsCreate.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
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
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickSave: function () {
                    if (that.binding.eventData && AppBar.modified && !AppBar.busy) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };
            
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                //return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        }, {
            
        })
    });
})();