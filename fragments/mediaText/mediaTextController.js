// controller for fragment: mediaText
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/mediaText/mediaTextService.js" />
/// <reference path="~/www/lib/jstz/scripts/jstz.js" />

(function () {
    "use strict";

    var namespaceName = "MediaText";

    WinJS.Namespace.define("MediaText", {
        Controller: WinJS.Class.derive(Fragments.RecordsetController, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            if (options) {
                MediaText._docId = options.docId;
            }
            // ListView control
            var listView = fragmentElement.querySelector("#mediaTextList.listview");

            Fragments.RecordsetController.apply(this, [fragmentElement, {
                eventLanguageItem: {
                    TITLE: "",
                    LanguageID: -1
                },
                eventSeriesTitle: "",
                multipleLanguages: false
            }, commandList, MediaText.eventTextTable, MediaText.eventTextView, listView]);
            
            var initEventTextSprache = fragmentElement.querySelector("#InitEventTextSprache");
            var pageBinding = AppBar.scope && AppBar.scope.binding;
            var that = this;

            var layout = null;

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
            }

            // get field entries
            var getFieldEntries = function (index) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var ret = {};
                if (listView && listView.winControl) {
                    var element = listView.winControl.elementFromIndex(index);
                    if (element) {
                        var fields = element.querySelectorAll('input[type="text"], textarea');
                        /*fields.forEach(function (field) {
                            var fieldEntry = field.dataset && field.dataset.fieldEntry;
                            if (fieldEntry) {
                                ret[fieldEntry] = field.value;
                            }
                        });*/
                        for (var i = 0; i < fields.length; i++) {
                            var fieldEntry = fields[i].dataset && fields[i].dataset.fieldEntry;
                            if (fieldEntry) {
                                ret[fieldEntry] = fields[i].value;
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

                that.binding.eventSeriesTitle = item.SerieTitel;
            }
            this.resultConverter = resultConverter;

            this.eventHandlers = {
                pressEnterKey: function (event) {
                    Log.call(Log.l.u2, namespaceName + ".Controller.");
                    if (event && event.keyCode === WinJS.Utilities.Key.enter &&
                        event.target && event.target.tagName &&
                        event.target.tagName.toLowerCase() === "textarea") {
                        if (event.stopPropagation) {
                            event.stopPropagation();
                        } else {
                            event.cancelBubble = true;
                        }
                    }
                    Log.ret(Log.l.u2);
                },
                activateEnterKey: function (event) {
                    Log.call(Log.l.u2, namespaceName + ".Controller.");
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickForward") {
                            AppBar.commandList[i].key = WinJS.Utilities.Key.enter;
                            break;
                        }
                    }
                    Log.ret(Log.l.u2);
                },
                deactivateEnterKey: function (event) {
                    Log.call(Log.l.u2, namespaceName + ".Controller.");
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickForward") {
                            AppBar.commandList[i].key = null;
                            break;
                        }
                    }
                    Log.ret(Log.l.u2);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.selectionChanged().then(function() {
                        AppBar.triggerDisableHandlers();
                    });
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.MediaTextLayout.MediaTextLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        }
                    }
                    that.loadingStateChanged(eventInfo);
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible && that.nextUrl) {
                            that.loadNext();
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.setFocusOnItemInvoked(eventInfo);
                    Log.ret(Log.l.trace);
                },
                changedLanguage: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    AppData.setErrorMsg(pageBinding);
                    if (event.currentTarget && AppBar.notifyModified) {
                        var combobox = event.currentTarget;
                        MediaText._languageId = parseInt(combobox.value);
                        AppBar.busy = true;
                        that.saveData(function (response) {
                            AppBar.busy = false;
                            // erst savedata und dann loaddata
                            that.loadData();
                            Log.print(Log.l.trace, "event text saved");
                        }, function (errorResponse) {
                            AppBar.busy = false;
                            Log.print(Log.l.error, "error saving event text");
                            AppData.setErrorMsg(pageBinding, errorResponse);
                        });
                    }
                    Log.ret(Log.l.trace);
                }
            }

            this.disableHandlers = {
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

            var getDocId = function() {
                return MediaText._docId;
            }
            this.getDocId = getDocId;
            
            var setDocId = function(value) {
                Log.print(Log.l.trace, "docId=" + value);
                MediaText._docId = value;
            }
            this.setDocId = setDocId;

            var getLanguageId = function() {
                return MediaText._languageId;
            }
            this.getLanguageId = getLanguageId;

            var setLanguageId = function(value) {
                Log.print(Log.l.trace, "languageId=" + value);
                MediaText._languageId = value;
            }
            this.setLanguageId = setLanguageId;

            var setLanguageComboResults = function(results) {
                var i;
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                that.binding.multipleLanguages = (results && results.length > 1);
                if (initEventTextSprache && initEventTextSprache.winControl) {
                    initEventTextSprache.winControl.data = new WinJS.Binding.List(results ? results : []);
                    if (results && results.length > 0) {
                        for (i=0;i<results.length;i++) {
                            if (results[i] && results[i].LanguageID === MediaText._languageId) {
                                break;
                            }
                        }
                        if (i === results.length) {
                            that.binding.eventLanguageItem = {
                                TITLE: "",
                                LanguageID: -1
                            };
                        }
                        initEventTextSprache.selectedIndex = i;
                        that.binding.eventLanguageItem = results[i];
                    }
                }
                Log.ret(Log.l.trace);
            }
            var loadInitLanguageData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(pageBinding);
                var ret = new WinJS.Promise.as().then(function () {
                    var results = MediaText.initSpracheView.getResults();
                    if (results || !results.length) {
                        Log.print(Log.l.trace, "calling select initSpracheView...");
                        //load the list of INITSprache for Combobox
                        return MediaText.initSpracheView.select(function (json) {
                            Log.print(Log.l.trace, "initSpracheView: success!");
                            if (json && json.d) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                setLanguageComboResults(json.d.results);
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(pageBinding, errorResponse);
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

            this.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadInitLanguageData();
            }).then(function () {
                Log.print(Log.l.trace, "loadInitLanguageData complete");
                return that.loadData();
            }).then(function () {
                that.updateCommands();
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "loadData complete");
            });
            Log.ret(Log.l.trace);
        })
    });
})();
