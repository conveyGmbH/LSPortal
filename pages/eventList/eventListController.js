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
/// <reference path="~/www/pages/home/homeService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var namespaceName = "EventList";

    WinJS.Namespace.define("EventList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList, isMaster) {
            Log.call(Log.l.trace, "EventList.Controller.");
            Application.Controller.apply(this, [pageElement, {
                eventId: AppData.getRecordId("Veranstaltung"),
                prevModifiedUser: null,
                publishFlag: null,
                count: 0,
                active: null,
                dashboardIdx: 0,
                isGlobSiteCustAdmin: AppHeader.controller.binding.userData.SiteAdmin || AppHeader.controller.binding.userData.IsCustomerAdmin,
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin &&
                    AppData._persistentStates.leadsuccessBasic,
                btnFilterNotPublished: getResourceText("eventList.btnFilterNotPublished"),
                btnEventSort: getResourceText("eventList.btnEventDesc"),
                btnDateSort: getResourceText("eventList.btnDateDesc"),
                showHideFilterBtn: null,
                showHideDashboardFeature: true,
                searchString: "",
                minDate: "",
                maxDate: "",
                sortField: "VeranstaltungName",
                sortType: "A"
            }, commandList, isMaster]);
            this.nextUrl = null;
            this.records = null;
            this.disabledindexes = [];

            var that = this;
            that.prevRecId = 0;
            that.curRecId = 0;
            that.loadDataDelayedPromise = null;

            // ListView control
            var listView = pageElement.querySelector("#eventList.listview");
            var btnFilterNotPublished = pageElement.querySelector("#btnFilterNotPublished");
            var dashboardCombo = pageElement.querySelector("#showDashboardCombo");
            var searchField = pageElement.querySelector("#searchField");
            var btnEventSort = pageElement.querySelector("#btnEventSort");
            var btnDateSort = pageElement.querySelector("#btnDateSort");
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
                if (dashboardCombo && dashboardCombo.winControl) {
                    dashboardCombo.winControl.data = null;
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

            var resetFilters = function () {
                that.binding.searchString = "";
                that.binding.minDate = "";
                that.binding.maxDate = "";
                that.binding.sortField = "VeranstaltungName";
                that.binding.sortType = "A";
                that.binding.dashboardIdx = 0;
            }
            this.resetFilters = resetFilters;

            var hideBtnFilterNotPublished = function (curPageId) {
                // Select the element with the ID btnFilterNotPublished
                var btn = pageElement.querySelector("#btnFilterNotPublishedfieldline");
                // Check if the element exists to avoid errors
                if (btn) {
                    if (curPageId === "start") {
                        // Set the display property to none
                        that.binding.showHideFilterBtn = null;
                        that.binding.publishFlag = null;
                    } else {
                        // Nur anzeigen wenn es auch einen gibt
                        /*that.binding.showHideFilterBtn = true;
                        that.binding.publishFlag = true;*/
                    }
                } else {
                    Log.print(Log.l.trace, "Element with ID btnFilterNotPublished not found.");
                }
            }
            this.hideBtnFilterNotPublished = hideBtnFilterNotPublished;

            var showDashboardFeature = function (curPageId) {
                var sel = pageElement.querySelector("#dashboardFeature");
                if (sel) {
                    if (curPageId === "start") {
                        that.binding.showHideDashboardFeature = true;
                    } else {
                        that.binding.showHideDashboardFeature = null;
                    }
                } else {
                    Log.print(Log.l.trace, "Element with ID btnFilterNotPublished not found.");
                }
            }
            this.showDashboardFeature = showDashboardFeature;

            var creatingDashboardComboCategory = function () {
                Log.call(Log.l.trace, "EventList.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_GetMandantDashboardTypes", {

                }, function (json) {
                    if (json && json.d && json.d.results) {
                        if (dashboardCombo && dashboardCombo.winControl) {
                            dashboardCombo.winControl.data = new WinJS.Binding.List(json.d.results);
                            dashboardCombo.selectedIndex = 0;
                        }
                    }
                }, function (error) {
                    Log.print(Log.l.error, "call error");
                });
                Log.ret(Log.l.trace);
            };
            this.creatingDashboardComboCategory = creatingDashboardComboCategory;

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

            var scrollToRecordId = function (recordId) {
                Log.call(Log.l.trace, "Questionnaire.Controller.", "recordId=" + recordId);
                if (that.loading) {
                    WinJS.Promise.timeout(50).then(function () {
                        that.scrollToRecordId(recordId);
                    });
                } else {
                    if (recordId && listView && listView.winControl) {
                        for (var i = 0; i < that.records.length; i++) {
                            var events = that.records.getAt(i);
                            if (events && typeof events === "object" &&
                                events.VeranstaltungVIEWID === recordId) {
                                listView.winControl.indexOfFirstVisible = i;
                                break;
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.scrollToRecordId = scrollToRecordId;

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "EventList.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    for (var i = 0; i < that.records.length; i++) {
                        var events = that.records.getAt(i);
                        if (events && typeof events === "object" &&
                            events.VeranstaltungVIEWID === recordId) {
                            listView.winControl.selection.set(i);
                            that.scrollToRecordId(recordId);
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            var scopeFromRecordId = function (recordId) {
                var ret = null;
                Log.call(Log.l.trace, "EventList.Controller.", "recordId=" + recordId);
                if (that.records && recordId) {
                    var i, item = null;
                    for (i = 0; i < that.records.length; i++) {
                        var record = that.records.getAt(i);
                        if (record && typeof record === "object" &&
                            record.VeranstaltungVIEWID === recordId) {
                            item = record;
                            break;
                        }
                    }
                    if (item) {
                        Log.print(Log.l.trace, "found i=" + i);
                        ret = { index: i, item: item };
                    } else {
                        Log.print(Log.l.trace, "not found");
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            }
            this.scopeFromRecordId = scopeFromRecordId;

            var resultConverter = function (item, index) {
                item.index = index;
                // convert Startdatum
                if (item.StartDatum) {
                    item.StartDatum = getDateObject(item.StartDatum);
                    var startMoment = moment(item.StartDatum);
                    startMoment.locale(Application.language);
                    item.StartDatum = startMoment.format("ll");
                }
                //convert Enddatum
                if (item.EndDatum) {
                    item.EndDatum = getDateObject(item.EndDatum);
                    var endMoment = moment(item.EndDatum);
                    endMoment.locale(Application.language);
                    item.EndDatum = endMoment.format("ll");
                }
                item.nameInitial = item.VeranstaltungName ? item.VeranstaltungName.substr(0, 2) : "";
                if (item.Disabled) {
                    item.disabled = true;
                    that.disabledindexes.push(index);
                } else {
                    item.disabled = false;
                }
                if (item.PublishFlag) {
                    that.binding.showHideFilterBtn = true;
                    that.binding.publishFlag = true;
                }
            }
            this.resultConverter = resultConverter;

            var updateBindings = function(data) {
                if (data && data.VeranstaltungVIEWID) {
                    that.binding.publishFlag = data.PublishFlag;
                    that.binding.prevModifiedUser = data.PrevModifierUser;
                    //that.binding.showHideFilterBtn = data.PublishFlag;
                    if (typeof AppHeader === "object" &&
                        AppHeader.controller && AppHeader.controller.binding) {
                        AppHeader.controller.binding.publishFlag = AppHeader.controller.getPublishFlag(); /* that.binding.publishFlag that.binding.generalData.publishFlag*/
                    }
                    if (data.Aktiv) {
                        that.binding.active = 1;
                    }
                    AppData._persistentStates.showdashboardMesagoCombo = data.DashboardIdx;
                    if (AppBar.scope.binding) {
                        AppBar.scope.binding.isSupreme = parseInt(AppData._persistentStates.showdashboardMesagoCombo) || parseInt(AppData._userData.IsSupreme);
                    }
                    if (typeof AppBar.scope.checkTip === "function") {
                        AppBar.scope.checkTip();
                    }
                    if (data.DashboardIdx === 0) {
                        NavigationBar.enablePage("startPremium");
                        NavigationBar.enablePage("dashboardFN");
                    }
                    if (data.DashboardIdx === 1 || data.DashboardIdx === 2 || data.DashboardIdx === 3 || data.DashboardIdx === 4) {
                        NavigationBar.enablePage("startPremium");
                    } else {
                        NavigationBar.disablePage("startPremium");
                    }
                    /*if (data.DashboardIdx === "3" || data.DashboardIdx === "4") {
                        NavigationBar.enablePage("dashboardFN");
                    } else {
                        NavigationBar.disablePage("dashboardFN");
                    }*/
                    if (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 1) {
                        NavigationBar.changeNavigationBarLabel("startPremium", getResourceText("label.startPremium")); //getResourceText()
                    } else if (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 2) {
                        NavigationBar.changeNavigationBarLabel("startPremium", getResourceText("label.startSurpreme")); //
                    } else if (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 3) {
                        NavigationBar.changeNavigationBarLabel("startPremium", getResourceText("label.dashboardFNPremium")); //getResourceText()
                    } else if (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 4) {
                        NavigationBar.changeNavigationBarLabel("startPremium", getResourceText("label.dashboardFNSupreme")); //getResourceText()
                    } else {
                        Log.print(Log.l.trace, "Unknown value of IsSupreme Flag");
                    }
                }
            }
            var loadDataDelayed = function () {
                if (that.loadDataDelayedPromise) {
                    that.loadDataDelayedPromise.cancel();
                    that.removeDisposablePromise(that.loadDataDelayedPromise);
                }
                that.loadDataDelayedPromise = WinJS.Promise.timeout(450).then(function () {
                    //that.getFilter();
                    //AppData.setRecordId("FairMandantSearch", searchString);
                    that.loadData();
                });
                that.addDisposablePromise(that.loadDataDelayedPromise);
            }
            this.loadDataDelayed = loadDataDelayed;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "EventList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                changeSearchField: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (event && event.currentTarget) {
                        that.binding.searchString = event.currentTarget.value;
                        //that.loadData();
                        that.loadDataDelayed();
                    }
                    Log.ret(Log.l.trace);
                },
                selectionDropDownChanged: function (event) {
                    Log.call(Log.l.trace, "EventList.Controller.");
                    var target = event.currentTarget || event.target;
                    if (target) {
                        that.binding.dashboardIdx = parseInt(target.value);
                        that.loadData();
                    }
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
                            if (circleElement && circleElement.style) {
                                circleElement.style.backgroundColor = Colors.accentColor;
                            }
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor);
                            Colors.loadSVGImageElements(listView, "action-image-flag", 40);
                            Colors.loadSVGImageElements(listView, "warning-image", 40, "red");
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
                    AppData.setRecordId("VeranstaltungEdit", "");
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
                                        var prevRecId = that.curRecId;
                                        var newRecId = item.data.VeranstaltungVIEWID;
                                        Log.print(Log.l.trace, "newRecId:" + newRecId + " curRecId:" + that.curRecId + " prevRecId:" + prevRecId);
                                        if (newRecId !== 0 && newRecId !== that.curRecId) {
                                            if (that.curRecId) {
                                                that.prevRecId = that.curRecId;
                                            }
                                            that.curRecId = newRecId;
                                            //that.binding.eventId = newRecId;
                                            // use Veranstaltung2 for event selection of multi-event administrators !== Veranstaltung (admin's own event!)
                                            AppData.setRecordId("Veranstaltung2", that.binding.eventId);
                                            var lastPageId = Application.getPageId(Application.navigator._lastPage);
                                            if (lastPageId !== curPageId) {
                                                Log.print(Log.l.trace, "Page navigation not completed");
                                            } else if (AppBar.modified && AppBar.scope && typeof AppBar.scope.saveData === "function") {
                                                //=== "function" save wird nicht aufgerufen wenn selectionchange
                                                // current detail view has saveData() function
                                                AppBar.scope.saveData(function (response) {
                                                    updateBindings(item.data);
                                                    // called asynchronously if ok
                                                    that.binding.eventId = newRecId;
                                                    if ((curPageId === "eventCopy" ||
                                                        curPageId === "contactResultsList" ||
                                                        //curPageId === "mandatory" ||
                                                        curPageId === "questiongroup" ||
                                                        curPageId === "questionList" ||
                                                        //curPageId === "optQuestionList" ||
                                                        curPageId === "skills") &&
                                                        typeof AppBar.scope.loadData === "function") {
                                                        if (typeof AppBar.scope.setEventId === "function") {
                                                            AppBar.scope.setEventId(that.binding.eventId); /*setEventId rausnehmen*/
                                                        }
                                                        AppBar.scope.loadData();
                                                    } else if ((curPageId === "event" || curPageId === "genDataSettings") &&
                                                        typeof AppBar.scope.loadData === "function") {
                                                        AppBar.scope.loadData();
                                                    }else if (curPageId === "eventProducts" &&
                                                        typeof AppBar.scope.loadData === "function") {
                                                        if (typeof AppBar.scope.setEventId === "function") {
                                                            AppBar.scope.setEventId(that.binding.eventId); /*setEventId rausnehmen*/
                                                        }
                                                        AppBar.scope.loadData();
                                                    } else if (curPageId === "reporting" &&
                                                        typeof AppBar.scope.loadData === "function") {
                                                        AppBar.scope.loadData(newRecId);
                                                    } else {
                                                        var newPageId = Application.getPageId(Application.navigator._nextPage);
                                                        if (newPageId !== "event" &&
                                                            newPageId !== "contactResultsList") {
                                                            Application.navigateById("event");
                                                        }
                                                    }
                                                    if (curPageId === "optMandatoryFieldList" &&
                                                        typeof AppBar.scope.loadData === "function") {
                                                        //AppBar.scope.setEventId(that.binding.eventId);
                                                        WinJS.Promise.as().then(function () {
                                                            Log.print(Log.l.trace, "Load Question");
                                                            return AppBar.scope.loadQuestion();
                                                        }).then(function () {
                                                            Log.print(Log.l.trace, "Binding wireup page complete");
                                                            return AppBar.scope.loadPflichtFeld();
                                                        }).then(function () {
                                                            Log.print(Log.l.trace, "Binding wireup page complete");
                                                            return AppBar.scope.loadData();
                                                        });
                                                    }
                                                    if (curPageId === "mandatory" &&
                                                        typeof AppBar.scope.loadData === "function") {
                                                        WinJS.Promise.as().then(function () {
                                                            Log.print(Log.l.trace, "Load Question");
                                                            return AppBar.scope.loadData();
                                                        })/*.then(function () {
                                                            Log.print(Log.l.trace, "Binding wireup page complete");
                                                            return AppBar.scope.validateCb();
                                                        })*/;
                                                    }
                                                    if (curPageId === "optQuestionList" &&
                                                        typeof AppBar.scope.loadData === "function") {
                                                        WinJS.Promise.as().then(function () {
                                                            Log.print(Log.l.trace, "Load Question");
                                                            return AppBar.scope.loadQuestion();
                                                        }).then(function () {
                                                            Log.print(Log.l.trace, "Binding wireup page complete");
                                                            return AppBar.scope.loadData();
                                                        });
                                                    }
                                                }, function (errorResponse) {
                                                    if (curPageId === "eventCopy" ||
                                                        curPageId === "mandatory" ||
                                                        curPageId === "optQuestionList" ||
                                                        curPageId === "questionList" ||
                                                        curPageId === "event" ||
                                                        curPageId === "contactResultsList" ||
                                                        curPageId === "reporting" ||
                                                        curPageId === "reportingColumnList" ||
                                                        curPageId === "start") {
                                                        that.selectRecordId(that.prevRecId);
                                                    }
                                                });
                                            } else {
                                                // current detail view has NO saveData() function - is list
                                                updateBindings(item.data);
                                                that.binding.eventId = newRecId;
                                                if ((curPageId === "eventCopy" ||
                                                    //curPageId === "mandatory" ||
                                                    curPageId === "optQuestionList" ||
                                                    curPageId === "questionList" ||
                                                    curPageId === "questiongroup" ||
                                                    curPageId === "skills" ||
                                                    curPageId === "contactResultsList") &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    if (typeof AppBar.scope.setEventId === "function") {
                                                        AppBar.scope.setEventId(that.binding.eventId); /*setEventId rausnehmen*/
                                                    }
                                                    AppBar.scope.loadData();
                                                } else if ((curPageId === "event" || curPageId === "genDataSettings") &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    AppBar.scope.loadData();
                                                }
                                                if ((curPageId === "reporting" ||
                                                    curPageId === "reportingColumnList" ||
                                                    curPageId === "start") &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    AppBar.scope.loadData(newRecId);
                                                }
                                                if (curPageId === "mandatory" &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    WinJS.Promise.as().then(function () {
                                                        Log.print(Log.l.trace, "Load Question");
                                                        return AppBar.scope.loadData();
                                                    })/*.then(function () {
                                                        Log.print(Log.l.trace, "Binding wireup page complete");
                                                        return AppBar.scope.validateCb();
                                                    })*/;
                                                }
                                                if (curPageId === "optQuestionList" &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    WinJS.Promise.as().then(function () {
                                                        Log.print(Log.l.trace, "Load Question");
                                                        return AppBar.scope.loadQuestion();
                                                    }).then(function () {
                                                        Log.print(Log.l.trace, "Binding wireup page complete");
                                                        return AppBar.scope.loadData();
                                                    });
                                                }
                                                if (curPageId === "startPremium" && item.data.DashboardIdx !== 0 &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    Application.navigateById("start");
                                                }
                                                if (curPageId === "optMandatoryFieldList" &&
                                                    typeof AppBar.scope.loadData === "function") {
                                                    WinJS.Promise.as().then(function () {
                                                        Log.print(Log.l.trace, "Load Question");
                                                        return AppBar.scope.loadQuestion();
                                                    }).then(function () {
                                                        Log.print(Log.l.trace, "Binding wireup page complete");
                                                        return AppBar.scope.loadPflichtFeld();
                                                    }).then(function () {
                                                        Log.print(Log.l.trace, "Binding wireup page complete");
                                                        return AppBar.scope.loadData();
                                                    });
                                                }
                                                if (curPageId === "publish") {
                                                    if (prevRecId && nav.canGoBack === true) {
                                                        nav.back(1).done();
                                                    }
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
                },
                clickOrderByNameDate: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (event && event.currentTarget) {
                        var newOrderAttribute = null;
                        if (event.currentTarget.id === "btnEventSort") {
                            that.binding.sortField = "VeranstaltungName";
                            newOrderAttribute = "VeranstaltungName";
                        }
                        if (event.currentTarget.id === "btnDateSort") {
                            that.binding.sortField = "StartDatum";
                            newOrderAttribute = "StartDatum";
                        }
                        if (newOrderAttribute !== EventList._orderAttribute) {
                            // bei mehreren Button müsste hier der vorher ausgewählte auf "Default-Text gesetzt werden!
                            EventList._orderAttribute = newOrderAttribute;
                            that.binding.sortType = "D";
                            EventList._orderDesc = true;
                        } else {
                            that.binding.sortType = "A";
                            EventList._orderDesc = false;
                        }
                        var newRscText = "eventList." +
                            event.currentTarget.id.replace("Sort", EventList._orderDesc ? "Desc" : "Asc");
                        that.binding[event.currentTarget.id] = getResourceText(newRscText);
                        that.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderBy: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (event && event.currentTarget) {
                        if (event.currentTarget.id === "btnFilterNotPublished") {
                            if (EventList._restriction == null) {
                                EventList._restriction = {
                                    PublishFlag: 1
                                }
                            } else {
                                EventList._restriction = null;
                            }
                        }
                        var newRscText = EventList._restriction && EventList._restriction["PublishFlag"] ? getResourceText("eventList.btnFilterAll") : getResourceText("eventList.btnFilterNotPublished");
                        that.binding[event.currentTarget.id] = getResourceText(newRscText);
                        that.loadData();
                    }
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
            if (searchField) {
                this.addRemovableEventListener(searchField, "input", this.eventHandlers.changeSearchField.bind(this));
            }
            if (btnFilterNotPublished) {
                this.addRemovableEventListener(btnFilterNotPublished, "click", this.eventHandlers.clickOrderBy.bind(this));
            }
            if (dashboardCombo) {
                this.addRemovableEventListener(dashboardCombo, "change", this.eventHandlers.selectionDropDownChanged.bind(this));
            }
            if (btnEventSort) {
                this.addRemovableEventListener(btnEventSort, "click", this.eventHandlers.clickOrderByNameDate.bind(this));
            }
            if (btnDateSort) {
                this.addRemovableEventListener(btnDateSort, "click", this.eventHandlers.clickOrderByNameDate.bind(this));
            }

            var hideMaster = function () {
                var ret = null;
                Log.call(Log.l.trace, "EventList.Controller.");
                if (Application.navigator._nextPage) {
                    ret = WinJS.Promise.timeout(10).then(function () {
                        return that.hideMaster();
                    });
                } else {
                    ret = WinJS.Promise.timeout(10).then(function () {
                        Application.navigator._masterMaximized = true;
                        Application.showDetail();
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.hideMaster = hideMaster;

            var loadData = function (recordId) {
                Log.call(Log.l.trace, "EventList.Controller.", "recordId=" + recordId);
                that.binding.count = 0;
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
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    AppData.setErrorMsg(that.binding);
                    AppData.setErrorMsg(that.binding);
                    return AppData.call("PRC_GetPortalEvents", {
                        pVeranstaltungID: recordId || 0,
                        pSearchString: that.binding.searchString,
                        pMinDate: that.binding.minDate,
                        pMaxDate: that.binding.maxDate,
                        pSortField: that.binding.sortField,
                        pSortType: that.binding.sortType,
                        pDachboardType: that.binding.dashboardIdx
                    }, function (json) {
                        Log.print(Log.l.info, "call PRC_GetPortalEvents success! ");
                        if (!recordId) {
                            if (json && json.d && json.d.results && json.d.results.length > 0) {
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
                                if (AppData.getRecordId("VeranstaltungEdit")) {
                                    recordId = AppData.getRecordId("VeranstaltungEdit");
                                } else {
                                    recordId = AppData.getRecordId("Veranstaltung2");
                                }
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
                                //reset it after selection
                                AppData.setRecordId("VeranstaltungEdit", null);
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

                        } else {
                            if (json && json.d && json.d.results && json.d.results[0] && that.records) {
                                that.binding.count = that.records.length;
                                var scope = that.scopeFromRecordId(recordId);
                                if (scope) {
                                    var prevNotifyModified = AppBar.notifyModified;
                                    AppBar.notifyModified = false;
                                    var item = json.d.results[0];
                                    that.resultConverter(item, scope.index);
                                    that.records.setAt(scope.index, item);
                                    AppBar.notifyModified = prevNotifyModified;
                                    if (that.binding.eventId === recordId) {
                                        updateBindings(item);
                                    }
                                }
                            }
                        }

                        Log.ret(Log.l.trace);
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "call PRC_GetPortalEvents error");
                        if (typeof error === "function") {
                            error(errorResponse);
                        }
                    });
                }).then(function () {
                    var curPageId = Application.getPageId(nav.location);
                    that.hideBtnFilterNotPublished(curPageId);
                    var splitViewContent = Application.navigator && Application.navigator.splitViewContent;
                    // Problem wenn gefiltert wird und dabei count = 1 ist von Result
                    if (that.binding.count === 1 && !that.binding.searchString && !that.binding.isGlobSiteCustAdmin) {
                        if (splitViewContent && !Application.navigator._hideDetailRestored) {
                            Application.navigator._hideDetailRestored = true;
                            WinJS.Utilities.addClass(splitViewContent, "hide-detail-restored");
                        }
                        return that.hideMaster();
                    } else {
                        if (splitViewContent && Application.navigator._hideDetailRestored) {
                            Application.navigator._hideDetailRestored = false;
                            WinJS.Utilities.removeClass(splitViewContent, "hide-detail-restored");
                        }
                        return WinJS.Promise.timeout(30);
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            // initially set selection to own eventId!
            AppData.setRecordId("Veranstaltung2", AppData.getRecordId("Veranstaltung"));

            that.processAll().then(function () {
                if (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 1) {
                    NavigationBar.changeNavigationBarLabel("startPremium", getResourceText("label.startPremium")); //getResourceText()
                } else if (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 2) {
                    NavigationBar.changeNavigationBarLabel("startPremium", getResourceText("label.startSurpreme")); //
                } else if (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 3) {
                    NavigationBar.changeNavigationBarLabel("startPremium", getResourceText("label.dashboardFNPremium")); //getResourceText()
                } else if (parseInt(AppData._persistentStates.showdashboardMesagoCombo) === 4) {
                    NavigationBar.changeNavigationBarLabel("startPremium", getResourceText("label.dashboardFNSupreme")); //getResourceText()
                } else {
                    Log.print(Log.l.trace, "Unknown value of IsSupreme Flag");
                }
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                return that.creatingDashboardComboCategory();
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
