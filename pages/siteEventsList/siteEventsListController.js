// controller for page: SiteEventsList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/siteEventsList/siteEventsListService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("SiteEventsList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "SiteEventsList.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                eventId: 0,
                selIdx: AppData.getRecordId("VeranstaltungTermin") - 1,
                eventText: getResourceText("siteEventsList.event"),
                eventTypID: null,
                preveventTypID: null,
                searchString: ""
            }, commandList, true]);
            this.nextUrl = null;

            var that = this;

            // ListView control
            var listView = pageElement.querySelector("#siteEventsList.listview");
            var eventTypDropdown = pageElement.querySelector("#eventTyp");
            var searchInput = pageElement.querySelector("#searchInput");
            var progress = null;
            var counter = null;
            var layout = null;
            

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.eventdatasets) {
                    that.eventdatasets = null;
                }
                listView = null;
            }

            var creatingEventsCategory = function () {
                Log.call(Log.l.trace, "SiteEventsList.Controller.");
                var exhibitorCategory = [
                    {
                        value: null,
                        title: getResourceText("siteEventsList.allEvents")
                    },
                    {
                        value: 1,
                        title: getResourceText("siteEventsList.customerEvents")
                    },
                    {
                        value: 2,
                        title: getResourceText("siteEventsList.siteEvents")
                    }
                ];
                if (eventTypDropdown && eventTypDropdown.winControl) {
                    eventTypDropdown.winControl.data = new WinJS.Binding.List(exhibitorCategory);
                    eventTypDropdown.selectedIndex = 0;
                }
            }
            this.creatingEventsCategory = creatingEventsCategory;

            var background = function (index) {
                if (index % 2 === 0) {
                    return 1;
                } else {
                    return null;
                }
            };
            this.background = background;

            var loadNextUrl = function () {
                Log.call(Log.l.trace, "SiteEventsList.Controller.");
                progress = listView.querySelector(".list-footer .progress");
                counter = listView.querySelector(".list-footer .counter");
                if (that.eventdatasets && that.nextUrl && listView) {
                    that.loading = true;
                    if (progress && progress.style) {
                        progress.style.display = "inline";
                    }
                    if (counter && counter.style) {
                        counter.style.display = "none";
                    }
                    AppData.setErrorMsg(that.binding);
                    Log.print(Log.l.trace, "calling select SiteEventsList.VeranstaltungView...");
                    var nextUrl = that.nextUrl;
                    that.nextUrl = null;
                    SiteEventsList.VeranstaltungView.selectNext(function (json) { //json is undefined
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "SiteEventsList.VeranstaltungView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results && that.eventdatasets) {
                            that.nextUrl = SiteEventsList.VeranstaltungView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, that.binding.count);
                                that.binding.count = that.eventdatasets.push(item);
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
                Log.call(Log.l.trace, "SiteEventsList.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    for (var i = 0; i < that.eventdatasets.length; i++) {
                        var eventdataset = that.eventdatasets.getAt(i);
                        if (eventdataset && typeof eventdataset === "object" &&
                            eventdataset.VeranstaltungTerminVIEWID === recordId) {
                            listView.winControl.selection.set(i);
                            AppData.setRecordId("VeranstaltungTermin", recordId);
                            that.binding.eventId = recordId;
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

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
                item.recordIcon = Binding.Converter.getIconFromID(item.IconID, "SiteEventsList");
                if (!item.recordIcon) {
                    item.recordIcon = "";
                }
                item.StartDatum = that.getDateObject(item.StartDatum);
                item.EndDatum = that.getDateObject(item.EndDatum);
                item.nameInitial = (item.DisplayName)
                    ? item.DisplayName.substr(0, 2)
                    : (item.DisplayName ? item.DisplayName.substr(0, 2) : "");
            }
            this.resultConverter = resultConverter;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "SiteEventsList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                onSelectionDropDownChanged: function(event) {
                    Log.call(Log.l.trace, "SiteEventsList.Controller.");
                    that.binding.searchString = "";
                    var target = event.currentTarget || event.target;
                    if (target) {
                        that.binding.eventTypID = target.value;
                    }
                    that.loadData();
                    Log.ret(Log.l.trace);
                },
                onSearchInput: function (event) {
                    Log.call(Log.l.trace, "SiteEventsList.Controller.");
                    if (that.binding.eventTypID === null) {
                        that.binding.eventTypID = 0;
                    }
                    if (event.keyCode === 13) {
                        if (searchInput.value) {
                        return AppData.call("PRC_GetEventList",
                            {
                                pSearchString: searchInput.value,
                                pTerminTyp: parseInt(that.binding.eventTypID)
                            },
                            function(json) {
                                Log.print(Log.l.info, "call success! ");
                                if (json && json.d && json.d.results.length > 0) {
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                    });

                                    that.binding.count = results.length;
                                    that.eventdatasets = new WinJS.Binding.List(results);
                                    that.selectRecordId(results[0].VeranstaltungTerminVIEWID);

                                    if (listView.winControl) {
                                        // add ListView dataSource
                                        listView.winControl.itemDataSource = that.eventdatasets.dataSource;
                                    }
                                } else {

                                }
                            },
                            function(error) {
                                Log.print(Log.l.error, "call error");
                            });
                    } else {
                            Log.print(Log.l.error, "searchString empty!");
                        that.loadData();
                    }
                    }
                    
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "SiteEventsList.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    that.binding.selIdx = item.index;
                                    if (item.data && item.data.VeranstaltungTerminVIEWID) {
                                        // called asynchronously if ok
                                        var curPageId = Application.getPageId(nav.location);
                                        if (curPageId === "siteevents" || curPageId === "siteEventsList" || curPageId === "mailingTypes" || curPageId === "siteeventsImport") {
                                            AppBar.scope.binding.saveFlag = true;
                                            //AppBar.scope.saveData();
                                            if (curPageId === "siteeventsImport") {
                                                AppBar.scope.loadData(item.data.VeranstaltungTerminVIEWID);
                                                AppData.setRecordId("VeranstaltungTermin", item.data.VeranstaltungTerminVIEWID);
                                            }
                                            if (AppBar.scope._element &&
                                                AppBar.scope._element.id === "siteeventsController") {
                                            if (typeof AppBar.scope.loadData === "function") {
                                                AppBar.scope.loadData(item.data.VeranstaltungTerminVIEWID);
                                                AppBar.scope.binding.searchString = "";
                                                AppBar.scope.searchStringData = "";
                                                AppData.setRecordId("VeranstaltungTermin", item.data.VeranstaltungTerminVIEWID);
                                                }
                                            }
                                        } else {
                                            Application.navigateById("siteeventsList");
                                        }
                                        AppBar.triggerDisableHandlers();
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "SiteEventsList.Controller.");
                    Application.showDetail();
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "SiteEventsList.Controller.");
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
                                layout = Application.SiteEventsListLayout.SiteEventsListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor, "name");
                            that.loadNextUrl();
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "SiteEventsList.Controller.");
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
                    Log.call(Log.l.trace, "SiteEventsList.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;
                        if (visible && that.eventdatasets && that.nextUrl) {
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
                }
            };

            this.disableHandlers = null;

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
            }
            if (searchInput) {
                this.addRemovableEventListener(searchInput, "keyup", this.eventHandlers.onSearchInput.bind(this));
            }
            if (eventTypDropdown) {
                this.addRemovableEventListener(eventTypDropdown, "change", this.eventHandlers.onSelectionDropDownChanged.bind(this));
            }
            
            var loadData = function () {
                Log.call(Log.l.trace, "SiteEventsList.Controller.");
                that.loading = true;
                progress = listView.querySelector(".list-footer .progress");
                counter = listView.querySelector(".list-footer .counter");
                if (progress && progress.style) {
                    progress.style.display = "inline";
                }
                if (counter && counter.style) {
                    counter.style.display = "none";
                }
                AppData.setErrorMsg(that.binding);
                var restriction = "";
                if (that.binding.eventTypID === null || that.binding.eventTypID === "null" || that.binding.eventTypID === 0) {
                    restriction = "";
                    that.binding.preveventTypID = null;
                } else if (that.binding.eventTypID === that.binding.preveventTypID) {
                    Log.call(Log.l.trace, "SiteEventsList.Controller.");
                    return WinJS.Promise.as();
                } else {
                    restriction = { TerminTyp: parseInt(that.binding.eventTypID) };
                    that.binding.preveventTypID = that.binding.eventTypID;
                }
                var ret = new WinJS.Promise.as().then(function () {
                    return SiteEventsList.VeranstaltungView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "SiteEventsList: success!");
                        // employeeView returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            that.nextUrl = SiteEventsList.VeranstaltungView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                           
                            that.binding.count = results.length;
                            that.eventdatasets = new WinJS.Binding.List(results);
                            that.selectRecordId(results[0].VeranstaltungTerminVIEWID);
                            
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.eventdatasets.dataSource;
                            }
                            Log.print(Log.l.trace, "Data loaded");
                            if (that.binding.selIdx >= json.d.results.length) {
                                that.binding.selIdx = json.d.results.length - 1;
                            }
                            var recordId = AppData.getRecordId("VeranstaltungTermin");
                            if (recordId) {
                                WinJS.Promise.timeout(0).then(function () {
                                    that.selectRecordId(recordId);
                                });
                            } else {
                                AppData.setRecordId("VeranstaltungTermin", json.d.results[0].VeranstaltungTerminID);
                                recordId = AppData.getRecordId("VeranstaltungTermin");
                                WinJS.Promise.timeout(0).then(function () {
                                    that.selectRecordId(recordId);
                                });
                            }
                        } else {
                            that.binding.count = 0;
                            that.nextUrl = null;
                            that.eventdatasets = null;
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = null;
                            }
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
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        if (progress && progress.style) {
                            progress.style.display = "none";
                        }
                        if (counter && counter.style) {
                            counter.style.display = "inline";
                        }
                        that.loading = false;
                        }, restriction);
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.creatingEventsCategory();
            }).then(function () {
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
                eventdatasets: null
            })
    });
})();
