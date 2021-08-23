// controller for page: StartQuestions
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/DiaIndustries/DiaIndustriesService.js" />
/// <reference path="~/www/lib/chartJS/scripts/dist/Chart.js" />
/// <reference path="~/www/lib/chartJS/scripts/dist/Chart.bundle.js" />
(function () {
    "use strict";

    WinJS.Namespace.define("DiaIndustries", {
        Controller: WinJS.Class.derive(Fragments.Controller,
            function Controller(fragmentElement, options) {
                Log.call(Log.l.trace, "DiaIndustries.Controller.");
                Fragments.Controller.apply(this,
                    [
                        fragmentElement, {
                            criteriaMain: 1
                        }
                    ]);

                var that = this;

                var criteriadrop = fragmentElement.querySelector("#criteriadropdown");

                var industriesyearchart1 = null;
                var industriesyearchart2 = null;
                var industriesyearchart3 = null;
                var industriesyearchart4 = null;

                var plugin = {
                    beforeDraw: function (chart) {
                        // Get ctx from string
                        var ctx = chart.chart.ctx;

                        // Get options from the center object in options
                        var centerConfig = chart.config.options.elements.center;
                        var fontStyle = centerConfig.fontStyle || 'Arial';
                        var txt = centerConfig.text;
                        var color = centerConfig.color || '#000';
                        var maxFontSize = centerConfig.maxFontSize || 75;
                        var sidePadding = centerConfig.sidePadding || 20;
                        var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2);
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

                //IndustriesYearChart1Data
                var industriesYearChartDataLabels1 = [];
                var industriesYearChartDataTexts1 = "";
                var industriesYearChartDataRaw1 = [];
                var industriesYearChartDataProcent1 = "";

                var yearRangeChart1Data = {
                    labels: industriesYearChartDataLabels1,
                    datasets: [{
                        data: industriesYearChartDataRaw1,
                        backgroundColor: [Colors.dashboardColor, "#878684"],
                        hoverBackgroundColor: [Colors.dashboardColor, "#878684"]
                    }]
                };
                //YearRangeChart1

                var createIndustriesYearChart1 = function () {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    industriesyearchart1 = new Chart(fragmentElement.querySelector("#industriesYearChart1"), {
                        type: 'doughnut',
                        data: yearRangeChart1Data,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            height: 250,
                            width: 250,
                            elements: {
                                center: {
                                    text: industriesYearChartDataProcent1 + " " + industriesYearChartDataTexts1//set as you wish
                                }
                            },
                            cutoutPercentage: 75,
                            legend: {
                                display: true,
                                position: 'left'
                            }
                        },
                        plugins: [plugin]
                    });

                    Log.ret(Log.l.trace);
                }
                this.createIndustriesYearChart1 = createIndustriesYearChart1;

                //YearRangeChart2Data
                var industriesYearChartDataLabels2 = [];
                var industriesYearChartDataTexts2 = "";
                var industriesYearChartDataRaw2 = [];
                var industriesYearChartDataProcent2 = "";

                var yearRangeChart2Data = {
                    labels: industriesYearChartDataLabels2,
                    datasets: [{
                        data: industriesYearChartDataRaw2,
                        backgroundColor: [Colors.dashboardColor, "#878684"],
                        hoverBackgroundColor: [Colors.dashboardColor, "#878684"]
                    }]
                };
                //YearRangeChart2

                var createIndustriesYearChart2 = function () {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    industriesyearchart2 = new Chart(fragmentElement.querySelector("#industriesYearChart2"), {
                        type: 'doughnut',
                        data: yearRangeChart2Data,
                        options: {
                            maintainAspectRatio: false,
                            elements: {
                                center: {
                                    text: industriesYearChartDataProcent2 + " " + industriesYearChartDataTexts2  //set as you wish
                                }
                            },
                            cutoutPercentage: 75,
                            legend: {
                                display: true,
                                position: 'left'
                            }
                        },
                        plugins: [plugin]
                    });
                    Log.ret(Log.l.trace);
                }
                this.createIndustriesYearChart2 = createIndustriesYearChart2;

                //YearRangeChart3Data
                var industriesYearChartDataLabels3 = [];
                var industriesYearChartDataTexts3 = "";
                var industriesYearChartDataRaw3 = [];
                var industriesYearChartDataProcent3 = "";

                var yearRangeChart3Data = {
                    labels: industriesYearChartDataLabels3,
                    datasets: [{
                        data: industriesYearChartDataRaw3,
                        backgroundColor: [Colors.dashboardColor, "#878684"],
                        hoverBackgroundColor: [Colors.dashboardColor, "#878684"]
                    }]
                };
                //YearRangeChart3

                var createIndustriesYearChart3 = function () {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    industriesyearchart3 = new Chart(fragmentElement.querySelector("#industriesYearChart3"), {
                        type: 'doughnut',
                        data: yearRangeChart3Data,
                        options: {
                            maintainAspectRatio: false,
                            elements: {
                                center: {
                                    text: industriesYearChartDataProcent3 + " " + industriesYearChartDataTexts3  //set as you wish
                                }
                            },
                            cutoutPercentage: 75,
                            legend: {
                                display: true,
                                position: 'left'
                            }
                        },
                        plugins: [plugin]
                    });
                    Log.ret(Log.l.trace);
                }
                this.createIndustriesYearChart3 = createIndustriesYearChart3;

                //YearRangeChart4Data
                var industriesYearChartDataLabels4 = [];
                var industriesYearChartDataTexts4 = "";
                var industriesYearChartDataRaw4 = [];
                var industriesYearChartDataProcent4 = "";

                var yearRangeChart4Data = {
                    labels: industriesYearChartDataLabels4,
                    datasets: [{
                        data: industriesYearChartDataRaw4,
                        backgroundColor: [Colors.dashboardColor, "#878684"],
                        hoverBackgroundColor: [Colors.dashboardColor, "#878684"]
                    }]
                };
                //YearRangeChart4

                var createIndustriesYearChart4 = function () {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    industriesyearchart4 = new Chart(fragmentElement.querySelector("#industriesYearChart4"), {
                        type: 'doughnut',
                        data: yearRangeChart4Data,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            height: 250,
                            width: 250,
                            elements: {
                                center: {
                                    text: industriesYearChartDataProcent4 + " " + industriesYearChartDataTexts4  //set as you wish
                                }
                            },
                            cutoutPercentage: 75,
                            legend: {
                                display: true,
                                position: 'left'
                            }
                        },
                        plugins: [plugin]
                    });
                    Log.ret(Log.l.trace);
                }
                this.createIndustriesYearChart4 = createIndustriesYearChart4;

                var clearArrays = function() {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    //clear IndustriesYearChart1Data
                    industriesYearChartDataLabels1 = [];
                    industriesYearChartDataTexts1 = "";
                    industriesYearChartDataRaw1 = [];
                    industriesYearChartDataProcent1 = "";
                    yearRangeChart1Data = {
                        labels: industriesYearChartDataLabels1,
                        datasets: [{
                            data: industriesYearChartDataRaw1,
                            backgroundColor: [Colors.dashboardColor, "#878684"],
                            hoverBackgroundColor: [Colors.dashboardColor, "#878684"]
                        }]
                    };

                    //clear IndustriesYearChart2Data
                    industriesYearChartDataLabels2 = [];
                    industriesYearChartDataTexts2 = "";
                    industriesYearChartDataRaw2 = [];
                    industriesYearChartDataProcent2 = "";
                    yearRangeChart2Data = {
                        labels: industriesYearChartDataLabels2,
                        datasets: [{
                            data: industriesYearChartDataRaw2,
                            backgroundColor: [Colors.dashboardColor, "#878684"],
                            hoverBackgroundColor: [Colors.dashboardColor, "#878684"]
                        }]
                    };

                    //clear IndustriesYearChart3Data
                    industriesYearChartDataLabels3 = [];
                    industriesYearChartDataTexts3 = "";
                    industriesYearChartDataRaw3 = [];
                    industriesYearChartDataProcent3 = "";
                    yearRangeChart3Data = {
                        labels: industriesYearChartDataLabels3,
                        datasets: [{
                            data: industriesYearChartDataRaw3,
                            backgroundColor: [Colors.dashboardColor, "#878684"],
                            hoverBackgroundColor: [Colors.dashboardColor, "#878684"]
                        }]
                    };

                    //clear IndustriesYearChart4Data
                    industriesYearChartDataLabels4 = [];
                    industriesYearChartDataTexts4 = "";
                    industriesYearChartDataRaw4 = [];
                    industriesYearChartDataProcent4 = "";
                    yearRangeChart4Data = {
                        labels: industriesYearChartDataLabels4,
                        datasets: [{
                            data: industriesYearChartDataRaw4,
                            backgroundColor: [Colors.dashboardColor, "#878684"],
                            hoverBackgroundColor: [Colors.dashboardColor, "#878684"]
                        }]
                    };
                    Log.ret(Log.l.trace);
                }
                this.clearArrays = clearArrays;

                var redrawCharts = function () {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    industriesyearchart1.data.labels = industriesYearChartDataLabels1;
                    industriesyearchart1.data.datasets[0].data = industriesYearChartDataRaw2;
                    industriesyearchart1.options.elements.center.text = industriesYearChartDataProcent1 + " " + industriesYearChartDataTexts1;
                    industriesyearchart1.update();
                    industriesyearchart2.data.labels = industriesYearChartDataLabels2;
                    industriesyearchart2.data.datasets[0].data = industriesYearChartDataRaw2;
                    industriesyearchart2.options.elements.center.text = industriesYearChartDataProcent2 + " " + industriesYearChartDataTexts2;
                    industriesyearchart2.update();
                    industriesyearchart3.data.labels = industriesYearChartDataLabels3;
                    industriesyearchart3.data.datasets[0].data = industriesYearChartDataRaw3;
                    industriesyearchart3.options.elements.center.text = industriesYearChartDataProcent3 + " " + industriesYearChartDataTexts3;
                    industriesyearchart3.update();
                    industriesyearchart4.data.labels = industriesYearChartDataLabels4;
                    industriesyearchart4.data.datasets[0].data = industriesYearChartDataRaw4;
                    industriesyearchart4.options.elements.center.text = industriesYearChartDataProcent4 + " " + industriesYearChartDataTexts4;
                    industriesyearchart4.update();
                    Log.ret(Log.l.trace);
                }
                this.redrawCharts = redrawCharts;

                var drawCharts = function () {
                    that.createIndustriesYearChart1();
                    that.createIndustriesYearChart2();
                    that.createIndustriesYearChart3();
                    that.createIndustriesYearChart4();
                }
                this.drawCharts = drawCharts;

                var resultConverter = function (item, index) {
                    item.index = index;
                    if (item.QualifierID === 11) {
                        if (industriesYearChartDataTexts1.length === 0) {
                            industriesYearChartDataTexts1 = item.Qualifier;
                        }
                        industriesYearChartDataLabels1.push(item.Qualifier2);
                        //industriesYearChartDataLabels1.push(getResourceText("diaYearRange.remaindata"));
                        industriesYearChartDataRaw1.push(item.NumHits);
                        //industriesYearChartDataRaw1.push(item.NumTotal - item.NumHits);
                        industriesYearChartDataProcent1 = Math.round(item.NumHits / item.NumTotal * 100) + "%";
                    }
                    if (item.QualifierID === 12) {
                        if (industriesYearChartDataTexts2.length === 0) {
                            industriesYearChartDataTexts2 = item.Qualifier;
                        }
                        industriesYearChartDataLabels2.push(item.Qualifier2);
                        //industriesYearChartDataLabels2.push(getResourceText("diaYearRange.remaindata"));
                        industriesYearChartDataRaw2.push(item.NumHits);
                        //industriesYearChartDataRaw2.push(item.NumTotal - item.NumHits);
                        industriesYearChartDataProcent2 = Math.round(item.NumHits / item.NumTotal * 100) + "%";
                    }
                    if (item.QualifierID === 13) {
                        if (industriesYearChartDataTexts3.length === 0) {
                            industriesYearChartDataTexts3 = item.Qualifier;
                        }
                        industriesYearChartDataLabels3.push(item.Qualifier2);
                        //industriesYearChartDataLabels3.push(getResourceText("diaYearRange.remaindata"));
                        industriesYearChartDataRaw3.push(item.NumHits);
                        //industriesYearChartDataRaw3.push(item.NumTotal - item.NumHits);
                        industriesYearChartDataProcent3 = Math.round(item.NumHits / item.NumTotal * 100) + "%";
                    }
                    if (item.QualifierID === 14) {
                        if (industriesYearChartDataTexts4.length === 0) {
                            industriesYearChartDataTexts4 = item.Qualifier;
                        }
                        industriesYearChartDataLabels4.push(item.Qualifier2);
                        //industriesYearChartDataLabels4.push(getResourceText("diaYearRange.remaindata"));
                        industriesYearChartDataRaw4.push(item.NumHits);
                        //industriesYearChartDataRaw4.push(item.NumTotal - item.NumHits);
                        industriesYearChartDataProcent4 = Math.round(item.NumHits / item.NumTotal * 100) + "%";
                    }
                    if (item.QualifierID === null) {
                        industriesYearChartDataTexts1 = item.ResultMessage;
                        industriesYearChartDataTexts2 = item.ResultMessage;
                        industriesYearChartDataTexts3 = item.ResultMessage;
                        industriesYearChartDataTexts4 = item.ResultMessage;
                        industriesYearChartDataProcent4 = "";
                    }
                }
                this.resultConverter = resultConverter;

                var getGetCriterionListData = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_GetCriterionList", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pLanguageSpecID: AppData.getLanguageId()
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        if (criteriadrop && criteriadrop.winControl) {
                            criteriadrop.winControl.data = new WinJS.Binding.List(json.d.results);
                            criteriadrop.selectedIndex = 0;
                            that.binding.criteriaMain = json.d.results[0].CriterionID;
                        }
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                }
                this.getGetCriterionListData = getGetCriterionListData;

                var getGetDashboardData = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    that.clearArrays();
                    AppData.call("PRC_GetDashboardData", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pCriterion1ID: 2,
                        pCriterion2ID: that.binding.criteriaMain,
                        pLandID: 0,
                        pLanguageSpecID: AppData.getLanguageId()
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var results = json.d.results;
                        results.forEach(function (item, index) {
                            that.resultConverter(item, index);
                        });
                        if (industriesyearchart1 === null) {
                            that.drawCharts();
                        } else {
                            that.redrawCharts();
                        }
                        AppData.setErrorMsg(that.binding);
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                }
                this.getGetDashboardData = getGetDashboardData;

                this.eventHandlers = {
                    changedCriteria: function (event) {
                        Log.call(Log.l.trace, "Contact.Controller.");
                        that.binding.criteriaMain = parseInt(event.target.value);
                        that.getGetDashboardData();
                        Log.ret(Log.l.trace);
                    },
                    changedCountry: function (event) {
                        Log.call(Log.l.trace, "Event.Controller.");
                        that.binding.criteriaCountry = parseInt(event.target.value);
                        that.getGetDashboardData();
                        Log.ret(Log.l.trace);
                    }
                };

                if (criteriadrop) {
                    this.addRemovableEventListener(criteriadrop, "change", this.eventHandlers.changedCriteria.bind(this));
                }

                that.processAll().then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    return getGetCriterionListData();
                }).then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    return getGetDashboardData();
                });
                Log.ret(Log.l.trace);
            }, {

            })
    });
})();