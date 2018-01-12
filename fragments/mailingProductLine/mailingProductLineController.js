// controller for page: info
    /// <reference path="~/www/lib/WinJS/scripts/base.js" />
    /// <reference path="~/www/lib/WinJS/scripts/ui.js" />
    /// <reference path="~/www/lib/convey/scripts/appSettings.js" />
    /// <reference path="~/www/lib/convey/scripts/dataService.js" />
    /// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
    /// <reference path="~/www/scripts/generalData.js" />
    /// <reference path="~/www/fragments/empRoles/empRolesService.js" />

    (function () {
        "use strict";

        WinJS.Namespace.define("MailingProductLine", {
            Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
                Log.call(Log.l.trace, "EmpRoles.Controller.");
                Fragments.Controller.apply(this, [fragmentElement, {
                    mailingLine: options.mailingLine
                }]);
                var that = this;
                this.curRecId = 0;
                this.prevRecId = 0;

                var progress = null;
                var counter = null;
                var layout = null;

                var mouseDown = false;

                // now do anything...
                var listView = fragmentElement.querySelector("#mailingProductLineList.listview");

                // get field entries
                var getFieldEntries = function (index) {
                    Log.call(Log.l.trace, "MailingProductLine.Controller.");
                    var ret = {};
                    if (listView && listView.winControl) {
                        var element = listView.winControl.elementFromIndex(index);
                        if (element) {
                            var fields = element.querySelectorAll('textarea');
                            ret["ZeilenText"] = fields[0] && fields[0].value;
                        }
                    }
                    Log.ret(Log.l.trace, ret);
                    return ret;
                };
                this.getFieldEntries = getFieldEntries;

                var mergeRecord = function (prevRecord, newRecord) {
                    Log.call(Log.l.trace, "MailingProductLine.Controller.");
                    var ret = false;
                    for (var prop in newRecord) {
                        if (newRecord.hasOwnProperty(prop)) {
                            if (newRecord[prop] !== prevRecord[prop]) {
                                prevRecord[prop] = newRecord[prop];
                                ret = true;
                            }
                        }
                    }
                    Log.ret(Log.l.trace, ret);
                    return ret;
                }
                this.mergeRecord = mergeRecord;

                var scopeFromRecordId = function (mailDocumentId) {
                    var i;
                     Log.call(Log.l.trace, "MailingProductLine.Controller.", "recordId=" + mailDocumentId);
                    var item = null;
                    for (i = 0; i < that.mailingLine.length; i++) {
                        var line = that.mailingLine.getAt(i);
                        if (line && typeof line === "object" &&
                            line.MAILERZEILENVIEWID === mailDocumentId) {
                            item = line;
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

                var saveData = function (complete, error) {
                    var ret = null;
                    Log.call(Log.l.trace, "MailingProductLine.Controller.");
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
                            if (that.mergeRecord(curScope.item, newRecord) || AppBar.modified) {
                                Log.print(Log.l.trace, "save changes of recordId:" + recordId);
                                ret = MailingProductLine.MAILERZEILENView.update(function (response) {
                                    Log.print(Log.l.info, "MailingProductLine.Controller. update: success!");
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
                                    }, recordId, curScope.item);
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

                var eventHandlers = {
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
                        Log.call(Log.l.trace, "MailingProductLine.Controller.");
                        if (listView && listView.winControl) {
                            var listControl = listView.winControl;
                            if (listControl.selection) {
                                var selectionCount = listControl.selection.count();
                                if (selectionCount === 1) {
                                    // Only one item is selected, show the page
                                    listControl.selection.getItems().done(function (items) {
                                        var item = items[0];
                                        if (item.data && item.data.MAILERZEILENVIEWID) {
                                            var newRecId = item.data.MAILERZEILENVIEWID;
                                            Log.print(Log.l.trace, "newRecId:" + newRecId + " curRecId:" + that.curRecId);
                                            if (newRecId !== 0 && newRecId !== that.curRecId) {
                                                AppData.setRecordId('MAILERZEILENVIEWID', newRecId);
                                                if (that.curRecId) {
                                                    that.prevRecId = that.curRecId;
                                                }
                                                that.curRecId = newRecId;
                                                if (that.prevRecId !== 0) {
                                                    that.saveData(function (response) {
                                                        Log.print(Log.l.trace, "question saved");
                                                        AppBar.triggerDisableHandlers();
                                                    }, function (errorResponse) {
                                                        Log.print(Log.l.error, "error saving question");
                                                    });
                                                } else {
                                                    AppBar.triggerDisableHandlers();
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        }
                        Log.ret(Log.l.trace);
                    },
                    onLoadingStateChanged: function (eventInfo) {
                        Log.call(Log.l.trace, "MailingProductLine.Controller.");
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
                            if (listView.winControl.loadingState === "itemsLoading") {
                                if (!layout) {
                                    layout = MailingProductLine.ListLayout.MailingProductLineLayout;
                                    listView.winControl.layout = { type: layout };
                                }
                            } else if (listView.winControl.loadingState === "complete") {
                                if (that.loading) {
                                    that.loading = false;
                                }
                            }
                        }
                        Log.ret(Log.l.trace);
                    },
                    onHeaderVisibilityChanged: function (eventInfo) {
                        Log.call(Log.l.trace, "Questionnaire.Controller.");
                        Log.ret(Log.l.trace);
                    },
                    onFooterVisibilityChanged: function (eventInfo) {
                        Log.call(Log.l.trace, "Questionnaire.Controller.");
                        if (eventInfo && eventInfo.detail) {
                            progress = listView.querySelector(".list-footer .progress");
                            counter = listView.querySelector(".list-footer .counter");
                            var visible = eventInfo.detail.visible;
                            if (visible) {
                                if (that.contacts && that.nextUrl) {
                                    that.loading = true;
                                    if (progress && progress.style) {
                                        progress.style.display = "inline";
                                    }
                                    if (counter && counter.style) {
                                        counter.style.display = "none";
                                    }
                                    AppData.setErrorMsg(that.binding);
                                    Log.print(Log.l.trace, "calling select ListLocal.contactView...");
                                    var nextUrl = that.nextUrl;
                                    that.nextUrl = null;
                                    MailingProductLine.MAILERZEILENView.selectNext(function (json) {
                                        // this callback will be called asynchronously
                                        // when the response is available
                                        Log.print(Log.l.trace, "ListLocal.contactView: success!");
                                        // startContact returns object already parsed from json file in response
                                        if (json && json.d) {
                                            that.nextUrl = MailingProductLine.MAILERZEILENView.getNextUrl(json);
                                            var results = json.d.results;
                                            results.forEach(function (item) {
                                                that.resultConverter(item);
                                                that.binding.count = that.questions.push(item);
                                            });
                                        }
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
                        }
                        Log.ret(Log.l.trace);
                    },
                    onItemInvoked: function (eventInfo) {
                        Log.call(Log.l.trace, "Questionnaire.Controller.");
                        if (eventInfo && eventInfo.target) {
                            var comboInputFocus = eventInfo.target.querySelector(".win-dropdown:focus");
                            if (comboInputFocus) {
                                eventInfo.preventDefault();
                            } else {
                                // set focus into textarea if current mouse cursor is inside of element position
                                var freitextInput = eventInfo.target.querySelector(".field-text-comment");
                                if (freitextInput) {
                                    var position = WinJS.Utilities.getPosition(freitextInput);
                                    if (position) {
                                        var left = position.left;
                                        var top = position.top;
                                        var width = position.width;
                                        var height = position.height;
                                        if (that.cursorPos.x >= left &&
                                            that.cursorPos.x <= left + width &&
                                            that.cursorPos.y >= top &&
                                            that.cursorPos.y <= top + height) {
                                            WinJS.Promise.timeout(0).then(function () {
                                                // set focus async!
                                                freitextInput.focus();
                                            });
                                            /* Log.call(Log.l.trace, "Questionnaire.Controller.");
                                             for (var i = 0; i < AppBar.commandList.length; i++) {
                                                 if (AppBar.commandList[i].id === "clickForward")
                                                     AppBar.commandList[i].key = null;
                                             }*/
                                        }/* else {
                                        Log.call(Log.l.trace, "Questionnaire.Controller.");
                                        for (var j = 0; j < AppBar.commandList.length; j++) {
                                            if (AppBar.commandList[j].id === "clickForward")
                                                AppBar.commandList[j].key = WinJS.Utilities.Key.enter;
                                        }
                                    }*/

                                    }
                                    if (freitextInput.value) {
                                        WinJS.Utilities.addClass(freitextInput, "field-text-comment-big");
                                    } else {
                                        WinJS.Utilities.removeClass(freitextInput, "field-text-comment-big");
                                    }
                                }
                            }
                        }
                        Log.ret(Log.l.trace);
                    }
                }
                this.eventHandlers = eventHandlers;

                // register ListView event handler
                if (listView) {
                    this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                    this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                    this.addRemovableEventListener(listView, "headervisibilitychanged", this.eventHandlers.onHeaderVisibilityChanged.bind(this));
                    this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                    this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                    // prevent some keyboard actions from listview to navigate within controls!
                    this.addRemovableEventListener(listView, "keydown", function (e) {
                        if (!e.ctrlKey && !e.altKey) {
                            switch (e.keyCode) {
                            case WinJS.Utilities.Key.leftArrow:
                            case WinJS.Utilities.Key.rightArrow:
                            case WinJS.Utilities.Key.space:
                                e.stopImmediatePropagation();
                                break;
                            }
                        }
                    }.bind(this), true);
                }

                var loadData = function (curMailingLine) {
                    Log.call(Log.l.trace, "MailingProductLine.", "curMailingLine=" + curMailingLine);
                    AppData.setErrorMsg(that.binding);
                    var ret = new WinJS.Promise.as().then(function () {
                        return MailingProductLine.MAILERZEILENView.select(function(json) {
                            that.binding.mailingLine = curMailingLine;
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "MAILERZEILENView: success!");
                            // startContact returns object already parsed from json file in response
                            if (json && json.d) {
                                that.nextUrl = MailingProductLine.MAILERZEILENView.getNextUrl(json);
                                var results = json.d.results;
                                that.mailingLine = new WinJS.Binding.List(results);

                                if (listView && listView.winControl) {
                                    var getTextareaForFocus = function(element) {
                                        var focusElement = null;
                                        if (element) {
                                            var freitextInputs =
                                                element.querySelectorAll(".win-textarea, .win-textbox");
                                            if (freitextInputs)
                                                for (var i = 0; i < freitextInputs.length; i++) {
                                                    var freitextInput = freitextInputs[i];
                                                    if (freitextInput) {
                                                        var position = WinJS.Utilities.getPosition(freitextInput);
                                                        if (position) {
                                                            var left = position.left;
                                                            var top = position.top;
                                                            var width = position.width;
                                                            var height = position.height;
                                                            if (that.cursorPos.x >= left &&
                                                                that.cursorPos.x <= left + width &&
                                                                that.cursorPos.y >= top &&
                                                                that.cursorPos.y <= top + height + 2) {
                                                                focusElement = freitextInput;
                                                                break;
                                                            }
                                                        }
                                                    }
                                                }
                                        }
                                        Log.ret(Log.l.trace);
                                        return focusElement;
                                    }
                                    var trySetActive = function(element, scroller) {
                                        var success = true;
                                        // don't call setActive() if a dropdown control has focus!
                                        var comboInputFocus = element.querySelector(".win-dropdown:focus");
                                        if (!comboInputFocus) {
                                            try {
                                                var focusElement;
                                                if (typeof element.setActive === "function") {
                                                    focusElement = getTextareaForFocus(element);
                                                    element.setActive();
                                                    if (focusElement && focusElement !== element) {
                                                        focusElement.focus();
                                                    }
                                                } else {
                                                    // check for existence of WinRT
                                                    var resources = Resources.get();
                                                    if (resources) {
                                                        focusElement = getTextareaForFocus(element);
                                                        if (focusElement && focusElement !== element) {
                                                            WinJS.Promise.timeout(0).then(function() {
                                                                focusElement.focus();
                                                            });
                                                        }
                                                    }
                                                }
                                            } catch (e) {
                                                // setActive() raises an exception when trying to focus an invisible item. Checking visibility is non-trivial, so it's best
                                                // just to catch the exception and ignore it. focus() on the other hand, does not raise exceptions.
                                                success = false;
                                            }
                                        }
                                        return success;
                                    };
                                    // overwrite _setFocusOnItem for this ListView to supress automatic
                                    // scroll-into-view when calling item.focus() in base.js implementation
                                    // by prevent the call of _ElementUtilities._setActive(item);
                                    listView.winControl._setFocusOnItem = function ListView_setFocusOnItem(entity) {
                                        this._writeProfilerMark("_setFocusOnItem,info");
                                        if (this._focusRequest) {
                                            this._focusRequest.cancel();
                                        }
                                        if (this._isZombie()) {
                                            return;
                                        }
                                        var winControl = this;
                                        var setFocusOnItemImpl = function(item) {
                                            if (winControl._isZombie()) {
                                                return;
                                            }

                                            if (winControl._tabManager.childFocus !== item) {
                                                winControl._tabManager.childFocus = item;
                                            }
                                            winControl._focusRequest = null;
                                            if (winControl._hasKeyboardFocus && !winControl._itemFocused) {
                                                if (winControl._selection._keyboardFocused()) {
                                                    winControl._drawFocusRectangle(item);
                                                }
                                                // The requestItem promise just completed so _cachedCount will
                                                // be initialized.
                                                if (entity.type === WinJS.UI.ObjectType.groupHeader ||
                                                    entity.type === WinJS.UI.ObjectType.item) {
                                                    winControl._view
                                                        .updateAriaForAnnouncement(item,
                                                            (
                                                                entity.type === WinJS.UI.ObjectType.groupHeader
                                                                    ? winControl._groups.length()
                                                                    : winControl._cachedCount));
                                                }

                                                // Some consumers of ListView listen for item invoked events and hide the listview when an item is clicked.
                                                // Since keyboard interactions rely on async operations, sometimes an invoke event can be received before we get
                                                // to WinJS.Utilities._setActive(item), and the listview will be made invisible. If that happens and we call item.setActive(), an exception
                                                // is raised for trying to focus on an invisible item. Checking visibility is non-trivial, so it's best
                                                // just to catch the exception and ignore it.
                                                winControl._itemFocused = true;
                                                trySetActive(item);
                                            }
                                        };

                                        if (entity.type === WinJS.UI.ObjectType.item) {
                                            this._focusRequest = this._view.items.requestItem(entity.index);
                                        } else if (entity.type === WinJS.UI.ObjectType.groupHeader) {
                                            this._focusRequest = this._groups.requestHeader(entity.index);
                                        } else {
                                            this._focusRequest = WinJS.Promise.wrap(
                                                entity.type === WinJS.UI.ObjectType.header
                                                ? this._header
                                                : this._footer);
                                        }
                                        this._focusRequest.then(setFocusOnItemImpl);
                                    };
                                    
                                    listView.winControl._supressScrollIntoView = true;
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = that.mailingLine.dataSource;
                                }
                                
                            } else {
                                that.mailingLine = null;
                                if (listView && listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = null;
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, {
                                MaildokumentID: curMailingLine
                            });
                    });
                    Log.ret(Log.l.trace);
                    return ret;
                };
                this.loadData = loadData;

                that.processAll().then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return that.loadData(that.binding.mailingLine);
                }).then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                });
                Log.ret(Log.l.trace);
            }, {
                mailingLine: null,
                cursorPos: { x: 0, y: 0 }
            })
        });
    })();