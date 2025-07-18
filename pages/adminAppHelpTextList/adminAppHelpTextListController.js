// controller for page: clientManagementList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/adminAppHelpTextList/adminAppHelpTextListService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var namespaceName = "AdminAppHelpTextList";

    WinJS.Namespace.define("AdminAppHelpTextList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                recordId: 0,
                languageId: 0
            }, commandList, true]);
            this.nextUrl = null;
            this.loading = false;
            this.pages = null;

            var that = this;

            // ListView control
            var listView = pageElement.querySelector("#adminAppHelpTextList.listview");
            var initSprache = pageElement.querySelector("#InitSprache");
            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.pages) {
                    that.pages = null;
                }
            }

            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var setSelIndex = function (index) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "index=" + index);
                if (that.pages && that.pages.length > 0) {
                    if (index >= that.pages.length) {
                        index = that.pages.length - 1;
                    }
                    that.binding.selIdx = index;
                    listView.winControl.selection.set(index);
                }
                Log.ret(Log.l.trace);
            }
            this.setSelIndex = setSelIndex;
            
            var loadNextUrl = function (recordId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                if (that.pages && that.nextUrl && listView) {
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
                    AdminAppHelpTextList.appHelpTextView.selectNext(function (json) { //json is undefined
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "select fairMandantView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && that.pages) {
                            that.nextUrl = AdminAppHelpTextList.appHelpTextView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, that.binding.count);
                                that.binding.count = that.pages.push(item);
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
                    if (recordId && listView && listView.winControl && that.pages) {
                        for (var i = 0; i < that.pages.length; i++) {
                            var pages = that.pages.getAt(i);
                            if (pages && typeof pages === "object" &&
                                pages.LangAppHelpTextVIEWID === recordId) {
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
                var pages;
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                var recordIdNotFound = true;
                if (recordId && listView && listView.winControl && listView.winControl.selection && that.pages) {
                    for (var i = 0; i < that.pages.length; i++) {
                        pages = that.pages.getAt(i);
                        if (pages &&
                            typeof pages === "object" &&
                            pages.LangAppHelpTextVIEWID === recordId) {
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
                for (i = 0; i < that.pages.length; i++) {
                    var pages = that.pages.getAt(i);
                    if (pages && typeof pages === "object" &&
                        pages.LangAppHelpTextVIEWID === recordId) {
                        item = pages;
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
                item.nameInitial = item.Title ? item.Title.substr(0, 2) : "";
                item.nameInitialBkgColor = Colors.getColorFromNameInitial(item.nameInitial);
                if (typeof item.CS1504SerienNr === "string") {
                    item.CS1504SerienNr = that.cutSerialnumber(item.CS1504SerienNr);
                }
                item.VersionText =
                    item.Version ? "V. " + item.Version : getResourceText("adminAppHelpTextList.inactive");
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
                                    if (item.data &&
                                        item.data.LangAppHelpTextVIEWID !== that.binding.recordId) {
                                        that.binding.selIdx = item.index;
                                        that.binding.recordId = item.data.LangAppHelpTextVIEWID;
                                        if (Application.navigator._lastPage === nav.location) {
                                            // called asynchronously if ok
                                            if (AppBar.scope && typeof AppBar.scope.saveData === "function") {
                                                AppBar.scope.saveData(function (response) {
                                                    if (typeof AppBar.scope.loadData === "function") {
                                                        AppBar.scope.loadData();
                                                    }
                                                });
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onSelectionChangedInitSprache: function(event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (event && event.target) {
                        var value = event.target.value;
                        that.binding.languageId = (typeof value === "string" ? parseInt(value) : value);
                        that.loadData();
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
                                layout = Application.AdminAppHelpTextListLayout.AdminAppHelpTextListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "itemsLoaded") {
                            if (that.pages && that.pages.length > 0) {
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
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor, "name");
                            Colors.loadSVGImageElements(listView, "warning-image", 40, Colors.offColor);
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
                            /*var i;
                            if (that.pages) {
                                for (i = 0; i < that.pages.length; i++) {
                                    var employee = that.pages.getAt(i);
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
                        if (visible && that.pages && that.nextUrl) {
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
                            Log.print(Log.l.trace, "calling select appHelpTextView...");
                            AdminAppHelpTextList.appHelpTextView.selectNext(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "select fairMandantView: success!");
                                // employeeView returns object already parsed from json file in response
                                if (json && json.d && json.d.results.length > 0) {
                                    that.nextUrl = AdminAppHelpTextList.appHelpTextView.getNextUrl(json);
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                        that.binding.count = that.pages.push(item);
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
            if (initSprache) {
                this.addRemovableEventListener(initSprache, "change", this.eventHandlers.onSelectionChangedInitSprache.bind(this));
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
                    if (!AdminAppHelpTextList.initSpracheView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initSpracheView...");
                        //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                        return AdminAppHelpTextList.initSpracheView.select(function (json) {
                            Log.print(Log.l.trace, "initSpracheView: success!");
                            if (json && json.d) {
                                var results = json.d.results;
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initSprache && initSprache.winControl) {
                                    initSprache.winControl.data = new WinJS.Binding.List(results);
                                    if (!that.binding.languageId) {
                                        that.binding.languageId = AppData.getLanguageId();
                                    }
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initSprache && initSprache.winControl &&
                            (!initSprache.winControl.data || !initSprache.winControl.data.length)) {
                            initSprache.winControl.data = new WinJS.Binding.List(AdminAppHelpTextList.initSpracheView.getResults());
                            if (!that.binding.languageId) {
                                that.binding.languageId = AppData.getLanguageId();
                            }
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    return AdminAppHelpTextList.appHelpTextView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "select fairMandantView: success!");
                        // employeeView returns object already parsed from json file in response
                        if (!recordId) {
                            if (json && json.d && json.d.results.length > 0) {
                                that.binding.count = json.d.results.length;
                                that.nextUrl = AdminAppHelpTextList.appHelpTextView.getNextUrl(json);
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                that.pages = new WinJS.Binding.List(results);

                                if (listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = that.pages.dataSource;
                                }
                                that.selectRecordId(json.d.results[0].LangAppHelpTextVIEWID);
                            } else {
                                that.binding.count = 0;
                                that.nextUrl = null;
                                that.pages = null;
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
                            if (json && json.d && that.pages) {
                                var scope = that.scopeFromRecordId(recordId);
                                if (scope) {
                                    var prevNotifyModified = AppBar.notifyModified;
                                    AppBar.notifyModified = false;
                                    var item = json.d;
                                    that.resultConverter(item, scope.index);
                                    that.pages.setAt(scope.index, item);
                                    AppBar.notifyModified = prevNotifyModified;
                                }
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
                        }, { LanguageSpecID: parseInt(that.binding.languageId) }, recordId);
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
