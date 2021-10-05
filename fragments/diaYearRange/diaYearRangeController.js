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
                            criteriaMain: 7
                        }
                    ]);

                var that = this;

                this.isSupreme = AppData._userData.IsSupreme;

                var yearrangechart1 = null;
                var yearrangechart2 = null;
                var yearrangechart3 = null;
                var yearrangechart4 = null;

                // Surpreme Charts
                var yearrangechart5 = null;
                var yearrangechart6 = null;
                var yearrangechart7 = null;
                var yearrangechart8 = null;

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
                        backgroundColor: [Colors.dashboardColor, "#efedee "],
                        hoverBackgroundColor: [Colors.dashboardColor, "#efedee "]
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
                                    text: yearRangeChartDataProcent1 //set as you wish

                                }
                            },
                            cutoutPercentage: 85,
                                legend: false,
                                legendCallback: function (chart) {
                                    var elem = [];
                                    elem.push('<div class="custom-legends-item">');
                                    if (chart.data.labels[0]) {
                                        elem.push(chart.data.labels[0]);
                                    }
                                    elem.push('</div>');
                                    return elem.join("");
                                }
                        },
                        plugins: [plugin]
                    });

                    Log.ret(Log.l.trace);
                    var legend1Element = fragmentElement.querySelector(".yearRangeChart1-legend");
                    /* insert custom HTML inside custom div */
                    legend1Element.innerHTML = yearrangechart1.generateLegend();
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
                        backgroundColor: [Colors.dashboardColor, "#efedee "],
                        hoverBackgroundColor: [Colors.dashboardColor, "#efedee "]
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
                                    text: yearRangeChartDataProcent2  //set as you wish
                                }
                            },
                            cutoutPercentage: 85,
                            legend: false,
                            legendCallback: function (chart) {
                                var elem = [];
                                elem.push('<div class="custom-legends-item">');
                                if (chart.data.labels[0]) {
                                     elem.push(chart.data.labels[0]);
                                }
                                elem.push('</div>');
                                return elem.join("");
                            }
                        },
                        plugins: [plugin]
                    });
                    Log.ret(Log.l.trace);
                    var legend2Element = fragmentElement.querySelector(".yearRangeChart2-legend");
                    /* insert custom HTML inside custom div */
                    legend2Element.innerHTML = yearrangechart2.generateLegend();
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
                        backgroundColor: [Colors.dashboardColor, "#efedee "],
                        hoverBackgroundColor: [Colors.dashboardColor, "#efedee "]
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
                                    text: yearRangeChartDataProcent3  //set as you wish
                                }
                            },
                            cutoutPercentage: 85,
                            legend: false,
                            legendCallback: function (chart) {
                                var elem = [];
                                elem.push('<div class="custom-legends-item">');
                                if (chart.data.labels[0]) {
                                    elem.push(chart.data.labels[0]);
                                }
                                elem.push('</div>');
                                return elem.join("");
                            }
                        },
                        plugins: [plugin]
                    });
                    Log.ret(Log.l.trace);
                    var legend3Element = fragmentElement.querySelector(".yearRangeChart3-legend");
                    /* insert custom HTML inside custom div */
                    legend3Element.innerHTML = yearrangechart3.generateLegend();
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
                        backgroundColor: [Colors.dashboardColor, "#efedee "],
                        hoverBackgroundColor: [Colors.dashboardColor, "#efedee "]
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
                                    text: yearRangeChartDataProcent4  //set as you wish
                                }
                            },
                            cutoutPercentage: 85,
                            legend: false,
                            legendCallback: function (chart) {
                                var elem = [];
                                elem.push('<div class="custom-legends-item">');
                                if (chart.data.labels[0]) {
                                    elem.push(chart.data.labels[0]);
                                }
                                elem.push('</div>');
                                return elem.join("");
                            }
                        },
                        plugins: [plugin]
                    });
                    Log.ret(Log.l.trace);
                    var legend4Element = fragmentElement.querySelector(".yearRangeChart4-legend");
                    /* insert custom HTML inside custom div */
                    legend4Element.innerHTML = yearrangechart4.generateLegend();
                }
                this.createYearRangeChart4 = createYearRangeChart4;

                //YearRangeChart5Data
                var yearRangeChartDataLabels5 = [];
                var yearRangeChartDataTexts5 = [];
                var yearRangeChartDataRaw5 = [];
                var yearRangeChartDataProcent5 = "";

                var yearRangeChart5Data = {
                    labels: yearRangeChartDataLabels5,
                    datasets: [{
                        data: yearRangeChartDataRaw5,
                        backgroundColor: ["#cc5b87", "#efedee "],
                        hoverBackgroundColor: ["#cc5b87", "#efedee "]
                    }]
                };
                //YearRangeChart5

                var createYearRangeChart5 = function () {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    yearrangechart5 = new Chart(fragmentElement.querySelector("#yearRangeChart5"), {
                        type: 'doughnut',
                        data: yearRangeChart5Data,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            height: 250,
                            width: 250,
                            elements: {
                                center: {
                                    text: yearRangeChartDataProcent5  //set as you wish
                                }
                            },
                            cutoutPercentage: 85,
                            legend: {
                                display: false
                            }
                        },
                        plugins: [plugin]
                    });
                    Log.ret(Log.l.trace);
                }
                this.createYearRangeChart5 = createYearRangeChart5;

                //YearRangeChart6Data
                var yearRangeChartDataLabels6 = [];
                var yearRangeChartDataTexts6 = [];
                var yearRangeChartDataRaw6 = [];
                var yearRangeChartDataProcent6 = "";

                var yearRangeChart6Data = {
                    labels: yearRangeChartDataLabels6,
                    datasets: [{
                        data: yearRangeChartDataRaw6,
                        backgroundColor: ["#cc5b87", "#efedee "],
                        hoverBackgroundColor: ["#cc5b87", "#efedee "]
                    }]
                };
                //YearRangeChart6

                var createYearRangeChart6 = function () {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    yearrangechart6 = new Chart(fragmentElement.querySelector("#yearRangeChart6"), {
                        type: 'doughnut',
                        data: yearRangeChart6Data,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            height: 250,
                            width: 250,
                            elements: {
                                center: {
                                    text: yearRangeChartDataProcent6  //set as you wish
                                }
                            },
                            cutoutPercentage: 85,
                            legend: {
                                display: false
                            }
                        },
                        plugins: [plugin]
                    });
                    Log.ret(Log.l.trace);
                }
                this.createYearRangeChart6 = createYearRangeChart6;

                //YearRangeChart7Data
                var yearRangeChartDataLabels7 = [];
                var yearRangeChartDataTexts7 = [];
                var yearRangeChartDataRaw7 = [];
                var yearRangeChartDataProcent7 = "";

                var yearRangeChart7Data = {
                    labels: yearRangeChartDataLabels7,
                    datasets: [{
                        data: yearRangeChartDataRaw7,
                        backgroundColor: ["#cc5b87", "#efedee "],
                        hoverBackgroundColor: ["#cc5b87", "#efedee "]
                    }]
                };
                //YearRangeChart7

                var createYearRangeChart7 = function () {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    yearrangechart7 = new Chart(fragmentElement.querySelector("#yearRangeChart7"), {
                        type: 'doughnut',
                        data: yearRangeChart7Data,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            height: 250,
                            width: 250,
                            elements: {
                                center: {
                                    text: yearRangeChartDataProcent7  //set as you wish
                                }
                            },
                            cutoutPercentage: 85,
                            legend: {
                                display: false
                            }
                        },
                        plugins: [plugin]
                    });
                    Log.ret(Log.l.trace);
                }
                this.createYearRangeChart7 = createYearRangeChart7;

                //YearRangeChart8Data
                var yearRangeChartDataLabels8 = [];
                var yearRangeChartDataTexts8 = [];
                var yearRangeChartDataRaw8 = [];
                var yearRangeChartDataProcent8 = "";

                var yearRangeChart8Data = {
                    labels: yearRangeChartDataLabels8,
                    datasets: [{
                        data: yearRangeChartDataRaw8,
                        backgroundColor: ["#cc5b87", "#efedee "],
                        hoverBackgroundColor: ["#cc5b87", "#efedee "]
                    }]
                };
                //YearRangeChart8

                var createYearRangeChart8 = function () {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    yearrangechart8 = new Chart(fragmentElement.querySelector("#yearRangeChart8"), {
                        type: 'doughnut',
                        data: yearRangeChart8Data,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            height: 180,
                            width: 180,
                            elements: {
                                center: {
                                    text: yearRangeChartDataProcent8  //set as you wish
                                }
                            },
                            cutoutPercentage: 85,
                            legend: {
                                display: false
                            }
                        },
                        plugins: [plugin]
                    });
                    Log.ret(Log.l.trace);
                }
                this.createYearRangeChart8 = createYearRangeChart8;
                
                var drawCharts = function () {
                    that.createYearRangeChart1();
                    that.createYearRangeChart2();
                    that.createYearRangeChart3();
                    that.createYearRangeChart4();
                    if (that.isSupreme === 2) {
                        that.createYearRangeChart5();
                        that.createYearRangeChart6();
                        that.createYearRangeChart7();
                        that.createYearRangeChart8();
                    }
                }
                this.drawCharts = drawCharts;

                var resultConverterPremium = function (item, index) {
                    item.index = index;
                    if (item.QualifierExtID === "13185") {
                        yearRangeChartDataTexts1.push(item.Qualifier);
                        yearRangeChartDataLabels1.push(item.Qualifier);
                        yearRangeChartDataLabels1.push(getResourceText("diaYearRange.remaindata"));
                        yearRangeChartDataRaw1.push(item.NumHits);
                        yearRangeChartDataRaw1.push(item.NumTotal - item.NumHits);
                        yearRangeChartDataProcent1 = Math.round(item.NumHits / item.NumTotal * 100) + "%";
                    }
                    if (item.QualifierExtID === "13186") {
                        yearRangeChartDataTexts2.push(item.Qualifier);
                        yearRangeChartDataLabels2.push(item.Qualifier);
                        yearRangeChartDataLabels2.push(getResourceText("diaYearRange.remaindata"));
                        yearRangeChartDataRaw2.push(item.NumHits);
                        yearRangeChartDataRaw2.push(item.NumTotal - item.NumHits);
                        yearRangeChartDataProcent2 = Math.round(item.NumHits / item.NumTotal * 100) + "%";
                    }
                    if (item.QualifierExtID === "13187") {
                        yearRangeChartDataTexts3.push(item.Qualifier);
                        yearRangeChartDataLabels3.push(item.Qualifier);
                        yearRangeChartDataLabels3.push(getResourceText("diaYearRange.remaindata"));
                        yearRangeChartDataRaw3.push(item.NumHits);
                        yearRangeChartDataRaw3.push(item.NumTotal - item.NumHits);
                        yearRangeChartDataProcent3 = Math.round(item.NumHits / item.NumTotal * 100) + "%";
                    }
                    if (item.QualifierExtID === "13188") {
                        yearRangeChartDataTexts4.push(item.Qualifier);
                        yearRangeChartDataLabels4.push(item.Qualifier);
                        yearRangeChartDataLabels4.push(getResourceText("diaYearRange.remaindata"));
                        yearRangeChartDataRaw4.push(item.NumHits);
                        yearRangeChartDataRaw4.push(item.NumTotal - item.NumHits);
                        yearRangeChartDataProcent4 = Math.round(item.NumHits / item.NumTotal * 100) + "%";
                    }
                }
                this.resultConverterPremium = resultConverterPremium;

                var resultConverterSurpreme = function (item, index) {
                    item.index = index;
                    if (item.QualifierExtID === "13185") {
                        yearRangeChartDataTexts5.push(item.Qualifier);
                        yearRangeChartDataLabels5.push(item.Qualifier);
                        yearRangeChartDataLabels5.push(getResourceText("diaYearRange.remaindata"));
                        yearRangeChartDataRaw5.push(item.PercentGlobal);
                        yearRangeChartDataRaw5.push(100 - item.PercentGlobal);
                        yearRangeChartDataProcent5 = item.PercentGlobal + "%";
                    }
                    if (item.QualifierExtID === "13186") {
                        yearRangeChartDataTexts6.push(item.Qualifier);
                        yearRangeChartDataLabels6.push(item.Qualifier);
                        yearRangeChartDataLabels6.push(getResourceText("diaYearRange.remaindata"));
                        yearRangeChartDataRaw6.push(item.PercentGlobal);
                        yearRangeChartDataRaw6.push(100 - item.PercentGlobal);
                        yearRangeChartDataProcent6 = item.PercentGlobal + "%";
                    }
                    if (item.QualifierExtID === "13187") {
                        yearRangeChartDataTexts7.push(item.Qualifier);
                        yearRangeChartDataLabels7.push(item.Qualifier);
                        yearRangeChartDataLabels7.push(getResourceText("diaYearRange.remaindata"));
                        yearRangeChartDataRaw7.push(item.PercentGlobal);
                        yearRangeChartDataRaw7.push(100 - item.PercentGlobal);
                        yearRangeChartDataProcent7 = item.PercentGlobal + "%";
                    }
                    if (item.QualifierExtID === "13188") {
                        yearRangeChartDataTexts8.push(item.Qualifier);
                        yearRangeChartDataLabels8.push(item.Qualifier);
                        yearRangeChartDataLabels8.push(getResourceText("diaYearRange.remaindata"));
                        yearRangeChartDataRaw8.push(item.PercentGlobal);
                        yearRangeChartDataRaw8.push(100 - item.PercentGlobal);
                        yearRangeChartDataProcent8 = item.PercentGlobal + "%";
                    }
                }
                this.resultConverterSurpreme = resultConverterSurpreme;

                var resultConverterCrit = function (item, index) {
                    item.index = index;
                    if (item.ExternalID === "10882") {
                        that.binding.criteriaMain = item.CriterionID;
                    }
                }
                this.resultConverterCrit = resultConverterCrit;

                var getGetCriterionListData = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_GetCriterionList", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pLanguageSpecID: AppData.getLanguageId()
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var results = json.d.results;
                        results.forEach(function (item, index) {
                            that.resultConverterCrit(item, index);
                        });
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                }
                this.getGetCriterionListData = getGetCriterionListData;

                var getGetDashboardDataPremium = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    that.getGetCriterionListData();
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_GetDashboardData", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pCriterion1ID: that.binding.criteriaMain,
                        pCriterion2ID: 0,
                        pLandID: 0,
                        pDay: 0,
                        pLanguageSpecID: AppData.getLanguageId()
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var results = json.d.results;
                        results.forEach(function (item, index) {
                            that.resultConverterPremium(item, index);
                        });
                        that.drawCharts();
                        AppData.setErrorMsg(that.binding);
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                }
                this.getGetDashboardDataPremium = getGetDashboardDataPremium;

                var getGetDashboardDataSurpreme = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_GetDashboardData", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pCriterion1ID: that.binding.criteriaMain,
                        pCriterion2ID: 0,
                        pLandID: 0,
                        pLanguageSpecID: AppData.getLanguageId()
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var results = json.d.results;
                        results.forEach(function (item, index) {
                            that.resultConverterSurpreme(item, index);
                        });
                        that.drawCharts();
                        AppData.setErrorMsg(that.binding);
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                }
                this.getGetDashboardDataSurpreme = getGetDashboardDataSurpreme;

                var checkIfSurpreme = function () {
                    var container = fragmentElement.querySelector(".chart-container");
                    var containerS = fragmentElement.querySelector(".chart-container-surpreme");
                    var dia1 = fragmentElement.querySelector(".chart-container-block1");
                    var dia2 = fragmentElement.querySelector(".chart-container-block2");
                    var dia3 = fragmentElement.querySelector(".chart-container-block3");
                    var dia4 = fragmentElement.querySelector(".chart-container-block4");
                    var dia5 = fragmentElement.querySelector(".chart-container-block5");
                    var dia6 = fragmentElement.querySelector(".chart-container-block6");
                    var dia7 = fragmentElement.querySelector(".chart-container-block7");
                    var dia8 = fragmentElement.querySelector(".chart-container-block8");
                    if (that.isSupreme === 2) {
                        container.style.height = "100px";
                        containerS.style.height = "100px";
                        containerS.style.marginTop = "5%";
                        dia1.style.height = "100px";
                        dia2.style.height = "100px";
                        dia3.style.height = "100px";
                        dia4.style.height = "100px";
                        dia5.style.height = "80px";
                        dia6.style.height = "80px";
                        dia7.style.height = "80px";
                        dia8.style.height = "80px";
                    } else {
                        container.style.height = "230px";
                        container.style.height = "130px";
                        container.style.marginTop = "5%";
                        dia1.style.height = "130px";
                        dia2.style.height = "130px";
                        dia3.style.height = "130px";
                        dia4.style.height = "130px";
                    }
                }
                this.checkIfSurpreme = checkIfSurpreme;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Data loaded");
                return checkIfSurpreme();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                return getGetDashboardDataPremium();
            }).then(function () {
                if (that.isSupreme === 2) {
                    Log.print(Log.l.trace, "Data loaded");
                    return getGetDashboardDataSurpreme();
                }
            });
            Log.ret(Log.l.trace);
        }, {
            
            })
    });
})();