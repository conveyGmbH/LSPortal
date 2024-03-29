// controller for page: eventResourceAdministration
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/eventResourceAdministration/eventResourceAdministrationService.js" />
/// <reference path="~/www/lib/jstz/scripts/jstz.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("EventResourceAdministration", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "EventResourceAdministration.Controller.");

            // ListView control
            var listView = pageElement.querySelector("#eventTextList.listview");

            Application.RecordsetController.apply(this, [pageElement, {
                eventLanguageItem: {
                    TITLE: "",
                    LanguageID: -1
                },
                eventSeriesItem: {
                    Titel: "",
                    MandantSerieID: -1
                },
                multipleLanguages: false,
                multipleSeries: false,
                showSeries: false
        }, commandList, false, 
                EventResourceAdministration.eventTextTable, 
                EventResourceAdministration.eventTextView, listView]);
            
            this.eventTextUsageControl = null;

            var initEventTextSprache = pageElement.querySelector("#InitEventTextSprache");
            var eventSeries = pageElement.querySelector("#eventSeries");

            var that = this;

            var layout = null;

            // get field entries
            var getFieldEntries = function (index) {
                Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
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
            var resultConverter = function(item, index) {
                Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
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
                if (item.NameTitle && (item.NameTitle).indexOf("SEO") === 0) {
                    item.isSEO = 1;
                }
                Log.ret(Log.l.trace);
            }
            this.resultConverter = resultConverter;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickForward: function (event) {
                    Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
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
                    Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                    that.insertData();
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                pressEnterKey: function (event) {
                    Log.call(Log.l.trace, "Questionnaire.Controller.");
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
                    Log.call(Log.l.trace, "Questionnaire.Controller.");
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickForward") {
                            AppBar.commandList[i].key = WinJS.Utilities.Key.enter;
                            break;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                deactivateEnterKey: function (event) {
                    Log.call(Log.l.trace, "Questionnaire.Controller.");
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickForward") {
                            AppBar.commandList[i].key = null;
                            break;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Questiongroup.Controller.");
                    that.selectionChanged().then(function() {
                        AppBar.triggerDisableHandlers();
                    });
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.EventResourceAdministrationLayout.EventTextLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        }
                    }
                    that.loadingStateChanged(eventInfo);
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Questiongroup.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible && that.nextUrl) {
                            that.loadNext();
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "Questiongroup.Controller.");
                    that.setFocusOnItemInvoked(eventInfo);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
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
                    Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var combobox = event.currentTarget;
                        EventResourceAdministration._languageId = parseInt(combobox.value);
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
                    Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var combobox = event.currentTarget;
                        EventResourceAdministration._eventSeriesId = parseInt(combobox.value);
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
                        case WinJS.Utilities.Key.upArrow:
                        case WinJS.Utilities.Key.downArrow:
                        case WinJS.Utilities.Key.space:
                            e.stopImmediatePropagation();
                            break;
                        }
                    }
                }.bind(this), true);
                this.addRemovableEventListener(listView, "contextmenu", function (e) {
                    var targetTagName = e.target &&
                        e.target.tagName &&
                        e.target.tagName.toLowerCase();
                    if (targetTagName === "textarea" || targetTagName === "input") {
                        e.stopImmediatePropagation();
                    }
                }.bind(this), true);
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
            }

            var setLanguageComboResults = function(results) {
                var i;
                Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                that.binding.multipleLanguages = (results && results.length > 1);
                if (initEventTextSprache && initEventTextSprache.winControl) {
                    initEventTextSprache.winControl.data = new WinJS.Binding.List(results ? results : []);
                    if (results && results.length > 0) {
                        for (i=0;i<results.length;i++) {
                            if (results[i] && results[i].LanguageID === EventResourceAdministration._languageId) {
                                break;
                            }
                        }
                        if (i === results.length) {
                            EventResourceAdministration._languageId = results[0].LanguageID;
                            i = 0;
                        }
                        initEventTextSprache.selectedIndex = i;
                        that.binding.eventLanguageItem = results[i];
                    }
                }
                Log.ret(Log.l.trace);
            }
            var loadInitLanguageData = function () {
                Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    var results = EventResourceAdministration.initSpracheView.getResults();
                    if (results || !results.length) {
                        Log.print(Log.l.trace, "calling select initSpracheView...");
                        //load the list of INITSprache for Combobox
                        return EventResourceAdministration.initSpracheView.select(function (json) {
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

            var setSeriesComboResults = function(results) {
                var i;
                Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                that.binding.multipleSeries = (results && results.length > 1);
                if (eventSeries && eventSeries.winControl) {
                    eventSeries.winControl.data = new WinJS.Binding.List(results ? results : []);
                    if (results && results.length > 0) {
                        for (i=0;i<results.length;i++) {
                            if (results[i] && results[i].MandantSerieID === EventResourceAdministration._eventSeriesId) {
                                break;
                            }
                        }
                        if (i === results.length) {
                            EventResourceAdministration._eventSeriesId = results[0].MandantSerieID;
                            i = 0;
                        }
                        eventSeries.selectedIndex = i;
                        that.binding.eventSeriesItem = results[i];
                    }
                }
                Log.ret(Log.l.trace);
            }
            var loadSeriesData = function () {
                Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select eventSeriesView...");
                    //load the list of eventSeries for Combobox
                    return EventResourceAdministration.eventSeriesView.select(function (json) {
                        Log.print(Log.l.trace, "eventSeriesView: success!");
                        if (json && json.d) {
                            // Now, we call WinJS.Binding.List to get the bindable list
                            setSeriesComboResults(json.d.results);
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            that.loadSeriesData = loadSeriesData;

            var getEventTextUsageId = function() {
                return EventResourceAdministration._eventTextUsageId;
            }
            that.getEventTextUsageId = getEventTextUsageId;
            
            var setEventTextUsageId = function(value) {
                Log.print(Log.l.trace, "eventTextUsageId=" + value);
                EventResourceAdministration._eventTextUsageId = value;
                var prevShowSeries = that.binding.showSeries;
                that.binding.showSeries = (value === 2 || value === 1);
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
                if (prevShowSeries !== that.binding.showSeries) {
                    WinJS.Promise.timeout(50).then(function() {
                        var pageControl = pageElement.winControl;
                        if (pageControl && pageControl.updateLayout) {
                            pageControl.prevWidth = 0;
                            pageControl.prevHeight = 0;
                            pageControl.updateLayout.call(pageControl, pageElement);
                        }
                    });
                }
            }
            that.setEventTextUsageId = setEventTextUsageId;

            var getEventId = function() {
                return EventResourceAdministration._eventId;
            }
            that.getEventId = getEventId;

            var setEventId = function(value) {
                Log.print(Log.l.trace, "eventId=" + value);
                EventResourceAdministration._eventId = value;
                var ret = WinJS.Promise.timeout(0).then(function() {
                    return that.loadSeriesData();
                }).then(function () {
                    Log.print(Log.l.trace, "eventTextUsage complete");
                    return that.loadData();
                });
                return ret;
            }
            that.setEventId = setEventId;

            var master = Application.navigator.masterControl;
            if (master && master.controller && master.controller.binding) {
                that.setEventId(master.controller.binding.eventId);
            }

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadInitLanguageData();
            }).then(function () {
                Log.print(Log.l.trace, "loadInitLanguageData complete");
                return that.loadSeriesData();
            }).then(function () {
                Log.print(Log.l.trace, "loadSeriesData complete");
                var eventTextUsageHost = pageElement.querySelector("#eventTextUsageHostResource.fragmenthost");
                if (eventTextUsageHost) {
                    return Application.loadFragmentById(eventTextUsageHost, "eventTextUsage", {});
                } else {
                    return WinJS.Promise.as();
                }
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



