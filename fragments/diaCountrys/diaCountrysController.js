// controller for page: StartQuestions
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/diaCountrys/diaCountrysService.js" />
/// <reference path="~/www/lib/chartJS/scripts/dist351/chart.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("DiaCountrys", {
        Controller: WinJS.Class.derive(Fragments.Controller,
            function Controller(fragmentElement, options) {
                Log.call(Log.l.trace, "DiaCountrys.Controller.");
                Fragments.Controller.apply(this,
                    [
                        fragmentElement, {
                            Top5Country: 5
                        }
                    ]);

                var that = this;

                that.isSupreme = AppData._userData.IsSupreme;

                var anzKontakte = null;

                var top5DiagramChart = null;
                var top5DiagramSurpremeChart = null;

                var top5Countrydrop = fragmentElement.querySelector("#top5countrydropdown");
                var top5Countrydropdata = [{ TITLE: getResourceText("diaCountrys.top5"), VALUE: 5 }, { TITLE: getResourceText("diaCountrys.top10"), VALUE: 10 }];

                if (top5Countrydrop && top5Countrydrop.winControl) {
                    top5Countrydrop.winControl.data = new WinJS.Binding.List(top5Countrydropdata);
                    top5Countrydrop.selectedIndex = 0;
                }

                var dropdowncolor = function () {
                    top5Countrydrop.style.backgroundColor = "#efedee ";
                }
                this.dropdowncolor = dropdowncolor;

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

                var hexToRgbA = function(hex) {
                    var c;
                    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                        c = hex.substring(1).split('');
                        if (c.length == 3) {
                            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
                        }
                        c = '0x' + c.join('');
                        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ', 0.8)';
                    }
                    throw new Error('Bad Hex');
                }
                this.hexToRgbA = hexToRgbA;

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

                var top5Diagramlabelsdata = [];
                var top5Diagramdatasetsdata = [];
                var top5Diagrambackgroundcolor = [];
                var top5Diagrambordercolor = [];
                
                var dataMain = {
                    labels: top5Diagramlabelsdata,
                    datasets: [{
                        data: top5Diagramdatasetsdata,
                        backgroundColor: top5Diagrambackgroundcolor,
                        borderColor: top5Diagrambordercolor
                    }]
                };

                var createTop5Diagram = function () {
                    top5DiagramChart = new Chart(fragmentElement.querySelector("#countryChart"), {
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

                
                var top5Diagramsupremedatasetsdata = [];
                var top5Diagramsupremebackgroundcolor = [];
                var top5Diagramsupremebordercolor = [];

                var dataMainSurpreme = {
                    labels: [],
                    datasets: [
                        {
                            label: "Event",
                            order: 0,
                            data: top5Diagramdatasetsdata,
                            backgroundColor: top5Diagrambackgroundcolor,
                            borderColor: top5Diagrambordercolor,
                            fill: true
                            
                        },
                        {
                            label: "Global",
                            order: 1,
                            backgroundColor: top5Diagramsupremebackgroundcolor,
                            borderColor: top5Diagramsupremebordercolor,
                            data: top5Diagramsupremedatasetsdata,
                            fill: false
                        }
                    ]
                };

                var surpremeColor = "#cc5b87";
                
                var ctx2 = fragmentElement.querySelector("#countryChart").getContext('2d');

                var createTop5DiagramSurpreme = function () {
                    top5DiagramSurpremeChart = new Chart(ctx2,
                        {
                            type: 'radar',
                            data: dataMainSurpreme,
                            options: {
                                maintainAspectRatio: false,
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
                                        elem.push('<div class="custom-legends-item-left-count" style="color:' + chart.data.datasets[0].backgroundColor[i] + '">');
                                        if (chart.data.labels[i]) {
                                            elem.push(" " + (value / total * 100).toFixed(0) + "%");
                                        }
                                        elem.push('</div>');
                                        elem.push('</div>');
                                        elem.push('<div class="custom-legends-item-right">');
                                        elem.push('<div class="custom-legends-item-right-label">');
                                        if (chart.data.labels[i]) {
                                            elem.push(chart.data.labels[i]);
                                        }
                                        elem.push('<div class="custom-legends-item-right-count" style="color:' + chart.data.datasets[1].backgroundColor[i] + '">');
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
                                            display: false
                                        }
                                    }],
                                    xAxes: [{
                                        ticks: {
                                            display: false //this will remove only the label
                                        },
                                        gridLines: {
                                            display: false
                                        }
                                    }]
                                },
                                tooltips: {
                                    // Disable the on-canvas tooltip
                                    enabled: false,

                                    custom: function (tooltipModel) {
                                        // Tooltip Element
                                        var tooltipEl = document.getElementById('chartjs-tooltip');

                                        // Create element on first render
                                        if (!tooltipEl) {
                                            tooltipEl = document.createElement('div');
                                            tooltipEl.id = 'chartjs-tooltip';
                                            tooltipEl.innerHTML = '<table></table>';
                                            document.body.appendChild(tooltipEl);
                                        }

                                        // Hide if no tooltip
                                        if (tooltipModel.opacity === 0) {
                                            tooltipEl.style.opacity = 0;
                                            return;
                                        }

                                        // Set caret Position
                                        tooltipEl.classList.remove('above', 'below', 'no-transform');
                                        if (tooltipModel.yAlign) {
                                            tooltipEl.classList.add(tooltipModel.yAlign);
                                        } else {
                                            tooltipEl.classList.add('no-transform');
                                        }

                                        function getBody(bodyItem) {
                                            return bodyItem.lines;
                                        }

                                        // Set Text
                                        if (tooltipModel.body) {
                                            var titleLines = tooltipModel.title || [];
                                            var bodyLines = tooltipModel.body.map(getBody);

                                            var innerHtml = '<thead>';

                                            titleLines.forEach(function (title) {
                                                innerHtml += '<tr><th>' + title + '</th></tr>';
                                            });
                                            innerHtml += '</thead><tbody>';

                                            bodyLines.forEach(function (body, i) {
                                                var colors = tooltipModel.labelColors[i];
                                                var style = 'background:' + colors.backgroundColor;
                                                style += '; border-color:' + colors.borderColor;
                                                style += '; border-width: 2px';
                                                var span = '<span style="' + style + '"></span>';
                                                innerHtml += '<tr><td>' + span + body + '</td></tr>';
                                            });
                                            innerHtml += '</tbody>';

                                            var tableRoot = tooltipEl.querySelector('table');
                                            tableRoot.innerHTML = innerHtml;
                                        }

                                        // `this` will be the overall tooltip
                                        var position = this._chart.canvas.getBoundingClientRect();

                                        // Display, position, and set styles for font
                                        tooltipEl.style.opacity = 1;
                                        tooltipEl.style.position = 'absolute';
                                        tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                                        tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                                        tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
                                        tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
                                        tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
                                        tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
                                        tooltipEl.style.pointerEvents = 'none';
                                    }
                                }
                            }
                        });
                    var legentElement = fragmentElement.querySelector(".countrys-label-surpreme");
                    /* insert custom HTML inside custom div */
                    legentElement.innerHTML = top5DiagramSurpremeChart.generateLegend();
                }
                this.createTop5DiagramSurpreme = createTop5DiagramSurpreme;

                var clearArrays = function() {
                    top5Diagramlabelsdata = [];
                    top5Diagramdatasetsdata = [];
                    top5Diagrambackgroundcolor = [];
                    top5Diagrambordercolor = [];
                    if (that.isSupreme === 2) {
                        top5Diagramsupremedatasetsdata = [];
                        top5Diagramsupremebackgroundcolor = [];
                        top5Diagramsupremebordercolor = [];
                    }
                }
                this.clearArrays = clearArrays;

                var setUpData = function() {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    if (that.isSupreme === 1) {
                        dataMain.labels = top5Diagramlabelsdata;
                        dataMain.datasets[0].data = top5Diagramlabelsdata;
                        dataMain.datasets[0].backgroundColor = top5Diagrambackgroundcolor;
                        dataMain.datasets[0].borderColor = top5Diagrambordercolor;
                    }
                    if (that.isSupreme === 2) {
                        dataMainSurpreme.labels = top5Diagramlabelsdata;
                        dataMainSurpreme.datasets[0].data = top5Diagramdatasetsdata;
                        dataMainSurpreme.datasets[0].backgroundColor = top5Diagrambackgroundcolor;
                        dataMainSurpreme.datasets[0].borderColor = top5Diagrambordercolor;
                        dataMainSurpreme.datasets[1].data = top5Diagramsupremedatasetsdata;
                        dataMainSurpreme.datasets[1].backgroundColor = top5Diagramsupremebackgroundcolor;
                        dataMainSurpreme.datasets[1].borderColor = top5Diagramsupremebordercolor;
                        
                    }

                }
                this.setUpData = setUpData;

                var redrawCharts = function () {
                    Log.call(Log.l.trace, "DiaYearRange.Controller.");
                    if (that.isSupreme === 1) {
                        top5DiagramChart.data.labels = top5Diagramlabelsdata;
                        top5DiagramChart.data.datasets[0].data = top5Diagramdatasetsdata;
                        top5DiagramChart.data.datasets[0].backgroundColor = top5Diagrambackgroundcolor;
                        top5DiagramChart.data.datasets[0].borderColor = top5Diagrambordercolor;
                        top5DiagramChart.update();
                    }
                    if (that.isSupreme === 2) {
                        top5DiagramSurpremeChart.data.labels = top5Diagramlabelsdata;
                        top5DiagramSurpremeChart.data.datasets[0].data = top5Diagramdatasetsdata;
                        top5DiagramSurpremeChart.data.datasets[0].backgroundColor = top5Diagrambackgroundcolor;
                        top5DiagramSurpremeChart.data.datasets[0].borderColor = top5Diagrambordercolor;
                        top5DiagramSurpremeChart.data.datasets[1].data = top5Diagramsupremedatasetsdata;
                        top5DiagramSurpremeChart.data.datasets[1].backgroundColor = top5Diagramsupremebackgroundcolor;
                        top5DiagramSurpremeChart.data.datasets[1].borderColor = top5Diagramsupremebordercolor;
                        top5DiagramSurpremeChart.update();
                    }
                    Log.ret(Log.l.trace);
                }
                this.redrawCharts = redrawCharts;

                var drawCharts = function () {
                    that.createTop5Diagram();
                    if (that.isSupreme === 2) {
                        that.createTop5DiagramSurpreme();
                    }
                }
                this.drawCharts = drawCharts;

                var resultConverter = function (item, index) {
                    item.index = index;
                    if (item.Land === null) {
                        item.Land = "Kein Land";
                    }
                    top5Diagramlabelsdata.push(item.Land);
                    top5Diagramdatasetsdata.push(item.Anzahl);
                    top5Diagrambackgroundcolor.push(that.hexToRgbA(that.getColor(Colors.dashboardColor, item.index / 12)));
                    top5Diagrambordercolor.push(that.hexToRgbA(that.getColor(Colors.dashboardColor, item.index / 12)));
                    if (that.isSupreme === 2) {
                        top5Diagramsupremedatasetsdata.push(item.Anzahl + 10);
                        top5Diagramsupremebackgroundcolor.push(that.hexToRgbA(that.getColor(surpremeColor, item.index / 12)));
                        top5Diagramsupremebordercolor.push(that.hexToRgbA(that.getColor(surpremeColor, item.index / 12)));
                    }
                }
                this.resultConverter = resultConverter;

                var loadData = function (recordId) {
                    Log.call(Log.l.trace, "DiaCountrys.");
                    that.clearArrays();
                    top5DiagramSurpremeChart = null;
                    top5DiagramChart = null;
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

                                if (that.binding.Top5Country === "10") {
                                    results.length = 10;
                                } else {
                                    results.length = 5;
                                }

                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                               
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
                    }).then(function () {
                        if (that.isSupreme === 1) {
                            if (top5DiagramChart === null) {
                                that.setUpData();
                                that.createTop5Diagram();
                                that.redrawCharts();
                            } else {
                                that.setUpData();
                                that.redrawCharts();
                            }
                        } else {
                            if (top5DiagramSurpremeChart === null) {
                                that.setUpData();
                                that.createTop5DiagramSurpreme();
                                that.redrawCharts();
                            } else {
                                that.setUpData();
                                that.createTop5DiagramSurpreme();
                            }
                        }
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

                this.eventHandlers = {
                    changedTopCountry: function (event) {
                        Log.call(Log.l.trace, "Contact.Controller.");
                        that.binding.Top5Country = parseInt(event.target.value);
                        that.loadData();
                        Log.ret(Log.l.trace);
                    }
                };

                if (top5Countrydrop) {
                    this.addRemovableEventListener(top5Countrydrop, "change", this.eventHandlers.changedTopCountry.bind(this));
                }

            that.processAll().then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                return that.dropdowncolor();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.checkIfSurpreme();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return;
            });
            Log.ret(Log.l.trace);
        }, {
            
            })
    });
})();