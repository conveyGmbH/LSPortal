// controller for page: StartQuestions
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/diaVisitors/diaVisitorsService.js" />
/// <reference path="~/www/lib/chartJS/scripts/dist/Chart.js" />
/// <reference path="~/www/lib/chartJS/scripts/dist/Chart.bundle.js" />
(function () {
    "use strict";

    WinJS.Namespace.define("DiaVisitors", {
        Controller: WinJS.Class.derive(Fragments.Controller,
            function Controller(fragmentElement, options) {
                Log.call(Log.l.trace, "DiaVisitors.Controller.");
                Fragments.Controller.apply(this,
                    [
                        fragmentElement, {
                            hour: getResourceText("diaVisitors.hour"),
                            day: getResourceText("diaVisitors.day"),
                            dayhourflag: 1
                            }
                    ]);

                var that = this;

                this.visitorChart = null;

                var dayhourswitch = fragmentElement.querySelector("#showHourDay");

                //Date convertion
                var getDateObject = function (dateData) {
                    var ret;
                    if (dateData) {
                        var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                        var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                        if (that.binding.dayhourflag === 1) {
                            ret = new Date(milliseconds).toLocaleDateString();
                        } else {
                            ret = new Date(milliseconds).toLocaleTimeString().slice(0, -3);
                        }
                        //.toLocaleString('de-DE').substr(0, 10);
                    } else {
                        ret = "";
                    }
                    return ret;
                };
                this.getDateObject = getDateObject;

                // visitorChartData
                var visitorChartDataLabels = [];
                var visitorChartDataRaw = [];
                var visitorChartDatabackgroundColor = [];
                var visitorChartDataborderColor = [];


                var visitorChartData = {
                    labels: visitorChartDataLabels,
                    datasets: [{
                        label: visitorChartDataLabels,
                        data: visitorChartDataRaw,
                        backgroundColor: [
                            visitorChartDatabackgroundColor
                        ],
                        borderColor: [
                            visitorChartDataborderColor
                        ]
                    }]
                };

                //visitorChart
                var createvisitorChart = function() {
                    Log.call(Log.l.trace, "DiaVisitors.Controller.");
                    that.visitorChart = new Chart(fragmentElement.querySelector("#visitorChart"), {
                        type: 'bar',
                        data: visitorChartData,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            "hover": {
                                "animationDuration": 0
                            },
                            "animation": {
                                "duration": 1,
                                "onComplete": function () {
                                    var chartInstance = this.chart,
                                        ctx = chartInstance.ctx;

                                    ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'bottom';

                                    this.data.datasets.forEach(function (dataset, i) {
                                        var meta = chartInstance.controller.getDatasetMeta(i);
                                        meta.data.forEach(function (bar, index) {
                                            var data = dataset.data[index];
                                            ctx.fillText(data, bar._model.x, bar._model.y);
                                        });
                                    });
                                }
                            },
                            legend: {
                                "display": false
                            },
                            tooltips: {
                                "enabled": false
                            },
                            scales: {
                                yAxes: [{
                                    display: false,
                                    gridLines: {
                                        display: false
                                    },
                                    ticks: {
                                        max: Math.max(visitorChartDataRaw.length) + 10,
                                        display: false,
                                        beginAtZero: true
                                    }
                                }],
                                xAxes: [{
                                    gridLines: {
                                        display: false
                                    },
                                    ticks: {
                                        beginAtZero: true
                                    }
                                }]
                            }
                        }
                    });
                    Log.ret(Log.l.trace);
                }
                this.createvisitorChart = createvisitorChart;

                var redraw = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    that.visitorChart.data.labels = visitorChartDataLabels;
                    that.visitorChart.data.datasets[0].data = visitorChartDataRaw;
                    that.visitorChart.data.datasets[0].backgroundColor = visitorChartDatabackgroundColor;
                    that.visitorChart.data.datasets[0].borderColor = visitorChartDataborderColor;
                    that.visitorChart.update();
                }
                this.redraw = redraw;

                var resultConverter = function (item, index) {
                    item.index = index;
                    if (item.NumHits > 0) {
                        visitorChartDataLabels.push(that.getDateObject(item.IntervalStart));
                        visitorChartDataRaw.push(item.NumHits);
                        visitorChartDatabackgroundColor.push(Colors.dashboardColor);
                        visitorChartDataborderColor.push(Colors.dashboardColor);
                    }
                }
                this.resultConverter = resultConverter;
                
                var getGetDashboardVisitorData = function (interval, startday, endday) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    visitorChartDataLabels = [];
                    visitorChartDataRaw = [];
                    AppData.call("PRC_GetDashTimeline", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pIntervalHours: interval,
                        pStartTS: startday,
                        pEndTS: endday
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var results = json.d.results;
                        results.forEach(function (item, index) {
                            that.resultConverter(item, index);
                        });
                        if (that.visitorChart) {
                            that.redraw();
                        } else {
                            that.createvisitorChart();
                            that.redraw();
                        }

                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                }
                this.getGetDashboardVisitorData = getGetDashboardVisitorData;

                this.eventHandlers = {
                    changedTime: function (event) {
                        Log.call(Log.l.trace, "Contact.Controller.");
                        if (dayhourswitch.winControl.checked === true) {
                            that.binding.dayhourflag = 1;
                            that.getGetDashboardVisitorData(24, 0, 0);
                        } else {
                            that.binding.dayhourflag = 0;
                            that.getGetDashboardVisitorData(1, 0, 0);
                        }
                        Log.ret(Log.l.trace);
                    }
                };


                if (dayhourswitch) {
                    this.addRemovableEventListener(dayhourswitch, "change", this.eventHandlers.changedTime.bind(this));
                }

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                //return getGetDashboardVisitorData(24, 0, 0);
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
            
            })
    });
})();