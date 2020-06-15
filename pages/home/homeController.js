// controller for page: home
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/home/homeService.js" />

/*
 Structure of states to be set from external modules:
 {
    networkState: newNetworkstate:
 }
*/

(function () {
    "use strict";

    WinJS.Namespace.define("Home", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Home.Controller.");

            Application.Controller.apply(this, [pageElement, {
                count: 0,
                comment: getResourceText("info.comment"),
            }, commandList]);

            var that = this;


            var listView = pageElement.querySelector("#homeActions.listview");
            /*
            if (listView && listView.winControl) {
                listView.winControl.itemDataSource = null;
                if (listView.style) {
                    listView.style.visibility = "hidden";
                }
            }
             */

            this.dispose = function() {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
            }

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Home.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Home.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Home.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "Home.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "Home.Controller.");
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
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "Home.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        Log.print(Log.l.trace, "itemIndex=" + eventInfo.detail.itemIndex);
                        var item = Home.actionsView.getAt(eventInfo.detail.itemIndex);
                        if (item && item.page) {
                            Application.navigateById(item.page, event);
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Home.Controller.");
                    if (listView && listView.winControl) {
                        var i;
                        Log.print(Log.l.trace, "onLoadingStateChanged called loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                            //
                        } else if (listView.winControl.loadingState === "itemsLoaded") {
                            Colors.loadSVGImageElements(listView, "action-image", 40, "#ffffff", "name", function (svgInfo) {
                                if (svgInfo.element && svgInfo.element.parentNode) {
                                    var actionItem = svgInfo.element.parentNode.parentNode;
                                    if (actionItem && actionItem.style && actionItem.style.visibility !== "visible") {
                                        actionItem.style.visibility = "visible";
                                    }
                                }
                                return WinJS.Promise.as();
                            });
                        } else if (listView.winControl.loadingState === "complete") {
                            //
                        }
                    }
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

            if (listView) {
                // add ListView event handler
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
            }

            // finally, load the data
            that.processAll().then(function() {
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
                if (!Application.pageframe.splashScreenDone) {
                    WinJS.Promise.timeout(20).then(function () {
                        return Application.pageframe.hideSplashScreen();
                    });
                }
            });
            Log.ret(Log.l.trace);
        })
    });
})();







