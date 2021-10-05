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
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.js" />
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
                            dayhourflag: "0"
                            }
                    ]);

                var that = this;
                this.isSupreme = AppData._userData.IsSupreme;

                this.visitorChart = null;

                var dayhourcombo = fragmentElement.querySelector("#dayhourdropdown");
                var daycombo = fragmentElement.querySelector("#daydropdown");
                var select = fragmentElement.querySelectorAll("select");

                var surpremebarcolor = "#cc5b87";

                var titlecategorys = [{ TITLE: getResourceText("diaVisitors.day"), VALUE: 1 }, { TITLE: getResourceText("diaVisitors.hour"), VALUE: 0 }];

                if (dayhourcombo && dayhourcombo.winControl) {
                    dayhourcombo.winControl.data = new WinJS.Binding.List(titlecategorys);
                    dayhourcombo.selectedIndex = 0;
                }

                var dropdowncolor = function () {
                    for (var i = 0; i < select.length; i++) {
                        select[i].style.backgroundColor = "#efedee ";
                    }
                    daycombo.style.backgroundColor = "#efedee ";
                    daycombo.value = moment().format("YYYY-MM-DD");
                }
                this.dropdowncolor = dropdowncolor;

                var getDayHourData = function () {
                    Log.call(Log.l.trace, "DiaVisitors.Controller.");
                    var interval = parseInt(that.binding.dayhourflag);
                    if (interval === 0) {
                        return 1;
                    } else {
                        return 24;
                    }
                }
                this.getDayHourData = getDayHourData;

                //Date convertion
                var getDateObject = function (dateData) {
                    var ret;
                    if (dateData) {
                        var interval = parseInt(that.binding.dayhourflag);
                        var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                        var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                        if (interval === 1) {
                            ret = new Date(milliseconds).toLocaleDateString();
                        } else {
                            moment().locale("de");
                            ret = moment(milliseconds).format("HH:mm");//new Date(milliseconds).toLocaleTimeString().slice(0, -3);
                            
                        }
                        //.toLocaleString('de-DE').substr(0, 10);
                    } else {
                        ret = "";
                    }
                    return ret;
                };
                this.getDateObject = getDateObject;

                var formatDate = function (date, startend) {
                    if (startend === 1) {
                        var d = new Date(date),
                            month = '' + (d.getMonth() + 1),
                            day = '' + d.getDate(),
                            year = d.getFullYear();

                        if (month.length < 2)
                            month = '0' + month;
                        if (day.length < 2)
                            day = '0' + day;

                        var myDate = moment(date);
                        var mili = moment(myDate).toDate().getTime();

                        return mili;
                    } else {
                        var d = new Date(date),
                            month = '' + (d.getMonth() + 1),
                            day = '' + d.getDate(),
                            year = d.getFullYear();

                        if (month.length < 2)
                            month = '0' + month;
                        if (day.length < 2)
                            day = '0' + day;

                        var myDate = moment(date);
                        var tomorrow = moment(myDate).add(1, 'days');
                        var mili = moment(tomorrow).toDate().getTime();

                        return mili;
                    }
                    
                }
                this.formatDate = formatDate;
                
                var getMilliseconts = function (date) {
                    var d = new Date(date);
                    var m = date.getTime();
                    return m;
                }
                this.getMilliseconts = getMilliseconts;

                // visitorChartData
                var visitorChartDataLabels = [];
                var visitorChartDataRaw = [];
                var visitorChartDatabackgroundColor = [];
                var visitorChartDataborderColor = [];
                var maxtickNummer = 0;
                var visitorChartDataRawSurpreme = [];
                var visitorChartDatabackgroundColorSurpreme = [];
                var visitorChartDataborderColorSurpreme = [];


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
                        ],
                        barPercentage: 1.0
                    }
                    ]
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
                                        max: maxtickNummer + 25,
                                        display: false,
                                        beginAtZero: true
                                    },
                                    stacked: false,
                                }],
                                xAxes: [{
                                    gridLines: {
                                        display: false
                                    },
                                    ticks: {
                                        beginAtZero: true
                                    },
                                    stacked: false
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
                    that.visitorChart.config.options.scales.yAxes[0].ticks.max = maxtickNummer + 25;
                    if (that.isSupreme === 2) {
                        if (that.visitorChart.data.datasets.length > 1) {
                            that.visitorChart.data.datasets[1].data = visitorChartDataRawSurpreme;
                        } else {
                            that.visitorChart.data.datasets.push({
                                label: visitorChartDataLabels,
                                data: visitorChartDataRawSurpreme,
                                backgroundColor: visitorChartDatabackgroundColorSurpreme,
                                borderColor: visitorChartDataborderColorSurpreme,
                                barPercentage: 1.0
                            });  
                        }
                        
                    }
                    that.visitorChart.update();
                }
                this.redraw = redraw;

                var resultDayConverter = function (item, index) {
                    item.index = index;
                    visitorChartDataLabels.push(that.getDateObject(item.IntervalStart));
                    visitorChartDataRaw.push(item.NumHits);
                    visitorChartDatabackgroundColor.push(Colors.dashboardColor);
                    visitorChartDataborderColor.push(Colors.dashboardColor);
                    if (that.isSupreme === 2) {
                        visitorChartDataRawSurpreme.push(item.NumHits);
                        visitorChartDatabackgroundColorSurpreme.push(surpremebarcolor);
                        visitorChartDataborderColorSurpreme.push(surpremebarcolor);
                    }
                }
                this.resultDayConverter = resultDayConverter;

                var resultHourConverter = function (item, index) {
                    item.index = index;
                    if (index === 0 ||
                        index === 1 ||
                        index === 2 ||
                        index === 3 ||
                        index === 4 ||
                        index === 5 ||
                        index === 6 ||
                        index === 7 ||
                        index === 20 ||
                        index === 21 ||
                        index === 22 ||
                        index === 23
                    ) {

                    } else {
                        visitorChartDataLabels.push(that.getDateObject(item.IntervalStart));
                        visitorChartDataRaw.push(item.NumHits);
                        visitorChartDatabackgroundColor.push(Colors.dashboardColor);
                        visitorChartDataborderColor.push(Colors.dashboardColor);
                        if (that.isSupreme === 2) {
                            visitorChartDataRawSurpreme.push(item.NumHits);
                            visitorChartDatabackgroundColorSurpreme.push(surpremebarcolor);
                            visitorChartDataborderColorSurpreme.push(surpremebarcolor);
                        }
                    }
                }
                this.resultHourConverter = resultHourConverter;
                
                var getGetDashboardVisitorData = function (interval, startday, endday) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    visitorChartDataLabels = [];
                    visitorChartDataRaw = [];
                    visitorChartDataRawSurpreme = [];
                    AppData.call("PRC_GetDashTimeline", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pIntervalHours: interval,
                        pStartTS: startday,
                        pEndTS: endday
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var interval = that.binding.dayhourflag;
                        var results = json.d.results;
                        maxtickNummer = Math.max.apply(Math, results.map(function (o) { return o.NumHits; }));
                        if (interval === "0") {
                            results.forEach(function(item, index) {
                                that.resultHourConverter(item, index);
                            });
                        } else {
                            results.forEach(function (item, index) {
                            that.resultDayConverter(item, index);
                        });
                        }
                        
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
                        var visibilitiyday = parseInt(that.binding.dayhourflag);
                        var interval = parseInt(that.binding.dayhourflag);
                        if (interval === 0) {
                            that.binding.dayhourflag = 1;
                        } else {
                            that.binding.dayhourflag = 0;
                        }
                        var startday = that.formatDate(daycombo.value, 1);
                        if (isNaN(startday)) {
                            startday = 0;
                        }
                        var endday = that.formatDate(daycombo.value, 0);
                        if (isNaN(endday)) {
                            endday = 0;
                        }
                        if (visibilitiyday === 0) {
                            daycombo.style.display = "none";
                            startday = 0;
                            endday = 0;
                            daycombo.value = "";
                        } else {
                            daycombo.style.display = "inline"; 
                            startday = moment().valueOf();
                            endday = moment().valueOf();
                            daycombo.value = moment().format("YYYY-MM-DD");
                        }
                        Log.ret(Log.l.trace);
                        that.getGetDashboardVisitorData(that.getDayHourData(), startday, endday);
                        
                        /*var interval = parseInt(that.binding.dayhourflag);
                        if (interval === 0) {
                            that.getGetDashboardVisitorData(24, 0, 0);
                        } else {
                            that.getGetDashboardVisitorData(1, 0, 0);
                        }*/
                        Log.ret(Log.l.trace);
                    },
                    changedDay: function (event) {
                        Log.call(Log.l.trace, "Event.Controller.");
                        var startday = that.formatDate(daycombo.value, 1);
                        var endday = that.formatDate(daycombo.value, 0);
                        that.getGetDashboardVisitorData(that.getDayHourData(), startday, endday);
                        Log.ret(Log.l.trace);
                    },
                    cleardDay: function (event) {
                        Log.call(Log.l.trace, "Event.Controller.");
                        if (daycombo.value) {
                            daycombo.value = "";
                            that.getGetDashboardVisitorData(that.getDayHourData(), 0, 0);
                        }
                        Log.ret(Log.l.trace);
                    }
                };


                if (dayhourcombo) {
                    this.addRemovableEventListener(dayhourcombo, "change", this.eventHandlers.changedTime.bind(this));
                }
                if (daycombo) {
                    this.addRemovableEventListener(daycombo, "change", this.eventHandlers.changedDay.bind(this));
                    //this.addRemovableEventListener(daycombo, "focus", this.eventHandlers.cleardDay.bind(this));
                }

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return dropdowncolor();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return getGetDashboardVisitorData(1, moment().valueOf(), moment().valueOf());
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
            
            })
    });
})();