// controller for page: StartQuestions
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/DiaIndustries/DiaIndustriesService.js" />
/// <reference path="~/www/lib/chartJS/scripts/dist/chart.js" />
(function () {
    "use strict";

    WinJS.Namespace.define("DiaIndustries", {
        Controller: WinJS.Class.derive(Fragments.Controller,
            function Controller(fragmentElement, options) {
                Log.call(Log.l.trace, "DiaIndustries.Controller.");
                Fragments.Controller.apply(this,
                    [
                        fragmentElement, {
                            criteriaMain: 1,
                            criteriaSecond: "",
                            isSupreme: false
                        }
                    ]);

                var that = this;

                var icons = fragmentElement.querySelector(".industries-chart-top-container");

                var loadIcon = function () {
                    var icon = fragmentElement.querySelector(".action-image");
                    icon.name = "information";
                    Colors.loadSVGImageElements(icons, "action-image", 24, Colors.textColor, "name");
                }
                this.loadIcon = loadIcon;

                this.isSupreme = parseInt(AppData._persistentStates.showdashboardMesagoCombo);

                var criteriadrop = fragmentElement.querySelector("#criteriadropdown"); 
                var industriesTooltip = fragmentElement.querySelector("#mydiaIndustriesElement");

                var dropdowncolor = function () {
                    criteriadrop.style.backgroundColor = "#efedee ";
                }
                this.dropdowncolor = dropdowncolor;

                var setTooltipText = function() {
                    if (that.isSupreme === 1) {
                        industriesTooltip.innerHTML = getResourceText("diaIndustries.tooltipPremium");
                    } else {
                        industriesTooltip.innerHTML = getResourceText("diaIndustries.tooltipSupreme1") + " <br>  <p></p>" + getResourceText("diaIndustries.tooltipSupreme2");
                    }
                }
                this.setTooltipText = setTooltipText;

                var setSupremeContainer = function () {
                    if (that.isSupreme === 1) {
                        that.binding.isSupreme = false;
                    } else {
                        that.binding.isSupreme = true;
                    }
                }
                this.setSupremeContainer = setSupremeContainer;

                var getColor = function (color, id) {
                    var rgbColor = Colors.hex2rgb(color);
                    var hsvColor = Colors.rgb2hsv(rgbColor);
                    hsvColor.s *= 0.8 - id;
                    hsvColor.v /= 0.8 - id;
                    rgbColor = Colors.hsv2rgb(hsvColor);
                    return Colors.rgb2hex(rgbColor);
                }
                this.getColor = getColor;

                var supremeColor = "#cc5b87";

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
                            ctx.font = "bold " + "11px " + fontStyle;

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

                //IndustriesYearChart1Data
                var industriesYearChartDataLabels1 = [];
                var industriesYearChartDataLabels1Cut = [];
                var industriesYearChartDataTexts1 = "";
                var industriesYearChartDataRaw1 = [];
                var industriesYearChartDataProcent1 = "";

                var yearRangeChart1Data = {
                    labels: industriesYearChartDataLabels1,
                    datasets: [{
                        data: industriesYearChartDataRaw1,
                        backgroundColor: [
                            Colors.dashboardColor,
                            that.getColor(Colors.dashboardColor, 0.3),
                            that.getColor(Colors.dashboardColor, 0.4),
                            that.getColor(Colors.dashboardColor, 0.6),
                            that.getColor(Colors.dashboardColor, 0.7)
                        ],
                        borderColor: [
                            Colors.dashboardColor,
                            that.getColor(Colors.dashboardColor, 0.3),
                            that.getColor(Colors.dashboardColor, 0.4),
                            that.getColor(Colors.dashboardColor, 0.6),
                            that.getColor(Colors.dashboardColor, 0.7)
                        ]
                    }]
                };
                //YearRangeChart1
                var industriesyearchart1;
                var createIndustriesYearChart1 = function () {
                    if (industriesyearchart1) {
                        industriesyearchart1.destroy();
                    }
                    industriesyearchart1 = new Chart(fragmentElement.querySelector("#industriesYearChart1").getContext("2d"),
                        {
                            type: 'doughnut',
                            data: yearRangeChart1Data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '85%',
                                elements: {
                                    center: {
                                        text: industriesYearChartDataProcent1 + " " + industriesYearChartDataTexts1,
                                        color: '#000000', // Default is #000000
                                        fontStyle: 'Arial', // Default is Arial
                                        sidePadding: 20, // Default is 20 (as a percentage)
                                        minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                                        lineHeight: 25 // Default is 25 (in px), used for when text wraps
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'left',
                                        labels: {
                                            boxWidth: 10
                                        }
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {
                                                var title = industriesYearChartDataLabels1[context[0].dataIndex];
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label;
                                            }
                                        }
                                    }
                                }
                            },
                            plugins: [centerDoughnutPlugin]

                        });
                }
                this.createIndustriesYearChart1 = createIndustriesYearChart1;
                
                //YearRangeChart2Data
                var industriesYearChartDataLabels2 = [];
                var industriesYearChartDataLabels2Cut = [];
                var industriesYearChartDataTexts2 = "";
                var industriesYearChartDataRaw2 = [];
                var industriesYearChartDataProcent2 = "";

                var yearRangeChart2Data = {
                    labels: industriesYearChartDataLabels2,
                    datasets: [{
                        data: industriesYearChartDataRaw2,
                        backgroundColor: [
                            Colors.dashboardColor,
                            that.getColor(Colors.dashboardColor, 0.3),
                            that.getColor(Colors.dashboardColor, 0.4),
                            that.getColor(Colors.dashboardColor, 0.6),
                            that.getColor(Colors.dashboardColor, 0.7)
                        ],
                        borderColor: [
                            Colors.dashboardColor,
                            that.getColor(Colors.dashboardColor, 0.3),
                            that.getColor(Colors.dashboardColor, 0.4),
                            that.getColor(Colors.dashboardColor, 0.6),
                            that.getColor(Colors.dashboardColor, 0.7)
                        ]
                    }]
                };
                //YearRangeChart2
                
                var industriesyearchart2;
                var createIndustriesYearChart2 = function () {
                    if (industriesyearchart2) {
                        industriesyearchart2.destroy();
                    }
                    industriesyearchart2 = new Chart(fragmentElement.querySelector("#industriesYearChart2").getContext("2d"),
                        {
                            type: 'doughnut',
                            data: yearRangeChart2Data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '85%',
                                elements: {
                                    center: {
                                        text: industriesYearChartDataProcent2 + " " + industriesYearChartDataTexts2,
                                        color: '#000000', // Default is #000000
                                        fontStyle: 'Arial', // Default is Arial
                                        sidePadding: 20, // Default is 20 (as a percentage)
                                        minFontSize: 10, // Default is 20 (in px), set to false and text will not wrap.
                                        lineHeight: 25 // Default is 25 (in px), used for when text wraps
                                    }
                                }, plugins: {
                                    legend: {
                                        display: true,
                                        position: 'left',
                                        labels: {
                                            boxWidth: 10
                                        }
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {
                                                var title = industriesYearChartDataLabels2[context[0].dataIndex];
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label;
                                            }
                                        }
                                    }
                                }
                            },
                            plugins: [centerDoughnutPlugin]

                        });
                }
                this.createIndustriesYearChart2 = createIndustriesYearChart2;

                //YearRangeChart3Data
                var industriesYearChartDataLabels3 = [];
                var industriesYearChartDataLabels3Cut = [];
                var industriesYearChartDataTexts3 = "";
                var industriesYearChartDataRaw3 = [];
                var industriesYearChartDataProcent3 = "";

                var yearRangeChart3Data = {
                    labels: industriesYearChartDataLabels3,
                    datasets: [{
                        data: industriesYearChartDataRaw3,
                        backgroundColor: [
                            Colors.dashboardColor,
                            that.getColor(Colors.dashboardColor, 0.3),
                            that.getColor(Colors.dashboardColor, 0.4),
                            that.getColor(Colors.dashboardColor, 0.6),
                            that.getColor(Colors.dashboardColor, 0.7)
                        ],
                        borderColor: [
                            Colors.dashboardColor,
                            that.getColor(Colors.dashboardColor, 0.3),
                            that.getColor(Colors.dashboardColor, 0.4),
                            that.getColor(Colors.dashboardColor, 0.6),
                            that.getColor(Colors.dashboardColor, 0.7)
                        ]
                    }]
                };
                //YearRangeChart3

                var industriesyearchart3;
                var createIndustriesYearChart3 = function () {
                    if (industriesyearchart3) {
                        industriesyearchart3.destroy();
                    }
                    industriesyearchart3 = new Chart(fragmentElement.querySelector("#industriesYearChart3").getContext("2d"),
                        {
                            type: 'doughnut',
                            data: yearRangeChart3Data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '85%',
                                elements: {
                                    center: {
                                        text: industriesYearChartDataProcent3 + " " + industriesYearChartDataTexts3,
                                        color: '#000000', // Default is #000000
                                        fontStyle: 'Arial', // Default is Arial
                                        sidePadding: 20, // Default is 20 (as a percentage)
                                        minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                                        lineHeight: 25 // Default is 25 (in px), used for when text wraps
                                    }
                                }, plugins: {
                                    legend: {
                                        display: true,
                                        position: 'left',
                                        labels: {
                                            boxWidth: 10
                                        }
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {
                                                var title = industriesYearChartDataLabels3[context[0].dataIndex];
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label;
                                            }
                                        }
                                    }
                                }
                            },
                            plugins: [centerDoughnutPlugin]

                        });
                }
                this.createIndustriesYearChart3 = createIndustriesYearChart3;

                //YearRangeChart4Data
                var industriesYearChartDataLabels4 = [];
                var industriesYearChartDataLabels4Cut = [];
                var industriesYearChartDataTexts4 = "";
                var industriesYearChartDataRaw4 = [];
                var industriesYearChartDataProcent4 = "";

                var yearRangeChart4Data = {
                    labels: industriesYearChartDataLabels4,
                    datasets: [{
                        data: industriesYearChartDataRaw4,
                        backgroundColor: [
                            Colors.dashboardColor,
                            that.getColor(Colors.dashboardColor, 0.3),
                            that.getColor(Colors.dashboardColor, 0.4),
                            that.getColor(Colors.dashboardColor, 0.6),
                            that.getColor(Colors.dashboardColor, 0.7)
                        ],
                        borderColor: [
                            Colors.dashboardColor,
                            that.getColor(Colors.dashboardColor, 0.3),
                            that.getColor(Colors.dashboardColor, 0.4),
                            that.getColor(Colors.dashboardColor, 0.6),
                            that.getColor(Colors.dashboardColor, 0.7)
                        ]
                    }]
                };
                //YearRangeChart4

                var industriesyearchart4;
                var createIndustriesYearChart4 = function () {
                    if (industriesyearchart4) {
                        industriesyearchart4.destroy();
                    }
                    industriesyearchart4 = new Chart(fragmentElement.querySelector("#industriesYearChart4").getContext("2d"),
                        {
                            type: 'doughnut',
                            data: yearRangeChart4Data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '85%',
                                elements: {
                                    center: {
                                        text: industriesYearChartDataProcent4 + " " + industriesYearChartDataTexts4,
                                        color: '#000000', // Default is #000000
                                        fontStyle: 'Arial', // Default is Arial
                                        sidePadding: 20, // Default is 20 (as a percentage)
                                        minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                                        lineHeight: 25 // Default is 25 (in px), used for when text wraps
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'left',
                                        labels: {
                                            boxWidth: 10
                                        }
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {
                                                var title = industriesYearChartDataLabels4[context[0].dataIndex];
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label;
                                            }
                                        }
                                    }
                                }
                            },
                            plugins: [centerDoughnutPlugin]

                        });
                }
                this.createIndustriesYearChart4 = createIndustriesYearChart4;

                //IndustriesYearChart5Data
                var industriesYearChartDataLabels5 = [];
                var industriesYearChartDataLabels5Cut = [];
                var industriesYearChartDataTexts5 = "";
                var industriesYearChartDataRaw5 = [];
                var industriesYearChartDataProcent5 = "";

                var yearRangeChart5Data = {
                    labels: industriesYearChartDataLabels5,
                    datasets: [{
                        data: industriesYearChartDataRaw5,
                        backgroundColor: [
                            supremeColor,
                            that.getColor(supremeColor, 0.3),
                            that.getColor(supremeColor, 0.4),
                            that.getColor(supremeColor, 0.6),
                            that.getColor(supremeColor, 0.7)
                        ],
                        borderColor: [
                            supremeColor,
                            that.getColor(supremeColor, 0.3),
                            that.getColor(supremeColor, 0.4),
                            that.getColor(supremeColor, 0.6),
                            that.getColor(supremeColor, 0.7)
                        ]
                    }]
                };

                //YearRangeChart5

                var industriesyearchart5;
                var createIndustriesYearChart5 = function () {
                    if (industriesyearchart5) {
                        industriesyearchart5.destroy();
                    }
                    industriesyearchart5 = new Chart(fragmentElement.querySelector("#industriesYearChart5").getContext("2d"),
                        {
                            type: 'doughnut',
                            data: yearRangeChart5Data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '85%',
                                elements: {
                                    center: {
                                        text: industriesYearChartDataProcent5 + " " + industriesYearChartDataTexts5,
                                        color: '#000000', // Default is #000000
                                        fontStyle: 'Arial', // Default is Arial
                                        sidePadding: 20, // Default is 20 (as a percentage)
                                        minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                                        lineHeight: 25 // Default is 25 (in px), used for when text wraps
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'left',
                                        labels: {
                                            boxWidth: 10
                                        }
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {
                                                var title = industriesYearChartDataLabels5[context[0].dataIndex];
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label;
                                            }
                                        }
                                    }
                                }
                            },
                            plugins: [centerDoughnutPlugin]

                        });
                }
                this.createIndustriesYearChart5 = createIndustriesYearChart5;

                //YearRangeChart6Data
                var industriesYearChartDataLabels6 = [];
                var industriesYearChartDataLabels6Cut = [];
                var industriesYearChartDataTexts6 = "";
                var industriesYearChartDataRaw6 = [];
                var industriesYearChartDataProcent6 = "";

                var yearRangeChart6Data = {
                    labels: industriesYearChartDataLabels6,
                    datasets: [{
                        data: industriesYearChartDataRaw6,
                        backgroundColor: [
                            supremeColor,
                            that.getColor(supremeColor, 0.3),
                            that.getColor(supremeColor, 0.4),
                            that.getColor(supremeColor, 0.6),
                            that.getColor(supremeColor, 0.7)
                        ],
                        borderColor: [
                            supremeColor,
                            that.getColor(supremeColor, 0.3),
                            that.getColor(supremeColor, 0.4),
                            that.getColor(supremeColor, 0.6),
                            that.getColor(supremeColor, 0.7)
                        ]
                    }]
                };
                //YearRangeChart6

                var industriesyearchart6;
                var createIndustriesYearChart6 = function () {
                    if (industriesyearchart6) {
                        industriesyearchart6.destroy();
                    }
                    industriesyearchart6 = new Chart(fragmentElement.querySelector("#industriesYearChart6").getContext("2d"),
                        {
                            type: 'doughnut',
                            data: yearRangeChart6Data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '85%',
                                elements: {
                                    center: {
                                        text: industriesYearChartDataProcent6 + " " + industriesYearChartDataTexts6,
                                        color: '#000000', // Default is #000000
                                        fontStyle: 'Arial', // Default is Arial
                                        sidePadding: 20, // Default is 20 (as a percentage)
                                        minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                                        lineHeight: 25 // Default is 25 (in px), used for when text wraps
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'left',
                                        labels: {
                                            boxWidth: 10
                                        }
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {
                                                var title = industriesYearChartDataLabels6[context[0].dataIndex];
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label;
                                            }
                                        }
                                    }
                                }
                            },
                            plugins: [centerDoughnutPlugin]

                        });
                }
                this.createIndustriesYearChart6 = createIndustriesYearChart6;

                //YearRangeChart7Data
                var industriesYearChartDataLabels7 = [];
                var industriesYearChartDataLabels7Cut = [];
                var industriesYearChartDataTexts7 = "";
                var industriesYearChartDataRaw7 = [];
                var industriesYearChartDataProcent7 = "";

                var yearRangeChart7Data = {
                    labels: industriesYearChartDataLabels7,
                    datasets: [{
                        data: industriesYearChartDataRaw7,
                        backgroundColor: [
                            supremeColor,
                            that.getColor(supremeColor, 0.3),
                            that.getColor(supremeColor, 0.4),
                            that.getColor(supremeColor, 0.6),
                            that.getColor(supremeColor, 0.7)
                        ],
                        borderColor: [
                            supremeColor,
                            that.getColor(supremeColor, 0.3),
                            that.getColor(supremeColor, 0.4),
                            that.getColor(supremeColor, 0.6),
                            that.getColor(supremeColor, 0.7)
                        ]
                    }]
                };
                //YearRangeChart7

                var industriesyearchart7;
                var createIndustriesYearChart7 = function () {
                    if (industriesyearchart7) {
                        industriesyearchart7.destroy();
                    }
                    industriesyearchart7 = new Chart(fragmentElement.querySelector("#industriesYearChart7").getContext("2d"),
                        {
                            type: 'doughnut',
                            data: yearRangeChart7Data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '85%',
                                elements: {
                                    center: {
                                        text: industriesYearChartDataProcent7 + " " + industriesYearChartDataTexts7,
                                        color: '#000000', // Default is #000000
                                        fontStyle: 'Arial', // Default is Arial
                                        sidePadding: 20, // Default is 20 (as a percentage)
                                        minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                                        lineHeight: 25 // Default is 25 (in px), used for when text wraps
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'left',
                                        labels: {
                                            boxWidth: 10
                                        }
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {
                                                var title = industriesYearChartDataLabels7[context[0].dataIndex];
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label;
                                            }
                                        }
                                    }
                                }
                            },
                            plugins: [centerDoughnutPlugin]

                        });
                }
                this.createIndustriesYearChart7 = createIndustriesYearChart7;

                //YearRangeChart4Data
                var industriesYearChartDataLabels8 = [];
                var industriesYearChartDataLabels8Cut = [];
                var industriesYearChartDataTexts8 = "";
                var industriesYearChartDataRaw8 = [];
                var industriesYearChartDataProcent8 = "";

                var yearRangeChart8Data = {
                    labels: industriesYearChartDataLabels8,
                    datasets: [{
                        data: industriesYearChartDataRaw8,
                        backgroundColor: [
                            supremeColor,
                            that.getColor(supremeColor, 0.3),
                            that.getColor(supremeColor, 0.4),
                            that.getColor(supremeColor, 0.6),
                            that.getColor(supremeColor, 0.7)
                        ],
                        borderColor: [
                            supremeColor,
                            that.getColor(supremeColor, 0.3),
                            that.getColor(supremeColor, 0.4),
                            that.getColor(supremeColor, 0.6),
                            that.getColor(supremeColor, 0.7)
                        ]
                    }]
                };
                //YearRangeChart4

                var industriesyearchart8;
                var createIndustriesYearChart8 = function () {
                    if (industriesyearchart8) {
                        industriesyearchart8.destroy();
                    }
                    industriesyearchart8 = new Chart(fragmentElement.querySelector("#industriesYearChart8").getContext("2d"),
                        {
                            type: 'doughnut',
                            data: yearRangeChart8Data,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '85%',
                                elements: {
                                    center: {
                                        text: industriesYearChartDataProcent8 + " " + industriesYearChartDataTexts8,
                                        color: '#000000', // Default is #000000
                                        fontStyle: 'Arial', // Default is Arial
                                        sidePadding: 20, // Default is 20 (as a percentage)
                                        minFontSize: 20, // Default is 20 (in px), set to false and text will not wrap.
                                        lineHeight: 25 // Default is 25 (in px), used for when text wraps
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'left',
                                        labels: {
                                            boxWidth: 10
                                        }
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {
                                                var title = industriesYearChartDataLabels8[context[0].dataIndex];
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label;
                                            }
                                        }
                                    }
                                }
                            },
                            plugins: [centerDoughnutPlugin]

                        });
                }
                this.createIndustriesYearChart8 = createIndustriesYearChart8;

                var clearArrays = function() {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    //clear IndustriesYearChart1Data
                    industriesYearChartDataLabels1 = [];
                    industriesYearChartDataLabels1Cut = [];
                    industriesYearChartDataTexts1 = "";
                    industriesYearChartDataRaw1 = [];
                    industriesYearChartDataProcent1 = "";
                    yearRangeChart1Data = {
                        labels: industriesYearChartDataLabels1,
                        datasets: [{
                            data: industriesYearChartDataRaw1,
                            backgroundColor: [
                                Colors.dashboardColor,
                                that.getColor(Colors.dashboardColor, 0.3),
                                that.getColor(Colors.dashboardColor, 0.4),
                                that.getColor(Colors.dashboardColor, 0.6),
                                that.getColor(Colors.dashboardColor, 0.7)
                            ],
                            borderColor: [
                                Colors.dashboardColor,
                                that.getColor(Colors.dashboardColor, 0.3),
                                that.getColor(Colors.dashboardColor, 0.4),
                                that.getColor(Colors.dashboardColor, 0.6),
                                that.getColor(Colors.dashboardColor, 0.7)
                            ]
                        }]
                    };

                    //clear IndustriesYearChart2Data
                    industriesYearChartDataLabels2 = [];
                    industriesYearChartDataLabels2Cut = [];
                    industriesYearChartDataTexts2 = "";
                    industriesYearChartDataRaw2 = [];
                    industriesYearChartDataProcent2 = "";
                    yearRangeChart2Data = {
                        labels: industriesYearChartDataLabels2,
                        datasets: [{
                            data: industriesYearChartDataRaw2,
                            backgroundColor: [
                                Colors.dashboardColor,
                                that.getColor(Colors.dashboardColor, 0.3),
                                that.getColor(Colors.dashboardColor, 0.4),
                                that.getColor(Colors.dashboardColor, 0.6),
                                that.getColor(Colors.dashboardColor, 0.7)
                            ],
                            borderColor: [
                                Colors.dashboardColor,
                                that.getColor(Colors.dashboardColor, 0.3),
                                that.getColor(Colors.dashboardColor, 0.4),
                                that.getColor(Colors.dashboardColor, 0.6),
                                that.getColor(Colors.dashboardColor, 0.7)
                            ]
                        }]
                    };

                    //clear IndustriesYearChart3Data
                    industriesYearChartDataLabels3 = [];
                    industriesYearChartDataLabels3Cut = [];
                    industriesYearChartDataTexts3 = "";
                    industriesYearChartDataRaw3 = [];
                    industriesYearChartDataProcent3 = "";
                    yearRangeChart3Data = {
                        labels: industriesYearChartDataLabels3,
                        datasets: [{
                            data: industriesYearChartDataRaw3,
                            backgroundColor: [
                                Colors.dashboardColor,
                                that.getColor(Colors.dashboardColor, 0.3),
                                that.getColor(Colors.dashboardColor, 0.4),
                                that.getColor(Colors.dashboardColor, 0.6),
                                that.getColor(Colors.dashboardColor, 0.7)
                            ],
                            borderColor: [
                                Colors.dashboardColor,
                                that.getColor(Colors.dashboardColor, 0.3),
                                that.getColor(Colors.dashboardColor, 0.4),
                                that.getColor(Colors.dashboardColor, 0.6),
                                that.getColor(Colors.dashboardColor, 0.7)
                            ]
                        }]
                    };

                    //clear IndustriesYearChart4Data
                    industriesYearChartDataLabels4 = [];
                    industriesYearChartDataLabels4Cut = [];
                    industriesYearChartDataTexts4 = "";
                    industriesYearChartDataRaw4 = [];
                    industriesYearChartDataProcent4 = "";
                    yearRangeChart4Data = {
                        labels: industriesYearChartDataLabels4,
                        datasets: [{
                            data: industriesYearChartDataRaw4,
                            backgroundColor: [
                                Colors.dashboardColor,
                                that.getColor(Colors.dashboardColor, 0.3),
                                that.getColor(Colors.dashboardColor, 0.4),
                                that.getColor(Colors.dashboardColor, 0.6),
                                that.getColor(Colors.dashboardColor, 0.7)
                            ],
                            borderColor: [
                                Colors.dashboardColor,
                                that.getColor(Colors.dashboardColor, 0.3),
                                that.getColor(Colors.dashboardColor, 0.4),
                                that.getColor(Colors.dashboardColor, 0.6),
                                that.getColor(Colors.dashboardColor, 0.7)
                            ]
                        }]
                    };
                    Log.ret(Log.l.trace);
                    //Surpreme
                    if (that.isSupreme === 2) {
                        Log.call(Log.l.trace, "DiaYearRange.Controller.");
                        //clear IndustriesYearChart5Data
                        industriesYearChartDataLabels5 = [];
                        industriesYearChartDataLabels5Cut = [];
                        industriesYearChartDataTexts5 = "";
                        industriesYearChartDataRaw5 = [];
                        industriesYearChartDataProcent5 = "";
                        yearRangeChart5Data = {
                            labels: industriesYearChartDataLabels5,
                            datasets: [{
                                data: industriesYearChartDataRaw5,
                                backgroundColor: [
                                    supremeColor,
                                    that.getColor(supremeColor, 0.3),
                                    that.getColor(supremeColor, 0.4),
                                    that.getColor(supremeColor, 0.6),
                                    that.getColor(supremeColor, 0.7)
                                ],
                                borderColor: [
                                    supremeColor,
                                    that.getColor(supremeColor, 0.3),
                                    that.getColor(supremeColor, 0.4),
                                    that.getColor(supremeColor, 0.6),
                                    that.getColor(supremeColor, 0.7)
                                ]
                            }]
                        };

                        //clear IndustriesYearChart6Data
                        industriesYearChartDataLabels6 = [];
                        industriesYearChartDataLabels6Cut = [];
                        industriesYearChartDataTexts6 = "";
                        industriesYearChartDataRaw6 = [];
                        industriesYearChartDataProcent6 = "";
                        yearRangeChart6Data = {
                            labels: industriesYearChartDataLabels6,
                            datasets: [{
                                data: industriesYearChartDataRaw6,
                                backgroundColor: [
                                    supremeColor,
                                    that.getColor(supremeColor, 0.3),
                                    that.getColor(supremeColor, 0.4),
                                    that.getColor(supremeColor, 0.6),
                                    that.getColor(supremeColor, 0.7)
                                ],
                                borderColor: [
                                    supremeColor,
                                    that.getColor(supremeColor, 0.3),
                                    that.getColor(supremeColor, 0.4),
                                    that.getColor(supremeColor, 0.6),
                                    that.getColor(supremeColor, 0.7)
                                ]
                            }]
                        };

                        //clear IndustriesYearChart7Data
                        industriesYearChartDataLabels7 = [];
                        industriesYearChartDataLabels7Cut = [];
                        industriesYearChartDataTexts7 = "";
                        industriesYearChartDataRaw7 = [];
                        industriesYearChartDataProcent7 = "";
                        yearRangeChart7Data = {
                            labels: industriesYearChartDataLabels7,
                            datasets: [{
                                data: industriesYearChartDataRaw7,
                                backgroundColor: [
                                    supremeColor,
                                    that.getColor(supremeColor, 0.3),
                                    that.getColor(supremeColor, 0.4),
                                    that.getColor(supremeColor, 0.6),
                                    that.getColor(supremeColor, 0.7)
                                ],
                                borderColor: [
                                    supremeColor,
                                    that.getColor(supremeColor, 0.3),
                                    that.getColor(supremeColor, 0.4),
                                    that.getColor(supremeColor, 0.6),
                                    that.getColor(supremeColor, 0.7)
                                ]
                            }]
                        };

                        //clear IndustriesYearChart8Data
                        industriesYearChartDataLabels8 = [];
                        industriesYearChartDataLabels8Cut = [];
                        industriesYearChartDataTexts8 = "";
                        industriesYearChartDataRaw8 = [];
                        industriesYearChartDataProcent8 = "";
                        yearRangeChart8Data = {
                            labels: industriesYearChartDataLabels8,
                            datasets: [{
                                data: industriesYearChartDataRaw8,
                                backgroundColor: [
                                    supremeColor,
                                    that.getColor(supremeColor, 0.3),
                                    that.getColor(supremeColor, 0.4),
                                    that.getColor(supremeColor, 0.6),
                                    that.getColor(supremeColor, 0.7)
                                ],
                                borderColor: [
                                    supremeColor,
                                    that.getColor(supremeColor, 0.3),
                                    that.getColor(supremeColor, 0.4),
                                    that.getColor(supremeColor, 0.6),
                                    that.getColor(supremeColor, 0.7)
                                ]
                            }]
                        };
                        Log.ret(Log.l.trace); 
                    }
                }
                this.clearArrays = clearArrays;

                var redrawCharts = function() {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    yearRangeChart1Data.labels = industriesYearChartDataLabels1Cut;
                    yearRangeChart1Data.datasets[0].data = industriesYearChartDataRaw2;
                    yearRangeChart2Data.labels = industriesYearChartDataLabels2Cut;
                    yearRangeChart2Data.datasets[0].data = industriesYearChartDataRaw2;
                    yearRangeChart3Data.labels = industriesYearChartDataLabels3Cut;
                    yearRangeChart3Data.datasets[0].data = industriesYearChartDataRaw3;
                    yearRangeChart4Data.labels = industriesYearChartDataLabels4Cut;
                    yearRangeChart4Data.datasets[0].data = industriesYearChartDataRaw4;
                    if (that.isSupreme === 2) {
                        yearRangeChart5Data.labels = industriesYearChartDataLabels5Cut;
                        yearRangeChart5Data.datasets[0].data = industriesYearChartDataRaw5;
                        yearRangeChart6Data.labels = industriesYearChartDataLabels6Cut;
                        yearRangeChart6Data.datasets[0].data = industriesYearChartDataRaw6;
                        yearRangeChart7Data.labels = industriesYearChartDataLabels7Cut;
                        yearRangeChart7Data.datasets[0].data = industriesYearChartDataRaw7;
                        yearRangeChart8Data.labels = industriesYearChartDataLabels8Cut;
                        yearRangeChart8Data.datasets[0].data = industriesYearChartDataRaw8;
                        Log.ret(Log.l.trace);
                    }
                }
                this.redrawCharts = redrawCharts;

                var drawPremiumCharts = function () {
                    that.createIndustriesYearChart1();
                    that.createIndustriesYearChart2();
                    that.createIndustriesYearChart3();
                    that.createIndustriesYearChart4();
                }
                this.drawPremiumCharts = drawPremiumCharts;

                var drawSupremeCharts = function () {
                        that.createIndustriesYearChart5();
                        /*that.createIndustriesYearChart6();
                        that.createIndustriesYearChart7();
                        that.createIndustriesYearChart8();*/
                }
                this.drawSupremeCharts = drawSupremeCharts;

                var resultConverterPremium = function (item, index) {
                    item.index = index;
                    if (item.QualifierExtID === "17281") {
                        //tooltip for dougnut
                        var splitQualifier2;
                        if (AppData.getLanguageId() === 1031) {
                            splitQualifier2 = item.Qualifier2.replace(/und/gi, "?und").split("?");
                        } else {
                            splitQualifier2 = item.Qualifier2.replace(/and/gi, "?and").split("?");

                        }
                        splitQualifier2[splitQualifier2.length - 1] = splitQualifier2[splitQualifier2.length - 1].trim() + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%";
                        industriesYearChartDataLabels1.push(splitQualifier2);
                        //industriesYearChartDataLabels1.push(item.Qualifier2 + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                        if (item.Qualifier2) {
                            if (item.Qualifier2.length > 15) {
                                var qualifier2Cut = item.Qualifier2.substring(15, 0);
                                industriesYearChartDataLabels1Cut.push(qualifier2Cut + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                            } else {
                                industriesYearChartDataLabels1Cut.push(item.Qualifier2 + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                            }
                        }
                        //industriesYearChartDataLabels1.push(getResourceText("diaYearRange.remaindata"));
                        industriesYearChartDataRaw1.push(item.NumHits);
                        //industriesYearChartDataRaw1.push(item.NumTotal - item.NumHits);
                    }
                    if (item.QualifierExtID === "17282") {
                        //tooltip for dougnut
                        var splitQualifier2;
                        if (AppData.getLanguageId() === 1031) {
                            splitQualifier2 = item.Qualifier2.replace(/und/gi, "?und").split("?");
                        } else {
                            splitQualifier2 = item.Qualifier2.replace(/and/gi, "?and").split("?");

                        }
                        splitQualifier2[splitQualifier2.length - 1] = splitQualifier2[splitQualifier2.length - 1].trim() + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%";
                        industriesYearChartDataLabels2.push(splitQualifier2);
                        //industriesYearChartDataLabels2.push(item.Qualifier2 + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                        if (item.Qualifier2) {
                            if (item.Qualifier2.length > 15) {
                                var qualifier2Cut = item.Qualifier2.substring(15, 0);
                                industriesYearChartDataLabels2Cut.push(qualifier2Cut + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                            } else {
                                industriesYearChartDataLabels2Cut.push(item.Qualifier2 + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                            }
                        }
                        //industriesYearChartDataLabels2.push(getResourceText("diaYearRange.remaindata"));
                        industriesYearChartDataRaw2.push(item.NumHits);
                        //industriesYearChartDataRaw2.push(item.NumTotal - item.NumHits);
                    }
                    if (item.QualifierExtID === "17283") {
                        //tooltip for dougnut
                        var splitQualifier2;
                        if (AppData.getLanguageId() === 1031) {
                            splitQualifier2 = item.Qualifier2.replace(/und/gi, "?und").split("?");
                        } else {
                            splitQualifier2 = item.Qualifier2.replace(/and/gi, "?and").split("?");
                        
                        }
                        splitQualifier2[splitQualifier2.length - 1] = splitQualifier2[splitQualifier2.length - 1].trim() + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%";
                        industriesYearChartDataLabels3.push(splitQualifier2);
                        //industriesYearChartDataLabels3.push(item.Qualifier2 + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                        if (item.Qualifier2) {
                            if (item.Qualifier2.length > 15) {
                                var qualifier2Cut = item.Qualifier2.substring(15, 0);
                                industriesYearChartDataLabels3Cut.push(qualifier2Cut + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                            } else {
                                industriesYearChartDataLabels3Cut.push(item.Qualifier2 + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                            }
                        }
                        //industriesYearChartDataLabels3.push(getResourceText("diaYearRange.remaindata"));
                        industriesYearChartDataRaw3.push(item.NumHits);
                        //industriesYearChartDataRaw3.push(item.NumTotal - item.NumHits);
                    }
                    if (item.QualifierExtID === "17284") {
                        //tooltip for dougnut
                        var splitQualifier2;
                        if (AppData.getLanguageId() === 1031) {
                            splitQualifier2 = item.Qualifier2.replace(/und/gi, "?und").split("?");
                        } else {
                            splitQualifier2 = item.Qualifier2.replace(/and/gi, "?and").split("?");

                        }
                        splitQualifier2[splitQualifier2.length - 1] = splitQualifier2[splitQualifier2.length - 1].trim() + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%";
                        industriesYearChartDataLabels4.push(splitQualifier2);
                        //industriesYearChartDataLabels4.push(item.Qualifier2 + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                        if (item.Qualifier2) {
                            if (item.Qualifier2.length > 15) {
                                var qualifier2Cut = item.Qualifier2.substring(15, 0);
                                industriesYearChartDataLabels4Cut.push(qualifier2Cut + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                            } else {
                                industriesYearChartDataLabels4Cut.push(item.Qualifier2 + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                            }
                        }
                        //industriesYearChartDataLabels4.push(getResourceText("diaYearRange.remaindata"));
                        industriesYearChartDataRaw4.push(item.NumHits);
                        //industriesYearChartDataRaw4.push(item.NumTotal - item.NumHits);
                    }
                    /*if (item.QualifierExtID === "13189") {
                        industriesYearChartDataTexts1 = item.ResultMessage;
                        industriesYearChartDataTexts2 = item.ResultMessage;
                        industriesYearChartDataTexts3 = item.ResultMessage;
                        industriesYearChartDataTexts4 = item.ResultMessage;
                        industriesYearChartDataProcent4 = "";
                    }*/
                }
                this.resultConverterPremium = resultConverterPremium;

                var resultConverterSurpreme = function (item, index) {
                    item.index = index;  
                    if (item.QualifierExtID === "17281") {
                        if (industriesYearChartDataTexts5.length === 0) {
                            industriesYearChartDataTexts5 = item.Qualifier;
                        }
                        industriesYearChartDataLabels5.push(item.Qualifier2 + " " + item.PercentGlobal + " %");
                        if (item.Qualifier2) {
                            if (item.Qualifier2.length > 15) {
                                var qualifier2Cut = item.Qualifier2.substring(15, 0);
                                industriesYearChartDataLabels5Cut.push(qualifier2Cut + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                            } else {
                                industriesYearChartDataLabels5Cut.push(item.Qualifier2 + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                            }
                        }
                        //industriesYearChartDataLabels5.push(getResourceText("diaYearRange.remaindata"));
                        industriesYearChartDataRaw5.push(item.PercentGlobal);
                        //industriesYearChartDataRaw5.push(item.NumTotal - item.NumHits);
                        industriesYearChartDataProcent5 = item.PercentGlobal + "%";
                    }
                    if (item.QualifierExtID === "17282") {
                        if (industriesYearChartDataTexts6.length === 0) {
                            industriesYearChartDataTexts6 = item.Qualifier;
                        }
                        industriesYearChartDataLabels6.push(item.Qualifier2 + " " + item.PercentGlobal + " %");
                        if (item.Qualifier2) {
                            if (item.Qualifier2.length > 15) {
                                var qualifier2Cut = item.Qualifier2.substring(15, 0);
                                industriesYearChartDataLabels6Cut.push(qualifier2Cut + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                            } else {
                                industriesYearChartDataLabels6Cut.push(item.Qualifier2 + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                            }
                        }
                        //industriesYearChartDataLabels6.push(getResourceText("diaYearRange.remaindata"));
                        industriesYearChartDataRaw6.push(item.PercentGlobal);
                        //industriesYearChartDataRaw6.push(item.NumTotal - item.NumHits);
                        industriesYearChartDataProcent6 = item.PercentGlobal + "%";
                    }
                    if (item.QualifierExtID === "17283") {
                        if (industriesYearChartDataTexts7.length === 0) {
                            industriesYearChartDataTexts7 = item.Qualifier;
                        }
                        industriesYearChartDataLabels7.push(item.Qualifier2 + " " + item.PercentGlobal + " %");
                        if (item.Qualifier2) {
                            if (item.Qualifier2.length > 15) {
                                var qualifier2Cut = item.Qualifier2.substring(15, 0);
                                industriesYearChartDataLabels7Cut.push(qualifier2Cut + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                            } else {
                                industriesYearChartDataLabels7Cut.push(item.Qualifier2 + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                            }
                        }
                        //industriesYearChartDataLabels7.push(getResourceText("diaYearRange.remaindata"));
                        industriesYearChartDataRaw7.push(item.PercentGlobal);
                        //industriesYearChartDataRaw7.push(item.NumTotal - item.NumHits);
                        industriesYearChartDataProcent7 = item.PercentGlobal + "%";
                    }
                    if (item.QualifierExtID === "17284") {
                        if (industriesYearChartDataTexts8.length === 0) {
                            industriesYearChartDataTexts8 = item.Qualifier;
                        }
                        industriesYearChartDataLabels8.push(item.Qualifier2 + " " + item.PercentGlobal + " %");
                        if (item.Qualifier2) {
                            if (item.Qualifier2.length > 15) {
                                var qualifier2Cut = item.Qualifier2.substring(15, 0);
                                industriesYearChartDataLabels8Cut.push(qualifier2Cut + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                            } else {
                                industriesYearChartDataLabels8Cut.push(item.Qualifier2 + " " + Math.round(item.NumHits / item.NumTotal * 100) + "%");
                            }
                        }
                        //industriesYearChartDataLabels8.push(getResourceText("diaYearRange.remaindata"));
                        industriesYearChartDataRaw8.push(item.PercentGlobal);
                        //industriesYearChartDataRaw8.push(item.NumTotal - item.NumHits);
                        industriesYearChartDataProcent8 = item.PercentGlobal + "%";
                    }
                    /*if (item.QualifierExtID === "13189") {
                        industriesYearChartDataTexts5 = item.ResultMessage;
                        industriesYearChartDataTexts6 = item.ResultMessage;
                        industriesYearChartDataTexts7 = item.ResultMessage;
                        industriesYearChartDataTexts8 = item.ResultMessage;
                        industriesYearChartDataProcent8 = "";
                    }*/
                }
                this.resultConverterSurpreme = resultConverterSurpreme;

                var resultConverterSupremeSpecialOne = function(item, index) {
                    //if (item.QualifierExtID === "17289") {
                        if (industriesYearChartDataTexts5.length === 0) {
                            industriesYearChartDataTexts5 = getResourceText("startPremium.tipEvent"); //2
                        }
                        //tooltip for dougnut
                    var splitQualifier;
                    if (AppData.getLanguageId() === 1031) {
                        splitQualifier = item.Qualifier.replace(/und/gi, "?und").split("?");
                    } else {
                        splitQualifier = item.Qualifier.replace(/and/gi, "?and").split("?");

                    }
                    splitQualifier[splitQualifier.length - 1] = splitQualifier[splitQualifier.length - 1].trim() + " " + item.PercentGlobal + " %";
                    industriesYearChartDataLabels5.push(splitQualifier);
                    //industriesYearChartDataLabels5.push(item.Qualifier + " " + item.PercentGlobal + " %");
                        if (item.Qualifier) {
                            if (item.Qualifier.length > 15) {
                                var qualifierCut = item.Qualifier.substring(15, 0);
                                industriesYearChartDataLabels5Cut.push(qualifierCut + " " + item.PercentGlobal + "%");
                            } else {
                                industriesYearChartDataLabels5Cut.push(item.Qualifier + " " + item.PercentGlobal + "%");
                            }
                        }
                    //industriesYearChartDataLabels5.push(getResourceText("diaYearRange.remaindata"));
                    /**
                     * absolute number!!
                     */
                        industriesYearChartDataRaw5.push(item.NumHits);
                        //industriesYearChartDataRaw5.push(item.NumTotal - item.NumHits);
                        //industriesYearChartDataProcent5 = item.PercentGlobal + "%";
                   //}
                }
                this.resultConverterSupremeSpecialOne = resultConverterSupremeSpecialOne;

                var resultConverterYearRange = function (item, index) {
                    item.index = index;
                    if (item.QualifierExtID === "17281") {
                        if (industriesYearChartDataTexts1.length === 0) {
                            industriesYearChartDataTexts1 = item.Qualifier;
                        }
                        industriesYearChartDataProcent1 = Math.round(item.NumHits / item.NumTotal * 100) + "%";
                    }
                    if (item.QualifierExtID === "17282") {
                        if (industriesYearChartDataTexts2.length === 0) {
                            industriesYearChartDataTexts2 = item.Qualifier;
                        }
                        industriesYearChartDataProcent2 = Math.round(item.NumHits / item.NumTotal * 100) + "%";
                    }
                    if (item.QualifierExtID === "17283") {
                        if (industriesYearChartDataTexts3.length === 0) {
                            industriesYearChartDataTexts3 = item.Qualifier;
                        }
                        industriesYearChartDataProcent3 = Math.round(item.NumHits / item.NumTotal * 100) + "%";
                    }
                    if (item.QualifierExtID === "17284") {
                        if (industriesYearChartDataTexts4.length === 0) {
                            industriesYearChartDataTexts4 = item.Qualifier;
                        }
                        industriesYearChartDataProcent4 = Math.round(item.NumHits / item.NumTotal * 100) + "%";
                    }
                }
                this.resultConverterYearRange = resultConverterYearRange;

                var resultConverterCriteria = function (item, index) {
                    item.index = index;
                    if (item.CriterionID === 61) {
                        item.CriterionText = getResourceText("diaCountrysIndustries.comboboxtext");
                    }
                }
                this.resultConverterCriteria = resultConverterCriteria;

                var getGetCriterionListData = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_GetCriterionList", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pLanguageSpecID: AppData.getLanguageId()
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        json.d.results.forEach(function (item, index) {
                            that.resultConverterCriteria(item, index);
                        });
                        json.d.results.shift();
                        if (criteriadrop && criteriadrop.winControl) {
                            criteriadrop.winControl.data = new WinJS.Binding.List(json.d.results);
                            criteriadrop.selectedIndex = 0;
                            that.binding.criteriaMain = json.d.results[0].CriterionID;
                            that.binding.criteriaSecond = json.d.results[0].ExternalID;
                            that.loadData();
                        }
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                }
                this.getGetCriterionListData = getGetCriterionListData;

                var getGetYearRangePremium = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_GetDashboardData", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pCriterion1ID: 40,
                        pCriterion2ID: 0,
                        pLandID: 0,
                        pDay: 0,
                        pLanguageSpecID: AppData.getLanguageId()
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var results = json.d.results;
                        results.forEach(function (item, index) {
                            that.resultConverterYearRange(item, index);
                        });
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                }
                this.getGetYearRangePremium = getGetYearRangePremium;

                var getGetDashboardData = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    that.clearArrays();
                    AppData.call("PRC_GetDashboardData", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pCriterion1ID: 40,
                        pCriterion2ID: that.binding.criteriaMain,
                        pDay: 0,
                        pLandID: 0,
                        pWantedRows: 5,
                        pLanguageSpecID: AppData.getLanguageId()
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var results = json.d.results;
                        results.sort(function (a, b) {
                            return b.NumHits - a.NumHits;
                        });
                        results.forEach(function (item, index) {
                            that.resultConverterPremium(item, index);
                        });
                        that.redrawCharts();
                        that.drawPremiumCharts();
                        AppData.setErrorMsg(that.binding);
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                }
                this.getGetDashboardData = getGetDashboardData;

                var getGetDashboardDataSurpreme = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    that.clearArrays();
                    var lang = 
                    AppData.call("PRC_GetDashboardData", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pCriterion1ID: that.binding.criteriaMain, /*40*/
                        pCriterion2ID: 0, /*that.binding.criteriaMain*/
                        pLandID: 0,
                        pDay: 0,
                        pWantedRows: 5,
                        pLanguageSpecID: AppData.getLanguageId()
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var results = json.d.results;
                        results.sort(function (a, b) {
                            return b.PercentGlobal - a.PercentGlobal; /*b.NumHits - a.NumHits*/
                        });
                        results.forEach(function (item, index) {
                            //that.resultConverterSurpreme(item, index);
                            that.resultConverterSupremeSpecialOne(item, index);
                        });
                        that.redrawCharts();
                        that.drawSupremeCharts();
                        AppData.setErrorMsg(that.binding);
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                }
                this.getGetDashboardDataSurpreme = getGetDashboardDataSurpreme;

                var loadData = function() {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    var ret = new WinJS.Promise.as().then(function () {
                        return that.clearArrays();
                    }).then(function () {
                        return that.getGetYearRangePremium();
                    }).then(function () {
                        return that.getGetDashboardData();
                    }).then(function () {
                        if (that.isSupreme === 2) {
                            return that.getGetDashboardDataSurpreme();
                        }
                    });
                    Log.ret(Log.l.trace);
                    return ret;
                }
                this.loadData = loadData;

                this.eventHandlers = {
                    changedCriteria: function (event) {
                        Log.call(Log.l.trace, "Contact.Controller.");
                        that.binding.criteriaMain = parseInt(event.target.value);
                        that.loadData();
                        Log.ret(Log.l.trace);
                    },
                    changedCountry: function (event) {
                        Log.call(Log.l.trace, "Event.Controller.");
                        that.binding.criteriaCountry = parseInt(event.target.value);
                        that.loadData();
                        Log.ret(Log.l.trace);
                    }
                };

                if (criteriadrop) {
                    this.addRemovableEventListener(criteriadrop, "change", this.eventHandlers.changedCriteria.bind(this));
                }
                
                that.processAll().then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return that.loadIcon();
                }).then(function() {
                    that.setSupremeContainer();
                    return WinJS.Promise.as();
                }).then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    return dropdowncolor();
                }).then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    return setTooltipText();
                }).then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    return getGetCriterionListData();
                }).then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    //return loadData();
                });
                Log.ret(Log.l.trace);
            }, {

            })
    });
})();