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

            this.nextUrl = null;
            this.loading = false;
            this.listView = listView;

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
            }

            var progress = null;
            var counter = null;
            var layout = null;
            var isAreaModified = false;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var mouseDown = false;

            // get field entries
            var getFieldEntries = function (index) {
                Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                var ret = {}, i;
                if (that.listView && that.listView.winControl) {
                    var element = that.listView.winControl.elementFromIndex(index);
                    if (element) {
                        var text = element.querySelectorAll('input[type="text"]');
                        if (text) for (i=0; i<text.length; i++) {
                            ret[text[i].name] = text[i].value;
                        }
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.getFieldEntries = getFieldEntries;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                onPointerDown: function (e) {
                    Log.call(Log.l.trace, "Questiongroup.Controller.");
                    that.cursorPos = { x: e.pageX, y: e.pageY };
                    mouseDown = true;
                    Log.ret(Log.l.trace);
                },
                onMouseDown: function (e) {
                    Log.call(Log.l.trace, "Questiongroup.Controller.");
                    that.cursorPos = { x: e.pageX, y: e.pageY };
                    mouseDown = true;
                    Log.ret(Log.l.trace);
                },
                onPointerUp: function (e) {
                    Log.call(Log.l.trace, "Questiongroup.Controller.");
                    mouseDown = false;
                    Log.ret(Log.l.trace);
                },
                onMouseUp: function (e) {
                    Log.call(Log.l.trace, "Questiongroup.Controller.");
                    mouseDown = false;
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                    var currentlistIndex = that.currentlistIndex;
                    that.selectionChanged(function() {
                        if (isAreaModified) {
                            isAreaModified = false;
                            that.loadData();
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
                    });
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "MailingTypes.Controller.");
                    that.saveData(function (response) {
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
                                isAreaModified = false;
                                that.loadData();
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
                    }).then(function() {
                        if (isAreaModified) {
                            isAreaModified = false;
                            that.loadData();
                        }
                    });
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
                                    that.deleteData();
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
                                layout = Application.VisitorFlowEntExtLayout.VisitorFlowEntExtLayout;
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
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                    if (eventInfo && eventInfo.detail) {
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
                    Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
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
                                Log.print(Log.l.trace, "VisitorFlowEntExt.CR_V_BereichView: success!");
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
                    Log.call(Log.l.trace, "Questiongroup.Controller.");
                    if (eventInfo && eventInfo.target) {
                        var comboInputFocus = eventInfo.target.querySelector(".win-dropdown:focus");
                        if (comboInputFocus) {
                            eventInfo.preventDefault();
                        } else {
                            // set focus into textarea if current mouse cursor is inside of element position
                            var setFocusOnElement = function (element) {
                                WinJS.Promise.timeout(0).then(function () {
                                    // set focus async!
                                    element.focus();
                                });
                            };
                            var textInputs = eventInfo.target.querySelectorAll(".win-textbox");
                            if (textInputs && textInputs.length > 0) {
                                for (var i = 0; i < textInputs.length; i++) {
                                    var textInput = textInputs[i];
                                    var position = WinJS.Utilities.getPosition(textInput);
                                    if (position) {
                                        var left = position.left;
                                        var top = position.top;
                                        var width = position.width;
                                        var height = position.height;
                                        if (that.cursorPos.x >= left && that.cursorPos.x <= left + width &&
                                            that.cursorPos.y >= top && that.cursorPos.y <= top + height) {
                                            setFocusOnElement(textInput);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
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
                    Log.call(Log.l.trace, "Account.Controller.");
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
                    if (that.curRecId || AppBar.busy) {
                        return false;
                    } else {
                        return true;
                    }
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
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "headervisibilitychanged", this.eventHandlers.onHeaderVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
            }

            var saveData = function (complete, error) {
                var ret = null;
                Log.call(Log.l.trace, "VisitorFlowEntExt.Controller.");
                AppData.setErrorMsg(that.binding);
                // standard call via modify
                var recordId = that.prevRecId;
                if (!recordId) {
                    // called via canUnload
                    recordId = that.curRecId;
                }
                that.prevRecId = 0;
                if (recordId) {
                    var curScope = that.scopeFromRecordId(recordId);
                    if (curScope && curScope.item) {
                        var newRecord = that.getFieldEntries(curScope.index);
                        var limitOld = (typeof curScope.item.Limit === "string") ? parseInt(curScope.item.Limit) : curScope.item.Limit;
                        var limitNew = (typeof newRecord.Limit === "string") ? parseInt(newRecord.Limit) : newRecord.Limit;
                        var offsetOld = (typeof curScope.item.Offset === "string") ? parseInt(curScope.item.Offset) : curScope.item.Offset;
                        var offsettNew = (typeof newRecord.Offset === "string") ? parseInt(newRecord.Offset) : newRecord.Offset;
                        var warnlimitOld = (typeof curScope.item.WarnLimit === "string") ? parseInt(curScope.item.WarnLimit) : curScope.item.WarnLimit;
                        var warnlimitNew = (typeof newRecord.WarnLimit === "string") ? parseInt(newRecord.WarnLimit) : newRecord.WarnLimit;
                        if (newRecord.TITLE && newRecord.Limit &&
                            (curScope.item.TITLE !== newRecord.TITLE || limitOld !== limitNew || warnlimitOld !== warnlimitNew || offsetOld !== offsettNew)) {
                            if (that.records) for (var i=0; i<that.records.length; i++) {
                                var item = that.records.getAt(i);
                                if (item.CR_V_BereichVIEWID !== recordId &&
                                    item.TITLE === newRecord.TITLE) {
                                    limitOld = (typeof item.Limit === "string") ? parseInt(item.Limit) : item.Limit;
                                    if (limitOld !== limitNew) {
                                        isAreaModified = true;
                                        break;
                                    }
                                    warnlimitOld = (typeof item.WarnLimit === "string") ? parseInt(item.WarnLimit) : item.WarnLimit;
                                    if (warnlimitOld !== warnlimitNew) {
                                        isAreaModified = true;
                                        break;
                                    }
                                    offsetOld = (typeof item.Offset === "string") ? parseInt(item.Offset) : item.Offset;
                                    if (offsetOld !== offsettNew) {
                                        isAreaModified = true;
                                        break;
                                    }
                                }
                            }
                        }
                        var mergedItem = copyByValue(curScope.item);
                        if (that.mergeRecord(mergedItem, newRecord) || AppBar.modified) {
                            Log.print(Log.l.trace, "save changes of recordId:" + recordId);
                            ret = VisitorFlowEntExt.CR_V_BereichView.update(function (response) {
                                Log.print(Log.l.info, "VisitorFlowEntExt.Controller. update: success!");
                                that.records.setAt(curScope.index, mergedItem);
                                // called asynchronously if ok
                                AppBar.modified = false;
                                if (typeof complete === "function") {
                                    complete(response);
                                }
                            }, function (errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (typeof error === "function") {
                                    error(errorResponse);
                                }
                            }, recordId, mergedItem);
                        } else {
                            Log.print(Log.l.trace, "no changes in recordId:" + recordId);
                        }
                    }
                }
                if (!ret) {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete({});
                        }
                    });
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.saveData = saveData;

            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
            prevRecId: 0,
            curRecId: 0,
            cursorPos: { x: 0, y: 0 }
        })
    });
})();



