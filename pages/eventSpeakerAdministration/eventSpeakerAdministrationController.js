// controller for page: eventSpeakerAdministration
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/eventSpeakerAdministration/eventSpeakerAdministrationService.js" />
/// <reference path="~/www/lib/jstz/scripts/jstz.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("EventSpeakerAdministration", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");

            // ListView control
            var listView = pageElement.querySelector("#eventSpeakerList.listview");

            Application.RecordsetController.apply(this, [pageElement, {
                count: 0
            }, commandList, false,
                EventSpeakerAdministration.eventSpeakerTable,
                EventSpeakerAdministration.eventSpeakerVIEW, listView]);

            var that = this;

            // superset of speaker entries in combobox
            this.speaker = null;

            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            // force reload on fieldEntry value change, to refill combobox!
            var forceReload = false;

            this.dispose = function () {
                if (that.speaker) {
                    that.speaker = null;
                }
            }

            // get field entries
            var getFieldEntries = function (index) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
                var ret = {};
                if (listView && listView.winControl) {
                    var element = listView.winControl.elementFromIndex(index);
                    if (element) {
                        var field = element.querySelector('.win-dropdown');
                        if (field) {
                            var fieldEntry = field.dataset && field.dataset.fieldEntry;
                            var value = parseInt(field.value);
                            if (fieldEntry) {
                                ret[fieldEntry] = value || null;
                                if (that.records) {
                                    var item = that.records.getAt(index);
                                    if (item && ret[fieldEntry] !== item[fieldEntry]) {
                                        forceReload = true;
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

            var resultConverter = function (item, index) {
                Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.", "index=", index);
                var ret = item;
                // reset mapped speaker on any result received
                Log.ret(Log.l.trace, ret);
            }
            this.resultConverter = resultConverter;

            var fillSpeakerCombo = function(combo, item, index) {
                Log.call(Log.l.u1, "EventSpeakerAdministration.Controller.");
                if (combo && combo.winControl) {
                    var eventSpeakerMap = that.records &&
                        that.records.map(function(recordsItem) {
                            return recordsItem.MandantSerieID || 0;
                        }) || [];
                    var curSpeaker = (that.speaker || []).filter(function(speakerItem) {
                        return (speakerItem.PersonAdresseVIEWID === item.PersonAdresseID ||
                            eventSpeakerMap.indexOf(speakerItem.PersonAdresseVIEWID) < 0);
                    });
                    if (curSpeaker) {
                        curSpeaker.push({
                            PersonAdresseVIEWID: 0,
                            PersonAdresseText: ""
                        });
                    }
                    combo.winControl.data = new WinJS.Binding.List(curSpeaker);
                    combo.value = item.PersonAdresseID || 0;
                }
                Log.ret(Log.l.u1);
            }
            this.fillSpeakerCombo = fillSpeakerCombo;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickForward: function (event) {
                    Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
                    AppData.setErrorMsg(that.binding);
                    forceReload = false;
                    AppBar.busy = true;
                    that.saveData(function(response) {
                        AppBar.busy = false;
                        Log.print(Log.l.trace, "question saved");
                    }, function(errorResponse) {
                        AppBar.busy = false;
                        Log.print(Log.l.error, "error saving question");
                    }).then(function() {
                        if (forceReload) {
                            return that.loadData();
                        } else {
                            return WinJS.Promise.as();
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
                    AppData.setErrorMsg(that.binding);
                    // PRC_CreateEmptyMA
                    that.saveData(function (response) {
                        AppBar.busy = false;
                    AppData.call("PRC_CreateEmptyMA", {
                        pVeranstaltungID: that.getEventId(),
                        pVariant: ""
                    }, function (json) {
                        Log.print(Log.l.info, "call success! json=" + json);
                        //Mitarbeiterid - Personaddressviewid
                        // update auf oData 
                        //Application.navigateById(Application.startPageId, event);
                        // rufe update und dann loaddata auf
                            that.curRecId = json.d;
                            Log.print(Log.l.trace, "inserted recordId=" + that.curRecIdd);
                            AppData.setRecordId(that.tableView.relationName, that.curRecId);
                    }, function (error) {
                        Log.print(Log.l.error, "call error=" + error);
                        AppData.setErrorMsg(that.binding, error);
                    });
                        Log.print(Log.l.trace, "question saved");
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        Log.print(Log.l.error, "error saving question");
                    }).then(function () {
                        that.loadData();
                    });
                    /*that.insertData().then(function() {
                        AppBar.triggerDisableHandlers();
                    });*/
                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
                    var confirmTitle = getResourceText("eventSpeakerAdministration.questionDelete");
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace,"clickDelete: user choice OK");
                            that.deleteData().then(function() {
                                AppBar.triggerDisableHandlers();
                            });
                        } else {
                            Log.print(Log.l.trace, "clickDelete: user choice CANCEL");
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                pressEnterKey: function (event) {
                    Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
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
                    Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickForward") {
                            AppBar.commandList[i].key = WinJS.Utilities.Key.enter;
                            break;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                deactivateEnterKey: function (event) {
                    Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
                    for (var i = 0; i < AppBar.commandList.length; i++) {
                        if (AppBar.commandList[i].id === "clickForward") {
                            AppBar.commandList[i].key = null;
                            break;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
                    forceReload = false;
                    that.selectionChanged().then(function() {
                        if (forceReload) {
                            return that.loadData();
                        } else {
                            return WinJS.Promise.as();
                        }
                    }).then(function () {
                        AppBar.triggerDisableHandlers();
                    });
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
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
                                layout = Application.eventSpeakerAdministrationLayout.EventSpeakerLayout;
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
                            if (that.records) {
                                for (var i = 0; i < that.records.length; i++) {
                                    var item = that.records.getAt(i);
                                    if (item) {
                                        var element = listView.winControl.elementFromIndex(i);
                                        if (element) {
                                            var combo = element.querySelector('select[data-field-entry="PersonAdresseID"]');
                                            that.fillSpeakerCombo(combo, item, i);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
                    
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
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
                                Log.print(Log.l.trace, "EventSpeakerAdministration.CR_V_FragengruppeView: success!");
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
                    Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
                    that.setFocusOnItemInvoked(eventInfo);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
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
            }

            this.disableHandlers = {
                clickNew: function () {
                    return AppBar.busy || !((that.speaker && that.speaker.length || 0) > (that.records && that.records.length || 0));
                },
                clickForward: function () {
                    // always enabled!
                    return AppBar.busy || !that.curRecId;
                },
                clickDelete: function () {
                    // always enabled!
                    return AppBar.busy || !that.curRecId;
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

            var loadSpeakerData = function () {
                Log.call(Log.l.trace, "EventSpeakerAdministration.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select speakerView...");
                    return EventSpeakerAdministration.speakerView.select(function (json) {
                        Log.print(Log.l.trace, "speakerView: success!");
                        that.speaker = (json && json.d && json.d.results) || [];
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });

                });
                Log.ret(Log.l.trace);
                return ret;
            }
            that.loadSpeakerData = loadSpeakerData;

            var getEventId = function () {
                return EventSpeakerAdministration._eventId;
            }
            that.getEventId = getEventId;

            var setEventId = function (value) {
                Log.print(Log.l.trace, "eventId=" + value);
                EventSpeakerAdministration._eventId = value;
            }
            that.setEventId = setEventId;

            var master = Application.navigator.masterControl;
            if (master && master.controller && master.controller.binding) {
                that.setEventId(master.controller.binding.eventId);
            }

            that.processAll().then(function () {
                Log.print(Log.l.trace, "loadSpeakerData");
                return that.loadSpeakerData();
            }).then(function () {
                Log.print(Log.l.trace, "loadFragmentById complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
                AppBar.triggerDisableHandlers();
                Log.print(Log.l.trace, "loadData complete");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



