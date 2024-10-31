// controller for page: siteHelp
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/siteHelp/siteHelpService.js" />

(function () {
    "use strict";

    var namespaceName = "SiteHelp";

    WinJS.Namespace.define(namespaceName, {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");

            Application.Controller.apply(this, [pageElement, {
                siteHelpVideoUrl: "https://" + getResourceText("siteHelp.videolink")
                
            }, commandList]);

            var that = this;

            
            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
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
                }
            };

           var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);

                var ret = new WinJS.Promise.as().then(function() {
                    
                        function(errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            // finally, load the data
            that.processAll().then(function () {
                
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete, now load data");
                if (listView && listView.winControl) {
                    // no list selection
                    if (listView.winControl.selectionMode !== WinJS.UI.SelectionMode.none) {
                        listView.winControl.selectionMode = WinJS.UI.SelectionMode.none;
                    }
                    // invoke
                    if (listView.winControl.tapBehavior !== WinJS.UI.TapBehavior.invokeOnly) {
                        listView.winControl.tapBehavior = WinJS.UI.TapBehavior.invokeOnly;
                    }
                    // set layout orientation!
                    if (listView.winControl._layout) {
                        listView.winControl._layout.orientation = WinJS.UI.Orientation.vertical;
                    }
                    // add ListView dataSource
                    that.binding.count = Home.actionsView.length;
                    listView.winControl.itemDataSource = Home.actionsView.dataSource;
                }
                return WinJS.Promise.as();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                var pageControl = pageElement.winControl;
                if (pageControl && pageControl.updateLayout) {
                    pageControl.prevWidth = 0;
                    pageControl.prevHeight = 0;
                    return pageControl.updateLayout.call(pageControl, pageElement);
                } else {
                    return WinJS.Promise.as();
                }
            }).then(function () {
                if (!Application.pageframe.splashScreenDone) {
                    WinJS.Promise.timeout(20).then(function () {
                        return Application.pageframe.hideSplashScreen();
                    });
                }
            }).then(function () {
                if (typeof AppHeader === "object" &&
                    AppHeader.controller && AppHeader.controller.binding) {
                    AppHeader.controller.loadData();
                }
            }).then(function () {
                if (AppData._persistentStates.eventColor) {
                    Colors.accentColor = AppData._persistentStates.eventColor;
                }
                var colors = Colors.updateColors();
                return (colors && colors._loadCssPromise) || WinJS.Promise.as();
            }).then(function () {
                AppBar.loadIcons();
                // workaround fix loading menu icon color
                NavigationBar.groups = Application.navigationBarGroups;
            }).then(function () {
                WinJS.Promise.timeout(50).then(function () {
                    // prüfen ob auf mandantfähigkeit dieses Flag 
                    if (that.binding.generalData.publishFlag) {
                        var confirmTitle = getResourceText("start.confirmTextPublish");
                        confirm(confirmTitle, function (result) {
                            if (result) {
                                Application.navigateById("publish");
                            } else {
                                Log.print(Log.l.trace, "publishflag: user choice CANCEL");
                            }
                        });
                    }
                });
                Log.print(Log.l.trace, "Splash screen vanished");
            });
            Log.ret(Log.l.trace);
        })
    });
})();