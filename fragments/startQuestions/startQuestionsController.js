// controller for page: StartQuestions
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/startQuestions/startQuestionsService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("StartQuestions", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "StartQuestions.Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                questions: getEmptyDefaultValue(StartQuestions.questionView.defaultValue),
                anwsers: null
            }, options]);

            var that = this;

            var questionList = fragmentElement.querySelector("#questionButtonList.listview");
            var anwsersList = fragmentElement.querySelector("#answersList.listview");

            /*var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "StartQuestions.Controller.", "recordId=" + recordId);
                if (recordId && questionList && questionList.winControl && questionList.winControl.selection) {
                    if (fields) {
                        for (var i = 0; i < that.fields.length; i++) {
                            var field = that.fields.getAt(i);
                            if (field &&
                                typeof field === "object" &&
                                field.FragebogenVIEWID === recordId) {
                                questionList.winControl.selection.set(i);
                                break;
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            var scopeFromRecordId = function (recordId) {
                var i;
                Log.call(Log.l.trace, "StartQuestions.Controller.", "recordId=" + recordId);
                var item = null;
                for (i = 0; i < that.fields.length; i++) {
                    var field = that.fields.getAt(i);
                    if (field && typeof field === "object" &&
                        field.FragebogenVIEWID === recordId) {
                        item = field;
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
            */
            var resultConverter = function (item, index) {
                item.index = index;
                that.binding.questions.qbez = item.index + 1;
                if (item.SumAntwort === null) {
                    item.SumAntwort = 0;
                }
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, "StartQuestions.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return StartQuestions.questionView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "licenceView: success!");
                        // licenceUserView returns object already parsed from json file in response
                        if (json && json.d && json.d.results.length > 0) {
                            //that.nextUrl = StartQuestions.questionView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            //that.fields = results;
                            that.questions = new WinJS.Binding.List(results);
                            if (questionList.winControl) {
                                if (questionList.winControl.selectionMode !== WinJS.UI.SelectionMode.single) {
                                    questionList.winControl.selectionMode = WinJS.UI.SelectionMode.single;
                                }
                                // direct selection on each tap
                                if (questionList.winControl.tapBehavior !== WinJS.UI.TapBehavior.directSelect) {
                                    questionList.winControl.tapBehavior = WinJS.UI.TapBehavior.directSelect;
                                }
                                // add ListView dataSource
                                questionList.winControl.itemDataSource = that.questions.dataSource;
                                questionList.winControl.selection.set(0);
                            }
                        } else {
                            //that.nextUrl = null;
                            that.questions = null;
                            if (questionList.winControl) {
                                // add ListView dataSource
                                questionList.winControl.itemDataSource = null;
                            }
                        }
                        return WinJS.Promise.as();
                    },
                        function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            return WinJS.Promise.as();
                        },
                        {

                        });
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            // define handlers
            var eventHandlers = {
                onSelectionChanged: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    if (questionList && questionList.winControl) {
                        var listControl = questionList.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                listControl.selection.getItems().done(function(items) {
                                    var item = items[0];
                                    if (item.data && item.data.FragebogenVIEWID) {
                                        AppData.setErrorMsg(that.binding);
                                        AppData.call("PRC_SumAntwort",
                                            {
                                                pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                                                pFragenNr: parseInt(item.data.FragebogenVIEWID)

                                            },
                                            function(json) {
                                                Log.print(Log.l.info, "call success! ");
                                                AppBar.busy = false;
                                                var results = json.d.results;
                                                results.forEach(function(item, index) {
                                                    that.resultConverter(item, index);
                                                });
                                                that.anwsersList = new WinJS.Binding.List(results);
                                                if (anwsersList.winControl) {
                                                    // add ListView dataSource
                                                    anwsersList.winControl.itemDataSource =
                                                        that.anwsersList.dataSource;
                                                }
                                            },
                                            function(errorResponse) {
                                                Log.print(Log.l.error, "call error");
                                                AppBar.busy = false;
                                                AppData.setErrorMsg(that.binding, errorResponse);
                                            });
                                    }
                                });
                            }
                        }
                    }
                }
            }
            this.eventHandlers = eventHandlers;

            if (questionList) {
                this.addRemovableEventListener(questionList, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                // single list selection
            }

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {

        })
    });
})();