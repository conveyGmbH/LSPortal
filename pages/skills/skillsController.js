﻿// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/skills/skillsService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("Skills", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Skills.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                questionId: AppData.generalData.getRecordId("SkillTypeSkills")
            }, commandList]);

            var that = this;

            var input = pageElement.querySelectorAll('.win-range');

            // ListView control
            var listView = pageElement.querySelector("#skillsList.listview");


            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var mouseDown = false;

            var resultConverter = function (item) {
                var key = "Line";
                for (var j = 1; j <= 28; j++) {
                    if (j <= item.Anzahl) {
                        item[key + j.toString()] = 1;
                    } else {
                        item[key + j.toString()] = null;
                    }
                }
            }
            this.resultConverter = resultConverter;

            // get field entries
            var getFieldEntries = function (index, type) {
                Log.call(Log.l.trace, "skillsController.");
                var ret = {};
                if (listView && listView.winControl) {
                    var element = listView.winControl.elementFromIndex(index);
                    if (element) {
                        var i, key;
                        var fields = element.querySelectorAll('input[type="text"]');
                        ret["TITLE"] = fields[0].value;
                        for (i = 1; i < fields.length; i++) {
                            if (i < 10) {
                                key = "Skills0" + i.toString();
                            } else {
                                key = "Skills" + i.toString();
                            }
                            ret[key] = fields[i].value;
                        }
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.getFieldEntries = getFieldEntries;

            var mergeRecord = function (prevRecord, newRecord) {
                Log.call(Log.l.trace, "skillsController.");
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

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "Skills.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    for (var i = 0; i < that.questions.length; i++) {
                        var question = that.questions.getAt(i);
                        if (question && typeof question === "object" &&
                            question.SkillTypeSkillsVIEWID === recordId) {
                            listView.winControl.selection.set(i);
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            var scopeFromRecordId = function (recordId) {
                var i;
                Log.call(Log.l.trace, "Skills.Controller.", "recordId=" + recordId);
                var item = null;
                for (i = 0; i < that.questions.length; i++) {
                    var question = that.questions.getAt(i);
                    if (question && typeof question === "object" &&
                        question.SkillTypeSkillsVIEWID === recordId) {
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

            var setAnswerCount = function (value) {
                Log.call(Log.l.trace, "Skills.Controller.", "value=" + value);
                if (that.curRecId && !that.prevRecId) {
                    var curScope = that.scopeFromRecordId(that.curRecId);
                    if (curScope && curScope.item &&
                        value !== curScope.item.Anzahl) {
                        curScope.item.Anzahl = value;
                        that.resultConverter(curScope.item);
                        that.questions.setAt(curScope.index, curScope.item);
                        AppBar.modified = true;
                    }
                }
                Log.ret(Log.l.trace);
            };
            this.setAnswerCount = setAnswerCount;

            this.inAnswerCountFromRange = false;
            var answerCountFromRange = function (range) {
                Log.call(Log.l.trace, "Skills.Controller.", "range=" + range);
                if (mouseDown) {
                    Log.print(Log.l.trace, "mouseDown is set!");
                    WinJS.Promise.timeout(250).then(function () {
                        that.answerCountFromRange(range);
                    });
                } else {
                    if (range) {
                        var value = range.value;
                        Log.print(Log.l.trace, "value=", value);
                        WinJS.Promise.timeout(50).then(function () {
                            that.setAnswerCount(value);
                            that.inAnswerCountFromRange = false;
                        });
                    } else {
                        that.inAnswerCountFromRange = false;
                    }
                }
                Log.ret(Log.l.trace);
            };
            this.answerCountFromRange = answerCountFromRange;

            var deleteData = function () {
                Log.call(Log.l.trace, "Skills.Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = that.curRecId;
                if (recordId) {
                    AppBar.busy = true;
                    Skills.skilltypeskillsView.deleteRecord(function (response) {
                        AppBar.busy = false;
                        // called asynchronously if ok
                        that.loadData();
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, recordId);
                }
                Log.ret(Log.l.trace);
            };
            this.deleteData = deleteData;

            var saveData = function (complete, error) {
                var ret = null;
                Log.call(Log.l.trace, "Skills.Controller.");
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
                            ret = Skills.skilltypeskillsView.update(function (response) {
                                Log.print(Log.l.info, "skilltypeskillsView update: success!");
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
                    Log.call(Log.l.trace, "Skills.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "Skills.Controller.");
                    that.saveData(function (response) {
                        AppBar.busy = true;
                        Skills.skilltypeskillsView.insert(function (json) {
                            AppBar.busy = false;
                            // called asynchronously if ok
                            Log.print(Log.l.info, "skilltypeskillsView insert: success!");
                            that.loadData();
                        }, function (errorResponse) {
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving question");
                    });
                    Log.ret(Log.l.trace);
                },
                clickForward: function (event) {
                    Log.call(Log.l.trace, "Skills.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "question saved");
                        that.loadData();
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving question");
                    });
                    Log.ret(Log.l.trace);
                },
                clickLineUp: function (event) {
                    Log.call(Log.l.trace, "Skills.Controller.");
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
                    Log.call(Log.l.trace, "Skills.Controller.");
                    if (that.curRecId && !that.prevRecId) {
                        var curScope = that.scopeFromRecordId(that.curRecId);
                        if (curScope && curScope.item &&
                            curScope.item.Sortierung < that.binding.count) {
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
                changedAnswerCount: function (event) {
                    Log.call(Log.l.trace, "Skills.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        if (that.inAnswerCountFromRange) {
                            Log.print(Log.l.trace, "extra ignored");
                        } else {
                            that.inAnswerCountFromRange = true;
                            that.answerCountFromRange(event.currentTarget);
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "Skills.Controller.");
                    var recordId = that.curRecId;
                    if (recordId) {
                        var curScope = that.scopeFromRecordId(that.curRecId);
                        if (curScope && curScope.item) {
                            var confirmTitle = Skills.resources.labelDelete + ": " + curScope.item.Fragestellung +
                                "\r\n" + Skills.resources.questionDelete;
                            confirm(confirmTitle, function (result) {
                                if (result) {
                                    Log.print(Log.l.trace, "clickDelete: user choice OK");
                                    that.deleteData(function (response) {
                                        // delete OK 
                                        that.loadData();
                                    }, function (errorResponse) {
                                        // delete ERROR
                                        var message = null;
                                        Log.print(Log.l.error, "error status=" + errorResponse.status + " statusText=" + errorResponse.statusText);
                                        if (errorResponse.data && errorResponse.data.error) {
                                            Log.print(Log.l.error, "error code=" + errorResponse.data.error.code);
                                            if (errorResponse.data.error.message) {
                                                Log.print(Log.l.error, "error message=" + errorResponse.data.error.message.value);
                                                message = errorResponse.data.error.message.value;
                                            }
                                        }
                                        if (!message) {
                                            message = getResourceText("error.delete");
                                        }
                                        alert(message);
                                    });
                                } else {
                                    Log.print(Log.l.trace, "clickDelete: user choice CANCEL");
                                }
                            });
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Skills.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Skills.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                onPointerDown: function (e) {
                    Log.call(Log.l.trace, "Skills.Controller.");
                    that.cursorPos = { x: e.pageX, y: e.pageY };
                    mouseDown = true;
                    Log.ret(Log.l.trace);
                },
                onMouseDown: function (e) {
                    Log.call(Log.l.trace, "Skills.Controller.");
                    that.cursorPos = { x: e.pageX, y: e.pageY };
                    mouseDown = true;
                    Log.ret(Log.l.trace);
                },
                onPointerUp: function (e) {
                    Log.call(Log.l.trace, "Skills.Controller.");
                    mouseDown = false;
                    Log.ret(Log.l.trace);
                },
                onMouseUp: function (e) {
                    Log.call(Log.l.trace, "Skills.Controller.");
                    mouseDown = false;
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Skills.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    if (item.data && item.data.SkillTypeSkillsVIEWID) {
                                        var newRecId = item.data.SkillTypeSkillsVIEWID;
                                        Log.print(Log.l.trace, "newRecId:" + newRecId + " curRecId:" + that.curRecId);
                                        if (newRecId !== 0 && newRecId !== that.curRecId) {
                                            AppData.generalData.setRecordId('SkillTypeSkills', newRecId);
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
                    Log.call(Log.l.trace, "Skills.Controller.");
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
                                layout = Application.SkillsListLayout.SkillsLayout;
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
                    Log.call(Log.l.trace, "Skills.Controller.");
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
                    Log.call(Log.l.trace, "Skills.Controller.");
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
                            Log.print(Log.l.trace, "calling select Skills.skilltypeskillsView...");
                            var nextUrl = that.nextUrl;
                            that.nextUrl = null;
                            Skills.skilltypeskillsView.selectNext(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "Skills.skilltypeskillsView: success!");
                                // selectNext returns object already parsed from json file in response
                                if (json && json.d) {
                                    that.nextUrl = Skills.skilltypeskillsView.getNextUrl(json);
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
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "Skills.Controller.");
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
                    // allow only up to 5 skill types!
                    if (that.binding.count >= 5) {
                        return true;
                    } else {
                        return false;
                    }
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
                            curScope.item.Sortierung < that.binding.count) {
                            ret = false;
                        }
                    }
                    return ret;
                },
                clickDelete: function () {
                    var ret = true;
                    if (that.curRecId && !that.prevRecId) {
                        var curScope = that.scopeFromRecordId(that.curRecId);
                        if (curScope && curScope.item &&
                            that.binding.count > 1) {
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

            var loadData = function () {
                Log.call(Log.l.trace, "Skills.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return Skills.skilltypeskillsView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "Skills.questionListView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.binding.count = json.d.results.length;
                            that.nextUrl = Skills.skilltypeskillsView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item) {
                                that.resultConverter(item);
                            });
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
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                return that.selectRecordId(that.binding.questionId);
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Record selected");
            });
            Log.ret(Log.l.trace);
        }, {
            nextUrl: null,
            loading: false,
            questions: null,
            prevRecId: 0,
            curRecId: 0,
            cursorPos: { x: 0, y: 0 }
        })
    });
})();
