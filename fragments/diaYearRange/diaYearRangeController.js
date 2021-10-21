// controller for page: StartQuestions
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/diaYearRange/diaYearRangeService.js" />
/// <reference path="~/www/lib/chartJS/scripts/dist/chart.js" />
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
                
                var yearRangeChart1Legend = {
                    afterUpdate(chart) {
                        var elem = [];
                        elem.push('<div class="custom-legends-item1">');
                        if (chart.data.labels[0]) {
                            elem.push(chart.data.labels[0]);
                        }
                        elem.push('</div>');
                        
                        var legentElement = fragmentElement.querySelector(".yearRangeChart1-legend");
                        var clegentElement = fragmentElement.querySelector(".custom-legends-item1");

                        if (clegentElement) {
                            clegentElement.remove();
                        }

                        return legentElement.insertAdjacentHTML('beforeend', elem.join(""));
                    }
                }

                var yearRangeChart2Legend = {
                    afterUpdate(chart) {
                        var elem = [];
                        elem.push('<div class="custom-legends-item2">');
                        if (chart.data.labels[0]) {
                            elem.push(chart.data.labels[0]);
                        }
                        elem.push('</div>');

                        var legentElement = fragmentElement.querySelector(".yearRangeChart2-legend");
                        var clegentElement = fragmentElement.querySelector(".custom-legends-item2");

                        if (clegentElement) {
                            clegentElement.remove();
                        }

                        return legentElement.insertAdjacentHTML('beforeend', elem.join(""));
                    }
                }

                var yearRangeChart3Legend = {
                    afterUpdate(chart) {
                        var elem = [];
                        elem.push('<div class="custom-legends-item3">');
                        if (chart.data.labels[0]) {
                            elem.push(chart.data.labels[0]);
                        }
                        elem.push('</div>');

                        var legentElement = fragmentElement.querySelector(".yearRangeChart3-legend");
                        var clegentElement = fragmentElement.querySelector(".custom-legends-item3");

                        if (clegentElement) {
                            clegentElement.remove();
                        }

                        return legentElement.insertAdjacentHTML('beforeend', elem.join(""));
                    }
                }

                var yearRangeChart4Legend = {
                    afterUpdate(chart) {
                        var elem = [];
                        elem.push('<div class="custom-legends-item4">');
                        if (chart.data.labels[0]) {
                            elem.push(chart.data.labels[0]);
                        }
                        elem.push('</div>');

                        var legentElement = fragmentElement.querySelector(".yearRangeChart4-legend");
                        var clegentElement = fragmentElement.querySelector(".custom-legends-item4");

                        if (clegentElement) {
                            clegentElement.remove();
                        }

                        return legentElement.insertAdjacentHTML('beforeend', elem.join(""));
                    }
                }

                var centerDoughnutPlugin = {
                    beforeDraw: function (chart) {
                        if (chart.config.options.elements.center) {
                            // Get ctx from string
                            var ctx = chart.ctx;
                            
                            // Get options from the center object in options
                            var centerConfig = chart.config.options.elements.center;
                            var fontStyle = centerConfig.fontStyle || 'Arial';
                            var txt = centerConfig.text;
                            var color = centerConfig.color || '#000';
                            var maxFontSize = centerConfig.maxFontSize || 75;
                            var sidePadding = centerConfig.sidePadding || 20;
                            var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2);
                            // Start with a base font of 30px
                            ctx.font = "bold " + "20px " + fontStyle;

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
                                minFontSize = 20;
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

                            var words = txt.split(' ');
                            var line = '';
                            var lines = [];

                            // Break words up into multiple lines if necessary
                            for (var n = 0; n < words.length; n++) {
                                var testLine = line + words[n] + ' ';
                                var metrics = ctx.measureText(testLine);
                                var testWidth = metrics.width;
                                if (testWidth > elementWidth && n > 0) {
                                    lines.push(line);
                                    line = words[n] + ' ';
                                } else {
                                    line = testLine;
                                }
                            }

                            // Move the center up depending on line height and number of lines
                            centerY -= (lines.length / 2) * lineHeight;

                            for (var n = 0; n < lines.length; n++) {
                                ctx.fillText(lines[n], centerX, centerY);
                                centerY += lineHeight;
                            }
                            //Draw text in center
                            ctx.fillText(line, centerX, centerY);
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
                        hoverBackgroundColor: [Colors.dashboardColor, "#efedee "],
                        hoverOffset: 4
                    }]
                };

                //YearRangeChart1
                var yearrangechart1;
                var createYearRangeChart1 = function () {
                    if (yearrangechart1) {
                        yearrangechart1.destroy();
                    }
                    yearrangechart1 = new Chart(fragmentElement.querySelector("#yearRangeChart1").getContext("2d"),
                        {
                            type: 'doughnut',
                            data: yearRangeChart1Data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '85%',
                                elements: {
                                    center: {
                                        text: yearRangeChartDataProcent1,
                                        color: '#000000', // Default is #000000
                                        fontStyle: 'Arial', // Default is Arial
                                        sidePadding: 20, // Default is 20 (as a percentage)
                                        minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                                        lineHeight: 25 // Default is 25 (in px), used for when text wraps
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {
                                                var title = context[0].label;
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label + " %";
                                            }
                                        }
                                    }
                                }
                            },
                            plugins: [centerDoughnutPlugin, yearRangeChart1Legend]

                        });
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
                var yearrangechart2;
                var createYearRangeChart2 = function () {
                    if (yearrangechart2) {
                        yearrangechart2.destroy();
                    }
                    yearrangechart2 = new Chart(fragmentElement.querySelector("#yearRangeChart2"),
                        {
                            type: 'doughnut',
                            data: yearRangeChart2Data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '85%',
                                elements: {
                                    center: {
                                        text: yearRangeChartDataProcent2,
                                        color: '#000000', // Default is #000000
                                        fontStyle: 'Arial', // Default is Arial
                                        sidePadding: 20, // Default is 20 (as a percentage)
                                        minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                                        lineHeight: 25 // Default is 25 (in px), used for when text wraps
                                    }
                                },
                                plugins: {
                                    htmlLegend: {
                                        // ID of the container to put the legend in
                                        containerID: 'yearRangeChart2-legend'
                                    },
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {
                                                var title = context[0].label;
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label + " %";
                                            }
                                        }
                                    }
                                }
                            },
                            plugins: [centerDoughnutPlugin, yearRangeChart2Legend]

                        });
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
                var yearrangechart3;
                var createYearRangeChart3 = function () {
                    if (yearrangechart3) {
                        yearrangechart3.destroy();
                    }
                    yearrangechart3 = new Chart(fragmentElement.querySelector("#yearRangeChart3"),
                        {
                            type: 'doughnut',
                            data: yearRangeChart3Data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '85%',
                                elements: {
                                    center: {
                                        text: yearRangeChartDataProcent3,
                                        color: '#000000', // Default is #000000
                                        fontStyle: 'Arial', // Default is Arial
                                        sidePadding: 20, // Default is 20 (as a percentage)
                                        minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                                        lineHeight: 25 // Default is 25 (in px), used for when text wraps
                                    }
                                },
                                plugins: {
                                    htmlLegend: {
                                        // ID of the container to put the legend in
                                        containerID: 'yearRangeChart3-legend'
                                    },
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {
                                                var title = context[0].label;
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label + " %";
                                            }
                                        }
                                    }
                                }
                            },
                            plugins: [centerDoughnutPlugin, yearRangeChart3Legend]

                        });
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
                var yearrangechart4;
                var createYearRangeChart4 = function () {
                    if (yearrangechart4) {
                        yearrangechart4.destroy();
                    }
                    yearrangechart4 = new Chart(fragmentElement.querySelector("#yearRangeChart4"),
                        {
                            type: 'doughnut',
                            data: yearRangeChart4Data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '85%',
                                elements: {
                                    center: {
                                        text: yearRangeChartDataProcent4,
                                        color: '#000000', // Default is #000000
                                        fontStyle: 'Arial', // Default is Arial
                                        sidePadding: 20, // Default is 20 (as a percentage)
                                        minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                                        lineHeight: 25 // Default is 25 (in px), used for when text wraps
                                    }
                                },
                                plugins: {
                                    htmlLegend: {
                                        // ID of the container to put the legend in
                                        containerID: 'yearRangeChart4-legend'
                                    },
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {
                                                var title = context[0].label;
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label + " %";
                                            }
                                        }
                                    }
                                }
                            },
                            plugins: [centerDoughnutPlugin, yearRangeChart4Legend]

                        });
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
                var yearrangechart5;
                var createYearRangeChart5 = function () {
                    if (yearrangechart5) {
                        yearrangechart5.destroy();
                    }
                    yearrangechart5 = new Chart(fragmentElement.querySelector("#yearRangeChart5"),
                        {
                            type: 'doughnut',
                            data: yearRangeChart5Data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '85%',
                                elements: {
                                    center: {
                                        text: yearRangeChartDataProcent5,
                                        color: '#000000', // Default is #000000
                                        fontStyle: 'Arial', // Default is Arial
                                        sidePadding: 20, // Default is 20 (as a percentage)
                                        minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                                        lineHeight: 25 // Default is 25 (in px), used for when text wraps
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {
                                                var title = context[0].label;
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label + " %";
                                            }
                                        }
                                    }
                                }
                            },
                            plugins: [centerDoughnutPlugin]

                        });
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
                var yearrangechart6;
                var createYearRangeChart6 = function () {
                    if (yearrangechart6) {
                        yearrangechart6.destroy();
                    }
                    yearrangechart6 = new Chart(fragmentElement.querySelector("#yearRangeChart6"),
                        {
                            type: 'doughnut',
                            data: yearRangeChart6Data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '85%',
                                elements: {
                                    center: {
                                        text: yearRangeChartDataProcent6,
                                        color: '#000000', // Default is #000000
                                        fontStyle: 'Arial', // Default is Arial
                                        sidePadding: 20, // Default is 20 (as a percentage)
                                        minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                                        lineHeight: 25 // Default is 25 (in px), used for when text wraps
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {
                                                var title = context[0].label;
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label + " %";
                                            }
                                        }
                                    }
                                }
                            },
                            plugins: [centerDoughnutPlugin]

                        });
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
                var yearrangechart7;
                var createYearRangeChart7 = function () {
                    if (yearrangechart7) {
                        yearrangechart7.destroy();
                    }
                    yearrangechart7 = new Chart(fragmentElement.querySelector("#yearRangeChart7"),
                        {
                            type: 'doughnut',
                            data: yearRangeChart7Data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '85%',
                                elements: {
                                    center: {
                                        text: yearRangeChartDataProcent7,
                                        color: '#000000', // Default is #000000
                                        fontStyle: 'Arial', // Default is Arial
                                        sidePadding: 20, // Default is 20 (as a percentage)
                                        minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                                        lineHeight: 25 // Default is 25 (in px), used for when text wraps
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {
                                                var title = context[0].label;
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label + " %";
                                            }
                                        }
                                    }
                                }
                            },
                            plugins: [centerDoughnutPlugin]

                        });
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
                var yearrangechart8;
                var createYearRangeChart8 = function () {
                    if (yearrangechart8) {
                        yearrangechart8.destroy();
                    }
                    yearrangechart8 = new Chart(fragmentElement.querySelector("#yearRangeChart8"),
                        {
                            type: 'doughnut',
                            data: yearRangeChart8Data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '85%',
                                elements: {
                                    center: {
                                        text: yearRangeChartDataProcent8,
                                        color: '#000000', // Default is #000000
                                        fontStyle: 'Arial', // Default is Arial
                                        sidePadding: 20, // Default is 20 (as a percentage)
                                        minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                                        lineHeight: 25 // Default is 25 (in px), used for when text wraps
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {
                                                var title = context[0].label;
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label + " %";
                                            }
                                        }
                                    }
                                }
                            },
                            plugins: [centerDoughnutPlugin]

                        });
                }
                this.createYearRangeChart8 = createYearRangeChart8;

                var setUpData = function () {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    if (that.isSupreme === 1) {
                        yearRangeChart1Data.labels = yearRangeChartDataLabels1;
                        yearRangeChart1Data.datasets[0].data = yearRangeChartDataRaw1;
                        yearRangeChart2Data.labels = yearRangeChartDataLabels2;
                        yearRangeChart2Data.datasets[0].data = yearRangeChartDataRaw2;
                        yearRangeChart3Data.labels = yearRangeChartDataLabels3;
                        yearRangeChart3Data.datasets[0].data = yearRangeChartDataRaw3;
                        yearRangeChart4Data.labels = yearRangeChartDataLabels4;
                        yearRangeChart4Data.datasets[0].data = yearRangeChartDataRaw4;
                    }
                    if (that.isSupreme === 2) {
                        yearRangeChart1Data.labels = yearRangeChartDataLabels1;
                        yearRangeChart1Data.datasets[0].data = yearRangeChartDataRaw1;
                        yearRangeChart2Data.labels = yearRangeChartDataLabels2;
                        yearRangeChart2Data.datasets[0].data = yearRangeChartDataRaw2;
                        yearRangeChart3Data.labels = yearRangeChartDataLabels3;
                        yearRangeChart3Data.datasets[0].data = yearRangeChartDataRaw3;
                        yearRangeChart4Data.labels = yearRangeChartDataLabels4;
                        yearRangeChart4Data.datasets[0].data = yearRangeChartDataRaw4;
                        yearRangeChart5Data.labels = yearRangeChartDataLabels5;
                        yearRangeChart5Data.datasets[0].data = yearRangeChartDataRaw5;
                        yearRangeChart6Data.labels = yearRangeChartDataLabels6;
                        yearRangeChart6Data.datasets[0].data = yearRangeChartDataRaw6;
                        yearRangeChart7Data.labels = yearRangeChartDataLabels7;
                        yearRangeChart7Data.datasets[0].data = yearRangeChartDataRaw7;
                        yearRangeChart8Data.labels = yearRangeChartDataLabels8;
                        yearRangeChart8Data.datasets[0].data = yearRangeChartDataRaw8;
                    }

                }
                this.setUpData = setUpData;

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
                        that.setUpData();
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
                        that.setUpData();
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