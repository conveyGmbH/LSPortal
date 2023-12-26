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
            Log.call(Log.l.trace, "GenDataAnswers.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataQuestion: getEmptyDefaultValue(GenDataAnswers.questionView.defaultValue),
                answerCount: 0,
                languageId: 0
            }, commandList]);

            // ListView control
            var initSprache = pageElement.querySelector("#InitSprache");
            var questionGroup = pageElement.querySelector("#questiongroup");

            var that = this;

            var getRecordId = function () {
                var recordId = null;
                Log.call(Log.l.trace, "GenDataAnswers.Controller.");
                var master = Application.navigator.masterControl;
                if (master && master.controller) {
                    recordId = master.controller.curRecId;
                }
                Log.ret(Log.l.trace, recordId);
                return recordId;
            }
            this.getRecordId = getRecordId;

            var setAnswerCount = function (value) {
                Log.call(Log.l.trace, "GenDataAnswers.Controller.", "value=" + value);
                that.binding.answerCount = parseInt(value);
                Log.ret(Log.l.trace);
            };
            this.setAnswerCount = setAnswerCount;

            var createAnswers = function () {
                Log.call(Log.l.trace, "GenDataAnswers.Controller.", "answerCount=" + that.binding.answerCount);
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_GetAnswers", {
                    pQuestionID: getRecordId(),
                    pLanguageSpecID: that.binding.languageId,
                    pNumAnswers: that.binding.answerCount
                }, function (json) {
                    Log.print(Log.l.info, "call success!");
                }, function (error) {
                    Log.print(Log.l.error, "call error");
                }).then(function() {
                    var genFragAnswersFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("genFragAnswers"));
                    if (genFragAnswersFragmentControl && genFragAnswersFragmentControl.controller) {
                        return genFragAnswersFragmentControl.controller.loadData();
                    } else {
                        return WinJS.Promise.as();
                    }
                });
            }
            this.createAnswers = createAnswers;

            this.inAnswerCountFromRange = false;
            var answerCountFromRange = function (range) {
                Log.call(Log.l.trace, "GenDataAnswers.Controller.", "range=" + range);
                if (that.mouseDown) {
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
                            that.createAnswers();
                            that.inAnswerCountFromRange = false;
                        });
                    } else {
                        that.inAnswerCountFromRange = false;
                    }
                }
                Log.ret(Log.l.trace);
            };
            this.answerCountFromRange = answerCountFromRange;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "GenDataAnswers.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "employee saved");
                        that.loadData();
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee");
                    });
                    Log.ret(Log.l.trace);
                },
                changedQuestion: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "employee saved");
                        that.loadData();
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee");
                    });
                    Log.ret(Log.l.trace);
                },
                changedLanguage: function (event) {
                    Log.call(Log.l.trace, "GenDataAnswers.Controller.");
                    if (event && event.currentTarget) {
                        that.binding.languageId = parseInt(event.currentTarget.value);
                        that.createAnswers();
                    }
                    Log.ret(Log.l.trace);
                },
                changedQuestionGroup: function (event) {
                    Log.call(Log.l.trace, "GenDataAnswers.Controller.");
                    if (event && event.currentTarget && that.binding.dataQuestion) {
                        that.binding.dataQuestion.QuestionGroupID = parseInt(event.currentTarget.value);
                        that.saveData();
                    }
                    Log.ret(Log.l.trace);
                },
                changedAnswerCount: function (event) {
                    Log.call(Log.l.trace, "GenDataAnswers.Controller.");
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
                clickNew: function (event) {
                    Log.call(Log.l.trace, "GenDataAnswers.Controller.");
                    AppData.setErrorMsg(that.binding);
                    that.insertData().then(function () {
                        AppBar.triggerDisableHandlers();
                    });
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "GenDataAnswers.Controller.");
                    var confirmTitle = getResourceText("genDataAnswers.questionDelete");
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "clickDelete: user choice OK");
                            that.deleteData().then(function () {
                                AppBar.triggerDisableHandlers();
                            });
                        } else {
                            Log.print(Log.l.trace, "clickDelete: user choice CANCEL");
                        }
                    });
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
                clickOk: function () {
                    return AppBar.busy;
                },
                clickDelete: function () {
                    if (that.binding.dataQuestion &&
                        that.binding.dataQuestion.QuestionVIEWID) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

            var resizeGenFragAnswers = function () {
                var ret = null;
                Log.call(Log.l.u1, "GenDataAnswers.Controller.");
                var genFragAnswersFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("genFragAnswers"));
                if (genFragAnswersFragmentControl &&
                    genFragAnswersFragmentControl.controller) {
                    if (genFragAnswersFragmentControl.controller.binding &&
                        genFragAnswersFragmentControl.controller.binding.loadingState !== "complete") {
                        ret = WinJS.Promise.timeout(20).then(function () {
                            return that.resizeGenFragAnswers();
                        });
                        Log.ret(Log.l.u1, "listview layout not yet completed");
                        return ret;
                    }
                }
                var genFragAnswersHost = pageElement.querySelector("#genfraganswershost");
                ret = WinJS.Promise.timeout(0).then(function () {
                    if (genFragAnswersHost &&
                        genFragAnswersHost.style &&
                        genFragAnswersFragmentControl &&
                        genFragAnswersFragmentControl._element) {
                        var genFragAnswersHeaderContainer =
                            genFragAnswersFragmentControl._element.querySelector(".win-headercontainer");
                        var genFragAnswersSurface =
                            genFragAnswersFragmentControl._element.querySelector(".win-surface");
                        var genFragAnswersFooterContainer =
                            genFragAnswersFragmentControl._element.querySelector(".win-footercontainer");
                        var height = (genFragAnswersHeaderContainer ? genFragAnswersHeaderContainer.offsetHeight : 0) +
                            (genFragAnswersSurface ? genFragAnswersSurface.offsetHeight : 0) +
                            (genFragAnswersFooterContainer ? genFragAnswersFooterContainer.offsetHeight : 0) + 8;
                        genFragAnswersHost.style.height = height.toString() + "px";
                    }
                    return WinJS.Promise.timeout(0);
                }).then(function () {
                    if (genFragAnswersFragmentControl &&
                        typeof genFragAnswersFragmentControl.updateLayout === "function") {
                        genFragAnswersFragmentControl.prevWidth = 0;
                        genFragAnswersFragmentControl.prevHeight = 0;
                        genFragAnswersFragmentControl.updateLayout.call(genFragAnswersFragmentControl, genFragAnswersFragmentControl._element);
                    }
                });
                Log.ret(Log.l.u1);
                return ret;
            }
            this.resizeGenFragAnswers = resizeGenFragAnswers;

            var loadData = function (recordId) {
                Log.call(Log.l.trace, "GenDataAnswers.Controller.", "recordId=" + recordId);
                AppData.setErrorMsg(that.binding);
                if (!recordId) {
                    recordId = getRecordId();
                }
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
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (!that.binding.languageId) {
                        that.binding.languageId = 1031;
                    }
                    Log.print(Log.l.trace, "calling select questionGroupTable...");
                    //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                    return GenDataAnswers.questionGroupTable.select(function (json) {
                        Log.print(Log.l.trace, "questionGroupTable: success!");
                        if (json && json.d && json.d.results) {
                            var results = json.d.results;
                            // Now, we call WinJS.Binding.List to get the bindable list
                            if (questionGroup && questionGroup.winControl) {
                                questionGroup.winControl.data = new WinJS.Binding.List(results);
                            }
                            questionGroup.selectedIndex = -1;
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                }).then(function () {
                    if (recordId) {
                        Log.print(Log.l.trace, "calling select questionView...");
                        return GenDataAnswers.questionView.select(function (json) {
                            Log.print(Log.l.trace, "questionView: success!");
                            if (json && json.d) {
                                that.binding.dataQuestion = json.d;
                                that.binding.answerCount = that.binding.dataQuestion.NumAnswers;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, recordId);
                    } else {
                        return WinJS.Promise.as();
                    }
                    //load of format relation record data
                }).then(function () {
                    var genFragAnswersFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("genFragAnswers"));
                    if (genFragAnswersFragmentControl && genFragAnswersFragmentControl.controller) {
                        return genFragAnswersFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#genfraganswershost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "genFragAnswers", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    AppBar.notifyModified = true;
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            // save data
            var saveData = function (complete, error) {
                var errorMessage;
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = getRecordId();
                var dataQuestion = that.binding.dataQuestion;
                if (!dataQuestion || !AppBar.modified || !recordId) {
                    Log.ret(Log.l.error, "not modified");
                    return new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete(dataQuestion);
                        }
                    });
                }
                if (AppBar.busy) {
                    Log.ret(Log.l.error, "busy - try again...");
                    return WinJS.Promise.timeout(100).then(function () {
                        return that.saveData(complete, error);
                    });
                }
                AppBar.busy = true;
                var ret = GenDataAnswers.questionView.update(function (response) {
                    // called asynchronously if ok
                    Log.print(Log.l.info, "questionView update: success!");
                }, function (errorResponse) {
                    AppBar.busy = false;
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    AppData.getErrorMsgFromErrorStack(errorResponse);
                    //AppData.setErrorMsg(that.binding, errorResponse);
                    if (typeof error === "function") {
                        error(errorResponse);
                    }
                }, recordId, dataQuestion).then(function () {
                    AppBar.modified = false;
                    AppBar.busy = false;
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        master.controller.loadData(recordId).then(function () {
                            if (typeof complete === "function") {
                                complete(dataQuestion);
                            }
                        });
                    } else {
                        if (typeof complete === "function") {
                            complete(dataQuestion);
                        }
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            var insertData = function (complete, error) {
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                AppBar.busy = true;
                AppData.setErrorMsg(that.binding);
                var ret = that.saveData(function (response) {
                    Log.print(Log.l.trace, "record saved");
                    var newDataQuestion = getEmptyDefaultValue(GenDataAnswers.questionView.defaultValue);
                    return GenDataAnswers.questionView.insert(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.info, "record insert: success!");
                        // contactData returns object already parsed from json file in response
                        AppBar.busy = false;
                        var recordId = null;
                        if (json && json.d) {
                            recordId = GenDataAnswers.questionView.getRecordId(json.d);
                            Log.print(Log.l.trace, "inserted recordId=" + recordId);
                            var master = Application.navigator.masterControl;
                            if (master && master.controller) {
                                master.controller.curRecId = recordId;
                                master.controller.loadData().then(function () {
                                    if (typeof complete === "function") {
                                        complete(dataQuestion);
                                    }
                                });
                            } else {
                                if (typeof complete === "function") {
                                    complete(dataQuestion);
                                }
                            }
                        } else {
                            if (typeof complete === "function") {
                                complete(dataQuestion);
                            }
                        }
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        if (typeof error === "function") {
                            error(errorResponse);
                        } else {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }
                        }, newDataQuestion);
                }, function (errorResponse) {
                    AppBar.busy = false;
                    if (typeof error === "function") {
                        error(errorResponse);
                    } else {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }
                });
                Log.ret(Log.l.trace, ret);
                return ret;
            }
            this.insertData = insertData;

            var deleteData = function (complete, error) {
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                var recordId = getRecordId();
                AppBar.busy = true;
                AppData.setErrorMsg(that.binding);
                var ret = GenDataAnswers.questionView.deleteRecord(function (response) {
                    AppBar.busy = false;
                    // called asynchronously if ok
                    that.binding.dataQuestion = getEmptyDefaultValue(GenDataAnswers.questionView.defaultValue);
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        master.controller.curRecId = null;
                        master.controller.loadData().then(function () {
                            if (typeof complete === "function") {
                                complete(that.binding.dataQuestion);
                            }
                        });
                    } else {
                        if (typeof complete === "function") {
                            complete(that.binding.dataQuestion);
                        }
                    }
                }, function (errorResponse) {
                    AppBar.busy = false;
                    if (typeof error === "function") {
                        error(errorResponse);
                    } else {
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
                        AppData.setErrorMsg(that.binding, message);
                    }
                }, recordId);
                Log.ret(Log.l.trace, ret);
                return ret;
            }
            this.deleteData = deleteData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Record selected");
            });
            Log.ret(Log.l.trace);
        }, {
        })
    });
})();




