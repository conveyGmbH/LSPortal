// controller for page: GenDataanswerHisto
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/genDataAnswers/genDataAnswersService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;
    
    WinJS.Namespace.define("GenDataAnswers", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
                Log.call(Log.l.trace, "GenDataanswerHisto.Controller.");
                Application.RecordsetController.apply(this, [pageElement, {
                    count: 0,
                    Anzahl: 0,
                    dataQuestion: "",
                    lang: 0,
                    answerid: 0
                }, commandList]);

                // ListView control
                var listView = pageElement.querySelector("#genDataAnswers.listview");
                var initSprache = pageElement.querySelector("#InitSprache");
                var questiongroup = pageElement.querySelector("#questiongroup");


                this.nextUrl = null;
                this.nextDocUrl = null;
                this.loading = false;
                this.answerData = null;
              
                this.firstanswerDataIndex = 0;

                var that = this;

                var mouseDown = false;
              
                this.dispose = function () {
                    if (listView && listView.winControl) {
                        listView.winControl.itemDataSource = null;
                    }
                    if (that.answerData) {
                        that.answerData = null;
                    }
                    listView = null;
                }

                var progress = null;
                var counter = null;
                var layout = null;

                var maxLeadingPages = 0;
                var maxTrailingPages = 0;
              
                var background = function (index) {
                    if (index % 2 === 0) {
                        return 1;
                    } else {
                        return null;
                    }
                };
                this.background = background;

                var setAnswers = function(count) {
                    Log.call(Log.l.trace, "QuestionList.Controller.", "count=" + count);
                    var questionid = that.getQuestionId();
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_GetAnswers", {
                        pQuestionID: questionid,
                        pLanguageSpecID: that.binding.lang,
                        pNumAnswers: count
                    }, function (json) {
                        Log.print(Log.l.info, "call success!");
                        that.getAnswers();
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                }
                this.setAnswers = setAnswers;

                var setAnswerCount = function (value) {
                    Log.call(Log.l.trace, "QuestionList.Controller.", "value=" + value);
                    that.binding.Anzahl = parseInt(value);
                    Log.ret(Log.l.trace);
                };
                this.setAnswerCount = setAnswerCount;

                this.inAnswerCountFromRange = false;
                var answerCountFromRange = function (range) {
                    Log.call(Log.l.trace, "QuestionList.Controller.", "range=" + range);
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
                                that.setAnswers(parseInt(value));
                                that.inAnswerCountFromRange = false;
                            });
                        } else {
                            that.inAnswerCountFromRange = false;
                        }
                    }
                    Log.ret(Log.l.trace);
                };
                this.answerCountFromRange = answerCountFromRange;

                var saveAnswer = function(answerid, answerdata) {
                    Log.call(Log.l.trace, "QuestionList.Controller.", "answerid=" + answerid);
                    AppData.setErrorMsg(that.binding);
                    var ret;
                    if (answerdata && AppBar.modified && !AppBar.busy) {
                        var recordId = answerid;
                        if (recordId) {
                            AppBar.busy = true;
                            ret = GenDataAnswers.answerTable.update(function (response) {
                                AppBar.busy = false;
                                // called asynchronously if ok
                                Log.print(Log.l.info, "contactData update: success!");
                                AppBar.modified = false;
                            }, function (errorResponse) {
                                AppBar.busy = false;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                }, recordId, answerdata).then(function () {
                                //load of format relation record data
                                Log.print(Log.l.trace, "calling select contactView...");
                            });
                        }
                    } else {
                        ret = new WinJS.Promise.as().then(function () {
                            if (typeof complete === "function") {
                                complete(answerdata);//dataContact
                            }
                        });
                    }
                    Log.ret(Log.l.trace);
                    return ret;
                }
                this.saveAnswer = saveAnswer;

                var getRestriction = function() {
                    var restriction = AppData.getRestriction("Kontakt");
                    if (!restriction) {
                        restriction = {};
                    }
                    return restriction;
                }
                this.getRestriction = getRestriction;

                var loadNextUrl = function (recordId) {
                    Log.call(Log.l.trace, "QuestionList.Controller.", "recordId=" + recordId);
                    if (that.answerData && that.nextUrl && listView) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        that.loading = true;
                        if (progress && progress.style) {
                            progress.style.display = "inline";
                        }
                        if (counter && counter.style) {
                            counter.style.display = "none";
                        }
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "calling select GenDataanswerHisto.personAdresseView...");
                        var nextUrl = that.nextUrl;
                        that.nextUrl = null;
                        GenDataAnswers.answerView.selectNext(function (json) { //json is undefined
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "GenDataanswerHisto.personAdresseView: success!");
                            // startContact returns object already parsed from json file in response
                            if (json && json.d && that.answerData) {
                                that.nextUrl = GenDataAnswers.answerView.getNextUrl(json);
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, that.binding.count);
                                    that.binding.count = that.answerData.push(item);
                                });
                            }
                            if (recordId) {
                                that.selectRecordId(recordId);
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            Log.print(Log.l.error, "GenDataanswerHisto.personAdresseView: error!");
                            AppData.setErrorMsg(that.binding, errorResponse);
                            if (progress && progress.style) {
                                progress.style.display = "none";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "inline";
                            }
                            that.loading = false;
                        }, null, nextUrl);
                    }
                    Log.ret(Log.l.trace);
                }
                this.loadNextUrl = loadNextUrl;

                var scopeFromRecordId = function (recordId) {
                    var i;
                    Log.call(Log.l.trace, "Questiongroup.Controller.", "recordId=" + recordId);
                    var item = null;
                    if (that.answerData) {
                        for (i = 0; i < that.answerData.length; i++) {
                            var answer = that.answerData.getAt(i);
                            if (answer && typeof answer === "object" &&
                                answer.AnswerVIEWID === recordId) {
                                item = answer;
                                break;
                            }
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

                var scrollToRecordId = function (recordId) {
                    Log.call(Log.l.trace, "QuestionList.Controller.", "recordId=" + recordId);
                    if (that.loading) {
                        WinJS.Promise.timeout(50).then(function () {
                            that.scrollToRecordId(recordId);
                        });
                    } else {
                        if (recordId && listView && listView.winControl && that.answerData) {
                            for (var i = 0; i < that.answerData.length; i++) {
                                var answer = that.answerData.getAt(i);
                                if (answer && typeof answer === "object" &&
                                    answer.AnswerVIEWID === recordId) {
                                    listView.winControl.indexOfFirstVisible = i - 1;
                                    break;
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                }
                this.scrollToRecordId = scrollToRecordId;

                var selectRecordId = function (recordId) {
                    var answer;
                    Log.call(Log.l.trace, "GenDataanswerHisto.Controller.", "recordId=" + recordId);
                    var recordIdNotFound = true;
                    if (recordId && listView && listView.winControl && listView.winControl.selection && that.answerData) {
                        for (var i = 0; i < that.answerData.length; i++) {
                            answer = that.answerData.getAt(i);
                            if (answer &&
                                typeof answer === "object" &&
                                answer.AnswerVIEWID === recordId) {
                                AppData.setRecordId("Kontakt", recordId);
                                listView.winControl.selection.set(i).done(function() {
                                    WinJS.Promise.timeout(50).then(function() {
                                        that.scrollToRecordId(recordId);
                                    });
                                });
                                recordIdNotFound = false;
                                break;
                            }
                        }
                        if (recordIdNotFound) {
                            that.loadNextUrl(recordId);
                        }
                    }
                    Log.ret(Log.l.trace);
                }
                this.selectRecordId = selectRecordId;

                var resultConverter = function (item, index) {
                    item.index = index;
                    if (item.QuestionGroupID) {
                        for (var i = 0; i < that.questiongroupdata.length; i++) {
                            if (item.QuestionGroupID === that.questiongroupdata[i].GroupText) {
                                item.QuestionGroupID = that.questiongroupdata[i].QuestionGroupVIEWID;
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                }
                this.resultConverter = resultConverter;

                var getAnswers = function() {
                    Log.call(Log.l.trace, "GenDataanswerHisto.Controller.");
                    var ret;
                    var lang = that.binding.lang;
                    if (lang) {
                        ret = GenDataAnswers.answerView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "questionnaireDocView: success!");
                            if (json && json.d && json.d.results && json.d.results.length) {
                                //that.nextUrl = EventsList.VeranstaltungView.getNextUrl(json);
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                that.binding.count = results.length;
                                that.binding.Anzahl = results.length;
                                that.answerData = new WinJS.Binding.List(results);
                                if (listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = that.answerData.dataSource;
                                }
                                Log.print(Log.l.trace, "Data loaded");

                            } else {
                                that.binding.count = 0;
                                that.binding.Anzahl = 0;
                                that.nextUrl = null;
                                that.records = null;
                                that.binding.lang = 0;
                                if (listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = null;
                                }
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
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            }, { LanguageSpecID: lang, QuestionID : that.getQuestionId() });
                    } else {
                        ret = new WinJS.Promise.as().then(function () {
                            that.binding.count = 0;
                            that.binding.Anzahl = 0;
                            that.nextUrl = null;
                            that.records = null;
                            that.binding.lang = 0;
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = null;
                            }
                            progress = listView.querySelector(".list-footer .progress");
                            counter = listView.querySelector(".list-footer .counter");
                            if (progress && progress.style) {
                                progress.style.display = "none";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "inline";
                            }
                            that.loading = false;
                        });
                    }
                    Log.ret(Log.l.trace);
                    return ret;
                }
                this.getAnswers = getAnswers;
            
                // define handlers
                this.eventHandlers = {
                    clickBack: function (event) {
                        Log.call(Log.l.trace, "GenDataanswerHisto.Controller.");
                        if (WinJS.Navigation.canGoBack === true) {
                            WinJS.Navigation.back(1).done();
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
                    onLanguageChange: function (event) {
                        Log.call(Log.l.trace, "QuestionList.Controller.");
                        that.binding.lang = parseInt(event.currentTarget.value);
                        that.getAnswers(that.binding.lang);
                        Log.ret(Log.l.trace);
                    },
                    onfocusoutQuestion: function(parameters) {
                        Log.call(Log.l.trace, "QuestionList.Controller.");
                        AppData.setErrorMsg(that.binding);
                        var ret;
                        var dataQuestion = that.binding.dataQuestion;
                        if (dataQuestion.QuestionGroupID) {
                            dataQuestion.QuestionGroupID = parseInt(dataQuestion.QuestionGroupID);
                        }
                        if (dataQuestion && AppBar.modified && !AppBar.busy) {
                            var recordId = that.getQuestionId();
                            if (recordId) {
                                AppBar.busy = true;
                                ret = GenDataAnswers.questionTable.update(function(response) {
                                        AppBar.busy = false;
                                        // called asynchronously if ok
                                        Log.print(Log.l.info, "dataQuestion update: success!");
                                        AppBar.modified = false;
                                        var master = Application.navigator.masterControl;
                                        if (master && master.controller && master.controller.binding) {
                                            master.controller.binding.questionId = that.binding.dataQuestion.QuestionVIEWID;
                                            master.controller.loadData().then(function () {
                                                //master.controller.loadData(master.controller.binding.employeeId).then(function () {
                                                master.controller.selectRecordId(master.controller.binding.questionId);
                                                //});
                                            });
                                        }
                                    },
                                    function(errorResponse) {
                                        AppBar.busy = false;
                                        // called asynchronously if an error occurs
                                        // or server returns response with an error status.
                                        AppData.setErrorMsg(that.binding, errorResponse);
                                    },
                                    recordId,
                                    dataQuestion);
                            }
                        } else {
                            ret = new WinJS.Promise.as().then(function () {
                                if (typeof complete === "function") {
                                    complete(dataQuestion);//dataContact
                                }
                            });
                        }
                        Log.ret(Log.l.trace);
                        return ret;
                    },
                    changedAnswerCount: function (event) {
                        Log.call(Log.l.trace, "QuestionList.Controller.");
                        if (event.target && AppBar.notifyModified) {
                            if (that.inAnswerCountFromRange) {
                                Log.print(Log.l.trace, "extra ignored");
                            } else {
                                that.inAnswerCountFromRange = true;
                                that.answerCountFromRange(event.target);
                            }
                        }
                        Log.ret(Log.l.trace);
                    },
                    clickNewQuestion: function (event) {
                        Log.call(Log.l.trace, "GenDataanswerHisto.Controller.");
                        AppBar.busy = true;
                        Log.print(Log.l.trace, "eployee saved");
                        var newQuestion = getEmptyDefaultValue(GenDataAnswers.questionTable.defaultValue);
                        //var newEmployee = copyByValue(Employee.employeeView.defaultValue);
                        GenDataAnswers.questionTable.insert(function (json) {
                            AppBar.busy = false;
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.info, "employeeView insert: success!");
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d) {
                                that.binding.dataQuestion = json.d;
                            }
                            AppBar.modified = true;
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "error inserting employee");
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                            }, newQuestion).then(function () {
                            /* Mitarbeiter Liste neu laden und Selektion auf neue Zeile setzen */
                            var master = Application.navigator.masterControl;
                            if (master && master.controller && master.controller.binding) {
                                master.controller.binding.questionId = that.binding.dataQuestion.QuestionVIEWID;
                                master.controller.loadData().then(function () {
                                    //master.controller.loadData(master.controller.binding.employeeId).then(function () {
                                    master.controller.selectRecordId(master.controller.binding.questionId);
                                    //});
                                });
                            }
                        });
                        Log.ret(Log.l.trace);
                    },
                    onfocusout: function(event) {
                        Log.call(Log.l.trace, "Questiongroup.Controller.");
                        var listControl = listView.winControl;
                        listControl.selection.getItems().done(function(items) {
                            var item = items[0];
                            if (item.data &&
                                item.data.AnswerVIEWID &&
                                item.data.AnswerVIEWID !== that.binding.answerid) {
                                var answerdata = {};
                                answerdata.AnswerText = item.data.AnswerText;
                                that.saveAnswer(item.data.AnswerVIEWID, item.data);
                            }
                        });
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
                    onLoadingStateChanged: function (eventInfo) {
                        Log.call(Log.l.trace, "GenDataanswerHisto.Controller.");
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
                                    layout = Application.GenDataAnswersLayout.GenDataAnswersLayout;
                                    listView.winControl.layout = { type: layout };
                                }
                            } else if (listView.winControl.loadingState === "itemsLoaded") {
                               
                                
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
                        Log.call(Log.l.trace, "GenDataanswerHisto.Controller.");
                        if (eventInfo && eventInfo.detail && listView) {
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
                        Log.call(Log.l.trace, "GenDataanswerHisto.Controller.");
                        if (listView) {
                            progress = listView.querySelector(".list-footer .progress");
                            counter = listView.querySelector(".list-footer .counter");
                            var visible = eventInfo.detail.visible;

                            if (visible && that.answerData && that.nextUrl) {
                                that.loadNextUrl();
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
                    }

                };

                this.disableHandlers = {
                    clickBack: function () {
                        if (WinJS.Navigation.canGoBack === true) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                }
                
                // register ListView event handler
            if (listView) {
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
                    this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                    this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                    this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                    this.addRemovableEventListener(listView, "focusout", this.eventHandlers.onfocusout.bind(this));
                }

                if (initSprache) {
                    this.addRemovableEventListener(initSprache, "change", this.eventHandlers.onLanguageChange.bind(this));
                }

                if (questiongroup) {
                    this.addRemovableEventListener(questiongroup, "mouseup", this.eventHandlers.onfocusoutQuestion.bind(this));
                }

                Log.print(Log.l.trace, "calling select GenDataanswerHisto.personAdresseView...");

                var getQuestionId = function () {
                    return GenDataAnswers._questionID;
                }
                that.getQuestionId = getQuestionId;

                var setQuestionId = function (value) {
                    Log.print(Log.l.trace, "personId=" + value);
                    GenDataAnswers._questionID = value;
                }
                that.setQuestionId = setQuestionId;

                var getAnswerId = function () {
                    return GenDataAnswers._answerId;
                }
                that.getAnswerId = getAnswerId;

                var setAnswerId = function (value) {
                    Log.print(Log.l.trace, "personId=" + value);
                    GenDataAnswers._answerId = value;
                }
                that.setAnswerId = setAnswerId;
            
            var loadData = function () {
                Log.call(Log.l.trace, "Contact.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!GenDataAnswers.initSpracheView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initSpracheView...");
                        //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                        return GenDataAnswers.initSpracheView.select(function (json) {
                            Log.print(Log.l.trace, "initSpracheView: success!");
                            if (json && json.d && json.d.results) {
                                var results = json.d.results;
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initSprache && initSprache.winControl) {
                                    initSprache.winControl.data = new WinJS.Binding.List(results);
                                }
                                initSprache.selectedIndex = 0;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initSprache && initSprache.winControl &&
                            (!initSprache.winControl.data || !initSprache.winControl.data.length)) {
                            var results = GenDataAnswers.initSpracheView.getResults();
                            initSprache.winControl.data = new WinJS.Binding.List(results);
                            initSprache.selectedIndex = 0;
                        }
                        if (initSprache && initSprache.winControl &&
                            (initSprache.winControl.data || initSprache.winControl.data.length)) {
                            initSprache.selectedIndex = 0;
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                        Log.print(Log.l.trace, "calling select questionGroupTable...");
                        //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                        return GenDataAnswers.questionGroupTable.select(function (json) {
                            Log.print(Log.l.trace, "questionGroupTable: success!");
                            if (json && json.d && json.d.results) {
                                var results = json.d.results;
                                that.questiongroupdata = results;
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (questiongroup && questiongroup.winControl) {
                                    questiongroup.winControl.data = new WinJS.Binding.List(results);
                                }
                                questiongroup.selectedIndex = 0;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                }).then(function () {
                    //load of format relation record data
                    Log.print(Log.l.trace, "calling select contactView...");
                    return GenDataAnswers.questionView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "contactView: success!");
                        if (json && json.d && json.d.results) {
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            
                            that.binding.dataQuestion = json.d.results[0];
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                }).then(function () {
                    that.getAnswers();
                }).then(function () {
                    AppBar.notifyModified = true;
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

                that.processAll().then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    that.loading = true;
                    return that.loadData();
                }).then(function () {
                    AppBar.notifyanswerified = true;
                    Log.print(Log.l.trace, "Record selected");
                });
                Log.ret(Log.l.trace);
        }, {
                cursorPos: { x: 0, y: 0 },
                indexold: 0,
                questiongroupdata: ""
        })
    });
})();




