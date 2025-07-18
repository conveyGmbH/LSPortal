// controller for page: mailingList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/mailingListLS/mailingListLSService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var namespaceName = "MailingListLS";

    WinJS.Namespace.define("MailingListLS", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "MailingList.Controller.");
            var listView = pageElement.querySelector("#mailingListLS.listview");
            this.listView = listView;
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                mailingId: 0,
                selIdx: 0,
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic,
                eventId: 0
            }, commandList, true]);
            this.nextUrl = null;
            this.loading = false;
            this.maildocuments = null;

            var that = this;

            var eventsDropdown = pageElement.querySelector("#events");

            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.maildocuments) {
                    that.maildocuments = null;
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

            var setEventId = function (value) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "eventId=" + value);
                MailingListLS._eventId = value;
                that.binding.eventId = value;
                Log.ret(Log.l.trace);
            }
            this.setEventId = setEventId;

            var loadNextUrl = function () {
                Log.call(Log.l.trace, "MailingList.Controller.");
                if (that.maildocuments && that.nextUrl && listView) {
                    that.loading = true;
                    if (progress && progress.style) {
                        progress.style.display = "inline";
                    }
                    AppData.setErrorMsg(that.binding);
                    Log.print(Log.l.trace, "calling select MailingList.MaildokumentView...");
                    var nextUrl = that.nextUrl;
                    that.nextUrl = null;
                    MailingListLS.MaildokumentView.selectNext(function (json) { //json is undefined
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "MailingList.MaildokumentView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results && that.maildocuments) {
                            that.nextUrl = MailingListLS.MaildokumentView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, that.binding.count);
                                that.binding.count = that.maildocuments.push(item);
                            });
                        }
                        that.loading = false;
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        //Log.print(Log.l.error, "ContactList.contactView: error!");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.loading = false;
                    },
                        null,
                        nextUrl);
                } else {
                    that.loading = false;
                }
                Log.ret(Log.l.trace);
            }
            this.loadNextUrl = loadNextUrl;

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "MailingList.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    for (var i = 0; i < that.maildocuments.length; i++) {
                        var maildocument = that.maildocuments.getAt(i);
                        if (maildocument && typeof maildocument === "object" &&
                            maildocument.MaildokumentVIEWID === recordId) {
                            listView.winControl.selection.set(i);
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
                if (that.maildocuments && recordId) {
                    var i, item = null;
                    for (i = 0; i < that.maildocuments.length; i++) {
                        var record = that.maildocuments.getAt(i);
                        if (record && typeof record === "object" &&
                            record.MaildokumentVIEWID === recordId) {
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
                if (item.Beschreibung && item.Subject) {
                    item.nameInitial = item.Beschreibung.substr(0, 1) + item.Subject.substr(0, 1);
                }
                item.mandatoryWarning = (!item.Beschreibung || !item.Sender || !item.Subject || !item.Mailtext) ? true : false;
            }
            this.resultConverter = resultConverter;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "MailingList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                changeEventId: function (parameters) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (event && event.currentTarget) {
                        var value = 0;
                        if (typeof event.currentTarget.value === "string") {
                            value = parseInt(event.currentTarget.value);
                        }
                        that.setEventId(value);
                        AppData.setRecordId("Maildokument", 0);
                        that.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "MailingList.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    that.binding.selIdx = item.index;
                                    if (item.data &&
                                        item.data.MaildokumentVIEWID &&
                                        item.data.MaildokumentVIEWID !== that.binding.mailingId) {
                                        // called asynchronously if ok
                                        if (AppBar.scope._element &&
                                            AppBar.scope._element.id === "mailingController") {
                                            if (typeof AppBar.scope.saveData === "function") {
                                                AppBar.scope.saveData(function (response) {
                                                    // called asynchronously if ok
                                                    that.binding.mailingId = item.data.MaildokumentVIEWID;
                                                    AppData.setRecordId("Maildokument", that.binding.mailingId);
                                                    if (typeof AppBar.scope.loadData === "function") {
                                                        // set flag called
                                                        AppBar.scope.loadData();
                                                    }
                                                }, function (errorResponse) {
                                                    that.selectRecordId(that.binding.mailingId);
                                                });
                                            }
                                        }
                                        if (AppBar.scope._element &&
                                            AppBar.scope._element.id === "mailingOptionsController") {
                                            AppBar.scope.setEventId(that.binding.eventId);
                                            AppBar.scope.setMailId(that.binding.mailingId);
                                            if (typeof AppBar.scope.loadData === "function") {
                                                // set flag called
                                                AppBar.scope.loadData();
                                            }
                                        }
                                    } else {
                                        if (typeof AppBar.scope.loadData === "function") {
                                            AppBar.scope.loadData();
                                        }
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "MailingList.Controller.");
                    Application.showDetail();
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "MailingList.Controller.");
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
                                layout = Application.MailingListLayout.MailingListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "itemsLoaded") {
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor);
                            Colors.loadSVGImageElements(listView, "warning-image", 40, Colors.offColor); //Colors.isDarkTheme ? "#8b4513" : "lightyellow"
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
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "MailingList.Controller.");
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
                    Log.call(Log.l.trace, "MailingList.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;
                        if (visible && that.maildocuments && that.nextUrl) {
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
            if (eventsDropdown) {
                this.addRemovableEventListener(eventsDropdown, "change", this.eventHandlers.changeEventId.bind(this));
            }


            var loadData = function (recordId) {
                Log.call(Log.l.trace, "MailingList.Controller.");
                that.loading = true;
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!that.events) {
                        return MailingListLS.eventView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "eventView: success!");
                            // eventView returns object already parsed from json file in response
                            if (json && json.d && json.d.results.length > 0) {
                                var results = json.d.results;
                                that.events = new WinJS.Binding.List(results);
                                if (eventsDropdown && eventsDropdown.winControl) {
                                    eventsDropdown.winControl.data = that.events;
                                    if (that.binding.eventId) {
                                        for (var i = 0; i < results.length; i++) {
                                            if (that.binding.eventId === results[i].VeranstaltungVIEWID) {
                                                eventsDropdown.selectedIndex = i;
                                            }
                                        }
                                    } else {
                                        eventsDropdown.selectedIndex = 0;
                                    }
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    return MailingListLS.MaildokumentView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "MailingList: success!");
                        // employeeView returns object already parsed from json file in response
                        if (!recordId) {
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            that.nextUrl = MailingListLS.MaildokumentView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            that.binding.count = results.length;

                            that.maildocuments = new WinJS.Binding.List(results);

                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.maildocuments.dataSource;
                            }
                            Log.print(Log.l.trace, "Data loaded");
                            var recordID = AppData.getRecordId("Maildokument");
                            if (recordID) {
                                WinJS.Promise.timeout(0).then(function () {
                                    that.selectRecordId(recordID);
                                });
                            } else {
                                if (results[0] && results[0].MaildokumentVIEWID) {
                                    recordID = results[0].MaildokumentVIEWID;
                                    AppData.setRecordId("Maildokument", recordID);
                                    WinJS.Promise.timeout(0).then(function () {
                                        that.selectRecordId(recordID);
                                    });
                                }
                            }
                        } else {
                            that.binding.count = 0;
                            that.nextUrl = null;
                            that.maildocuments = null;
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = null;
                            }
                            that.loading = false;
                        }
                        } else {
                            if (json && json.d && that.maildocuments) {
                                that.binding.count = that.maildocuments.length;
                                var scope = that.scopeFromRecordId(recordId);
                                if (scope) {
                                    var prevNotifyModified = AppBar.notifyModified;
                                    AppBar.notifyModified = false;
                                    var item = json.d;
                                    that.resultConverter(item, scope.index);
                                    that.maildocuments.setAt(scope.index, item);
                                    AppBar.notifyModified = prevNotifyModified;
                                }
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.loading = false;
                    }, recordId || {SpecType: ["NULL", 1]}
                    );
                }).then(function () {
                    if (that.binding.count === 0) {
                        if (typeof AppBar.scope.insertMailing === "function") {
                            AppBar.scope.insertMailing();
                        }
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.setEventId(AppData.getRecordId("Veranstaltung"));
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
