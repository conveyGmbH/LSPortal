// controller for page: startResourceAdministration
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/startResourceAdministration/startResourceAdministrationService.js" />
/// <reference path="~/www/lib/jstz/scripts/jstz.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("StartResourceAdministration", {
        Controller: WinJS.Class.derive(Application.RecordsetController, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "startResourceAdministration.Controller.");

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
                StartResourceAdministration.eventTextTable,
                StartResourceAdministration.eventTextView, listView]);

            this.eventTextUsageControl = null;

            var initEventTextSprache = pageElement.querySelector("#InitEventTextSprache");
            //var eventSeries = pageElement.querySelector("#eventSeries");

            var that = this;

            var layout = null;

            // get field entries
            var getFieldEntries = function (index) {
                Log.call(Log.l.trace, "startResourceAdministration.Controller.");
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
                Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
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
                    Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickForward: function (event) {
                    Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
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
                    Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
                    that.insertData();
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                pressEnterKey: function (event) {
                    Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
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
                    Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickForward") {
                            AppBar.commandList[i].key = WinJS.Utilities.Key.enter;
                            break;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                deactivateEnterKey: function (event) {
                    Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickForward") {
                            AppBar.commandList[i].key = null;
                            break;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
                    that.selectionChanged().then(function () {
                        AppBar.triggerDisableHandlers();
                    });
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.seriesResourceAdministrationLayout.EventTextLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        }
                    }
                    that.loadingStateChanged(eventInfo);
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible && that.nextUrl) {
                            that.loadNext();
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
                    that.setFocusOnItemInvoked(eventInfo);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
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
                    Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var combobox = event.currentTarget;
                        StartResourceAdministration._languageId = parseInt(combobox.value);
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
                    Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        var combobox = event.currentTarget;
                        StartResourceAdministration._eventStartId = parseInt(combobox.value);
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

            var setLanguageComboResults = function (results) {
                var i;
                Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
                that.binding.multipleLanguages = (results && results.length > 1);
                if (initEventTextSprache && initEventTextSprache.winControl) {
                    initEventTextSprache.winControl.data = new WinJS.Binding.List(results ? results : []);
                    if (results && results.length > 0) {
                        for (i = 0; i < results.length; i++) {
                            if (results[i] && results[i].LanguageID === StartResourceAdministration._languageId) {
                                break;
                            }
                        }
                        if (i === results.length) {
                            StartResourceAdministration._languageId = results[0].LanguageID;
                            i = 0;
                        }
                        initEventTextSprache.selectedIndex = i;
                        that.binding.seriesLanguageItem = results[i];
                    }
                }
                Log.ret(Log.l.trace);
            }
            var loadInitLanguageData = function () {
                Log.call(Log.l.trace, "StartResourceAdministration.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    var results = StartResourceAdministration.initSpracheView.getResults();
                    if (results || !results.length) {
                        Log.print(Log.l.trace, "calling select initSpracheView...");
                        //load the list of INITSprache for Combobox
                        return StartResourceAdministration.initSpracheView.select(function (json) {
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

            var getEventStartId = function () {
                return StartResourceAdministration._eventStartId;
            }
            that.getEventStartId = getEventStartId;

            var setEventStartId = function (value) {
                Log.print(Log.l.trace, "eventStartId=" + value);
                StartResourceAdministration._eventStartId = value;
            }
            that.setEventStartId = setEventStartId;
            var master = Application.navigator.masterControl;
            if (master && master.controller && master.controller.binding) {
                that.setEventStartId(master.controller.binding.startId);
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



