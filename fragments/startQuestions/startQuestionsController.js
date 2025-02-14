﻿// controller for page: StartQuestions
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/startQuestions/startQuestionsService.js" />
/// <reference path="~/www/lib/jqPlot/scripts/jquery.jqplot.js" />
/// <reference path="~/www/lib/jqPlot/scripts/plugins/jqplot.barRenderer.js" />
/// <reference path="~/www/lib/jqPlot/scripts/plugins/jqplot.CategoryAxisRenderer.js" />
/// <reference path="~/www/lib/jqPlot/scripts/plugins/jqplot.categoryAxisRenderer.min.js" />
/// <reference path="~/www/lib/jqPlot/scripts/plugins/jqplot.canvasAxisTickRenderer.js" />
/// <reference path="~/www/lib/jqPlot/scripts/plugins/jqplot.highlighter.min.js" />

(function () {
    "use strict";

    var namespaceName = "StartQuestions";

    WinJS.Namespace.define("StartQuestions", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                qbez: 0
            }]);
            var pageBinding = AppBar.scope && AppBar.scope.binding;
            var that = this;
            this.answerdata = null;
            this.anwsersquestiontext = [];
            this.anwserssumantwort = [];
            this.anwsercount = 0;

            var questionList = fragmentElement.querySelector("#questionButtonList.listview");

            /*var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                if (recordId && questionList && questionList.winControl && questionList.winControl.selection) {
                    if (fields) {
                        for (var i = 0; i < that.fields.length; i++) {
                            var field = that.fields.getAt(i);
                            if (field &&
                                typeof field === "object" &&
                                field.VeranstaltungVIEWID === recordId) {
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
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                var item = null;
                for (i = 0; i < that.fields.length; i++) {
                    var field = that.fields.getAt(i);
                    if (field && typeof field === "object" &&
                        field.VeranstaltungVIEWID === recordId) {
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

            var tooltipformater = function(tooltiptext) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                Log.ret(Log.l.trace);
                return tooltiptext[0] + " , " + tooltiptext[1];
            }
            this.tooltipformater = tooltipformater;

            this.answerChart = null;
            this.barChartWidth = 0;
            //this.employeetitle = that.title("Start.employeechart");
            this.answerChartArray = [];
            this.answerdata = [];
            this.answerdataID = [];
            this.answerticks = [];
            var answerResult = null, ei = 0, el = 0;
            var showanswerChart = function (barChartId, bAnimated) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(pageBinding);
                var questionWithMostAnswser = Math.max.apply(Math, answerResult.map(function (answer) { return answer.SumAntwort; }));
                WinJS.Promise.timeout(0).then(function () {
                    if (!that.answerdata || !that.answerdata.length) {
                        Log.print(Log.l.trace, "extra ignored");
                    } else {
                        var answerBarChart = fragmentElement.querySelector("#" + barChartId);
                        if (answerBarChart) {
                            var width = answerBarChart.clientWidth;
                            if (that.barChartWidth !== width) {
                                that.barChartWidth = width;
                                var series = [];
                                var ticks = [];
                                var tooltip = [];
                                if (that.answerdata && that.answerdata.length > 0) {
                                    for (var i = 0; i < that.answerdata.length; i++) {
                                        var row = that.answerdata[i];
                                        series[i] = [row.AntwortText, row.SumAntwort];
                                        tooltip[i] = [row.AntwortText];
                                        ticks[i] = i;
                                    }
                                }
                                if (answerBarChart.style) {
                                    if (that.answerdata.length === 2) {
                                        answerChart.style.height = (that.answerdata.length * 60 + 108).toString() + "px";
                                    } else {
                                        answerChart.style.height = (that.answerdata.length * 60 + 48).toString() + "px";
                                    }
                                }
                                var seriesColors = [
                                    Colors.dashboardColor
                                ];
                                try {
                                    answerBarChart.innerHTML = "";
                                    var rendererOptions = {
                                        barDirection: "vertical"
                                    };
                                    if (bAnimated) {
                                        rendererOptions.animation = {
                                            speed: 500
                                        };
                                    }
                                    $.jqplot.config.enablePlugins = true;
                                    that.answerChart = $.jqplot(barChartId, [that.anwserssumantwort], {
                                        title: that.answertitle,
                                        grid: {
                                            drawBorder: false,
                                            drawGridlines: false,
                                            background: "transparent",
                                            shadow: false
                                        },
                                        animate: bAnimated,
                                        seriesDefaults: {
                                            renderer: $.jqplot.BarRenderer,
                                            rendererOptions: rendererOptions,
                                            shadow: false,
                                            pointLabels: {
                                                show: true
                                            }
                                        },
                                        axes: {
                                            yaxis: {
                                                min: 0,
                                                tickInterval: questionWithMostAnswser > 2000 ? 500 : (questionWithMostAnswser > 100 ? 100 : (questionWithMostAnswser > 50 ? 50 : (questionWithMostAnswser > 20 ? 5 : 1))),
                                                tickOptions: {
                                                    formatString: '%d',
                                                    textColor: Colors.textColor
                                                }
                                            },
                                            xaxis: {
                                                renderer: $.jqplot.CategoryAxisRenderer,
                                                ticks: that.anwsersquestiontext,
                                                tickOptions: {
                                                    showGridline: false,
                                                    markSize: 0,
                                                    textColor: Colors.textColor
                                                }
                                            }
                                        },
                                        tickOptions: {
                                            fontSize: '10pt'
                                        },
                                        highlighter: {
                                            tooltipContentEditor: function (series, seriesIndex, pointIndex, plot) {
                                                //return that.tooltipformater(plot.data[seriesIndex][pointIndex]);
                                                var antwort = that.answerdata[pointIndex].AntwortText;
                                                var anzahl = that.answerdata[pointIndex].SumAntwort;

                                                var html = "<div class = 'tooltip'>Antwort : ";
                                                html += antwort;
                                                html += "  <br>Anzahl : ";
                                                html += anzahl;
                                                html += "  </div>";

                                                return html;
                                            },

                                            // other options just for completeness
                                            show: true,
                                            showTooltip: true,
                                            tooltipFade: true,
                                            sizeAdjust: 10,
                                            formatString: '%s',
                                            tooltipLocation: 'n',
                                            useAxesFormatters: false,
                                            tooltipOffset: 14
                                        },
                                        seriesColors: seriesColors,
                                        legend: {
                                            show: false
                                        }
                                    });
                                } catch (ex) {
                                    Log.print(Log.l.error, "exception occurred: " + ex.message);
                                    AppData.setErrorMsg(pageBinding, ex.message);
                                }
                            }
                        }
                    }
                });
                Log.ret(Log.l.trace);
            };
            this.showanswerChart = showanswerChart;

            var resultAnwserConverter = function (item, index) {
                item.index = index;
                if (item.FragenText) {
                    if (item.SumAntwort === null) {
                        item.SumAntwort = 0;
                        that.anwserssumantwort.push(item.SumAntwort);
                    } else {
                        that.anwserssumantwort.push(item.SumAntwort);
                    }
                    if (item.AntwortText) {
                        var count = item.AntwortText.length;
                        var ename;
                        if (that.anwsercount <= 4) {
                            if (count > 15) {
                                ename = item.AntwortText.slice(0, 15);
                                that.anwsersquestiontext.push(ename + "..");
                            } else {
                                that.anwsersquestiontext.push(item.AntwortText);
                            }
                        } else {
                            if (count > 9) {
                                ename = item.AntwortText.slice(0, 9);
                                that.anwsersquestiontext.push(ename + "..");
                            } else {
                                that.anwsersquestiontext.push(item.AntwortText);
                          }
                        }
                    }
                    
                }
            }
            this.resultAnwserConverter = resultAnwserConverter;

            var resultConverter = function (item, index) {
                item.index = index;
                item.buttonColor = Colors.dashboardColor;
                item.buttonTitle = Colors.tileTextColor;
                if (item.SumAntwort === null) {
                    item.SumAntwort = 0;
                }
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var eventId = AppBar.scope.getEventId();
                that.questions = null;
                that.binding.qbez = 0;
                AppData.setErrorMsg(pageBinding);
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
                            that.binding.qbez = results.length;
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
                                that.anwsersquestiontext = [];
                                that.anwserssumantwort = [];
                                that.answerdata = [];
                                that.answerticks = [];
                                that.answerdataID = [];
                                if (that.answerChart) {
                                    that.answerChart.destroy();
                                }
                            }
                        }
                        return WinJS.Promise.as();
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(pageBinding, errorResponse);
                        return WinJS.Promise.as();
                        }, { VeranstaltungVIEWID: eventId });
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            // define handlers
            var eventHandlers = {
                onSelectionChanged: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (questionList && questionList.winControl) {
                        var listControl = questionList.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    if (item.data && item.data.VeranstaltungVIEWID) {
                                        AppData.setErrorMsg(pageBinding);
                                        that.answerdata = [];
                                        that.answerticks = [];
                                        that.answerdataID = [];
                                        AppData.call("PRC_SumAntwort", {
                                            pVeranstaltungID: AppBar.scope.getEventId(),
                                            pFragenNr: parseInt(item.data.FragenNr)
                                        }, function (json) {
                                            Log.print(Log.l.info, "call success! ");
                                            if (json.d.results.length > 0) {
                                            AppBar.busy = false;
                                            that.anwsersquestiontext = [];
                                            that.anwserssumantwort = [];
                                            var results = json.d.results;
                                            that.anwsercount = results.length;
                                            answerResult = results;
                                            results.forEach(function (item, index) {
                                                that.resultAnwserConverter(item, index);
                                            });
                                            that.answerdata = results;
                                            that.barChartWidth = 0;
                                            that.showanswerChart("answerChart", true);
                                            } else {
                                                if (that.answerChart) {
                                                    that.answerChart.destroy();
                                                }
                                            }
                                        }, function (errorResponse) {
                                            Log.print(Log.l.error, "call error");
                                            AppBar.busy = false;
                                            AppData.setErrorMsg(pageBinding, errorResponse);
                                        });
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
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
            answer: null,
            answerchart: null
        })
    });
})();
