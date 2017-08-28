// controller for page: skillentry
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/emplist/emplistController.js" />
/// <reference path="~/www/pages/skillentry/skillentryService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("Skillentry", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement) {
            Log.call(Log.l.trace, "Skillentry.Controller.");
            Application.Controller.apply(this, [pageElement, {
                countSkills: 0
            }]);
            this.nextUrl = null;
            this.recordId = null;
            this.loading = false;
            this.questions = null;

            var that = this;

            // ListView control
            var listView = pageElement.querySelector("#skillentryList.listview");

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.questions) {
                    that.questions = null;
                }
            }

            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var mouseDown = false;

            var getRecordId = function () {
                Log.call(Log.l.trace, "EmpList.Controller.");
                var recordId = 0;
                var master = Application.navigator.masterControl;
                if (master && master.controller && master.controller.binding) {
                    recordId = master.controller.binding.employeeId;
                }
                Log.ret(Log.l.trace, recordId);
                return recordId;
            }
            this.getRecordId = getRecordId;

            var mergeRecord = function (prevRecord, newRecord) {
                Log.call(Log.l.trace, "Skillentry.Controller.");
                var ret = false;
                for (var prop in newRecord) {
                    if (newRecord.hasOwnProperty(prop)) {
                        if (newRecord[prop] !== prevRecord[prop]) {
                            prevRecord[prop] = newRecord[prop];
                            ret = true;
                            AppBar.modified = true;
                        }
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            }
            this.mergeRecord = mergeRecord;

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "Skillentry.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    for (var i = 0; i < that.questions.length; i++) {
                        var question = that.questions.getAt(i);
                        if (question && typeof question === "object" &&
                            question.MitarbeiterID === recordId) {
                            listView.winControl.selection.set(i);
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            // get field entries
            var getFieldEntries = function (index, type) {
                var ret = {};
                if (listView && listView.winControl) {
                    var element = listView.winControl.elementFromIndex(index);
                    if (element) {
                        var i, key;
                        var fields = element.querySelectorAll('input[type="checkbox"]');
                        for (i = 1; i <= fields.length; i++) {
                            if (i < 10) {
                                key = "Skill0" + i.toString();
                            } else {
                                key = "Skill" + i.toString();
                            }
                            if (fields[i - 1].checked) {
                                ret[key] = "X";
                            } else {
                                ret[key] = null;
                            }
                        }
                    }
                }
                return ret;
            };
            this.getFieldEntries = getFieldEntries;

            var scopeFromRecordId = function (recordId) {
                var i;
                Log.call(Log.l.trace, "Skillentry.Controller.", "recordId=" + recordId);
                var item = null;
                for (i = 0; i < that.questions.length; i++) {
                    var question = that.questions.getAt(i);
                    if (question && typeof question === "object" &&
                        question.SkillEntryLineVIEWID === recordId) {
                        item = question;
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
                Log.call(Log.l.trace, "Skillentry.Controller.");
                AppData.setErrorMsg(that.binding);
                // standard call via modify
                var recordId = that.curRecId; // that.curRecId that.prevRecId that.prevRecIdthat.binding.employeeId
                if (!recordId) {
                    // called via canUnload
                    recordId = that.curRecId;
                    that.curRecId = 0;
                }
                that.prevRecId = 0;
                if (recordId) {
                    var curScope = that.scopeFromRecordId(recordId);
                    if (curScope && curScope.item) {
                        var newRecord = that.getFieldEntries(curScope.index);
                        if (that.mergeRecord(curScope.item, newRecord) || AppBar.modified) { //|| AppBar.modified
                            Log.print(Log.l.trace, "save changes of recordId:" + recordId);
                            ret = Skillentry._skillentryline_E.update(function (response) {
                                Log.print(Log.l.info, "SkillEntryLine update: success!");
                                AppData.getUserData();
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
                        complete({});
                    });
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.saveData = saveData;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Skillentry.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickForward: function (event) {
                    Log.call(Log.l.trace, "Skillentry.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "question saved");
                        AppBar.triggerDisableHandlers();
                    },
                        function (errorResponse) {
                            Log.print(Log.l.error, "error saving question");
                        })/*.then(that.loadData(getRecordId())
                        ).then(function () {

                            

                        })*/;
                    Application.navigateById("skillentry", event); //skillentry
                    Log.ret(Log.l.trace);
                },
                clickLineUp: function (event) {
                    Log.call(Log.l.trace, "Skillentry.Controller.");
                    if (that.curRecId && !that.prevRecId) {
                        var curScope = that.scopeFromRecordId(that.curRecId);
                        if (curScope && curScope.item &&
                            curScope.item.Sortierung > 1) {
                            curScope.item.Sortierung--;
                            that.questions.setAt(curScope.index, curScope.item);
                            // set modified!
                            AppBar.modified = true;
                            that.saveData(function (response) {
                                Log.print(Log.l.trace, "question saved");
                                that.loadData();
                            }, function (errorResponse) {
                                Log.print(Log.l.error, "error saving question");
                            });
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickLineDown: function (event) {
                    Log.call(Log.l.trace, "Skillentry.Controller.");
                    if (that.curRecId && !that.prevRecId) {
                        var curScope = that.scopeFromRecordId(that.curRecId);
                        if (curScope && curScope.item &&
                            curScope.item.Sortierung < that.binding.countSkills) {
                            curScope.item.Sortierung += 2;
                            that.questions.setAt(curScope.index, curScope.item);
                            // set modified!
                            AppBar.modified = true;
                            that.saveData(function (response) {
                                Log.print(Log.l.trace, "question saved");
                                that.loadData();
                            }, function (errorResponse) {
                                Log.print(Log.l.error, "error saving question");
                            });
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Skillentry.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Skillentry.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                onPointerDown: function (e) {
                    Log.call(Log.l.trace, "Skillentry.Controller.");
                    that.cursorPos = { x: e.pageX, y: e.pageY };
                    mouseDown = true;
                    Log.ret(Log.l.trace);
                },
                onMouseDown: function (e) {
                    Log.call(Log.l.trace, "Skillentry.Controller.");
                    that.cursorPos = { x: e.pageX, y: e.pageY };
                    mouseDown = true;
                    Log.ret(Log.l.trace);
                },
                onPointerUp: function (e) {
                    Log.call(Log.l.trace, "Skillentry.Controller.");
                    mouseDown = false;
                    Log.ret(Log.l.trace);
                },
                onMouseUp: function (e) {
                    Log.call(Log.l.trace, "Skillentry.Controller.");
                    mouseDown = false;
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Skillentry.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count;
                            Log.print(Log.l.trace, "listControl:" + listControl + " selectionCount:" + selectionCount);
                            //  if (selectionCount === 1) {
                            // Only one item is selected, show the page
                            listControl.selection.getItems().done(function (items) {
                                var item = items[0];
                                if (item.data && item.data.SkillEntryLineVIEWID) {
                                    var newRecId = item.data.SkillEntryLineVIEWID;
                                    Log.print(Log.l.trace, "newRecId:" + newRecId + " curRecId:" + that.curRecId);
                                    if (newRecId !== 0 && newRecId !== that.curRecId) {
                                        AppData.generalData.setRecordId('SkillEntryLine', newRecId);
                                        if (that.curRecId) {
                                            that.prevRecId = that.curRecId;
                                        }
                                        if (that.curRecId !== 0) {
                                            that.saveData(function (response) {
                                                Log.print(Log.l.trace, "question saved");
                                                AppBar.triggerDisableHandlers();
                                            },
                                                function (errorResponse) {
                                                    Log.print(Log.l.error, "error saving question");
                                                });
                                        } else {
                                            AppBar.triggerDisableHandlers();
                                        }
                                        that.curRecId = newRecId;
                                        if (that.curRecId !== 0) {
                                            that.saveData(function (response) {
                                                Log.print(Log.l.trace, "question saved");
                                                AppBar.triggerDisableHandlers();
                                            },
                                                function (errorResponse) {
                                                    Log.print(Log.l.error, "error saving question");
                                                });
                                        } else {
                                            AppBar.triggerDisableHandlers();
                                        }
                                    }
                                }
                            });
                        }
                        //}
                    }
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Skillentry.Controller.");
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
                                layout = Application.QuestionListLayout.QuestionsLayout;
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
                            Colors.loadSVGImageElements(listView, "question-image", 28, Colors.textColor);
                            Colors.loadSVGImageElements(listView, "question-image-selected", 28, Colors.backgroundColor);

                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Skillentry.Controller.");
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
                    Log.call(Log.l.trace, "Skillentry.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;
                        if (visible && that.questions && that.nextUrl) {
                            that.loading = true;
                            if (progress && progress.style) {
                                progress.style.display = "inline";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "none";
                            }
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "calling select Skillentry.skilltypeskillsView...");
                            Skillentry._skillentryline_L.selectNext(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "Skillentry.skilltypeskillsView: success!");
                                // selectNext returns object already parsed from json file in response
                                if (json && json.d) {
                                    that.nextUrl = Skillentry._skillentryline_L.getNextUrl(json);
                                    var results = json.d.results;
                                    results.forEach(function (item) {
                                        //that.resultConverter(item);
                                        that.binding.count = that.questions.push(item);
                                    });
                                } else {
                                    that.nextUrl = null;
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
                            }, null, that.nextUrl);
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
                    Log.call(Log.l.trace, "Skillentry.Controller.");
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
                    return false;
                },
                clickForward: function () {
                    // never disabled!
                    return false;
                },
                clickLineUp: function () {
                    var ret = true;
                    if (that.curRecId && !that.prevRecId) {
                        var curScope = that.scopeFromRecordId(that.curRecId);
                        if (curScope && curScope.item &&
                            curScope.item.Sortierung > 1) {
                            ret = false;
                        }
                    }
                    return ret;
                },
                clickLineDown: function () {
                    var ret = true;
                    if (that.curRecId && !that.prevRecId) {
                        var curScope = that.scopeFromRecordId(that.curRecId);
                        if (curScope && curScope.item &&
                            curScope.item.Sortierung < that.binding.countSkills) {
                            ret = false;
                        }
                    }
                    return ret;
                }
            }

            // register ListView event handler
            if (listView) {
                listView.addEventListener("selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                listView.addEventListener("loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                listView.addEventListener("headervisibilitychanged", this.eventHandlers.onHeaderVisibilityChanged.bind(this));
                listView.addEventListener("footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                listView.addEventListener("iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
            }

            var loadData = function (mitarbeiterId) {
                Log.call(Log.l.trace, "Skillentry.Controller.", "mitarbeiterId=" + mitarbeiterId);
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return Skillentry._skillentryline_L.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "Skillentry._skillentryline_L: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.binding.countSkills = json.d.results.length;
                            that.nextUrl = Skillentry._skillentryline_L.getNextUrl(json);
                            var results = json.d.results;
                            var skilltypeid = results.SkillTypeID;
                            //results.forEach(function (item) {
                            //    that.resultConverter(item);
                            //});
                            // Now, we call WinJS.Binding.List to get the bindable list
                            that.questions = new WinJS.Binding.List(results);

                            if (listView.winControl) {
                                var trySetActive = function (element, scroller) {
                                    var success = true;
                                    // don't call setActive() if a dropdown control has focus!
                                    var comboInputFocus = element.querySelector(".win-dropdown:focus");
                                    if (!comboInputFocus) {
                                        try {
                                            if (typeof element.setActive === "function") {
                                                element.setActive();
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
                                // scroll-into-view when calling item.focus() in base.ls implementation
                                // by prevent the call of _ElementUtilities._setActive(item);
                                listView.winControl._setFocusOnItem = function ListView_setFocusOnItem(entity) {
                                    this._writeProfilerMark("_setFocusOnItem,info");
                                    if (this._focusRequest) {
                                        this._focusRequest.cancel();
                                    }
                                    if (this._isZombie()) {
                                        return;
                                    }
                                    var that = this;
                                    var setFocusOnItemImpl = function (item) {
                                        if (that._isZombie()) {
                                            return;
                                        }

                                        if (that._tabManager.childFocus !== item) {
                                            that._tabManager.childFocus = item;
                                        }
                                        that._focusRequest = null;
                                        if (that._hasKeyboardFocus && !that._itemFocused) {
                                            if (that._selection._keyboardFocused()) {
                                                that._drawFocusRectangle(item);
                                            }
                                            // The requestItem promise just completed so _cachedCount will
                                            // be initialized.
                                            if (entity.type === WinJS.UI.ObjectType.groupHeader || entity.type === WinJS.UI.ObjectType.item) {
                                                that._view.updateAriaForAnnouncement(item, (entity.type === WinJS.UI.ObjectType.groupHeader ? that._groups.length() : that._cachedCount));
                                            }

                                            // Some consumers of ListView listen for item invoked events and hide the listview when an item is clicked.
                                            // Since keyboard interactions rely on async operations, sometimes an invoke event can be received before we get
                                            // to WinJS.Utilities._setActive(item), and the listview will be made invisible. If that happens and we call item.setActive(), an exception
                                            // is raised for trying to focus on an invisible item. Checking visibility is non-trivial, so it's best
                                            // just to catch the exception and ignore it.
                                            that._itemFocused = true;
                                            trySetActive(item);
                                        }
                                    };

                                    if (entity.type === WinJS.UI.ObjectType.item) {
                                        this._focusRequest = this._view.items.requestItem(entity.index);
                                    } else if (entity.type === WinJS.UI.ObjectType.groupHeader) {
                                        this._focusRequest = this._groups.requestHeader(entity.index);
                                    } else {
                                        this._focusRequest = WinJS.Promise.wrap(entity.type === WinJS.UI.ObjectType.header ? this._header : this._footer);
                                    }
                                    this._focusRequest.then(setFocusOnItemImpl);
                                };


                                listView.winControl._supressScrollIntoView = true;
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.questions.dataSource;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                        MitarbeiterID: mitarbeiterId
                    });
                }).then(function () {
                    AppBar.notifyModified = true;
                    AppBar.triggerDisableHandlers();
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData(getRecordId());
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Record selected");
            });
            Log.ret(Log.l.trace);
        }, {
            nextUrl: null,
            recordId: null,
            loading: false,
            questions: null,
            prevRecId: 0,
            curRecId: 0,
            cursorPos: { x: 0, y: 0 }
        })
    });
})();
