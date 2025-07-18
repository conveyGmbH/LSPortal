// controller for page: clientManagementList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/clientManagementList/clientManagementListService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var namespaceName = "ClientManagementList";

    WinJS.Namespace.define("ClientManagementList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                clientId: 0 //AppData.getRecordId("Mitarbeiter")
            }, commandList, true]);
            this.nextUrl = null;
            this.loading = false;
            this.clients = null;

            var that = this;

            // ListView control
            var listView = pageElement.querySelector("#clientManagementList.listview");
            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.clients) {
                    that.clients = null;
                }
            }

            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var setSelIndex = function (index) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "index=" + index);
                if (that.clients && that.clients.length > 0) {
                    if (index >= that.clients.length) {
                        index = that.clients.length - 1;
                    }
                    that.binding.selIdx = index;
                    listView.winControl.selection.set(index);
                }
                Log.ret(Log.l.trace);
            }
            this.setSelIndex = setSelIndex;

            var loadNextUrl = function (recordId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                if (that.clients && that.nextUrl && listView) {
                    progress = listView.querySelector(".list-footer .progress");
                    counter = listView.querySelector(".list-footer .counter");
                    that.loading = true;
                    if (progress && progress.style) {
                        progress.style.display = "inline";
                    }
                    if (counter && counter.style) {
                        counter.style.display = "none";
                    }
                    AppData.setErrorMsg(that.binding);
                    Log.print(Log.l.trace, "calling select fairMandantView...");
                    var nextUrl = that.nextUrl;
                    that.nextUrl = null;
                    ClientManagementList.fairMandantView.selectNext(function (json) { //json is undefined
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "select fairMandantView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && that.clients) {
                            that.nextUrl = ClientManagementList.fairMandantView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, that.binding.count);
                                that.binding.count = that.clients.push(item);
                            });
                        }
                        if (recordId) {
                            that.selectRecordId(recordId);
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        Log.print(Log.l.error, "select fairMandantView: error!");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (progress && progress.style) {
                            progress.style.display = "none";
                        }
                        if (counter && counter.style) {
                            counter.style.display = "inline";
                        }
                        that.loading = false;
                    }, null, nextUrl);
                }
                Log.ret(Log.l.trace);
            }
            this.loadNextUrl = loadNextUrl;

            var scrollToRecordId = function (recordId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                if (that.loading) {
                    WinJS.Promise.timeout(50).then(function () {
                        that.scrollToRecordId(recordId);
                    });
                } else {
                    if (recordId && listView && listView.winControl && that.clients) {
                        for (var i = 0; i < that.clients.length; i++) {
                            var clients = that.clients.getAt(i);
                            if (clients && typeof clients === "object" &&
                                clients.FairMandantVIEWID === recordId) {
                                listView.winControl.indexOfFirstVisible = i - 1;
                                break;
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.scrollToRecordId = scrollToRecordId;

            var selectRecordId = function (recordId) {
                var clients;
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                var recordIdNotFound = true;
                if (recordId && listView && listView.winControl && listView.winControl.selection && that.clients) {
                    for (var i = 0; i < that.clients.length; i++) {
                        clients = that.clients.getAt(i);
                        if (clients &&
                            typeof clients === "object" &&
                            clients.FairMandantVIEWID === recordId) {
                            listView.winControl.selection.set(i).done(function () {
                                WinJS.Promise.timeout(50).then(function () {
                                    that.scrollToRecordId(recordId);
                                });
                            });
                            recordIdNotFound = false;
                            setSelIndex(i);
                            listView.winControl.selection.set(i);
                            break;
                        }
                    }
                    if (recordIdNotFound) {
                        that.loadNextUrl(recordId);
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            var scopeFromRecordId = function (recordId) {
                var i;
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                var item = null;
                for (i = 0; i < that.clients.length; i++) {
                    var clients = that.clients.getAt(i);
                    if (clients && typeof clients === "object" &&
                        clients.FairMandantVIEWID === recordId) {
                        item = clients;
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

            var resultConverter = function (item, index) {
                item.index = index;
                item.recordIcon = Binding.Converter.getIconFromID(item.IconID, "ClientManagementList");
                if (!item.recordIcon) {
                    item.recordIcon = "user";
                }
                item.nameInitial = item.Name ? item.Name.substr(0, 2) : "";
                item.nameInitialBkgColor = Colors.getColorFromNameInitial(item.nameInitial);
            }
            this.resultConverter = resultConverter;

            // define handlers
            this.eventHandlers = {
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function(items) {
                                    var item = items[0];
                                    var curPageId = Application.getPageId(nav.location);
                                    that.binding.selIdx = item.index;
                                    if (item.data &&
                                        item.data.FairMandantVIEWID &&
                                        item.data.FairMandantVIEWID !== that.binding.clientId) {
                                        // called asynchronously if ok
                                        that.binding.clientId = item.data.FairMandantVIEWID;
                                        if (AppBar.scope && typeof AppBar.scope.saveData === "function") {
                                            AppBar.scope.saveData(function(response) {
                                                Log.print(Log.l.trace, "update mandant");
                                                if (curPageId === "clientManagement") {
                                                    AppBar.scope.binding.saveFlag = true;
                                                    if (typeof AppBar.scope.loadData === "function") {
                                                        AppData.setRecordId("FairMandant",
                                                            that.binding.clientId);
                                                        AppBar.scope.loadData(that.binding.clientId);
                                                    } else {
                                                        Application.navigateById("clientManagement");
                                                    }
                                                }
                                                if (response && response.FairMandantVIEWID) {
                                                    that.loadData(response.FairMandantVIEWID).then(function() {
                                                        master.controller.selectRecordId(response.FairMandantVIEWID);
                                                    });
                                                }
                                            });
                                        } else {
                                            if (curPageId === "clientManagementLicenses") {
                                                AppBar.scope.binding.saveFlag = true;
                                                if (typeof AppBar.scope.loadData === "function") {
                                                    AppBar.scope.loadData(that.binding.clientId);
                                                } else {
                                                    Application.navigateById("clientManagementLicenses");
                                                }
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
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.showDetail();
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    var i;
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                                layout = Application.ClientManagementListLayout.ClientManagementListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "itemsLoaded") {
                            if (that.clients && that.clients.length > 0) {
                                var indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                                var indexOfLastVisible = listView.winControl.indexOfLastVisible;
                                for (i = indexOfFirstVisible; i <= indexOfLastVisible; i++) {
                                    var element = listView.winControl.elementFromIndex(i);
                                    if (element) {
                                        if (element.firstElementChild) {
                                            if (element.firstElementChild.disabled) {
                                                if (!WinJS.Utilities.hasClass(element, "win-nonselectable")) {
                                                    WinJS.Utilities.addClass(element, "win-nonselectable");
                                                    element.style.backgroundColor = "grey";
                                                }
                                            } else {
                                                if (WinJS.Utilities.hasClass(element, "win-nonselectable")) {
                                                    WinJS.Utilities.removeClass(element, "win-nonselectable");
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor, "name");
                            Colors.loadSVGImageElements(listView, "warning-image", 40, Colors.offColor);
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
                            /*var i;
                            if (that.clients) {
                                for (i = 0; i < that.clients.length; i++) {
                                    var employee = that.clients.getAt(i);
                                    if (employee.Gesperrt === 1) {
                                        var itemElement = listView.winControl.elementFromIndex(i);
                                        itemElement.oncontextmenu = function (e) { e.stopPropagation(); };
                                        // disable touch selection
                                        itemElement.addEventListener('MSPointerDown', function (e) {
                                            e.stopPropagation();
                                        });
                                        itemElement.addEventListener('pointerdown', function (e) {
                                            e.stopPropagation();
                                        });
                                        itemElement.style.backgroundColor = "grey";
                                    }
                                }
                            }*/
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (eventInfo && eventInfo.detail) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;
                        if (visible && that.clients && that.nextUrl) {
                            that.loading = true;
                            if (progress && progress.style) {
                                progress.style.display = "inline";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "none";
                            }
                            AppData.setErrorMsg(that.binding);
                            var nextUrl = that.nextUrl;
                            //that.nextUrl = null;
                            Log.print(Log.l.trace, "calling select fairMandantView...");
                            ClientManagementList.fairMandantView.selectNext(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "select fairMandantView: success!");
                                // employeeView returns object already parsed from json file in response
                                if (json && json.d && json.d.results.length > 0) {
                                    that.nextUrl = ClientManagementList.fairMandantView.getNextUrl(json);
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                        that.binding.count = that.clients.push(item);
                                    });
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                Log.print(Log.l.error, "select fairMandantView: error!");
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                                that.loading = false;
                            }, null, nextUrl);
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

            var loadData = function (recordId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                    return ClientManagementList.fairMandantView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "select fairMandantView: success!");
                        // employeeView returns object already parsed from json file in response
                        if (!recordId) {
                            if (json && json.d && json.d.results.length > 0) {
                                that.binding.count = json.d.results.length;
                                that.nextUrl = ClientManagementList.fairMandantView.getNextUrl(json);
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                that.clients = new WinJS.Binding.List(results);

                                if (listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = that.clients.dataSource;
                                }
                                that.selectRecordId(json.d.results[0].FairMandantVIEWID);
                            } else {
                                that.binding.count = 0;
                                that.nextUrl = null;
                                that.clients = null;
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
                            if (json && json.d) {
                                var client = json.d;
                                that.resultConverter(client);
                                var objectrec = scopeFromRecordId(recordId);
                                that.clients.setAt(objectrec.index, client);
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        Log.print(Log.l.error, "select fairMandantView: error!");
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
                    }, null, recordId);
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();
