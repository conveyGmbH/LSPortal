﻿// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/optMandatoryFieldList/optMandatoryFieldListService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("OptMandatoryFieldList", {
        Controller: WinJS.Class.derive(Application.RecordsetController, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
            // ListView control
            var listView = pageElement.querySelector("#optMandatoryFieldList.listview");

            Application.RecordsetController.apply(this, [pageElement, {
                dataOptQuestionAnswer: getEmptyDefaultValue(OptMandatoryFieldList.CR_OptFragenAntwortenVIEW.defaultValue),
                count: 0
            }, commandList, false, OptMandatoryFieldList.CR_OptFragenAntwortenVIEW, null, listView]);

            this.initQuestion = null; //selektierte Frage
            this.optAnswer = []; // Antwort
            this.initPflichtfeld = null; //KontaktFelder

            var that = this;

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
            }

            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var mouseDown = false;

            var resultAnswerConverter = function (item, index, value) {
                Log.call(Log.l.trace, "OptMandatoryFieldList.Controller." + value);
                if (item && item.FragenAntwortenVIEWID && item.FragenAntwortenVIEWID === value) {
                    for (var i = 1; i <= item.Anzahl; i++) {
                        var answer = {};
                        answer.antwort = i.toString() + ". ";
                        if (i < 10) {
                            answer.antwort += item["Antwort0" + i];
                        } else {
                            answer.antwort += item["Antwort" + i];
                        }
                        answer.index = i;
                        that.optAnswer.push(answer);
                    }
                }
                Log.ret(Log.l.trace, "");
            }
            this.resultAnswerConverter = resultAnswerConverter;

            var fillAnswer = function (value) {
                var questionId = parseInt(value);
                that.optAnswer = [];
                that.initQuestion.forEach(function (questionItem, index) {
                    that.resultAnswerConverter(questionItem, index, questionId);
                });
            }
            this.fillAnswer = fillAnswer;


            // get field entries
            var getFieldEntries = function (index) {
                Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                var ret = {};
                if (listView && listView.winControl) {
                    var element = listView.winControl.elementFromIndex(index);
                    if (element) {
                        var optQuestion = element.querySelector('#InitPFeldTyp');
                        var fragenId = parseInt(optQuestion.value);
                        ret["INITPFeldTypID"] = fragenId;

                        var selektedQuestion = element.querySelector('#SelektFragenopt');
                        var selektiertefragenId = parseInt(selektedQuestion.value);
                        ret["SelektierteFragenID"] = selektiertefragenId;

                        var selektedAnswer = element.querySelector('#SelektAntwortopt');
                        var sortindex = parseInt(selektedAnswer.value);
                        ret["SortIndex"] = sortindex;
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.getFieldEntries = getFieldEntries;

            var insertOptQuestion = function (target) {
                Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    var optFrage = {
                        SelektierteFragenID: null,
                        INITPFeldTypID: 0,
                        SortIndex: 0
                    };
                    if (target.id === "SelektFragenopt") { // kommt nicht hin da es ein updateFall ist
                        optFrage.SelektierteFragenID = parseInt(target.value);
                    } else if (target.id === "InitPFeldTyp" && parseInt(target.value)) {
                        optFrage.INITPFeldTypID = target.value; // String FragenID
                    } else if (target.id === "SelektAntwortopt") { // kommt nicht hin da es ein updateFall ist
                        optFrage.SortIndex = target.value;
                    }
                    AppBar.busy = true;
                    return that.tableView.insert(function (json) {
                        AppBar.busy = false;
                        AppBar.modified = false;
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.info, "record insert: success!");
                        // contactData returns object already parsed from json file in response
                        if (json && json.d) {
                            that.curRecId = that.tableView.getRecordId(json.d);
                            Log.print(Log.l.trace, "inserted recordId=" + that.curRecId);
                            AppData.setRecordId(that.tableView.relationName, that.curRecId);
                            that.loadData().then(function () {
                                that.selectRecordId(that.curRecId);
                            });
                        }
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error inserting product");
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, optFrage);
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.insertOptQuestion = insertOptQuestion;

            var insertDefaultQuestion = function () {
                Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                if (that.records) {
                    var defaultQuestion = { CR_PFFragenAntwortenVIEWID: null, INITPFeldTypID: 0, SelektierteFragenID: 0, SortIndex: 0, insertStatus: true };
                    that.binding.count = that.records.push(defaultQuestion);
                    that.listView.winControl.selection.set(that.records.length - 1);
                    AppBar.triggerDisableHandlers();
                }
                Log.ret(Log.l.trace);
            }
            this.insertDefaultQuestion = insertDefaultQuestion;

            var loadPflichtFeld = function () {
                Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                AppData.setErrorMsg(that.binding);
                that.initPflichtfeld = new WinJS.Binding.List([{ PflichtfeldTypID: 0, PflichtFeldTITLE: "" }]);
                var ret = OptMandatoryFieldList.mandatoryView.select(function (json) {
                    // this callback will be called asynchronously
                    // when the response is available
                    Log.print(Log.l.trace, "questionListView: success!");

                    if (json && json.d) {
                        that.binding.count = json.d.results.length;
                        that.nextUrl = OptMandatoryFieldList.mandatoryView.getNextUrl(json);
                        var results = json.d.results;
                        results.forEach(function (item, index) {
                            item.pflichtfeld = item.Sortierung + ". " + item.PflichtFeldTITLE;
                            that.initPflichtfeld.push(item);
                        });
                        Log.print(Log.l.trace, "Data loaded initPflichtfeld.count=" + that.initPflichtfeld.length);
                    }
                }, function (errorResponse) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    AppData.setErrorMsg(that.binding, errorResponse);
                }, {
                        LanguageSpecID: AppData.getLanguageId()
                    });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadPflichtFeld = loadPflichtFeld;

            var loadQuestion = function () {
                Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                AppData.setErrorMsg(that.binding);
                that.initQuestion = new WinJS.Binding.List([{ FragenAntwortenVIEWID: 0, frage: "" }]);
                var ret = OptMandatoryFieldList.questionListView.select(function (json) {
                    // this callback will be called asynchronously
                    // when the response is available
                    Log.print(Log.l.trace, "questionListView: success!");
                    if (json && json.d) {
                        that.binding.count = json.d.results.length;
                        that.nextUrl = OptMandatoryFieldList.questionListView.getNextUrl(json);
                        var results = json.d.results;
                        results.forEach(function (item, index) {
                            item.frage = item.Sortierung + ". " + item.Fragestellung;
                            that.initQuestion.push(item);
                        });
                        Log.print(Log.l.trace, "Data loaded initQuestion.count=" + that.initQuestion.length);
                    }
                }, function (errorResponse) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    AppData.setErrorMsg(that.binding, errorResponse);
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadQuestion = loadQuestion;

            // define handlers
            this.eventHandlers = {
                changeSelektedAnswer: function (event) {
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                    if (event.currentTarget && event.currentTarget.value) {
                        Log.print(Log.l.trace, "event changeSelektedAnswer: value=" + event.currentTarget.value + "Antwort=" + event.currentTarget.textContent);
                        AppBar.busy = true;
                        that.saveData(function (response) {
                            AppBar.busy = false;
                            Log.print(Log.l.trace, "question saved");
                        }, function (errorResponse) {
                            AppBar.busy = false;
                            Log.print(Log.l.error, "error saving question");
                        });
                    }
                    Log.ret(Log.l.trace);
                },
                changeSelektedQuestion: function (event) {
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                    if (event.currentTarget && event.currentTarget.value) {
                        var crossItem = that.records.getAt(that.currentlistIndex);
                        if (crossItem) {
                            //Cross Tabelle heisst sie SelektierteFragenID
                            if (crossItem.SelektierteFragenID === parseInt(event.currentTarget.value)) {
                                event.currentTarget.value = crossItem.FragenID;
                            }
                        }
                        if (event.currentTarget.value) {
                            if (crossItem && crossItem.CR_PFFragenAntwortenVIEWID) {
                                AppBar.busy = true;
                                that.saveData(function (response) {
                                    AppBar.busy = false;
                                    Log.print(Log.l.trace, "question saved");
                                }, function (errorResponse) {
                                    AppBar.busy = false;
                                    Log.print(Log.l.error, "error saving question");
                                });
                            } else {
                                that.insertOptQuestion(event.currentTarget);
                            }
                        }
                    }
                    if (event.currentTarget && event.currentTarget.value) {
                        Log.print(Log.l.trace, "event changeSelektedQuestion: value=" + event.currentTarget.value + "Fragestellung=" + event.currentTarget.textContent);
                        var crossItem = that.records.getAt(that.currentlistIndex);
                        if (crossItem) {
                            if (crossItem.FragenID === parseInt(event.currentTarget.value)) {
                                event.currentTarget.value = crossItem.SelektierteFragenID;
                            }
                            if (event.currentTarget.value !== crossItem.SelektierteFragenID) {
                                that.fillAnswer(event.currentTarget.value);
                                var element = listView.winControl.elementFromIndex(that.currentlistIndex);
                                if (element) {
                                    var comboSelektAntwortopt = element.querySelector("#SelektAntwortopt.win-dropdown");
                                    if (comboSelektAntwortopt && comboSelektAntwortopt.winControl) {
                                        if (that.optAnswer.length > 0) {
                                            comboSelektAntwortopt.winControl.data = new WinJS.Binding.List(that.optAnswer);
                                            comboSelektAntwortopt.value = that.optAnswer[0] ? that.optAnswer[0].index : 0;
                                        } else {
                                            comboSelektAntwortopt.winControl.data = new WinJS.Binding.List([{ index: 0, antwort: "" }]);
                                            comboSelektAntwortopt.value = 0;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                changePflichtfeld: function (event) {
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                    if (event.currentTarget && event.currentTarget.value) {
                        var crossItem = that.records.getAt(that.currentlistIndex);
                        if (crossItem) {
                            if (crossItem.INITPFeldTypID === parseInt(event.currentTarget.value)) {
                                event.currentTarget.value = crossItem.INITPFeldTypID;
                            }
                        }
                        if (event.currentTarget.value) {
                            if (crossItem && crossItem.CR_PFFragenAntwortenVIEWID) {
                                AppBar.busy = true;
                                that.saveData(function (response) {
                                    AppBar.busy = false;
                                    Log.print(Log.l.trace, "question saved");
                                }, function (errorResponse) {
                                    AppBar.busy = false;
                                    Log.print(Log.l.error, "error saving question");
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickBack: function (event) {
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                    that.insertDefaultQuestion();
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                    AppBar.busy = true;
                    that.saveData(function (response) {
                        AppBar.busy = false;
                        Log.print(Log.l.trace, "question saved");
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        Log.print(Log.l.error, "error saving question");
                    });
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                    var recordId = that.curRecId;
                    if (recordId) {
                        var curScope = that.scopeFromRecordId(that.curRecId);
                        if (curScope && curScope.item) {
                            var confirmTitle = getResourceText("optQuestionList.questionDelete");
                            confirm(confirmTitle, function (result) {
                                if (result) {
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
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                onPointerDown: function (e) {
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                    that.cursorPos = { x: e.pageX, y: e.pageY };
                    mouseDown = true;
                    Log.ret(Log.l.trace);
                },
                onMouseDown: function (e) {
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                    that.cursorPos = { x: e.pageX, y: e.pageY };
                    mouseDown = true;
                    Log.ret(Log.l.trace);
                },
                onPointerUp: function (e) {
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                    mouseDown = false;
                    Log.ret(Log.l.trace);
                },
                onMouseUp: function (e) {
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                    mouseDown = false;
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                    that.selectionChanged().then(function () {
                        AppBar.triggerDisableHandlers();
                    });
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
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
                                layout = Application.OptMandatoryFieldListLayout.QuestionsLayout;
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
                            var element;
                            if (that.records) {
                                if (that.initQuestion && that.initPflichtfeld) {
                                    for (var i = 0; i < that.records.length; i++) {
                                        var item = that.records.getAt(i);
                                        if (item) {
                                            element = listView.winControl.elementFromIndex(i);
                                            if (element) {
                                                var comboSelektFragenopt = element.querySelector("#SelektFragenopt.win-dropdown");
                                                if (comboSelektFragenopt && comboSelektFragenopt.winControl) {
                                                    if (!comboSelektFragenopt.winControl.data ||
                                                        comboSelektFragenopt.winControl.data && !comboSelektFragenopt.winControl.data.length) {
                                                        comboSelektFragenopt.winControl.data = that.initQuestion;
                                                        comboSelektFragenopt.value = item.SelektierteFragenID;
                                                    }
                                                    var comboSelektAntwortopt = element.querySelector("#SelektAntwortopt.win-dropdown");
                                                    if (comboSelektAntwortopt && comboSelektAntwortopt.winControl) {
                                                        if (!comboSelektAntwortopt.winControl.data ||
                                                            comboSelektAntwortopt.winControl.data && !comboSelektAntwortopt.winControl.data.length) {
                                                            if (item.SelektierteFragenID) {
                                                                // load the answer of optional Question
                                                                that.fillAnswer(item.SelektierteFragenID);
                                                                if (that.optAnswer.length > 0) {
                                                                    comboSelektAntwortopt.winControl.data = new WinJS.Binding.List(that.optAnswer);
                                                                } else {
                                                                    comboSelektAntwortopt.winControl.data = new WinJS.Binding.List([{ index: 0, antwort: "" }]);
                                                                }
                                                                comboSelektAntwortopt.value = item.SortIndex;
                                                            }
                                                        }
                                                    }
                                                }
                                                var comboInitFragengruppe = element.querySelector("#InitPFeldTyp.win-dropdown");
                                                if (comboInitFragengruppe && comboInitFragengruppe.winControl) {
                                                    if (!comboInitFragengruppe.winControl.data ||
                                                        comboInitFragengruppe.winControl.data &&
                                                        !comboInitFragengruppe.winControl.data.length) {
                                                        comboInitFragengruppe.winControl.data = that.initPflichtfeld;
                                                        comboInitFragengruppe.value = item.INITPFeldTypID;
                                                    }
                                                }

                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
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
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
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
                                Log.print(Log.l.trace, "OptMandatoryFieldList.CR_OptFragenAntwortenVIEW: success!");
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
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
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
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
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
                    var bHasNew = false;
                    if (that.records && that.records.length > 0) {
                        var item = that.records.getAt(that.records.length - 1);
                        if (item && !item.CR_PFFragenAntwortenVIEWID) {
                            bHasNew = true;
                        }
                    }
                    return bHasNew || AppBar.busy;
                },
                clickOk: function () {
                    return !that.curRecId || AppBar.busy;
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
            this.baseSaveData = this.saveData;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                var ret = that.baseSaveData(function (result) {
                    AppData.getUserData();
                    if (typeof complete === "function") {
                        complete(result);
                    }
                }, error);
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            /*this.baseLoadData = this.loadData;

            var loadData = function (restriction, options, itemRenderer, complete, error) {
                Log.call(Log.l.trace, "OptMandatoryFieldList.Controller.");
                var ret = that.baseLoadData(restriction, options, itemRenderer, complete, error).then(function () {
                    if (that.records &&
                        that.records.length > 0 &&
                        that.initPflichtfeld &&
                        that.initPflichtfeld.length > 0) {
                        function setPflichtfeldTitle(crossItem, index) {
                            for (var j = 0; j < that.initPflichtfeld.length; j++) {
                                var mandatoryField = that.initPflichtfeld.getAt(j);
                                if (mandatoryField && mandatoryField.PflichtfeldTypID === crossItem.INITPFeldTypID) {
                                    crossItem.pflichtfeld = mandatoryField.PflichtFeldTITLE;
                                    that.records.setAt(index, crossItem);
                                    break;
                                }
                            }
                        }
                        for (var i = 0; i < that.records.length; i++) {
                            var item = that.records.getAt(i);
                            if (item) {
                                setPflichtfeldTitle(item, i);
                            }
                        };
                    }
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;*/

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Load Question");
                return that.loadQuestion();
            }).then(function () {
                Log.print(Log.l.trace, "Load PflichtFeld");
                return that.loadPflichtFeld();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
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



