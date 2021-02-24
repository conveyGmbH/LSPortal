// controller for page: eventSeriesList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/eventSeriesList/eventSeriesListService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("EventSeriesList", {
        Controller: WinJS.Class.derive(Application.RecordsetController, function Controller(pageElement, commandList, isMaster) {
            Log.call(Log.l.trace, "EventSeriesList.Controller.");
            this.nextUrl = null;
            this.eventsdata = null;

            var that = this;

            // ListView control
            var listView = pageElement.querySelector("#eventSeriesList.listview");

            Application.RecordsetController.apply(this, [pageElement, {
                count: 0
            }, commandList, false, EventSeriesList.SerienView, null, listView]);

            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.eventsdata) {
                    that.eventstdata = null;
                }
                listView = null;
            }

            var background = function (index) {
                if (index % 2 === 0) {
                    return 1;
                } else {
                    return null;
                }
            };
            this.background = background;

            var loadNextUrl = function () {
                Log.call(Log.l.trace, "EventSeriesList.Controller.");
                progress = listView.querySelector(".list-footer .progress");
                counter = listView.querySelector(".list-footer .counter");
                if (that.eventsdata && that.nextUrl && listView) {
                    that.loading = true;
                    if (progress && progress.style) {
                        progress.style.display = "inline";
                    }
                    if (counter && counter.style) {
                        counter.style.display = "none";
                    }
                    AppData.setErrorMsg(that.binding);
                    Log.print(Log.l.trace, "calling select EventSeriesList.SerienView...");
                    var nextUrl = that.nextUrl;
                    that.nextUrl = null;
                    EventSeriesList.SerienView.selectNext(function (json) { //json is undefined
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "EventSeriesList.SerienView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results && that.eventsdata) {
                            that.nextUrl = EventSeriesList.SerienView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, that.binding.count);
                                that.binding.count = that.eventsdata.push(item);
                            });
                        }
                        if (progress && progress.style) {
                            progress.style.display = "none";
                        }
                        if (counter && counter.style) {
                            counter.style.display = "inline";
                        }
                        that.loading = false;
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        //Log.print(Log.l.error, "ContactList.contactView: error!");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (progress && progress.style) {
                            progress.style.display = "none";
                        }
                        if (counter && counter.style) {
                            counter.style.display = "inline";
                        }
                        that.loading = false;
                    },
                        null,
                        nextUrl);
                } else {
                    if (progress && progress.style) {
                        progress.style.display = "none";
                    }
                    if (counter && counter.style) {
                        counter.style.display = "inline";
                    }
                    that.loading = false;
                }
                Log.ret(Log.l.trace);
            }
            this.loadNextUrl = loadNextUrl;

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "EventSeriesList.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    for (var i = 0; i < that.eventsdata.length; i++) {
                        var events = that.eventsdata.getAt(i);
                        if (events && typeof events === "object" &&
                            events.VeranstaltungVIEWID === recordId) {
                            listView.winControl.selection.set(i);
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            var resultConverter = function (item, index) {
                item.index = index;
            }
            this.resultConverter = resultConverter;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "EventSeriesList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "EventSeriesList.Controller.");
                    Application.showDetail();
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EventSeriesList.Controller.");
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
                                layout = Application.EventsListLayout.EventsListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor);
                            Colors.loadSVGImageElements(listView, "action-image-flag", 40);
                            that.loadNextUrl();
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EventSeriesList.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    var curPageId = Application.getPageId(nav.location);
                                    that.binding.active = null;
                                    if (item.data.Aktiv) {
                                        that.binding.active = 1;
                                    }
                                    that.actualSelectedItem = item.data;
                                    if (item.data && item.data.MandantSerieVIEWID) {
                                        var newRecId = item.data.MandantSerieVIEWID;
                                        Log.print(Log.l.trace, "newRecId:" + newRecId + " curRecId:" + that.curRecId);
                                        if (newRecId !== 0 && newRecId !== that.curRecId) {
                                            if (that.curRecId) {
                                                that.prevRecId = that.curRecId;
                                            }
                                            that.curRecId = newRecId;

                                            if (AppBar.scope && typeof AppBar.scope.saveData === "function") {
                                                //=== "function" save wird nicht aufgerufen wenn selectionchange
                                                // current detail view has saveData() function
                                                AppBar.scope.saveData(function (response) {
                                                    // called asynchronously if ok
                                                    if (curPageId === "eventSeries" &&
                                                        typeof AppBar.scope.loadData === "function" &&
                                                        typeof AppBar.scope.setSeriesId === "function") {
                                                        AppBar.scope.setSeriesId(item.data.MandantSerieVIEWID);
                                                        AppBar.scope.loadData();
                                                    } else {
                                                        Application.navigateById("eventSeries");
                                                    }
                                                }, function (errorResponse) {
                                                    if (curPageId === "eventSeries" &&
                                                        typeof AppBar.scope.getSeriesId === "function") {
                                                        that.selectRecordId(AppBar.scope.getSeriesId());
                                                    }
                                                });
                                            } else {
                                                // current detail view has NO saveData() function - is list
                                                if (curPageId === "eventSeries" &&
                                                    typeof AppBar.scope.loadData === "function" &&
                                                    typeof AppBar.scope.setSeriesId === "function") {
                                                    AppBar.scope.setSeriesId(item.data.VeranstaltungVIEWID);
                                                    AppBar.scope.loadData();
                                                } else {
                                                    Application.navigateById("eventSeries");
                                                }
                                            }
                                            AppBar.triggerDisableHandlers();
                                        }
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EventSeriesList.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible) {
                            var contentHeader = listView.querySelector(".content-header");
                            if (contentHeader) {
                                var halfCircle = contentHeader.querySelector(".half-circle");
                                if (halfCircle && halfCircle.style) {
                                    if (halfCircle.style.visibility === "hidden") {
                                        halfCircle.style.visibility = "";
                                        WinJS.UI.Animation.enterPage(halfCircle);
                                    }
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EventSeriesList.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;
                        if (visible && that.eventsdata && that.nextUrl) {
                            that.loading = true;
                            that.loadNextUrl();
                        } else {
                            if (progress && progress.style) {
                                progress.style.display = "none";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "inline";
                            }
                            that.loading = false;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "EventSeriesList.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "EventSeriesList.Controller.");
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
                }
            };

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
            }

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        }, {
            nextUrl: null,
            loading: false,
            localeventsdata: null,
            deleteEventData: null
        })
    });
})();