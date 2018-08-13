// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/optQuestionList/optQuestionListService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("OptQuestionList", {
        Controller: WinJS.Class.derive(Application.RecordsetController, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "OptQuestionList.Controller.");
            // ListView control
            var listView = pageElement.querySelector("#optQuestionList.listview");
            
            Application.RecordsetController.apply(this, [pageElement, {
                dataOptQuestionAnswer: getEmptyDefaultValue(OptQuestionList.CR_OptFragenAntwortenVIEW.defaultValue),
                count: 0
            }, commandList, false, OptQuestionList.CR_OptFragenAntwortenVIEW, null, listView]); // VIEW ändern

            this.optQuestions = null; // selektierte Frage
            this.initoptionQuestion = null; //optionale Frage
            this.optAnswer = []; // Antwort

            var that = this;

            //var comboInitFragengruppe = pageElement.querySelector("#InitFragenopt.win-dropdown");

            this.resultConverter = function (item, index) {
                Log.call(Log.l.trace, "OptQuestionList.Controller.");

                Log.ret(Log.l.trace, "");
            };

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
                Log.call(Log.l.trace, "OptQuestionList.Controller." + that.records);
                for (var i = 1; i <= item.Anzahl; i++) {
                    var answer = {};
                    if (item.FragenAntwortenVIEWID && item.FragenAntwortenVIEWID === parseInt(value)) {
                        if (i < 10) {
                            answer.antwort = item["Antwort0" + i];
                        } else {
                            answer.antwort = item["Antwort" + i];
                        }
                        answer.index = i;
                        that.optAnswer.push(answer);
                    } else {
                        continue;
                    }
                }
                Log.ret(Log.l.trace, "");
            }
            this.resultAnswerConverter = resultAnswerConverter;

            // get field entries
            var getFieldEntries = function (index) {
                Log.call(Log.l.trace, "OptQuestionList.Controller.");
                var ret = {};
                if (listView && listView.winControl) {
                    var element = listView.winControl.elementFromIndex(index);
                    if (element) {
                        var optQuestion = element.querySelector('#InitFragenopt');
                        var fragenId = parseInt(optQuestion.value);
                        ret["FragenID"] = fragenId;

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
                Log.call(Log.l.trace, "Products.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    var optFrage = {};
                    if (target.id === "InitFragenopt") {
                        optFrage.FragenID = target.value; // String
                        //that.binding.dataOptQuestionAnswer.FragenID = target.value;
                    } else if (target.id === "SelektFragenopt") {
                        optFrage.SelektierteFragenID = target.value;
                    } else if (target.id === "SelektAntwortopt") { // kommt nicht hin da es ein updateFall ist
                        optFrage.SortIndex = target.value;
                    }
                    return OptQuestionList.CR_OptFragenAntwortenVIEW.insert(function (json) {
                        AppBar.busy = false;
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.info, "ProduktView insert: success!");
                        AppBar.modified = false;
                        // ProduktView returns object already parsed from json file in response
                        that.loadData();
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
                Log.call(Log.l.trace, "optQuestionList.Controller.");
                var defaultQuestion = { CR_OptFragenAntwortenVIEWID: null, FragenID: 0, SelektierteFragenID: 0, SortIndex: 0, insertStatus: true };
                that.binding.count = that.records.push(defaultQuestion);
                listView.winControl.itemDataSource = that.records.dataSource;
            }
            this.insertDefaultQuestion = insertDefaultQuestion;

            var loadQuestion = function () {
                Log.call(Log.l.trace, "optQuestionList.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    that.initoptionQuestion = new WinJS.Binding.List([{ FragenAntwortenVIEWID: 0, Fragestellung: "" }]);
                    that.optQuestions = new WinJS.Binding.List([{ FragenAntwortenVIEWID: 0, Fragestellung: "" }]);
                    return OptQuestionList.questionListView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "contactView: success!");

                        if (json && json.d) {
                            //that.binding.count = json.d.results.length;
                            that.nextUrl = OptQuestionList.questionListView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.initoptionQuestion.push(item);
                                that.optQuestions.push(item);
                            });
                            /*if (comboInitFragengruppe && comboInitFragengruppe.winControl) {
                                comboInitFragengruppe.winControl.data = new WinJS.Binding.List(json.d.results);
                            }*/
                            Log.print(Log.l.trace, "Data loaded" + that.binding.dataOptQuestionAnswer);
                            Log.print(Log.l.trace, "Data loaded" + that.binding.InitoptionQuestionItem);
                            Log.print(Log.l.trace, "Data loaded" + that.initoptionQuestion);
                            Log.print(Log.l.trace, "Data loaded" + that.binding.count);
                        } else {
                            that.binding.count = 0;
                            that.nextUrl = null;

                            if (listView) {
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
                            }
                            that.loading = false;
                        }
                    },
                        function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                });
                Log.ret(Log.l.trace);
            }
            this.loadQuestion = loadQuestion;

            // define handlers
            this.eventHandlers = {
                changeOptionQuestion: function (event, index) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    that.optAnswer = [];
                    Log.print(Log.l.trace, "question saved" + index + "event.currentTarget.value:" + event.currentTarget.value + "Fragestellung" + event.currentTarget.textContent);
                    if (event.currentTarget && event.currentTarget.value) {
                        that.binding.showAnswers = true;
                        Log.print(Log.l.trace, "event changeOptionQuestion: value=" + event.currentTarget.value);
                        that.initoptionQuestion.forEach(function (item, index) {
                            that.resultAnswerConverter(item, index, event.currentTarget.value);

                        });
                        if (that.optAnswer) {
                            for (var y = 0; y < that.optAnswer.length; y++) {
                                var answer = that.optAnswer[y];
                                var element = listView.winControl.elementFromIndex(y);
                                if (element) {
                                    var comboSelektAntwortopt = element
                                        .querySelector("#SelektAntwortopt.win-dropdown");
                                    if (comboSelektAntwortopt && comboSelektAntwortopt.winControl) {
                                        if (that.optAnswer) {
                                            comboSelektAntwortopt.winControl.data = new WinJS.Binding
                                                .List(that.optAnswer);
                                        } else {
                                            comboSelektAntwortopt.winControl.data = new WinJS.Binding.List([]);
                                        }
                                    }
                                }
                            }
                        }
                        for (var i = 0; i < that.records.length; i++) {
                            if (that.records.getAt(i).CR_OptFragenAntwortenVIEWID) {
                                that.saveData(function (response) {
                                    AppBar.busy = false;
                                    Log.print(Log.l.trace, "question saved");
                                },
                                    function (errorResponse) {
                                        AppBar.busy = false;
                                        Log.print(Log.l.error, "error saving question");
                                    });
                            } else {
                                that.insertOptQuestion(event.currentTarget);
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                changeSelektedQuestion: function (event) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    if (event.currentTarget && event.currentTarget.value) {
                        for (var i = 0; i < that.records.length; i++) {
                            //if (that.records.getAt(i).FragenID === parseInt(event.currentTarget.value)) {
                                if (that.records.getAt(i).CR_OptFragenAntwortenVIEWID) {
                                    that.saveData(function (response) {
                                        AppBar.busy = false;
                                        Log.print(Log.l.trace, "question saved");
                                    },
                                        function (errorResponse) {
                                            AppBar.busy = false;
                                            Log.print(Log.l.error, "error saving question");
                                        });
                                } else {
                                    that.insertOptQuestion(event.currentTarget);
                                }
                            //}
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                changeSelektedAnswer: function (event) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    if (event.currentTarget && event.currentTarget.value) {
                        for (var i = 0; i < that.records.length; i++) {
                            if (that.records.getAt(i).CR_OptFragenAntwortenVIEWID) {
                                that.saveData(function (response) {
                                    AppBar.busy = false;
                                    Log.print(Log.l.trace, "question saved");
                                },
                                    function (errorResponse) {
                                        AppBar.busy = false;
                                        Log.print(Log.l.error, "error saving question");
                                    });
                            } else {
                                that.insertOptQuestion(event.currentTarget);
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickBack: function (event) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    that.insertDefaultQuestion();
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
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
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    var recordId = that.curRecId;
                    if (recordId) {
                        var curScope = that.scopeFromRecordId(that.curRecId);
                        if (curScope && curScope.item) {
                            var confirmTitle = getResourceText("questiongroup.labelDelete") + ": " + curScope.item.TITLE +
                                "\r\n" + getResourceText("questiongroup.questionDelete");
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
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                onPointerDown: function (e) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    that.cursorPos = { x: e.pageX, y: e.pageY };
                    mouseDown = true;
                    Log.ret(Log.l.trace);
                },
                onMouseDown: function (e) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    that.cursorPos = { x: e.pageX, y: e.pageY };
                    mouseDown = true;
                    Log.ret(Log.l.trace);
                },
                onPointerUp: function (e) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    mouseDown = false;
                    Log.ret(Log.l.trace);
                },
                onMouseUp: function (e) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    mouseDown = false;
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    that.selectionChanged().then(function () {
                        AppBar.triggerDisableHandlers();
                    });
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
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
                                layout = Application.OptQuestionListLayout.QuestionsLayout;
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
                                if (that.initoptionQuestion && that.optQuestions) {
                                    for (var i = 0; i < that.records.length; i++) {
                                        var item = that.records.getAt(i);
                                        if (item) {
                                            element = listView.winControl.elementFromIndex(i);
                                            if (element) {
                                                var comboInitFragengruppe = element.querySelector("#InitFragenopt.win-dropdown");
                                                if (comboInitFragengruppe && comboInitFragengruppe.winControl) {
                                                    if (!comboInitFragengruppe.winControl.data ||
                                                        comboInitFragengruppe.winControl.data && !comboInitFragengruppe.winControl.data.length) {
                                                        comboInitFragengruppe.winControl.data = that.initoptionQuestion;
                                                        comboInitFragengruppe.value = item.FragenID;
                                                    }
                                                    if (item.FragenID) {
                                                        // load the answer of optional Question
                                                        that.initoptionQuestion.forEach(function (questionItem, index) {
                                                            that.resultAnswerConverter(questionItem, index, item.FragenID);
                                                        });
                                                        if (that.optAnswer) {
                                                            for (var y = 0; y < that.optAnswer.length; y++) {
                                                                var answer = that.optAnswer[y];
                                                                //var element = listView.winControl.elementFromIndex(y);
                                                                if (element) {
                                                                    var comboSelektAntwortopt = element
                                                                        .querySelector("#SelektAntwortopt.win-dropdown");
                                                                    if (comboSelektAntwortopt && comboSelektAntwortopt.winControl) {
                                                                        if (that.optAnswer) {
                                                                            comboSelektAntwortopt.winControl.data = new WinJS.Binding
                                                                                .List(that.optAnswer);
                                                                        } else {
                                                                            comboSelektAntwortopt.winControl.data = new WinJS.Binding.List([]);
                                                                        }
                                                                        comboSelektAntwortopt.value = item.SortIndex;
                                                                    }
                                                                }
                                                            }
                                                        }

                                                    }
                                                }
                                                var comboSelektFragenopt = element.querySelector("#SelektFragenopt.win-dropdown");
                                                if (comboSelektFragenopt && comboSelektFragenopt.winControl) {
                                                    if (!comboSelektFragenopt.winControl.data ||
                                                        comboSelektFragenopt.winControl.data && !comboSelektFragenopt.winControl.data.length) {
                                                        comboSelektFragenopt.winControl.data = that.optQuestions;
                                                        comboSelektFragenopt.value = item.SelektierteFragenID;
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
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
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
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
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
                                Log.print(Log.l.trace, "OptQuestionList.CR_V_FragengruppeView: success!");
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
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
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
                    return AppBar.busy;
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

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Load Question");
                that.loadQuestion();
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



