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
                count: 0,
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic,
                serviceUrl: "https://" + getResourceText("general.leadsuccessservicelink"),
                imageUrl: "'../../images/" + getResourceText("general.leadsuccessbasicimage"),
                mailUrl: "mailto:multimedia-shop@messefrankfurt.com"
            }, commandList, false, OptQuestionList.CR_OptFragenAntwortenVIEW, null, listView]); // VIEW ändern

            this.optQuestions = null; // selektierte Frage
            this.initoptionQuestion = null; //optionale Frage
            this.optAnswer = []; // Antwort

            var that = this;

            var layout = null;

            var resultAnswerConverter = function (item, index, value) {
                Log.call(Log.l.trace, "OptQuestionList.Controller." + value);
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

            var fillOptAnswer = function (value) {
                var questionId = parseInt(value);
                that.optAnswer = [];
                that.initoptionQuestion.forEach(function (questionItem, index) {
                    that.resultAnswerConverter(questionItem, index, questionId);
                });
            }
            this.fillOptAnswer = fillOptAnswer;


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
                    if (target.id === "InitFragenopt" && parseInt(target.value)) {
                        optFrage.FragenID = target.value; // String
                    } else if (target.id === "SelektFragenopt") { // kommt nicht hin da es ein updateFall ist
                        optFrage.SelektierteFragenID = target.value;
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
                            Log.print(Log.l.trace, "inserted recordId=" + that.curRecIdd);
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
                Log.call(Log.l.trace, "optQuestionList.Controller.");
                if (that.records) {
                    var defaultQuestion = { CR_OptFragenAntwortenVIEWID: null, FragenID: 0, SelektierteFragenID: 0, SortIndex: 0, insertStatus: true };
                    that.binding.count = that.records.push(defaultQuestion);
                    that.listView.winControl.selection.set(that.records.length - 1);
                    AppBar.triggerDisableHandlers();
                }
                Log.ret(Log.l.trace);
            }
            this.insertDefaultQuestion = insertDefaultQuestion;

            var loadQuestion = function () {
                Log.call(Log.l.trace, "optQuestionList.Controller.");
                AppData.setErrorMsg(that.binding);
                that.initoptionQuestion = new WinJS.Binding.List([{ FragenAntwortenVIEWID: 0, frage: "" }]);
                that.optQuestions = new WinJS.Binding.List([{ FragenAntwortenVIEWID: 0, frage: "" }]);
                var ret = OptQuestionList.questionListView.select(function (json) {
                    // this callback will be called asynchronously
                    // when the response is available
                    Log.print(Log.l.trace, "questionListView: success!");

                    if (json && json.d) {
                        that.binding.count = json.d.results.length;
                        that.nextUrl = OptQuestionList.questionListView.getNextUrl(json);
                        var results = json.d.results;
                        results.forEach(function (item, index) {
                            item.frage = item.Sortierung + ". " + item.Fragestellung;
                            that.initoptionQuestion.push(item);
                            that.optQuestions.push(item);
                        });
                        Log.print(Log.l.trace, "Data loaded initoptionQuestion.count=" + that.initoptionQuestion.length);
                    }
                },
                    function (errorResponse) {
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
                changeSelectedAnswer: function (event) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    if (event.currentTarget && event.currentTarget.value) {
                        Log.print(Log.l.trace, "event changeSelectedAnswer: value=" + event.currentTarget.value + "Antwort=" + event.currentTarget.textContent);
                        AppBar.busy = true;
                        that.saveData(function (response) {
                            AppBar.busy = false;
                            Log.print(Log.l.trace, "question saved");
                        },
                            function (errorResponse) {
                                AppBar.busy = false;
                                Log.print(Log.l.error, "error saving question");
                            });
                    }
                    Log.ret(Log.l.trace);
                },
                changeSelectedQuestion: function (event) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    if (event.currentTarget && event.currentTarget.value) {
                        Log.print(Log.l.trace, "event changeSelectedQuestion: value=" + event.currentTarget.value + "Fragestellung=" + event.currentTarget.textContent);
                        var crossItem = that.records.getAt(that.currentlistIndex);
                        if (crossItem) {
                            if (crossItem.FragenID === parseInt(event.currentTarget.value)) {
                                event.currentTarget.value = crossItem.SelektierteFragenID;
                            }
                            if (event.currentTarget.value !== crossItem.SelektierteFragenID) {
                                that.fillOptAnswer(event.currentTarget.value);
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
                                if (event.currentTarget.value) {
                                    AppBar.busy = true;
                                    that.saveData(function (response) {
                                        AppBar.busy = false;
                                        Log.print(Log.l.trace, "question saved");
                                    },
                                        function (errorResponse) {
                                            AppBar.busy = false;
                                            Log.print(Log.l.error, "error saving question");
                                        });
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                changeOptionQuestion: function (event) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    if (event.currentTarget && event.currentTarget.value) {
                        var crossItem = that.records.getAt(that.currentlistIndex);
                        if (crossItem) {
                            if (crossItem.SelektierteFragenID === parseInt(event.currentTarget.value)) {
                                event.currentTarget.value = crossItem.FragenID;
                            } else {
                                for (var i = 0; i < that.records.length; i++) {
                                    if (i !== that.currentlistIndex) {
                                        var otherCrossItem = that.records.getAt(i);
                                        if (otherCrossItem.FragenID === parseInt(event.currentTarget.value)) {
                                            event.currentTarget.value = crossItem.FragenID;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if (event.currentTarget.value) {
                            if (crossItem && crossItem.CR_OptFragenAntwortenVIEWID) {
                                AppBar.busy = true;
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
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    Application.navigateById("publish", event);
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
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.OptQuestionListLayout.QuestionsLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            if (that.records) {
                                if (that.initoptionQuestion && that.optQuestions) {
                                    for (var i = 0; i < that.records.length; i++) {
                                        var item = that.records.getAt(i);
                                        if (item) {
                                            var element = listView.winControl.elementFromIndex(i);
                                            if (element) {
                                                var comboSelektFragenopt = element.querySelector("#SelektFragenopt.win-dropdown");
                                                if (comboSelektFragenopt && comboSelektFragenopt.winControl) {
                                                    if (!comboSelektFragenopt.winControl.data ||
                                                        comboSelektFragenopt.winControl.data && !comboSelektFragenopt.winControl.data.length) {
                                                        comboSelektFragenopt.winControl.data = that.initoptionQuestion;
                                                        comboSelektFragenopt.value = item.SelektierteFragenID;
                                                    }
                                                    var comboSelektAntwortopt = element.querySelector("#SelektAntwortopt.win-dropdown");
                                                    if (comboSelektAntwortopt && comboSelektAntwortopt.winControl) {
                                                        if (!comboSelektAntwortopt.winControl.data ||
                                                            comboSelektAntwortopt.winControl.data && !comboSelektAntwortopt.winControl.data.length) {
                                                            if (item.SelektierteFragenID) {
                                                                // load the answer of optional Question
                                                                that.fillOptAnswer(item.SelektierteFragenID);
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
                                                var comboInitFragengruppe = element.querySelector("#InitFragenopt.win-dropdown");
                                                if (comboInitFragengruppe && comboInitFragengruppe.winControl) {
                                                    if (!comboInitFragengruppe.winControl.data ||
                                                        comboInitFragengruppe.winControl.data &&
                                                        !comboInitFragengruppe.winControl.data.length) {
                                                        comboInitFragengruppe.winControl.data = that.optQuestions;
                                                        comboInitFragengruppe.value = item.FragenID;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    that.loadingStateChanged(eventInfo);
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible && that.nextUrl) {
                            that.loadNext();
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "OptQuestionList.Controller.");
                    that.setFocusOnItemInvoked(eventInfo);
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
                    var bHasNew = false;
                    if (AppHeader.controller.binding.userData.SiteAdmin ||
                        AppData._persistentStates.leadsuccessBasic) {
                        if (that.records && that.records.length > 0) {
                            var item = that.records.getAt(that.records.length - 1);
                            if (item && !item.CR_PFFragenAntwortenVIEWID) {
                                bHasNew = true;
                            }
                        }
                        return bHasNew || AppBar.busy;
                    } else {
                        return true;
                    }
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

            this.baseSaveData = this.saveData;
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "OptQuestionList.Controller.");
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

            this.baseLoadData = this.loadData;
            var loadData = function (restriction, options, itemRenderer, complete, error) {
                Log.call(Log.l.trace, "OptQuestionList.Controller.");
                var ret = that.baseLoadData(restriction, options, itemRenderer, complete, error).then(function () {
                    if (that.records &&
                        that.records.length > 0 &&
                        that.optQuestions &&
                        that.optQuestions.length > 0) {
                        function setQuestionTitle(crossItem, index) {
                            for (var j = 0; j < that.optQuestions.length; j++) {
                                var optQuestion = that.optQuestions.getAt(j);
                                if (optQuestion && optQuestion.FragenAntwortenVIEWID === crossItem.FragenID) {
                                    crossItem.frage = optQuestion.frage;
                                    that.records.setAt(index, crossItem);
                                    break;
                                }
                            }
                        }
                        for (var i = 0; i < that.records.length; i++) {
                            var item = that.records.getAt(i);
                            if (item) {
                                setQuestionTitle(item, i);
                            }
                        };
                    }
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Load Question");
                return that.loadQuestion();
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



