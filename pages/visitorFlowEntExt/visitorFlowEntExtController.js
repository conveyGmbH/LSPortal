// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/visitorFlowEntExt/visitorFlowEntExtService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("VisitorFlowEntExt", {
        Controller: WinJS.Class.derive(Application.RecordsetController, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
            // ListView control
            var listView = pageElement.querySelector("#visitorflowentext.listview");

            Application.RecordsetController.apply(this, [pageElement, {
                count: 0
            }, commandList, false, VisitorFlowEntExt.CR_V_BereichView]);

            var that = this;

            var layout = null;
            var isAreaModified = false;

            this.newEntry = false;

            // get field entries
            var getFieldEntries = function (index) {
                Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                var ret = {}, i;
                if (that.listView && that.listView.winControl) {
                    var element = that.listView.winControl.elementFromIndex(index);
                    if (element) {
                        var text = element.querySelectorAll('input');
                        if (text) for (i=0; i<text.length; i++) {
                            ret[text[i].name] = text[i].value;
                        }
                        var fields = element.querySelectorAll('input[type="checkbox"]');
                        ret["WarningMailActive"] = (fields[0] && fields[0].checked) ? 1 : null;
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.getFieldEntries = getFieldEntries;

            var selectEntry = function (index) {
                Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                if (that.listView && that.listView.winControl) {
                    var entryIndex = index;
                    var element = that.listView;
                    if (element) {
                        if (entryIndex === 0) {
                            that.getFieldEntries(0);
                            element.winControl.selection.set(0);
                        }
                        if (entryIndex > 0) {
                            that.getFieldEntries(entryIndex);
                            element.winControl.selection.set(entryIndex);
                        }
                        if (entryIndex > 0 && that.newEntry === true) {
                            var lenght = element.winControl._cachedCount;
                            that.getFieldEntries(lenght);
                            element.winControl.selection.set(lenght);
                            that.newEntry = false;
                        }
                    }
                }
            }
            this.selectEntry = selectEntry;
            
            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                /*onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                    var currentlistIndex = that.currentlistIndex;
                    that.selectionChanged(function() {
                       /* if (isAreaModified) {
                            isAreaModified = false;
                            that.loadData();
                        }
                       listView.winControl.selection.set(currentlistIndex);
                       var element = that.listView.winControl.elementFromIndex(currentlistIndex);
                       if (element) {
                           var text = element.querySelectorAll('input[type="text"]');
                           if (text && text[0]) {
                               text[0].focus();
                           }
                       }
                    }, function(errorResponse) {
                        Log.print(Log.l.error, "error saving entext");
                        that.prevRecId = that.curRecId;
                        listView.winControl.selection.set(currentlistIndex);
                        var element = that.listView.winControl.elementFromIndex(currentlistIndex);
                        if (element) {
                            var text = element.querySelectorAll('input[type="text"]');
                            if (text && text[0]) {
                                text[0].focus();
                            }
                        }
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }).then(function () {
                        AppBar.triggerDisableHandlers();
                    });;
                    Log.ret(Log.l.trace);
                },*/
                onSelectionChanged: function(eventInfo) {
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                    that.selectionChanged().then(function () {
                        AppBar.triggerDisableHandlers();
                    });
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                    that.saveData(function (response) {
                        that.newEntry = true;
                        AppBar.busy = true;
                        Log.print(Log.l.trace, "MailingTypes saved");
                        var newEntExt = getEmptyDefaultValue(VisitorFlowEntExt.CR_V_BereichView.defaultValue);
                        newEntExt.VeranstaltungID = AppData.getRecordId("Veranstaltung");
                        VisitorFlowEntExt.CR_V_BereichView.insert(function (json) {
                            AppBar.busy = false;
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.info, "MailingTypes insert: success!");
                            // MailingTypes returns object already parsed from json file in response
                            if (json && json.d) {
                                //isAreaModified = false;
                                that.loadData().then(function () {
                                    that.selectRecordId(json.d.CR_V_BereichVIEWID);
                                });
                            }
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "error inserting employee");
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                            }, newEntExt);
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee");
                    });
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                    AppBar.busy = true;
                    that.saveData(function (response) {
                        AppBar.busy = false;
                        Log.print(Log.l.trace, "question saved");
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        Log.print(Log.l.error, "error saving question");
                    })/*.then(function () {
                        if (isAreaModified) {
                            isAreaModified = false;
                            that.loadData();
                        }
                    })*/;
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                    var recordId = that.curRecId;
                    if (recordId) {
                        var curScope = that.scopeFromRecordId(that.curRecId);
                        if (curScope && curScope.item) {
                            var confirmTitle = getResourceText("visitorFlowEntExt.labelDelete") + ": " + curScope.item.TITLE +
                                "\r\n" + getResourceText("visitorFlowEntExt.entextDelete");
                            confirm(confirmTitle, function (result) {
                                if (result) {
                                    AppBar.busy = true;
                                    Log.print(Log.l.trace, "clickDelete: user choice OK");
                                    var record;
                                    if (curScope.index > 0) {
                                        record = that.records.getAt(curScope.index - 1);
                                    } else {
                                        record = that.records.getAt(1);
                                    }
                                    if (record) {
                                        that.binding.cr_v_bereichId = record.CR_V_BereichVIEWID;
                                    }
                                    that.deleteData().then(function () {
                                        if (that.binding.cr_v_bereichId) {
                                            that.selectRecordId(that.binding.cr_v_bereichId);
                                        }
                                    });;
                                } else {
                                    Log.print(Log.l.trace, "clickDelete: user choice CANCEL");
                                }
                            });
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.VisitorFlowEntExtLayout.VisitorFlowEntExtLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            if (that.binding.loading) {
                                var count = listView.winControl.selection._focused &&
                                    listView.winControl.selection._focused.index;
                                that.selectEntry(count);
                            }
                        }
                    }
                    that.loadingStateChanged(eventInfo);
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible && that.nextUrl) {
                            that.loadNext();
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                    that.setFocusOnItemInvoked(eventInfo);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
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
            };

            this.disableHandlers = {
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickNew: function () {
                    // never disabled!
                    return AppBar.busy;
                },
                clickOk: function () {
                    return !that.curRecId || AppBar.busy || !AppBar.modified;
                },
                clickDelete: function () {
                    return !that.curRecId || AppBar.busy;
                }
            }

            // register ListView event handler
            if (listView) {
                // prevent some keyboard actions from listview to navigate within controls!
                this.addRemovableEventListener(listView, "keydown", function (e) {
                    if (!e.ctrlKey && !e.altKey) {
                        switch (e.keyCode) {
                            case WinJS.Utilities.Key.backspace:
                            case WinJS.Utilities.Key.deleteKey:
                            case WinJS.Utilities.Key.end:
                            case WinJS.Utilities.Key.home:
                            case WinJS.Utilities.Key.leftArrow:
                            case WinJS.Utilities.Key.rightArrow:
                            case WinJS.Utilities.Key.ctrl:
                            case WinJS.Utilities.Key.shift:
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

            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
                that.selectEntry(0);
            });
            Log.ret(Log.l.trace);
        }, {
            prevRecId: 0,
            curRecId: 0,
            cursorPos: { x: 0, y: 0 }
        })
    });
})();



