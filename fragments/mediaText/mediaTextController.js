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
    WinJS.Namespace.define("MediaText", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "MediaText.Controller.");
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
                multipleLanguages: false,
                count: 0
            }, commandList, MediaText.eventTextTable, MediaText.eventTextView, listView]);
            
            var initEventTextSprache = fragmentElement.querySelector("#InitEventTextSprache");

            var that = this;

            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            // get field entries
            var getFieldEntries = function (index) {
                Log.call(Log.l.trace, "Questiongroup.Controller.");
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
                Log.call(Log.l.trace, "MediaText.Controller.");
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
                Log.ret(Log.l.trace);
            }
            this.resultConverter = resultConverter;

            this.eventHandlers = {
                pressEnterKey: function (event) {
                    Log.call(Log.l.trace, "MediaText.Controller.");
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
                    Log.call(Log.l.trace, "MediaText.Controller.");
                    that.selectionChanged().then(function() {
                        AppBar.triggerDisableHandlers();
                    });
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "MediaText.Controller.");
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
                                layout = Application.MediaTextLayout.MediaTextLayout;
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
                    Log.call(Log.l.trace, "MediaText.Controller.");
                    /*if (eventInfo && eventInfo.detail) {
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
                    }*/
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "MediaText.Controller.");
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
                                Log.print(Log.l.trace, "MediaText.loadNext: success!");
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
                    Log.call(Log.l.trace, "MediaText.Controller.");
                    that.setFocusOnItemInvoked(eventInfo);
                    Log.ret(Log.l.trace);
                },
                changedLanguage: function (event) {
                    Log.call(Log.l.trace, "MediaText.Controller.");
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
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "headervisibilitychanged", this.eventHandlers.onHeaderVisibilityChanged.bind(this));
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
                Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
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
                Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                AppData.setErrorMsg(that.binding);
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
