// controller for page: GenDataModList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/genDataModList/genDataModListService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("GenDataModList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList, isMaster) {
            Log.call(Log.l.trace, "GenDataModList.Controller.");

            // ListView control
            var listView = pageElement.querySelector("#genDataModList.listview");

            Application.RecordsetController.apply(this, [pageElement, {
                count: 0
            }, commandList, isMaster,
                GenDataModList.personAdresseTable,
                GenDataModList.personAdresseView, listView]);

            this.nextUrl = null;
            this.nextDocUrl = null;
            this.loading = false;

            this.firstmodDataIndex = 0;

            var that = this;

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                listView = null;
            }

            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var background = function (index) {
                if (index % 2 === 0) {
                    return 1;
                } else {
                    return null;
                }
            };
            this.background = background;

            var deleteMod = function (recordId) {
                Log.call(Log.l.trace, "EventsList.Controller.", "recordId=" + recordId);
                AppData.setErrorMsg(that.binding);
                if (recordId) {
                    AppBar.busy = true;
                    GenDataModList.personAdresseTable.deleteRecord(function (response) {
                        AppBar.busy = false;
                        that.loadData();
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, recordId);
                }
                Log.ret(Log.l.trace);
            }
            this.deleteMod = deleteMod;

            var getRestriction = function () {
                var restriction = AppData.getRestriction("Kontakt");
                if (!restriction) {
                    restriction = {};
                }
                return restriction;
            }
            this.getRestriction = getRestriction;

            var resultConverter = function (item, index) {
                item.index = index;

            }
            this.resultConverter = resultConverter;

            var setPersonId = function () {
                Log.call(Log.l.trace, "GenDataModList.Controller.");
                if (listView && listView.winControl) {
                    var listControl = listView.winControl;
                    if (listControl.selection) {
                        listControl.selection.getItems().done(function (items) {
                            var item = items[0];
                            var curPageId = Application.getPageId(nav.location);
                            if (AppBar.scope && typeof AppBar.scope.saveData === "function") {
                                if ((curPageId === "genDataModHisto") &&
                                    typeof AppBar.scope.loadData === "function" &&
                                    typeof AppBar.scope.setPersonId === "function") {
                                    AppBar.scope.setPersonId(item.data.PersonID);
                                }
                            }
                        });
                    }
                }
            }
            this.setPersonId = setPersonId;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "GenDataModList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "GenDataModList.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    var curPageId = Application.getPageId(nav.location);
                                    if (item.data &&
                                        item.data.PersonAdresseVIEWID &&
                                        item.data.PersonAdresseVIEWID !== that.binding.contactId) {
                                        if (AppBar.scope && typeof AppBar.scope.saveData === "function") {
                                            //=== "function" save wird nicht aufgerufen wenn selectionchange
                                            // current detail view has saveData() function
                                            if ((curPageId === "genDataModDetails") &&
                                                typeof AppBar.scope.loadData === "function" &&
                                                typeof AppBar.scope.setAdresseId === "function") {
                                                AppBar.scope.saveData(function (response) {
                                                    AppBar.scope.setAdresseId(item.data.AdresseID);
                                                    AppBar.scope.setPersonAdresseId(item.data.PersonAdresseVIEWID);
                                                    AppBar.scope.loadData();
                                                },
                                                function (errorResponse) {
                                                    that.selectRecordId(item.data.PersonAdresseVIEWID);
                                                });
                                            }
                                            if ((curPageId === "genDataModHisto") &&
                                                typeof AppBar.scope.loadData === "function" &&
                                                typeof AppBar.scope.setPersonId === "function") {
                                                AppBar.scope.setPersonId(item.data.PersonID);
                                                AppBar.scope.setVaId(null);
                                                AppBar.scope.loadData();
                                            }
                                        } else {
                                            // current detail view has NO saveData() function - is list
                                            if (curPageId === "genDataModDetails" &&
                                                typeof AppBar.scope.loadData === "function") {
                                                AppBar.scope.loadData();
                                            } else {
                                                Application.navigateById("genDataModDetails");
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "GenDataModList.Controller.");
                    Application.showDetail();
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "GenDataModList.Controller.");
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
                                layout = Application.GenDataModListLayout.GenDataModListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "itemsLoaded") {


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
                    Log.call(Log.l.trace, "GenDataModList.Controller.");
                    if (eventInfo && eventInfo.detail && listView) {
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
                    Log.call(Log.l.trace, "EventSeriesAdministration.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;
                        if (visible && that.nextUrl) {
                            that.loading = true;
                            if (progress && progress.style) {
                                progress.style.display = "inline";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "none";
                            }
                            that.loadNext(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "EventSeriesAdministration.CR_V_FragengruppeView: success!");
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                            });
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

            this.disableHandlers = {
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
            }

            Log.print(Log.l.trace, "calling select GenDataModList.personAdresseView...");

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                that.loading = true;
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Record selected");
            });
            Log.ret(Log.l.trace);
        })
    });
})();




