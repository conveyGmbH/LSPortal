// controller for page: eventsList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/eventList/eventListService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.min.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("EventList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList, isMaster) {
            Log.call(Log.l.trace, "EventList.Controller.");
            Application.Controller.apply(this, [pageElement, {
                eventId: AppData.getRecordId("Veranstaltung"),
                publishFlag: null,
                count: 0,
                active: null,
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic
            }, commandList, isMaster]);
            this.nextUrl = null;
            this.records = null;
            this.disabledindexes = [];

            var that = this;

            // ListView control
            var listView = pageElement.querySelector("#eventList.listview");
            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.records) {
                    that.records = null;
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
                Log.call(Log.l.trace, "EventList.Controller.");
                progress = listView.querySelector(".list-footer .progress");
                counter = listView.querySelector(".list-footer .counter");
                if (that.records && that.nextUrl && listView) {
                    that.loading = true;
                    if (progress && progress.style) {
                        progress.style.display = "inline";
                    }
                    if (counter && counter.style) {
                        counter.style.display = "none";
                    }
                    AppData.setErrorMsg(that.binding);
                    Log.print(Log.l.trace, "calling select EventList.VeranstaltungView...");
                    var nextUrl = that.nextUrl;
                    that.nextUrl = null;
                    EventList.VeranstaltungView.selectNext(function (json) { //json is undefined
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "EventList.VeranstaltungView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results && that.records) {
                            that.nextUrl = EventList.VeranstaltungView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, that.binding.count);
                                that.binding.count = that.records.push(item);
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
                Log.call(Log.l.trace, "EventList.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    for (var i = 0; i < that.records.length; i++) {
                        var events = that.records.getAt(i);
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
                // convert Startdatum
                if (item.Startdatum) {
                    item.Startdatum = getDateObject(item.Startdatum);
                    var startMoment = moment(item.Startdatum);
                    startMoment.locale(Application.language);
                    item.Startdatum = startMoment.format("ll");
                }
                //convert Enddatum
                if (item.Enddatum) {
                    item.Enddatum = getDateObject(item.Enddatum);
                    var endMoment = moment(item.Enddatum);
                    endMoment.locale(Application.language);
                    item.Enddatum = endMoment.format("ll");
                }
                item.nameInitial = item.Name ? item.Name.substr(0, 2) : "";
                if (item.Disabled) {
                    item.disabled = true;
                    that.disabledindexes.push(index);
                } else {
                    item.disabled = false;
                }
            }
            this.resultConverter = resultConverter;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "EventList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "EventList.Controller.");
                    Application.showDetail();
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EventList.Controller.");
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
                                layout = Application.EventListLayout.EventListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            //smallest List color change
                            var circleElement = pageElement.querySelector('#nameInitialcircle');
                            circleElement.style.backgroundColor = Colors.accentColor;
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor);
                            Colors.loadSVGImageElements(listView, "action-image-flag", 40);
                            that.loadNextUrl();
                        } else if (listView.winControl.loadingState === "itemsLoaded") {
                            if (that.disabledindexes && that.disabledindexes.length > 0) {
                                var indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                                var indexOfLastVisible = listView.winControl.indexOfLastVisible;
                                for (var i = 0; i <= that.disabledindexes.length; i++) {
                                    var element = listView.winControl.elementFromIndex(that.disabledindexes[i]);
                                    if (element && element.parentElement && element.parentElement.parentElement) {
                                        if (element.firstElementChild) {
                                            if (element.firstElementChild.disabled) {
                                                if (!WinJS.Utilities.hasClass(element, "win-nonselectable")) {
                                                    WinJS.Utilities.addClass(element, "win-nonselectable");
                                                }
                                                if (!WinJS.Utilities.hasClass(element.parentElement.parentElement, "win-disabled")) {
                                                    WinJS.Utilities.addClass(element.parentElement.parentElement, "win-disabled");
                                                }
                                            } else {
                                                if (WinJS.Utilities.hasClass(element, "win-nonselectable")) {
                                                    WinJS.Utilities.removeClass(element, "win-nonselectable");
                                                }
                                                if (WinJS.Utilities.hasClass(element.parentElement.parentElement, "win-disabled")) {
                                                    WinJS.Utilities.removeClass(element.parentElement.parentElement, "win-disabled");
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EventList.Controller.");
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
                                    if (item.data && item.data.VeranstaltungVIEWID) {
                                        that.binding.publishFlag = item.data.PublishFlag;
                                        if (typeof AppHeader === "object" &&
                                            AppHeader.controller && AppHeader.controller.binding) {
                                            AppHeader.controller.binding.publishFlag = that.binding.publishFlag;
                                        }
                                        if (item.data.Aktiv) {
                                            that.binding.active = 1;
                                        }
                                        var newRecId = item.data.VeranstaltungVIEWID;
                                        Log.print(Log.l.trace, "newRecId:" + newRecId + " curRecId:" + that.curRecId);
                                        if (newRecId !== 0 && newRecId !== that.curRecId) {
                                            if (that.curRecId) {
                                                that.prevRecId = that.curRecId;
                                            }
                                            that.curRecId = newRecId;
                                            that.binding.eventId = newRecId;
                                            // use Veranstaltung2 for event selection of multi-event administrators !== Veranstaltung (admin's own event!)
                                            AppData.setRecordId("Veranstaltung2", that.binding.eventId);
                                            var lastPageId = Application.getPageId(Application.navigator._lastPage);
                                            if (lastPageId !== curPageId) {
                                                Log.print(Log.l.trace, "Page navigation not completed");
                                            } else if (AppBar.modified && AppBar.scope && typeof AppBar.scope.saveData === "function") {
                                                //=== "function" save wird nicht aufgerufen wenn selectionchange
                                                // current detail view has saveData() function
                                                AppBar.scope.saveData(function (response) {
                                                    // called asynchronously if ok

                                                    if ((curPageId === "eventCopy" ||
                                                        curPageId === "contactResultsList" ||
                                                        curPageId === "mandatory" ||
                                                        curPageId === "questiongroup" ||
                                                        curPageId === "questionList" ||
                                                        curPageId === "optQuestionList" ||
                                                        curPageId === "event") &&
                                                        typeof AppBar.scope.loadData === "function") {
                                                        if (typeof AppBar.scope.setEventId === "function") {
                                                            AppBar.scope.setEventId(that.binding.eventId); /*setEventId rausnehmen*/
                                                        }
                                                        AppBar.scope.loadData();
                                                    } else if (curPageId === "eventProducts" &&
                                                        typeof AppBar.scope.loadData === "function") {
                                                        if (typeof AppBar.scope.setEventId === "function") {
                                                            AppBar.scope.setEventId(that.binding.eventId); /*setEventId rausnehmen*/
                                                        }
                                                        AppBar.scope.loadData();
                                                    } else if (curPageId === "reporting" &&
                                                        typeof AppBar.scope.loadData === "function") {
                                                        AppBar.scope.loadData(item.data.VeranstaltungVIEWID);
                                                    } else {
                                                        var newPageId = Application.getPageId(Application.navigator._nextPage);
                                                        if (newPageId !== "event" &&
                                                            newPageId !== "contactResultsList") {
                                                            Application.navigateById("event");
                                                        }
                                                    }
                                                }, function (errorResponse) {
                                                    if ((curPageId === "eventCopy" ||
                                                        curPageId === "mandatory" ||
                                                        curPageId === "optQuestionList" ||
                                                        curPageId === "questionList" ||
                                                        curPageId === "event" ||
                                                        curPageId === "contactResultsList" ||
                                                        curPageId === "reporting" ||
                                                        curPageId === "reportingColumnList" ||
                                                        curPageId === "start") &&
                                                        typeof AppBar.scope.getEventId === "function") {
                                                        that.selectRecordId(AppBar.scope.getEventId());
                                                    }
                                                });
                                            } else {
                                                // current detail view has NO saveData() function - is list
                                                if ((curPageId === "eventCopy" ||
                                                    curPageId === "mandatory" ||
                                                    curPageId === "optQuestionList" ||
                                                    curPageId === "questionList" ||
                                                    curPageId === "questiongroup" ||
                                                    curPageId === "event" ||
                                                    curPageId === "contactResultsList") &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    if (typeof AppBar.scope.setEventId === "function") {
                                                        AppBar.scope.setEventId(that.binding.eventId); /*setEventId rausnehmen*/
                                                    }
                                                    AppBar.scope.loadData();
                                                }
                                                if ((curPageId === "reporting" ||
                                                    curPageId === "reportingColumnList" ||
                                                    curPageId === "start") &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    AppBar.scope.loadData(item.data.VeranstaltungVIEWID);
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
                    Log.call(Log.l.trace, "EventList.Controller.");
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
                    Log.call(Log.l.trace, "EventList.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;
                        if (visible && that.records && that.nextUrl) {
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
                    Log.call(Log.l.trace, "EventList.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "EventList.Controller.");
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

            var loadData = function () {
                Log.call(Log.l.trace, "EventList.Controller.");
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
                var ret = new WinJS.Promise.as().then(function () {
                    return EventList.VeranstaltungView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "Events: success!");
                        // employeeView returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            that.nextUrl = EventList.VeranstaltungView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            that.binding.count = results.length;

                            if (results.length <= 1) {
                                NavigationBar.disablePage("eventCopy");
                            } else {
                                NavigationBar.enablePage("eventCopy");
                            }

                            that.records = new WinJS.Binding.List(results);

                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.records.dataSource;
                            }
                            Log.print(Log.l.trace, "Data loaded");
                            // use Veranstaltung2 for event selection of multi-event administrators !== Veranstaltung (admin's own event!)
                            var recordId = AppData.getRecordId("Veranstaltung2");
                            if (recordId) {
                                if (AppBar.scope && typeof AppBar.scope.setEventId === "function") {
                                    AppBar.scope.setEventId(recordId);
                                }
                                that.selectRecordId(recordId);
                            } else {
                                if (listView && listView.winControl) {
                                    listView.winControl.selection.set(0);
                                }
                            }
                        } else {
                            that.binding.count = 0;
                            that.nextUrl = null;
                            that.records = null;
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
                        return WinJS.Promise.as();
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
                    }, {

                        });
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            // initially set selection to own eventId!
            AppData.setRecordId("Veranstaltung2", AppData.getRecordId("Veranstaltung"));

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
                loading: false
            })
    });
})();
