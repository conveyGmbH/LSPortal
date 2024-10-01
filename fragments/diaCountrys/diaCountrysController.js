// controller for page: StartQuestions
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/diaCountrys/diaCountrysService.js" />
/// <reference path="~/www/lib/chartJS/scripts/dist/chart.js" />

(function () {
    "use strict";

    var namespaceName = "DiaCountrys";

    WinJS.Namespace.define("DiaCountrys", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                Top5Country: 5
            }]);
            var pageBinding = AppBar.scope && AppBar.scope.binding;
            var that = this;

            that.isSupreme = parseInt(AppData._userData.IsSupreme) || parseInt(AppData._persistentStates.showdashboardMesagoCombo);

            var icons = fragmentElement.querySelector(".country-chart-top-container");
            var container = fragmentElement.querySelector(".country-chart-holder");
            var countrytooltip = fragmentElement.querySelector("#mydiaCountrysElement2");
            var labels = fragmentElement.querySelector(".countrys-label-surpreme");

            var anzKontakte = 0;
            var anzKontaktePremium = 0;

            var getEventId = function () {
                return DiaCountrys._eventId;
            }
            that.getEventId = getEventId;

            var setEventId = function (value) {
                Log.print(Log.l.trace, "eventId=" + value);
                DiaCountrys._eventId = AppBar.scope.getEventId();
            }
            that.setEventId = setEventId;

            var setTooltipText = function () {
                if (that.isSupreme === 1) {
                    countrytooltip.innerHTML = getResourceText("diaCountrys.tooltipPremium");
                } else {
                    countrytooltip.innerHTML = getResourceText("diaCountrys.tooltipSupreme1") + " <br> <p></p>" + getResourceText("diaCountrys.tooltipSupreme2");
                }
            }
            this.setTooltipText = setTooltipText;

            var langSet = function () {
                var ret;
                Log.call(Log.l.trace, "DiaIndustries.Controller.");
                var lang = AppData.getLanguageId();
                if (lang === 1031) {
                    ret = 1031;
                } else {
                    ret = 1033;
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            }
            this.langSet = langSet;

            var top5Diagramlabelsdata = [];
            var top5DiagramLabelsdataMulitline = [];
            var top5Diagramdatasetsdata = [];
            var top5Diagrambackgroundcolor = [];
            var top5Diagrambordercolor = [];

            var dataMain = {
                labels: top5Diagramlabelsdata,
                datasets: [
                    {
                        data: top5Diagramdatasetsdata,
                        backgroundColor: top5Diagrambackgroundcolor,
                        borderColor: top5Diagrambordercolor
                    }
                ]
            };

            var top5DiagramChart;

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

                        /*var words = txt.split(' ');
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
                            line = testLine;
                        }

                        // Move the center up depending on line height and number of lines
                        centerY -= (lines.length / 2) * lineHeight;

                        for (var n = 0; n < lines.length; n++) {
                            ctx.fillText(lines[n], centerX, centerY);
                            centerY += lineHeight;
                        }
                        //Draw text in center
                        ctx.fillText(line, centerX, centerY);*/
                    }
                }
            }

            var getColor = function (color, id) {
                var rgbColor = Colors.hex2rgb(color);
                var hsvColor = Colors.rgb2hsv(rgbColor);
                hsvColor.s *= 0.8 - id;
                hsvColor.v /= 0.8 - id;
                rgbColor = Colors.hsv2rgb(hsvColor);
                return Colors.rgb2hex(rgbColor);
            }
            this.getColor = getColor;

            var hexToRgbA = function (hex) {
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

            var createPremiumChart = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (top5DiagramChart) {
                    top5DiagramChart.destroy();
                }
                top5DiagramChart = new Chart(fragmentElement.querySelector("#countryChart"), {
                    type: 'doughnut',
                    data: dataMain,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '85%',
                        elements: {
                            center: {
                                text: anzKontakte + getResourceText("diaCountrys.visitors"),
                                color: Colors.textColor, // Default is #000000 '#000000'
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
                                fullWidth: false,
                                labels: {
                                    boxWidth: 20,
                                    color: Colors.textColor
                                }
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
                                        return " " + label;
                                    }
                                }
                            }
                        }
                    },
                    plugins: [centerDoughnutPlugin]
                });
                Log.ret(Log.l.trace);
            }
            this.createPremiumChart = createPremiumChart;

            var top5Diagramsupremedatasetsdata = [];
            var top5Diagramsupremebackgroundcolor = [];
            var top5Diagramsupremebordercolor = [];

            var dataMainSurpreme = {
                labels: [],
                datasets: [
                    {
                        label: "Event",
                        data: top5Diagramdatasetsdata,
                        backgroundColor: top5Diagrambackgroundcolor,
                        borderColor: top5Diagrambordercolor,
                        fill: true

                    },
                    {
                        label: "Global",
                        backgroundColor: top5Diagramsupremebackgroundcolor,
                        borderColor: top5Diagramsupremebordercolor,
                        data: top5Diagramsupremedatasetsdata,
                        fill: false
                    }
                ]
            };

            var htmlLegendPlugin = {
                afterUpdate(chart) {
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
                        elem.push('<div class="custom-legends-item-left-count" style="color:' +
                            chart.data.datasets[0].backgroundColor[i] +
                            '">');
                        if (chart.data.labels[i]) {
                            elem.push(" " + value + "%");
                        }
                        elem.push('</div>');
                        elem.push('</div>');
                        elem.push('<div class="custom-legends-item-right">');
                        elem.push('<div class="custom-legends-item-right-label">');
                        //hack ignore label with multiline -> use top5Diagramlabelsdata instead parameter chart 
                        if (top5Diagramlabelsdata[i]) {
                            elem.push(top5Diagramlabelsdata[i]);
                        }
                        elem.push('<div class="custom-legends-item-right-count" style="color:' +
                            chart.data.datasets[1].backgroundColor[i] +
                            '">');
                        if (chart.data.labels[i]) {
                            elem.push(" " + value2 + "%");
                        }
                        elem.push('</div>');
                        elem.push('</div>');
                        elem.push('</div>');
                        elem.push('</div>');
                    }
                    elem.push('</div>');

                    var legentElement = fragmentElement.querySelector(".countrys-label-surpreme");
                    var clegentElement = fragmentElement.querySelector(".custom-legends");

                    if (clegentElement) {
                        clegentElement.remove();
                    }

                    return legentElement.insertAdjacentHTML('beforeend', elem.join(""));
                }
            };

            var surpremeColor = "#092052";

            var top5DiagramSurpremeChart;
            var createSurpremeChart = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (top5DiagramSurpremeChart) {
                    top5DiagramSurpremeChart.destroy();
                }
                top5DiagramSurpremeChart = new Chart(fragmentElement.querySelector("#countryChart"), {
                    type: 'radar',
                    data: dataMainSurpreme,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            htmlLegend: {
                                // ID of the container to put the legend in
                                containerID: 'countrys-label-surpreme'
                            },
                            legend: {
                                display: false,
                                labels: {
                                    color: Colors.textColor
                                }
                            }
                        },
                        layout: {
                            padding: {
                                bottom: 5
                            }
                        },
                        scales: {
                            yAxes: {
                                display: false
                            },
                            xAxis: {
                                display: false
                            }, r: {
                                pointLabels: {
                                    font: {
                                        //size: 14
                                    },
                                    color: Colors.textColor
                                },
                                angleLines: {
                                    color: Colors.textColor
                                },
                                grid: {
                                    color: Colors.textColor
                                }
                            }
                        }
                    },
                    plugins: [htmlLegendPlugin]
                });
                Log.ret(Log.l.trace);
            }
            this.createSurpremeChart = createSurpremeChart;

            var setUpData = function () {
                Log.call(Log.l.trace, "DiaCountrys.Controller.");
                if (that.isSupreme === 1) {
                    dataMain.labels = top5Diagramlabelsdata;
                    dataMain.datasets[0].data = top5Diagramdatasetsdata;
                    dataMain.datasets[0].backgroundColor = top5Diagrambackgroundcolor;
                    dataMain.datasets[0].borderColor = top5Diagrambordercolor;
                }
                if (that.isSupreme === 2) {
                    dataMainSurpreme.labels = top5DiagramLabelsdataMulitline;
                    dataMainSurpreme.datasets[0].data = top5Diagramdatasetsdata;
                    dataMainSurpreme.datasets[0].backgroundColor = top5Diagrambackgroundcolor;
                    dataMainSurpreme.datasets[0].borderColor = top5Diagrambordercolor;
                    dataMainSurpreme.datasets[1].data = top5Diagramsupremedatasetsdata;
                    dataMainSurpreme.datasets[1].backgroundColor = top5Diagramsupremebackgroundcolor;
                    dataMainSurpreme.datasets[1].borderColor = top5Diagramsupremebordercolor;
                }
                Log.ret(Log.l.trace);
            }
            this.setUpData = setUpData;

            var getRandomInt = function (min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min)) + min;
            }
            this.getRandomInt = getRandomInt;

            var resultConverter = function (item, index) {
                if (that.isSupreme === 1) {
                    if (index <= 8) {
                        if (item.Land === null) {
                            item.Land = "Kein Land";
                        }
                        anzKontakte = item.TotalHits;
                        top5Diagramlabelsdata.push(item.Land + " " + ((item.Anzahl / item.TotalHits) * 100).toFixed(1) + "%");
                        top5Diagramdatasetsdata.push(item.Anzahl);
                        anzKontaktePremium += item.Anzahl;
                        top5Diagrambackgroundcolor.push(that.hexToRgbA(that.getColor(Colors.dashboardColor, index / 30)));
                        top5Diagrambordercolor.push(that.hexToRgbA(that.getColor(Colors.dashboardColor, index / 30)));
                    }
                }
                if (that.isSupreme === 2) {
                    if (index <= 8) {
                        if (item.Land === null) {
                            item.Land = "Kein Land";
                        }
                        if (item.Land !== null) {
                            var splitLand = item.Land.replace(/,/gi, ",?").split("?");
                        }
                        top5Diagramlabelsdata.push(item.Land);
                        top5DiagramLabelsdataMulitline.push(splitLand);
                        top5Diagramdatasetsdata.push(((item.Anzahl / item.TotalHits) * 100).toFixed(1)); /*item.GlobalPercentage*/
                        top5Diagrambackgroundcolor.push(that.hexToRgbA(that.getColor(Colors.dashboardColor, index / 30)));
                        top5Diagrambordercolor.push(that.hexToRgbA(that.getColor(Colors.dashboardColor, index / 30)));
                        /*var AnzahlSup = that.getRandomInt(8, 12);*/
                        if (item.GlobalPercentage === null) {
                            item.GlobalPercentage = 0;
                        }
                        top5Diagramsupremedatasetsdata.push(item.GlobalPercentage); /*item.GlobalPercentage*/
                        top5Diagramsupremebackgroundcolor.push(that.hexToRgbA(that.getColor(surpremeColor, index / 30)));
                        top5Diagramsupremebordercolor.push(that.hexToRgbA(that.getColor(surpremeColor, index / 30)));

                        anzKontakte = item.TotalHits;
                        anzKontaktePremium += item.Anzahl;
                    }
                }
            }
            this.resultConverter = resultConverter;

            var getGetCountryHitlistData = function () {
                Log.call(Log.l.trace, "DiaCountrys.Controller.");
                AppData.setErrorMsg(pageBinding);
                that.setEventId();
                var ret = AppData.call("PRC_GetCountryHitlist", {
                    pVeranstaltungID: that.getEventId(),
                    pLanguageSpecID: that.langSet()
                }, function (json) {
                    Log.print(Log.l.info, "call PRC_GetCountryHitlist success! ");
                    if (json.d.results && json.d.results.length > 0) {
                        var results = json.d.results;
                        var restdata;
                        results.sort(function (a, b) {
                            return b.Anzahl - a.Anzahl;
                        });
                        results.forEach(function (item, index) {
                            that.resultConverter(item, index);
                        });
                        if (that.isSupreme === 1) {
                            restdata = anzKontakte - anzKontaktePremium;
                            if (restdata) {
                                top5Diagramlabelsdata.push(getResourceText("diaCountrys.remaindata") + " " + ((restdata / anzKontakte) * 100).toFixed(1) + "%");
                                top5Diagramdatasetsdata.push(restdata);
                                top5Diagrambackgroundcolor.push(that.hexToRgbA(that.getColor(Colors.dashboardColor, 9 / 30)));
                                top5Diagrambordercolor.push(that.hexToRgbA(that.getColor(Colors.dashboardColor, 9 / 30)));
                            }
                            that.setUpData();
                            that.createPremiumChart();
                        } else {
                            restdata = anzKontakte - anzKontaktePremium;
                            if (restdata) {
                                top5Diagramlabelsdata.push(getResourceText("diaCountrys.remaindata"));
                                top5Diagramdatasetsdata.push(((restdata / anzKontakte) * 100).toFixed(1));
                                top5Diagramsupremedatasetsdata.push(((restdata / anzKontakte) * 100).toFixed(1)); /*Math.round((restdata / item.TotalHits) * 100)*/
                                top5Diagrambackgroundcolor.push(that.hexToRgbA(that.getColor(Colors.dashboardColor, 9 / 30)));
                                top5Diagrambordercolor.push(that.hexToRgbA(that.getColor(Colors.dashboardColor, 9 / 30)));
                                top5DiagramLabelsdataMulitline.push([getResourceText("diaCountrys.remaindata")]);
                                top5Diagramsupremebackgroundcolor.push(that.hexToRgbA(that.getColor(surpremeColor, 9 / 30)));
                                top5Diagramsupremebordercolor.push(that.hexToRgbA(that.getColor(surpremeColor, 9 / 30)));
                            }
                            that.setUpData();
                            that.createSurpremeChart();
                        }
                    }
                }, function (error) {
                    Log.print(Log.l.error, "call PRC_GetCountryHitlist error");
                    AppData.setErrorMsg(pageBinding, error);
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.getGetCountryHitlistData = getGetCountryHitlistData;

            var checkIfSurpreme = function () {
                if (that.isSupreme === 2) {
                    /*container.style.width = "50%";*/
                    /*container.style.width = "48%";
                    container.style.height = "240px";
                    container.style.float = "right";
                    labels.style.display = "inline-block";
                    labels.style.width = "48%";
                    labels.style.height = "240px";*/
                } else {
                    container.style.width = "100%";
                    /*container.style.height = "235px";*/
                    labels.style.display = "none";
                }
            }
            this.checkIfSurpreme = checkIfSurpreme;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return Colors.loadSVGImageElements(icons, "action-image", 24, Colors.textColor, "name");
            }).then(function () {
                Log.print(Log.l.trace, "Calling checkIfSurpreme");
                return that.checkIfSurpreme();
            }).then(function () {
                Log.print(Log.l.trace, "Calling checkIfSurpreme");
                return that.setTooltipText();
            }).then(function () {
                Log.print(Log.l.trace, "Calling getGetCountryHitlistData");
                return getGetCountryHitlistData();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {

        })
    });
})();
