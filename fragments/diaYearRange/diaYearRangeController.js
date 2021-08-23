// controller for page: StartQuestions
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/diaYearRange/diaYearRangeService.js" />
/// <reference path="~/www/lib/chartJS/scripts/dist/Chart.js" />
/// <reference path="~/www/lib/chartJS/scripts/dist/Chart.bundle.js" />
(function () {
    "use strict";

    WinJS.Namespace.define("DiaYearRange", {
        Controller: WinJS.Class.derive(Fragments.Controller,
            function Controller(fragmentElement, options) {
                Log.call(Log.l.trace, "DiaYearRange.Controller.");
                Fragments.Controller.apply(this,
                    [
                        fragmentElement, {
                        }
                    ]);

                var that = this;

                var yearrangechart1 = null;
                var yearrangechart2 = null;
                var yearrangechart3 = null;
                var yearrangechart4 = null;

                var plugin = {
                    beforeDraw: function(chart) {
                        // Get ctx from string
                        var ctx = chart.chart.ctx;

                        // Get options from the center object in options
                        var centerConfig = chart.config.options.elements.center;
                        var fontStyle = centerConfig.fontStyle || 'Arial';
                        var txt = centerConfig.text;
                        var color = centerConfig.color || '#000';
                        var maxFontSize = centerConfig.maxFontSize || 75;
                        var sidePadding = centerConfig.sidePadding || 20;
                        var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)
                        // Start with a base font of 30px
                        ctx.font = "30px " + fontStyle;

                        // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
                        var stringWidth = ctx.measureText(txt).width;
                        var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

                        // Find out how much the font can grow in width.
                        var widthRatio = elementWidth / stringWidth;
                        var newFontSize = Math.floor(30 * widthRatio);
                        var elementHeight = (chart.innerRadius * 2);

                        // Pick a new font size so it will not be larger than the height of label.
                        var fontSizeToUse = Math.min(newFontSize, elementHeight, maxFontSize);
                        var minFontSize = centerConfig.minFontSize;
                        var lineHeight = centerConfig.lineHeight || 25;
                        var wrapText = false;

                        if (minFontSize === undefined) {
                            minFontSize = 10;
                        }

                        if (minFontSize && fontSizeToUse < minFontSize) {
                            fontSizeToUse = minFontSize;
                            wrapText = true;
                        }

                        // Set font settings to draw it correctly.
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
                        var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
                        ctx.font = fontSizeToUse + "px " + fontStyle;
                        ctx.fillStyle = color;

                        if (!wrapText) {
                            ctx.fillText(txt, centerX, centerY);
                            return;
                        }

                        var lines = [];
                        var chunks = txt.split('\n');
                        for (var m = 0; m < chunks.length; m++) {
                            var words = chunks[m].split(' ');
                            var line;

                            // Break words up into multiple lines if necessary
                            for (var n = 0; n < words.length; n++) {
                                var testLine = (n == 0) ? words[n] : line + ' ' + words[n];
                                var metrics = ctx.measureText(testLine);
                                var testWidth = metrics.width;
                                if (testWidth > elementWidth && n > 0) {
                                    lines.push(line);
                                    line = words[n];
                                } else {
                                    line = testLine;
                                }
                            }
                            lines.push(line);
                        }

                        // Move the center up depending on line height and number of lines
                        centerY -= ((lines.length - 1) / 2) * lineHeight;

                        // All but last line
                        for (var n = 0; n < lines.length; n++) {
                            ctx.fillText(lines[n], centerX, centerY);
                            centerY += lineHeight;
                        }
                    }
                }

                //YearRangeChart1Data
                var yearRangeChartDataLabels1 = [];
                var yearRangeChartDataTexts1 = [];
                var yearRangeChartDataRaw1 = [];
                var yearRangeChartDataProcent1 = "";

                var yearRangeChart1Data = {
                    labels: yearRangeChartDataLabels1,
                    datasets: [{
                        data: yearRangeChartDataRaw1,
                        backgroundColor: [Colors.dashboardColor, "#878684"],
                        hoverBackgroundColor: [Colors.dashboardColor, "#878684"]
                    }]
                };
                //YearRangeChart1

                var createYearRangeChart1 = function() {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    yearrangechart1 = new Chart(fragmentElement.querySelector("#yearRangeChart1"), {
                        type: 'doughnut',
                        data: yearRangeChart1Data,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            height: 250,
                            width: 250,
                            elements: {
                                center: {
                                    text: yearRangeChartDataProcent1 + " " + yearRangeChartDataTexts1//set as you wish
                                }
                            },
                            cutoutPercentage: 75,
                            legend: {
                                display: false
                            }
                        },
                        plugins: [plugin]
                    });

                    Log.ret(Log.l.trace);
                }
                this.createYearRangeChart1 = createYearRangeChart1;

                //YearRangeChart2Data
                var yearRangeChartDataLabels2 = [];
                var yearRangeChartDataTexts2 = [];
                var yearRangeChartDataRaw2 = [];
                var yearRangeChartDataProcent2 = "";

                var yearRangeChart2Data = {
                    labels: yearRangeChartDataLabels2,
                    datasets: [{
                        data: yearRangeChartDataRaw2,
                        backgroundColor: [Colors.dashboardColor, "#878684"],
                        hoverBackgroundColor: [Colors.dashboardColor, "#878684"]
                    }]
                };
                //YearRangeChart2

                var createYearRangeChart2 = function () {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    yearrangechart2 = new Chart(fragmentElement.querySelector("#yearRangeChart2"), {
                        type: 'doughnut',
                        data: yearRangeChart2Data,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            height: 250,
                            width: 250,
                            elements: {
                                center: {
                                    text: yearRangeChartDataProcent2 + " " + yearRangeChartDataTexts2  //set as you wish
                                }
                            },
                            cutoutPercentage: 75,
                            legend: {
                                display: false
                            }
                        },
                        plugins: [plugin]
                    });
                    Log.ret(Log.l.trace);
                }
                this.createYearRangeChart2 = createYearRangeChart2;

                //YearRangeChart3Data
                var yearRangeChartDataLabels3 = [];
                var yearRangeChartDataTexts3 = [];
                var yearRangeChartDataRaw3 = [];
                var yearRangeChartDataProcent3 = "";

                var yearRangeChart3Data = {
                    labels: yearRangeChartDataLabels3,
                    datasets: [{
                        data: yearRangeChartDataRaw3,
                        backgroundColor: [Colors.dashboardColor, "#878684"],
                        hoverBackgroundColor: [Colors.dashboardColor, "#878684"]
                    }]
                };
                //YearRangeChart3

                var createYearRangeChart3 = function () {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    yearrangechart3 = new Chart(fragmentElement.querySelector("#yearRangeChart3"), {
                        type: 'doughnut',
                        data: yearRangeChart3Data,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            height: 250,
                            width: 250,
                            elements: {
                                center: {
                                    text: yearRangeChartDataProcent3 + " " + yearRangeChartDataTexts3  //set as you wish
                                }
                            },
                            cutoutPercentage: 75,
                            legend: {
                                display: false
                            }
                        },
                        plugins: [plugin]
                    });
                    Log.ret(Log.l.trace);
                }
                this.createYearRangeChart3 = createYearRangeChart3;

                //YearRangeChart4Data
                var yearRangeChartDataLabels4 = [];
                var yearRangeChartDataTexts4 = [];
                var yearRangeChartDataRaw4 = [];
                var yearRangeChartDataProcent4 = "";

                var yearRangeChart4Data = {
                    labels: yearRangeChartDataLabels4,
                    datasets: [{
                        data: yearRangeChartDataRaw4,
                        backgroundColor: [Colors.dashboardColor, "#878684"],
                        hoverBackgroundColor: [Colors.dashboardColor, "#878684"]
                    }]
                };
                //YearRangeChart4

                var createYearRangeChart4 = function () {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    yearrangechart4 = new Chart(fragmentElement.querySelector("#yearRangeChart4"), {
                        type: 'doughnut',
                        data: yearRangeChart4Data,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            height: 250,
                            width: 250,
                            elements: {
                                center: {
                                    text: yearRangeChartDataProcent4 + " " + yearRangeChartDataTexts4  //set as you wish
                                }
                            },
                            cutoutPercentage: 75,
                            legend: {
                                display: false
                            }
                        },
                        plugins: [plugin]
                    });
                    Log.ret(Log.l.trace);
                }
                this.createYearRangeChart4 = createYearRangeChart4;

                var drawCharts = function () {
                    that.createYearRangeChart1();
                    that.createYearRangeChart2();
                    that.createYearRangeChart3();
                    that.createYearRangeChart4();
                }
                this.drawCharts = drawCharts;

                var resultConverter = function (item, index) {
                    item.index = index;
                    if (item.index === 0) {
                        yearRangeChartDataTexts1.push(item.Qualifier);
                        yearRangeChartDataLabels1.push(item.Qualifier);
                        yearRangeChartDataLabels1.push(getResourceText("diaYearRange.remaindata"));
                        yearRangeChartDataRaw1.push(item.NumHits);
                        yearRangeChartDataRaw1.push(item.NumTotal - item.NumHits);
                        yearRangeChartDataProcent1 = Math.round(item.NumHits / item.NumTotal * 100) + "%";
                    }
                    if (item.index === 1) {
                        yearRangeChartDataTexts2.push(item.Qualifier);
                        yearRangeChartDataLabels2.push(item.Qualifier);
                        yearRangeChartDataLabels2.push(getResourceText("diaYearRange.remaindata"));
                        yearRangeChartDataRaw2.push(item.NumHits);
                        yearRangeChartDataRaw2.push(item.NumTotal - item.NumHits);
                        yearRangeChartDataProcent2 = Math.round(item.NumHits / item.NumTotal * 100) + "%";
                    }
                    if (item.index === 2) {
                        yearRangeChartDataTexts3.push(item.Qualifier);
                        yearRangeChartDataLabels3.push(item.Qualifier);
                        yearRangeChartDataLabels3.push(getResourceText("diaYearRange.remaindata"));
                        yearRangeChartDataRaw3.push(item.NumHits);
                        yearRangeChartDataRaw3.push(item.NumTotal - item.NumHits);
                        yearRangeChartDataProcent3 = Math.round(item.NumHits / item.NumTotal * 100) + "%";
                    }
                    if (item.index === 3) {
                        yearRangeChartDataTexts4.push(item.Qualifier);
                        yearRangeChartDataLabels4.push(item.Qualifier);
                        yearRangeChartDataLabels4.push(getResourceText("diaYearRange.remaindata"));
                        yearRangeChartDataRaw4.push(item.NumHits);
                        yearRangeChartDataRaw4.push(item.NumTotal - item.NumHits);
                        yearRangeChartDataProcent4 = Math.round(item.NumHits / item.NumTotal * 100) + "%";
                    }
                }
                this.resultConverter = resultConverter;

                var getGetDashboardData = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_GetDashboardData", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pCriterion1ID: 2,
                        pCriterion2ID: 0,
                        pLandID: 0,
                        pLanguageSpecID: AppData.getLanguageId()
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var results = json.d.results;
                        results.forEach(function (item, index) {
                            that.resultConverter(item, index);
                        });
                        that.drawCharts();
                        AppData.setErrorMsg(that.binding);
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                }
                this.getGetDashboardData = getGetDashboardData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Data loaded");
                return getGetDashboardData();
            });
            Log.ret(Log.l.trace);
        }, {
            
            })
    });
})();