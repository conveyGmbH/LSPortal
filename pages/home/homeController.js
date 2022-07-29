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

            var listView = pageElement.querySelector("#homeActions.listview");
            var tileContainer = pageElement.querySelector(".tiles-container");
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

            var resizeTileContainer = function(tilecount) {
                Log.call(Log.l.trace, "LocalEvents.Controller.");
                if (tilecount === 1 || tilecount === 2) {
                    tileContainer.style.height = "120px";
                }
                if (tilecount === 3 || tilecount === 4) {
                    tileContainer.style.height = "240px";
                }
                if (tilecount === 5 || tilecount === 6) {
                    tileContainer.style.height = "360px";
                }
                if (tilecount === 7 || tilecount === 8) {
                    tileContainer.style.height = "480px";
                }
                if (tilecount === 9 || tilecount === 10) {
                    tileContainer.style.height = "600px";
                }
            }
            this.resizeTileContainer = resizeTileContainer;

            var resultConverter = function (item, index) {
                item.index = index;
                Home._actions.push({ page: item.Page, imageName: item.ImageName});
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, "LocalEvents.Controller.");
                AppData.setErrorMsg(that.binding);
                if (Home._actions) {
                    Home._actions = [];
                }
                var ret = new WinJS.Promise.as().then(function () {
                    return Home.StartPageTileView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "StartPageTileView: success!");
                        // employeeView returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length) {
                            var results = json.d.results;
                            var tileCount = results.length;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            that.resizeTileContainer(tileCount);
                            Log.print(Log.l.trace, "StartPageTileView: success!");
                        } else {
                            Home._actions = Home._actionsdefault;
                            Log.print(Log.l.trace, "StartPageTileView: success!");
                        }
                    }, function (errorResponse) {
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
                Log.print(Log.l.trace, "Binding wireup page complete");
                if (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 2) {
                    that.changeMenuLabel("startPremium", getResourceText("label.startSurpreme")); //
                } else if (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 1) {
                    that.changeMenuLabel("startPremium", getResourceText("label.startPremium")); //getResourceText()
                } else {
                    Log.print(Log.l.trace, "Unknown value of IsSupreme Flag");
                }
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function() {
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
                if(typeof AppHeader === "object" &&
                    AppHeader.controller && AppHeader.controller.binding) {
                    AppHeader.controller.binding.userData = AppData._userData;
                    AppHeader.controller.binding.userMessagesDataCount = AppData._userMessagesData.MessagesCounter;
                    AppHeader.controller.binding.showNameInHeader = AppData._persistentStates.showNameInHeader;
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
                NavigationBar.groups = Application.navigationBarGroups;              
            });
            Log.ret(Log.l.trace);
        })
    });
})();







