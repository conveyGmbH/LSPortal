// controller for page: seriesResourceAdministration
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/seriesResourceAdministration/seriesResourceAdministrationService.js" />
/// <reference path="~/www/lib/jstz/scripts/jstz.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("SeriesResourceAdministration", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");

            // ListView control
            var listView = pageElement.querySelector("#eventTextList.listview");

            Application.RecordsetController.apply(this, [pageElement, {
                seriesLanguageItem: {
                    TITLE: "",
                    LanguageID: -1
                },
                multipleLanguages: false,
                /*multipleSeries: false,
                showSeries: false,*/
                count: 0
            }, commandList, false,
                SeriesResourceAdministration.eventTextTable,
                SeriesResourceAdministration.eventTextView, listView]);

            this.eventTextUsageControl = null;

            var initEventTextSprache = pageElement.querySelector("#InitEventTextSprache");
            //var eventSeries = pageElement.querySelector("#eventSeries");

            var that = this;

            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            // get field entries
            var getFieldEntries = function (index) {
                Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                var ret = {};
                if (listView && listView.winControl) {
                    var element = listView.winControl.elementFromIndex(index);
                    if (element) {
                        var fields = element.querySelectorAll('input[type="text"], textarea');
                        var prevRow = null;
                        for (var i = 0; i < fields.length; i++) {
                            var fieldEntry = fields[i].dataset && fields[i].dataset.fieldEntry;
                            if (fieldEntry) {
                                ret[fieldEntry] = fields[i].value;
                                var modifier = "Modified" + fieldEntry;
                                if (!ret[fieldEntry]) {
                                    ret[modifier] = null;
                                } else {
                                    if (!prevRow && that.records) {
                                        prevRow = that.records.getAt(index);
                                    }
                                    if (prevRow) {
                                        if (ret[fieldEntry] !== prevRow[fieldEntry]) {
                                            ret[modifier] = 1;
                                        } else {
                                            ret[modifier] = prevRow[modifier];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.getFieldEntries = getFieldEntries;

            var eventTextPlaceholder = getResourceText("eventResourceAdministration.eventTextPlaceholder");
            var resultConverter = function (item, index) {
                Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                if (!item.NameTitle) {
                    item.NameTitle = "";
                }
                if (!item.NameDescription) {
                    item.NameDescription = "";
                }
                if (!item.NameMainTitle) {
                    item.NameMainTitle = "";
                }
                if (!item.NameSubTitle) {
                    item.NameSubTitle = "";
                }
                if (!item.NameSummary) {
                    item.NameSummary = "";
                }
                if (!item.NameBody) {
                    item.NameBody = "";
                }
                item.placeholderTitle = eventTextPlaceholder + item.NameTitle;
                item.placeholderDescription = eventTextPlaceholder + item.NameDescription;
                item.placeholderMainTitle = eventTextPlaceholder + item.NameMainTitle;
                item.placeholderSubTitle = eventTextPlaceholder + item.NameSubTitle;
                item.placeholderSummary = eventTextPlaceholder + item.NameSummary;
                item.placeholderBody = eventTextPlaceholder + item.NameBody;

                item.heightSummary = item.Summary ? "196px" : "";
                item.heightBody = item.Body ? "196px" : "";
                Log.ret(Log.l.trace);
            }
            this.resultConverter = resultConverter;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickForward: function (event) {
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                    AppBar.busy = true;
                    that.saveData(function (response) {
                        AppBar.busy = false;
                        Log.print(Log.l.trace, "event text saved");
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        Log.print(Log.l.error, "error saving event text");
                    });
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                    that.insertData();
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                pressEnterKey: function (event) {
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                    if (event && event.keyCode === WinJS.Utilities.Key.enter &&
                        event.target && event.target.tagName &&
                        event.target.tagName.toLowerCase() === "textarea") {
                        if (event.stopPropagation) {
                            event.stopPropagation();
                        } else {
                            event.cancelBubble = true;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                activateEnterKey: function (event) {
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickForward") {
                            AppBar.commandList[i].key = WinJS.Utilities.Key.enter;
                            break;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                deactivateEnterKey: function (event) {
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickForward") {
                            AppBar.commandList[i].key = null;
                            break;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                    that.selectionChanged().then(function () {
                        AppBar.triggerDisableHandlers();
                    });
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
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
                                layout = Application.seriesResourceAdministrationLayout.EventTextLayout;
                                listView.winControl.layout = { type: layout };
                            }
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
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
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
                                Log.print(Log.l.trace, "Questiongroup.CR_V_FragengruppeView: success!");
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
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                    that.setFocusOnItemInvoked(eventInfo);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
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
                changedLanguage: function (event) {
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var combobox = event.currentTarget;
                        SeriesResourceAdministration._languageId = parseInt(combobox.value);
                        AppBar.busy = true;
                        that.saveData(function (response) {
                            AppBar.busy = false;
                            // erst savedata und dann loaddata
                            that.loadData();
                            Log.print(Log.l.trace, "event text saved");
                        }, function (errorResponse) {
                            AppBar.busy = false;
                            Log.print(Log.l.error, "error saving event text");
                        });
                    }
                    Log.ret(Log.l.trace);
                },
                changedSeries: function (event) {
                    Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var combobox = event.currentTarget;
                        SeriesResourceAdministration._eventSeriesId = parseInt(combobox.value);
                        that.loadData();
                    }
                    Log.ret(Log.l.trace);
                }
            }

            this.disableHandlers = {
                clickForward: function () {
                    // always enabled!
                    return false;
                },
                clickNew: function () {
                    return false;
                }
            }
            // register ListView event handler
            if (listView) {
                // prevent some keyboard actions from listview to navigate within controls!
                this.addRemovableEventListener(listView, "keydown", function (e) {
                    if (!e.ctrlKey && !e.altKey) {
                        switch (e.keyCode) {
                            case WinJS.Utilities.Key.end:
                            case WinJS.Utilities.Key.home:
                            case WinJS.Utilities.Key.leftArrow:
                            case WinJS.Utilities.Key.rightArrow:
                            case WinJS.Utilities.Key.space:
                                e.stopImmediatePropagation();
                                break;
                        }
                    }
                }.bind(this), true);
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "headervisibilitychanged", this.eventHandlers.onHeaderVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
            }

            var setLanguageComboResults = function (results) {
                var i;
                Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                that.binding.multipleLanguages = (results && results.length > 1);
                if (initEventTextSprache && initEventTextSprache.winControl) {
                    initEventTextSprache.winControl.data = new WinJS.Binding.List(results ? results : []);
                    if (results && results.length > 0) {
                        for (i = 0; i < results.length; i++) {
                            if (results[i] && results[i].LanguageID === SeriesResourceAdministration._languageId) {
                                break;
                            }
                        }
                        if (i === results.length) {
                            SeriesResourceAdministration._languageId = results[0].LanguageID;
                            i = 0;
                        }
                        initEventTextSprache.selectedIndex = i;
                        that.binding.seriesLanguageItem = results[i];
                    }
                }
                Log.ret(Log.l.trace);
            }
            var loadInitLanguageData = function () {
                Log.call(Log.l.trace, "SeriesResourceAdministration.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    var results = SeriesResourceAdministration.initSpracheView.getResults();
                    if (results || !results.length) {
                        Log.print(Log.l.trace, "calling select initSpracheView...");
                        //load the list of INITSprache for Combobox
                        return SeriesResourceAdministration.initSpracheView.select(function (json) {
                            Log.print(Log.l.trace, "initSpracheView: success!");
                            if (json && json.d) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                setLanguageComboResults(json.d.results);
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        setLanguageComboResults(results);
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            that.loadInitLanguageData = loadInitLanguageData;

            /*var getEventId = function () {
                return SeriesResourceAdministration._eventId;
            }
            that.getEventId = getEventId;

            var setSeriesId = function (value) {
                Log.print(Log.l.trace, "eventId=" + value);
                SeriesResourceAdministration._eventId = value;
            }
            that.setSeriesId = setSeriesId;
            */
            var getEventSeriesId = function () {
                return SeriesResourceAdministration._eventSeriesId;
            }
            that.getEventSeriesId = getEventSeriesId;

            var setEventSeriesId = function (value) {
                Log.print(Log.l.trace, "eventSeriesId=" + value);
                SeriesResourceAdministration._eventSeriesId = value;
                //return that.loadData();
            }
            that.setEventSeriesId = setEventSeriesId;

            var master = Application.navigator.masterControl;
            if (master && master.controller && master.controller.binding && master.controller.binding.seriesId) {
                that.setEventSeriesId(master.controller.binding.seriesId); //eventId
            }

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadInitLanguageData();
            }).then(function () {
                Log.print(Log.l.trace, "eventTextUsage complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "loadData complete");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



