// controller for page: StartQuestions
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/diaCountrys/diaCountrysService.js" />
/// <reference path="~/www/lib/chartJS/scripts/dist/Chart.js" />
/// <reference path="~/www/lib/chartJS/scripts/dist/Chart.bundle.js" />
(function () {
    "use strict";

    WinJS.Namespace.define("DiaCountrys", {
        Controller: WinJS.Class.derive(Fragments.Controller,
            function Controller(fragmentElement, options) {
                Log.call(Log.l.trace, "DiaCountrys.Controller.");
                Fragments.Controller.apply(this,
                    [
                        fragmentElement, {
                        }
                    ]);

                var that = this;

                that.isSupreme = AppData._userData.IsSupreme;

                var anzKontakte = null;

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

                var getColor = function(color, id) {
                    var rgbColor = Colors.hex2rgb(color);
                    var hsvColor = Colors.rgb2hsv(rgbColor);
                    hsvColor.s *= 0.8 - id;
                    hsvColor.v /= 0.8 - id;
                    rgbColor = Colors.hsv2rgb(hsvColor);
                    return Colors.rgb2hex(rgbColor);
                }
                this.getColor = getColor;

                // chart1
                /*var dataMain = {
                    labels: ["Deutschland", "USA", "Neuseeland", "Italien", "Südafrika"],
                    datasets: [{
                        data: [120, 50, 90, 80, 40],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)'
                        ],
                        pointStyle: 'rect'
                    }]
                }; */

                var labelsdata = [];

                var datasetsdata = [];

                var dataMain = {
                    labels: labelsdata,
                    datasets: [{
                        data: datasetsdata,
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
                        ],
                        pointStyle: 'rect'
                    }]
                };


                var createTop5Diagram = function() {
                    var promisedDeliveryChartMain = new Chart(fragmentElement.querySelector("#countryChart"), {
                        type: 'doughnut',
                        data: dataMain,
                        options: {
                            responsive: true,
                            elements: {
                                center: {
                                    text: anzKontakte + " Besucher"//set as you wish
                                }
                            },
                            maintainAspectRatio: false,
                            cutoutPercentage: 75,
                            legend: {
                                display: true,
                                position: 'left',
                                usePointStyle: true,
                                labels: {
                                    boxWidth: 15,
                                    fontSize: 18
                                }
                            }
                        },
                        plugins: [plugin, {
                            afterLayout: function (chart) {
                                var total = chart.data.datasets[0].data.reduce((a, b) => {
                                    return a + b;
                                });
                                chart.legend.legendItems.forEach(
                                    (label) => {
                                        var value = chart.data.datasets[0].data[label.index];
                                        label.text += ' - ' + (value / total * 100).toFixed(0) + '%';
                                        return label;
                                    }
                                )
                            }
                        }]

                    });
                }
                this.createTop5Diagram = createTop5Diagram;
                
                var dataMainSurpreme = {
                    labels: [],
                    datasets: [
                        {
                            backgroundColor: "rgba(91, 202, 255,0.2)",
                            borderColor: "rgba(91, 202, 255,1)",
                            data: []
                        },
                        {
                            backgroundColor: "rgba(204, 91, 135, 0.2)",
                            borderColor: "rgba(204, 91, 135,1)",
                            data: []
                        }
                    ]
                };

                var createTop5DiagramSurpreme = function() {
                    var promisedDeliveryChartMain = new Chart(fragmentElement.querySelector("#countryChart"),
                        {
                            type: 'radar',
                            data: dataMainSurpreme,
                            options: {
                                maintainAspectRatio: false,
                                tooltips: {
                                    mode: 'label'
                                },
                                legend: false,
                                legendCallback: function (chart) {
                                    var elem = [];
                                    var total = chart.data.datasets[0].data.reduce((a, b) => {
                                        return a + b;
                                    });
                                    var total2 = chart.data.datasets[1].data.reduce((a, b) => {
                                        return a + b;
                                    });
                                    elem.push('<div class="custom-legends">');
                                    for (var i = 0; i < chart.data.datasets[0].data.length; i++) {
                                        var value = chart.data.datasets[0].data[i];
                                        var value2 = chart.data.datasets[1].data[i];
                                        elem.push('<div class="custom-legends-container">');
                                        elem.push('<div class="custom-legends-item-left">');
                                        elem.push('<div class="custom-legends-item-left.label" style="background-color:' + chart.data.datasets[0].backgroundColor[i] + '">');
                                        if (chart.data.labels[i]) {
                                            elem.push(chart.data.labels[i] + ":");
                                        }
                                        elem.push('<div class="custom-legends-item-left-count" style="background-color:' + chart.data.datasets[0].backgroundColor[i] + '">');
                                        if (chart.data.labels[i]) {
                                            elem.push(" " + (value / total * 100).toFixed(0) + "%");
                                        }
                                        elem.push('</div>');
                                        elem.push('</div>');
                                        elem.push('</div>');
                                        elem.push('<div class="custom-legends-item-right">');
                                        elem.push('<div class="custom-legends-item-right-label" style="background-color:' + chart.data.datasets[0].backgroundColor[i] + '">');
                                        if (chart.data.labels[i]) {
                                            elem.push("Global: ");
                                        }
                                        elem.push('<div class="custom-legends-item-right-count" style="background-color:' + chart.data.datasets[0].backgroundColor[i] + '">');
                                        if (chart.data.labels[i]) {
                                            elem.push(" " + (value2 / total2 * 100).toFixed(0) + "%");
                                        }
                                        elem.push('</div>');
                                        elem.push('</div>');
                                        elem.push('</div>');
                                        elem.push('</div>');
                                    }
                                    elem.push('</div>');
                                    return elem.join("");
                                },
                                scales: {
                                    yAxes: [{
                                        ticks: {
                                            beginAtZero: true,
                                            display: false //this will remove only the label
                                        },
                                        gridLines: {
                                            display: false,
                                        }
                                    }],
                                    xAxes: [{
                                        ticks: {
                                            display: false //this will remove only the label
                                        },
                                        gridLines: {
                                            display: false,
                                        }
                                    }]
                                }
                            }
                        });
                    var legentElement = fragmentElement.querySelector(".countrys-label-surpreme");
                    /* insert custom HTML inside custom div */
                    legentElement.innerHTML = promisedDeliveryChartMain.generateLegend();
                }
                this.createTop5DiagramSurpreme = createTop5DiagramSurpreme;

               
                
                var resultConverter = function (item, index) {
                    item.index = index;
                    if (item.Land === null) {
                        item.Land = "Kein Land";
                    }
                    labelsdata.push(item.Land);
                    datasetsdata.push(item.Anzahl);
                    if (that.isSupreme === 2) {
                        dataMainSurpreme.labels.push(item.Land);
                        dataMainSurpreme.datasets[0].data.push(item.Anzahl);
                        dataMainSurpreme.datasets[1].data.push(item.Anzahl + 10);
                    }
                }
                this.resultConverter = resultConverter;

                var loadData = function (recordId) {
                    Log.call(Log.l.trace, "DiaCountrys.");
                    AppData.setErrorMsg(that.binding);
                    var ret = new WinJS.Promise.as().then(function () {
                        return DiaCountrys.reportLand.select(function (json) {
                            Log.print(Log.l.trace, "reportLand: success!");
                            if (json && json.d && json.d.results && json.d.results.length > 0) {
                                var color = Colors.dashboardColor;
                                var results = json.d.results;
                                results.sort(function (a, b) {
                                    return b.NumHits - a.NumHits;
                                });
                                results.length = 5;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                var result = dataMain;

                                Log.print(Log.l.trace, "reportLand: success!");
                            }

                        },
                        function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                             AppData.setErrorMsg(that.binding, errorResponse);
                         });
                    }).then(function () {
                        return DiaCountrys.mitarbeiterView.select(function (json) {
                            Log.print(Log.l.trace, "mitarbeiterView: success!");
                            if (json && json.d && json.d.results && json.d.results.length > 0) {
                                    Log.print(Log.l.trace, "mitarbeiterView: success!");
                                    var result = json.d.results[0];
                                    anzKontakte = result.AnzKontakte;
                                    Log.print(Log.l.trace, "mitarbeiterView: success!");
                            }

                            },
                            function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                    });
                    Log.ret(Log.l.trace);
                    return ret;
                };
                this.loadData = loadData;
                
                var checkIfSurpreme = function () {
                    var container = fragmentElement.querySelector(".country-chart-holder");
                    var labels = fragmentElement.querySelector(".countrys-label-surpreme");
                    if (that.isSupreme === 2) {
                        container.style.width = "48%";
                        container.style.height = "240px";
                        container.style.float = "right";
                        labels.style.display = "inline-block";
                        labels.style.width = "48%";
                        labels.style.height = "240px";
                    } else {
                        container.style.width = "100%";
                        container.style.height = "230px";
                        labels.style.display = "none";
                    }
                }
                this.checkIfSurpreme = checkIfSurpreme;

            that.processAll().then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return that.checkIfSurpreme();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                if (that.isSupreme === 2) {
                    return createTop5DiagramSurpreme();
                } else {
                    return createTop5Diagram();
                }
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return;
            });
            Log.ret(Log.l.trace);
        }, {
            
            })
    });
})();