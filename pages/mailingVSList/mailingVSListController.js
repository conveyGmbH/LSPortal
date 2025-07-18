// controller for page: eventsList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/mailingVSList/mailingVSListService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.min.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("MailingVSList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList, isMaster) {
            Log.call(Log.l.trace, "MailingVSList.Controller.");
            Application.Controller.apply(this, [pageElement, {
                eventId: 0,
                count: 0,
                active: null
            }, commandList, isMaster]);
            this.nextUrl = null;
            this.records = null;

            var that = this;

            // ListView control
            var listView = pageElement.querySelector("#mailingvslist.listview");
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
                Log.call(Log.l.trace, "MailingVSList.Controller.");
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
                    Log.print(Log.l.trace, "calling select MailingVSList.VeranstaltungView...");
                    var nextUrl = that.nextUrl;
                    that.nextUrl = null;
                    MailingVSList.VeranstaltungView.selectNext(function (json) { //json is undefined
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "MailingVSList.VeranstaltungView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results && that.records) {
                            that.nextUrl = MailingVSList.VeranstaltungView.getNextUrl(json);
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
                Log.call(Log.l.trace, "MailingVSList.Controller.", "recordId=" + recordId);
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
                item.currentDate = getDateObject(item.Startdatum);
                var curMoment = moment(item.currentDate);
                if (curMoment) {
                    curMoment.locale(Application.language);
                    item.currentDateString = curMoment.format("ll");
                }
                if (item.LiveStartDatum) {
                    item.startTimestamp = getDateObject(item.LiveStartDatum);
                    curMoment = moment(item.startTimestamp);
                    item.timeRangeString = curMoment.format("HH:mm");
                    if (item.LiveEndDatum) {
                        item.endTimestamp = getDateObject(item.LiveEndDatum);
                        curMoment = moment(item.endTimestamp);
                        item.timeRangeString += " - " + curMoment.format("HH:mm");
                    }
                }
                item.nameInitial = item.Name ? item.Name.substr(0, 2) : "";
            }
            this.resultConverter = resultConverter;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "MailingVSList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "MailingVSList.Controller.");
                    Application.showDetail();
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "MailingVSList.Controller.");
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
                                layout = Application.MailingVSListLayout.MailingVSListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "itemsLoaded") {
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
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "MailingVSList.Controller.");
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
                                    Log.print(Log.l.trace,
                                        "item.data.VeranstaltungVIEWID before: " + item.data.VeranstaltungVIEWID);
                                    if (item.data && item.data.VeranstaltungVIEWID) {
                                        Log.print(Log.l.trace,
                                            "item.data.VeranstaltungVIEWID after: " + item.data.VeranstaltungVIEWID);
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

                                            if (AppBar.scope && typeof AppBar.scope.saveData === "function") {
                                                //=== "function" save wird nicht aufgerufen wenn selectionchange
                                                // current detail view has saveData() function
                                                AppBar.scope.saveData(function (response) {
                                                    // called asynchronously if ok
                                                    if ((curPageId === "mailingList") &&
                                                        typeof AppBar.scope.loadData === "function" &&
                                                        typeof AppBar.scope.setEventId === "function") {
                                                        //if (curPageId === "mailingList") {
                                                        AppBar.scope.setEventId(item.data.VeranstaltungVIEWID);
                                                        AppBar.scope.loadData();
                                                        //}
                                                    } else {
                                                        Application.navigateById("mailingList");
                                                    }
                                                }, function (errorResponse) {
                                                    if (curPageId === "mailingList") {
                                                        that.selectRecordId(AppBar.scope.getEventId());
                                                    }
                                                });
                                            } else {
                                                // current detail view has NO saveData() function - is list
                                                if ((curPageId === "mailingList") &&
                                                    typeof AppBar.scope.loadData === "function" &&
                                                    typeof AppBar.scope.setEventId === "function") {
                                                    AppBar.scope.setEventId(item.data.VeranstaltungVIEWID);
                                                    AppBar.scope.loadData();
                                                } else {
                                                    Application.navigateById("mailingList");
                                                }
                                            }
                                            AppBar.triggerDisableHandlers();
                                        }
                                    }
                                    Log.print(Log.l.trace,
                                        "item.data.VeranstaltungVIEWID end: " + item.data.VeranstaltungVIEWID);
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "MailingVSList.Controller.");
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
                    Log.call(Log.l.trace, "MailingVSList.Controller.");
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
                    Log.call(Log.l.trace, "MailingVSList.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "MailingVSList.Controller.");
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
                Log.call(Log.l.trace, "MailingVSList.Controller.");
                that.loading = true;
                progress = pageElement.querySelector(".list-footer .progress");
                counter = pageElement.querySelector(".list-footer .counter");
                if (progress && progress.style) {
                    progress.style.display = "inline";
                }
                if (counter && counter.style) {
                    counter.style.display = "none";
                }
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return MailingVSList.VeranstaltungView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "Events: success!");
                        // employeeView returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            that.nextUrl = MailingVSList.VeranstaltungView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            that.binding.count = results.length;

                            that.records = new WinJS.Binding.List(results);

                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.records.dataSource;
                            }
                            Log.print(Log.l.trace, "Data loaded");
                            var recordID;
                            if (AppBar.scope && typeof AppBar.scope.getEventId === "function") {
                                recordID = AppBar.scope.getEventId();//AppData.getRecordId("Kontakt");
                            }
                            if (recordID) {
                                WinJS.Promise.timeout(0).then(function () {
                                    that.selectRecordId(recordID);
                                });
                            } else {
                                if (results[0] && results[0].VeranstaltungVIEWID) {
                                    WinJS.Promise.timeout(0).then(function () {
                                        that.selectRecordId(results[0].VeranstaltungVIEWID);
                                    });
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
                            progress = pageElement.querySelector(".list-footer .progress");
                            counter = pageElement.querySelector(".list-footer .counter");
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
                        progress = pageElement.querySelector(".list-footer .progress");
                        counter = pageElement.querySelector(".list-footer .counter");
                        if (progress && progress.style) {
                            progress.style.display = "none";
                        }
                        if (counter && counter.style) {
                            counter.style.display = "inline";
                        }
                        that.loading = false;
                    }, {

                    });
                })/*.then(function () {
                    if (listView && listView.winControl) {
                        return listView.winControl.selection.set(0);
                    } else {
                        return WinJS.Promise.as();
                    }
                })*/;
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

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