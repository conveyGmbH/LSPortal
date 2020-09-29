// controller for page: visitorFlowDashboard
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/start/startService.js" />
/// <reference path="~/www/lib/datamaps/scripts/datamaps.world.de.js" />
/// <reference path="~/www/lib/datamaps/scripts/datamaps.world.en.js" />
/// <reference path="~/www/lib/d3/scripts/d3.min.js" />
/// <reference path="~/www/lib/topojson/scripts/topojson.js" />

/*
 Structure of states to be set from external modules:
 {
    networkState: newNetworkstate:
 }
*/

(function () {
    "use strict";

    WinJS.Namespace.define("VisitorFlowDashboard", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "VisitorFlowDashboard.Controller.");
            Application.Controller.apply(this, [pageElement, {
                // add dynamic scripts to page element, src is either a file or inline text:
            }, commandList]);
            this.applist = null;

            this.refreshWaitTimeMs = 5000;

            var that = this;
            
            this.dispose = function () {
                if (that.applist) {
                    that.applist = null;
                }
            }

            /*var handleComboChange = function () {
                Log.call(Log.l.trace, "VisitorFlowDashboard.Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    var visitorFlowOverviewFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("visitorFlowOverview"));
                    if (visitorFlowOverviewFragmentControl && visitorFlowOverviewFragmentControl.controller) {
                        visitorFlowOverviewFragmentControl.controller.getVtitle();
                        return visitorFlowOverviewFragmentControl.controller.loadData();
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    var visitorFlowLevelIndicatorFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("visitorFlowLevelIndicator"));
                    if (visitorFlowLevelIndicatorFragmentControl && visitorFlowLevelIndicatorFragmentControl.controller) {
                        return visitorFlowLevelIndicatorFragmentControl.controller.loadData();
                    } else {
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.handleComboChange = handleComboChange;

            var handleTimeChange = function () {
                Log.call(Log.l.trace, "VisitorFlowDashboard.Controller.");
                var visitorFlowLevelIndicatorFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("visitorFlowLevelIndicator"));
                    if (visitorFlowLevelIndicatorFragmentControl && visitorFlowLevelIndicatorFragmentControl.controller) {
                        return visitorFlowLevelIndicatorFragmentControl.controller.loadData();
                    }
            }
            this.handleTimeChange = handleTimeChange;*/

            var resultConverter = function (item, index) {
                item.index = index;
                item.buttonColor = Colors.tileBackgroundColor;
                item.buttonTitle = Colors.tileTextColor;
                }
            this.resultConverter = resultConverter;
            
            var loadData = function() {
                Log.call(Log.l.trace, "VisitorFlowDashboard.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    var visitorFlowOverviewFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("visitorFlowOverview"));
                    if (visitorFlowOverviewFragmentControl && visitorFlowOverviewFragmentControl.controller) {
                        return visitorFlowOverviewFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#visitorFlowOverviewhost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "visitorFlowOverview", {});
                    } else {
                            return WinJS.Promise.as();
                                }
                                    }
                }).then(function () {
                    var visitorFlowLevelIndicatorFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("visitorFlowLevelIndicator"));
                    if (visitorFlowLevelIndicatorFragmentControl && visitorFlowLevelIndicatorFragmentControl.controller) {
                        return visitorFlowLevelIndicatorFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#visitorFlowLevelIndicatorhost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "visitorFlowLevelIndicator", {});
                        } else {
                            return WinJS.Promise.as();
                                }
                                        }
                }).then(function () {
                    var visitorFlowDevicesFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("visitorFlowDevices"));
                    if (visitorFlowDevicesFragmentControl && visitorFlowDevicesFragmentControl.controller) {
                        return visitorFlowDevicesFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#visitorFlowDeviceshost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "visitorFlowDevices", {});
                        } else {
                            return WinJS.Promise.as();
                                        }
                                            }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                changeEntExt: function (event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    //var name = event.currentTarget.value;
                    //that.handleComboChange(name, null);
                    Log.ret(Log.l.trace);
                },
                changeTime : function(event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    //var id = parseInt(event.currentTarget.value);
                    //that.handleTimeChange(id);
                    Log.ret(Log.l.trace);
                },
                clickEditEvent: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    var command = event.currentTarget;
                    if (command) {
                        Log.print(Log.l.trace, "clickButton event command.name=" + command.name);
                        Application.navigateById(command.id, event);
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    Application.navigateById("account", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
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
                clickBack: function() {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };
            
            // finally, load the data
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            })/*.then(function() {
                WinJS.Promise.timeout(50).then(function () {
                    if (AppHeader.controller.binding.userData.IsNoAdminUser) {
                        var confirmTitle = getResourceText("start.confirmIsAppUser");
                        confirm(confirmTitle, function (result) {
                            if (result) {

                            } else {
                                Log.print(Log.l.trace, "IsAppUser: user choice CANCEL");
                            }
            });
                    }
                });
            Log.print(Log.l.trace, "Splash screen vanished");
        })*/;
            Log.ret(Log.l.trace);
        })
    });
})();







