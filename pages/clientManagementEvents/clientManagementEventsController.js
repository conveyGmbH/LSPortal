// controller for page: clientManagementSummarise
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/hammer/scripts/hammer.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/pages/clientManagementEvents/clientManagementEventsService.js" />
(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var namespaceName = "ClientManagementEvents";

    WinJS.Namespace.define("ClientManagementEvents", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "ClientManagementEvents.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                eventsID: null
            }, commandList]);
            this.nextUrl = null;
            this.events = null;
            this.eventsId = null;

            var that = this;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var listView = pageElement.querySelector("#clientManagementEventsList.listview");

            this.dispose = function () {
               
            }

            var getFairMandantId = function () {
                return ClientManagementEvents._fairMandantId;
            }
            that.getFairMandantId = getFairMandantId;

            var setFairMandantId = function (value) {
                Log.print(Log.l.trace, "_fairMandantId=" + value);
                ClientManagementEvents._fairMandantId = value;
            }
            that.setFairMandantId = setFairMandantId;

            var getDateObject = function (dateData) {
                var ret;
                if (dateData) {
                    var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                    var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    ret = new Date(milliseconds).toLocaleDateString();
                    //.toLocaleString('de-DE').substr(0, 10);
                } else {
                    ret = "";
                }
                return ret;
            };
            this.getDateObject = getDateObject;

            var resultConverter = function (item, index) {
                item.index = index;
				
                if (!item.EventName) { item.EventName = ""; }
                if (!item.StartDate) { item.StartDate = ""; } else { item.StartDate = that.getDateObject(item.StartDate) }
                if (!item.EndDate) { item.EndDate = ""; } else { item.EndDate = that.getDateObject(item.EndDate) }
                if (!item.AnzUser) { item.AnzUser = ""; }
                if (!item.AnzKontakte) { item.AnzKontakte = ""; }
            }
            this.resultConverter = resultConverter;

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "LocalEvents.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    for (var i = 0; i < that.events.length; i++) {
                        var events = that.events.getAt(i);
                        if (events && typeof events === "object" &&
                            events.FairMandantVeranstID === recordId) {
                            listView.winControl.selection.set(i);
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            var scopeFromRecordId = function (recordId) {
                var i;
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                var item = null;
                for (i = 0; i < that.events.length; i++) {
                    var events = that.events.getAt(i);
                    if (events && typeof events === "object" &&
                        events.FairMandantVeranstID === recordId) {
                        item = events;
                        break;
                    }
                }
                if (item) {
                    Log.ret(Log.l.trace, "i=" + i);
                    return { index: i, item: item };
                } else {
                    Log.ret(Log.l.trace, "not found");
                    return null;
                }
            };
            this.scopeFromRecordId = scopeFromRecordId;

            var changeEvent = function () {
                Log.call(Log.l.trace, "LocalEvents.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_ChangeUserVeranstaltung", {
                    pNewVeranstaltungID: that.eventsId,
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

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickChange: function (event) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    that.changeEvent();
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        AppBar.busy = true;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    that.eventsId = item.data.VeranstaltungID;
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        // single list selection
                        if (listView.winControl.selectionMode !== WinJS.UI.SelectionMode.single) {
                            listView.winControl.selectionMode = WinJS.UI.SelectionMode.single;
                        }
                        // direct selection on each tap
                        if (listView.winControl.tapBehavior !== WinJS.UI.TapBehavior.directSelect) {
                            listView.winControl.tapBehavior = WinJS.UI.TapBehavior.directSelect;
                        }
                        // Double the size of the buffers on both sides
                        if (!maxLeadingPages) {
                            maxLeadingPages = listView.winControl.maxLeadingPages * 4;
                            listView.winControl.maxLeadingPages = maxLeadingPages;
                        }
                        if (!maxTrailingPages) {
                            maxTrailingPages = listView.winControl.maxTrailingPages * 4;
                            listView.winControl.maxTrailingPages = maxTrailingPages;
                        }
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.ClientManagementEventsLayout.ClientManagementEventsLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "itemsLoaded") {
                            //set list-order column
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor);
                            Colors.loadSVGImageElements(listView, "action-image-flag", 40);
                        } else if (listView.winControl.loadingState === "complete") {
                            if (that.loading) {
                                progress = listView.querySelector(".list-footer .progress");
                                counter = listView.querySelector(".list-footer .counter");
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                                that.loading = false;
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible && that.nextUrl) {
                            that.loadNext();
                        }
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
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                clickGotoPublish: function () {
                    return true;
                },
                clickChange: function () {
                    if (that.eventsId && AppData.generalData.eventId !== that.eventsId) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "click", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
            }

            var loadData = function () {
                Log.call(Log.l.trace, "ClientManagementEvents.Controller.");
                that.loading = true;
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    Log.call(Log.l.trace, "ClientManagementEvents.Controller.");
                    var fmid = that.getFairMandantId();
                    if (!fmid) {
                        Log.call(Log.l.trace, "No FairMandantID found!");

                    } else {
                        return AppData.call("PRC_GetExhibitorEvents",
                            {
                                pFairMandantID: fmid
                            },
                            function (json) {
                                Log.print(Log.l.info, "call success! ");
                                if (json && json.d && json.d.results.length > 0) {
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                    });
                                    that.events = new WinJS.Binding.List(results);
                                    that.binding.count = results.length;
                                    that.eventsId = results[0].VeranstaltungID;
                                    if (listView.winControl) {
                                        // add ListView dataSource
                                        listView.winControl.itemDataSource = that.events.dataSource;
                                        listView.winControl.selection.set(0);
                                    }
                                    AppBar.busy = true;
                                    //that.addBodyRowHandlers();
                                } else {
                                    Log.call(Log.l.trace, "No FairMandantID found!");
                                }
                            },
                            function (error) {
                                Log.print(Log.l.error, "call error");
                            });
                    }
                    Log.ret(Log.l.trace);
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;
            
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.setFairMandantId(AppData.getRecordId("FairMandant"));
            }).then(function () {
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
