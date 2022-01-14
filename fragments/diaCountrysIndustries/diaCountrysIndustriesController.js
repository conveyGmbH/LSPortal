// controller for page: StartQuestions
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/diaCountrysIndustries/diaCountrysIndustriesService.js" />
/// <reference path="~/www/lib/chartJS/scripts/dist/chart.js" />
/// <reference path="~/www/lib/datamaps/scripts/datamaps.world.de.js" />
/// <reference path="~/www/lib/datamaps/scripts/datamaps.world.en.js" />
/// <reference path="~/www/lib/d3/scripts/d3.min.js" />
/// <reference path="~/www/lib/topojson/scripts/topojson.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("DiaCountrysIndustries", {
        Controller: WinJS.Class.derive(Fragments.Controller,
            function Controller(fragmentElement, options) {
                Log.call(Log.l.trace, "DiaPositions.Controller.");
                Fragments.Controller.apply(this,
                    [
                        fragmentElement, {
                            criteriaMain: 0,
                            criteriaCountry: 0,
                            criteriaDays: 0
                        }
                    ]);

                var that = this;
                this.worldMapMaxWidth = 600;
                this.worldMap = null;
                this.worldMapHeight = 0;
                this.countryKeyData = null;
                this.countryColors = [];
                this.isSupreme = parseInt(AppData._userData.IsSupreme);
                this.dayData = 0;

                var selectedCountryBefore = null;

                var criteriadrop = fragmentElement.querySelector("#criteriadropdown");
                var countrydrop = fragmentElement.querySelector("#countrydropdown");
                var select = fragmentElement.querySelectorAll("select");
                var countryIndustriestooltip = fragmentElement.querySelector("#mydiaCountrysIndustriesElement");
                var icons = fragmentElement.querySelector(".countrysindustries-chart-top-container");

                this.countryfills = [];

                var loadIcon = function () {
                    var icon = fragmentElement.querySelector(".action-image");
                    icon.name = "information";
                    Colors.loadSVGImageElements(icons, "action-image", 24, Colors.textColor, "name");
                }
                this.loadIcon = loadIcon;

                var setTooltipText = function () {
                    if (that.isSupreme === 1) {
                        countryIndustriestooltip.innerHTML = getResourceText("diaCountrysIndustries.tooltipPremium");
                    } else {
                        countryIndustriestooltip.innerHTML = getResourceText("diaCountrysIndustries.tooltipSupreme1") + " <br> <p></p>" + getResourceText("diaCountrysIndustries.tooltipSupreme2");
                    }
                }
                this.setTooltipText = setTooltipText;

                var dropdowncolor = function () {
                    for (var i = 0; i < select.length; i++) {
                        select[i].style.backgroundColor = "#efedee ";
                    }
                }
                this.dropdowncolor = dropdowncolor;

                var isotoInitlandId = function (isoCode) {
                    var results = AppData.initLandView.getResults();
                    if (results && results.length > 0) {
                        for (var i = 0; i < results.length; i++) {
                            if (results[i].Alpha3_ISOCode === isoCode) {
                                return results[i].INITLandID;
                            }
                        }
                    }
                };
                this.isotoInitlandId = isotoInitlandId;

                var getDateObject = function (dateData) {
                    var ret;
                    if (dateData) {
                        var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                        var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                        ret = new Date(milliseconds);
                    } else {
                        //ret = new Date();
                    }
                    return ret;
                };
                this.getDateObject = getDateObject;

                var formatDate = function (date) {
                    var d = new Date(date),
                        month = '' + (d.getMonth() + 1),
                        day = '' + d.getDate(),
                        year = d.getFullYear();

                    if (month.length < 2)
                        month = '0' + month;
                    if (day.length < 2)
                        day = '0' + day;

                    return [year, month, day].join('-');
                }
                this.formatDate = formatDate;

                var getMilliseconts = function (date) {
                    var d = new Date(date);
                    var m = d.valueOf();
                    return m;
                }
                this.getMilliseconts = getMilliseconts;

                var createWorldChart = function (bAnimated) {
                    Log.call(Log.l.trace, "StartCountrys.Controller.");
                    var ret = new WinJS.Promise.as().then(function () {
                        if (!that.countryKeyData) {
                            Log.print(Log.l.trace, "extra ignored");
                        } else {
                            var worldContainer = fragmentElement.querySelector("#container");
                            if (worldContainer) {
                                var height = worldContainer.clientWidth / 2;
                                if (height > that.worldMapMaxWidth / 2) {
                                    height = that.worldMapMaxWidth / 2;
                                }
                                var width = worldContainer.clientWidth;
                                if (that.worldMapHeight !== height) {
                                    that.worldMapHeight = height;
                                    var hiliRgb = Colors.hex2rgb(Colors.textColor);
                                    var hiliBorderColor = "rgba(" + hiliRgb.r + "," + hiliRgb.g + "," + hiliRgb.b + ",0.2)";
                                    if (!that.countryKeyData) {
                                        Log.print(Log.l.trace, "load empty map");
                                        that.countryKeyData = {};
                                    }
                                    var fills = {
                                        defaultFill: "#d3d3d3"
                                    };
                                    if (that.countryColors) {
                                        for (var i = 0; i < that.countryColors.length; i++) {
                                            fills["COUNTRYFILL" + i] = that.countryColors[i];
                                        }
                                    }
                                    try {
                                        worldContainer.innerHTML = "";
                                        if (worldContainer.style) {
                                            if (bAnimated) {
                                                worldContainer.style.visibility = "hidden";
                                            }
                                        }
                                        that.worldMap = new Datamap({
                                            element: worldContainer,
                                            responsive: false,
                                            height: height,
                                            width: width - 20,
                                            fills: fills,
                                            // Array --> 'Countrykey' : { fillKey : 'Rate of importance'}
                                            data: that.countryKeyData,
                                            geographyConfig: {
                                                popupOnHover: true, /*false*/
                                                highlightOnHover: true,
                                                highlightFillColor: Colors.dashboardColor,
                                                highlightBorderColor: hiliBorderColor
                                            },
                                            done: function (datamap) {
                                                if (bAnimated) {
                                                    WinJS.Promise.timeout(50).then(function () {
                                                        if (worldContainer.style) {
                                                            worldContainer.style.visibility = "";
                                                        }
                                                        WinJS.UI.Animation.enterContent(worldContainer).done(function () {
                                                            var fragmentControl = fragmentElement.winControl;
                                                            if (fragmentControl && fragmentElement.updateLayout) {
                                                                fragmentControl.prevWidth = 0;
                                                                fragmentControl.prevHeight = 0;
                                                                fragmentControl.updateLayout.call(fragmentControl, fragmentElement);
                                                            }
                                                        });
                                                    });
                                                } else {
                                                    var fragmentControl = fragmentElement.winControl;
                                                    if (fragmentControl && fragmentElement.updateLayout) {
                                                        fragmentControl.prevWidth = 0;
                                                        fragmentControl.prevHeight = 0;
                                                        fragmentControl.updateLayout.call(pageControl, fragmentElement);
                                                    }
                                                }
                                                datamap.svg.call(d3.behavior.zoom().on("zoom", redraw));
                                                function redraw() {
                                                    datamap.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                                                }
                                                window.addEventListener('resize', function () {
                                                    that.worldMap.resize();

                                                });
                                            }
                                        });
                                    } catch (ex) {
                                        Log.print(Log.l.error, "exception occurred: " + ex.message);
                                    }
                                }
                            }
                        }
                    });
                    Log.ret(Log.l.trace);
                    return ret;
                }
                this.createWorldChart = createWorldChart;

                var redrawMap = function () {
                    Log.call(Log.l.trace, "StartCountrys.Controller.");
                    var map = d3.select('#container').append("svg").attr('class', 'map');
                    map.resize();
                    Log.ret(Log.l.trace);
                }
                this.redrawMap = redrawMap;

                // Define a plugin to provide data labels
                var plugin = {
                    afterDatasetsDraw: function (chart, easing) {
                        // To only draw at the end of animation, check for easing === 1
                        var ctx = chart.ctx;

                        chart.data.datasets.forEach(function (dataset, i) {
                            var meta = chart.getDatasetMeta(i);
                            if (!meta.hidden) {
                                meta.data.forEach(function (element, index) {
                                    // Draw the text in black, with the specified font
                                    ctx.fillStyle = Colors.textColor;

                                    var fontSize = 16;
                                    var fontStyle = 'normal';
                                    var fontFamily = 'Helvetica Neue';
                                    ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

                                    // Just naively convert to string for now
                                    var dataString = dataset.data[index].toString() + " %";

                                    // Make sure alignment settings are correct
                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'middle';

                                    var padding = 10;
                                    var position = element.tooltipPosition();
                                    ctx.fillText(dataString, position.x + 18, position.y - (fontSize / 2) + padding);
                                });
                            }
                        });
                    }
                }

                // countryIndustriesChart
                var countryIndustriesLabels = [];
                var countryIndustriesLabelsMultiline = [];
                var countryIndustriesRawDataPremium = [];
                var countryIndustriesRawDataSurpreme = [];

                var countryIndustriesPremiumData = {
                    labels: countryIndustriesLabels,
                    datasets: [{
                        data: countryIndustriesRawDataPremium,
                        backgroundColor: Colors.dashboardColor,
                        hoverBackgroundColor: Colors.dashboardColor
                    }]
                };

                var industriepremiumschart;
                var createCountryIndustriesPremiumChart = function () {
                    if (industriepremiumschart) {
                        industriepremiumschart.destroy();
                    }
                    industriepremiumschart = new Chart(fragmentElement.querySelector("#countrysIndustriesChart").getContext("2d"),
                        {
                            type: 'bar',
                            data: countryIndustriesPremiumData,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                indexAxis: 'y',
                                hover: {
                                    animationDuration: 0
                                },
                                layout: {
                                    padding: {
                                        right: 50
                                    }
                                },
                                scales: {
                                    y: {
                                        grid: {
                                            display: false,
                                            drawOnChartArea: false,
                                            color: "#fff",
                                            zeroLineColor: "#fff"
                                        },
                                        stacked: false,
                                        ticks: {
                                            color: Colors.textColor
                                        }
                                    },
                                    x: {
                                        display: false,
                                        grid: {
                                            display: false,
                                            drawOnChartArea: false
                                        },
                                        ticks: {
                                            display: false,
                                            beginAtZero: true
                                        },
                                        stacked: false
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
                                                var title = countryIndustriesLabels[context[0].dataIndex];
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label + " %";
                                            }
                                        }
                                    }
                                },
                                animation: {
                                    onComplete: function () {
                                        this.options.animation.onComplete = null;
                                        //var myWindow = window.open("", "MsgWindow", "width=widthOfCanvas,height=heightOfCanvas");
                                        //myWindow.document.write('<img src="' + industriepremiumschart.toBase64Image() + '"/>');
                                        if (AppBar && AppBar.scope.binding && AppBar.scope.binding.exportActive) {
                                            that.exportChartToPdf();
                                        }
                                    }
                                }
                            },
                            plugins: [plugin]
                        });
                }
                this.createCountryIndustriesPremiumChart = createCountryIndustriesPremiumChart;

                var exportChartToPdf = function () {
                    var element = document.getElementById("diaCountrysIndustriespDhost");
                    html2canvas(element,
                        {
                            scale: 1,
                            quality: 4
                        }).then(canvas => { /*, { dpi: 300 }*/
                            var widthOfCanvas = canvas.width;
                            var heightOfCanvas = canvas.height;
                            //set the orientation
                            var orientation, mmLeft, mmTop, mmWidth, mmHeight;
                            var mmLongSide = 297, mmShortSide = 210, mmBorder = 5, scale = 1;
                            if (widthOfCanvas >= heightOfCanvas) {
                                orientation = 'l';
                                mmLeft = mmBorder;
                                mmWidth = mmLongSide - 2 * mmBorder;
                                mmHeight = mmWidth * heightOfCanvas / widthOfCanvas;
                                if (mmHeight > (mmShortSide - 2 * mmBorder)) {
                                    scale = (mmShortSide - 2 * mmBorder) / mmHeight;
                                    mmHeight *= scale;
                                    mmWidth *= scale;
                                    mmLeft = (mmLongSide - mmWidth) / 2;
                                }
                                mmTop = (mmShortSide - mmHeight) / 2;
                            } else {
                                orientation = 'p';
                                mmTop = mmBorder;
                                mmHeight = mmLongSide - 2 * mmBorder;
                                mmWidth = mmHeight * widthOfCanvas / heightOfCanvas;
                                if (mmWidth > (mmShortSide - 2 * mmBorder)) {
                                    scale = (mmShortSide - 2 * mmBorder) / mmWidth;
                                    mmHeight *= scale;
                                    mmWidth *= scale;
                                    mmTop = (mmLongSide - mmHeight) / 2;
                                }
                                mmLeft = (mmShortSide - mmWidth) / 2;
                            }
                            var doc = new jsPDF(orientation, 'mm', 'a4'); /*[widthOfCanvas, heightOfCanvas]*/
                            doc.addImage(canvas.toDataURL(), 'png', mmLeft, mmTop, mmWidth, mmHeight);
                            //that.binding.progress.percent = 25;
                            //that.binding.progress.text = getResourceText('diaCountrys.top10');
                            return doc.save(getResourceText('diaCountrys.top10'));
                            if (AppBar.scope && AppBar.scope.binding && AppBar.scope.binding.dashBoardZip) {
                                AppBar.scope.binding.dashBoardZip.file(getResourceText('ddiaCountrysIndustries.title') + ' - ' + AppBar.scope.binding.fileName + '.pdf', doc.output('blob'));
                            }
                        });
                }
                this.exportChartToPdf = exportChartToPdf;

                var surpremeColor = "#cc5b87";

                var countryIndustriesSupremeData = {
                    labels: countryIndustriesLabels,
                    datasets: [{
                        data: countryIndustriesRawDataPremium,
                        backgroundColor: Colors.dashboardColor,
                        hoverBackgroundColor: Colors.dashboardColor
                    },
                        {
                            data: countryIndustriesRawDataSurpreme,
                            backgroundColor: surpremeColor,
                            hoverBackgroundColor: surpremeColor
                        }]
                };

                var industriesupremeschart;
                var createCountryIndustriesSupremeChart = function () {
                    if (industriesupremeschart) {
                        industriesupremeschart.destroy();
                    }
                    Chart.defaults.font.size = 15;
                    industriesupremeschart = new Chart(fragmentElement.querySelector("#countrysIndustriesChart").getContext("2d"),
                        {
                            type: 'bar',
                            data: countryIndustriesSupremeData,
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                indexAxis: 'y',
                                hover: {
                                    animationDuration: 0
                                },
                                layout: {
                                    padding: {
                                        right: 50
                                    }
                                },
                                scales: {
                                    y:
                                    {

                                        grid: {
                                            display: false,
                                            drawOnChartArea: false,
                                            color: "#fff",
                                            zeroLineColor: "#fff"
                                        },
                                        stacked: false,
                                        ticks: {
                                            color: Colors.textColor
                                        }
                                    },
                                    x: {
                                        display: false,
                                        grid: {
                                            display: false,
                                            drawOnChartArea: false
                                        },
                                        ticks: {
                                            display: false,
                                            beginAtZero: true
                                        },
                                        stacked: false
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        display: false,
                                        callbacks: {
                                            title: function (context) {/*.label*/
                                                var title = countryIndustriesLabels[context[0].dataIndex];
                                                return title;
                                            },
                                            label: function (context) {
                                                var label = context.dataset.data[context.dataIndex];
                                                return " " + label + " %";
                                            }
                                        }
                                    }
                                },
                                animation: {
                                    onComplete: function () {
                                        this.options.animation.onComplete = null;
                                        //var myWindow = window.open("", "MsgWindow", "width=widthOfCanvas,height=heightOfCanvas");
                                        //myWindow.document.write('<img src="' + industriepremiumschart.toBase64Image() + '"/>');
                                        if (AppBar && AppBar.scope.binding && AppBar.scope.binding.exportActive) {
                                            that.exportChartToPdf();
                                        }
                                    }
                                }
                            },
                            plugins: [plugin]
                        });
                }
                this.createCountryIndustriesSupremeChart = createCountryIndustriesSupremeChart;

                var clearArrays = function () {
                    countryIndustriesLabels = [];
                    countryIndustriesLabelsMultiline = [];
                    countryIndustriesRawDataPremium = [];
                    if (that.isSupreme === 2) {
                        countryIndustriesLabels = [];
                        countryIndustriesRawDataPremium = [];
                        countryIndustriesRawDataSurpreme = [];
                    }
                }
                this.clearArrays = clearArrays;

                var redraw = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    if (that.isSupreme === 1) {
                        countryIndustriesPremiumData.labels = countryIndustriesLabelsMultiline;/*countryIndustriesLabels*/
                        countryIndustriesPremiumData.datasets[0].data = countryIndustriesRawDataPremium;
                    }
                    if (that.isSupreme === 2) {
                        countryIndustriesSupremeData.labels = countryIndustriesLabelsMultiline;/*countryIndustriesLabels*/
                        countryIndustriesSupremeData.datasets[0].data = countryIndustriesRawDataPremium;
                        countryIndustriesSupremeData.datasets[1].data = countryIndustriesRawDataSurpreme;
                    }
                }
                this.redraw = redraw;

                var resultConverterPremium = function (item, index) {
                    item.index = index;
                    if (item.LandID === 0) {
                        item.Land = "-";
                    }
                    countryIndustriesLabels.push(item.Qualifier);
                    var splitQualifier = item.Qualifier.split(" ");
                    if (item.Qualifier) {
                        countryIndustriesLabelsMultiline.push(splitQualifier);
                    }
                    if (item.NumHits) {
                        countryIndustriesRawDataPremium.push(Math.round((item.NumHits / item.NumTotal) * 100));
                    }
                    if (item.Startdatum) {
                        item.Startdatum = getDateObject(item.Startdatum);
                    }
                    if (item.Enddatum) {
                        item.Enddatum = getDateObject(item.Enddatum);
                    }
                }
                this.resultConverterPremium = resultConverterPremium;

                var resultConverterSurpreme = function (item, index) {
                    item.index = index;
                    if (item.PercentGlobal) {
                        countryIndustriesRawDataSurpreme.push(item.PercentGlobal);
                    }
                }
                this.resultConverterSurpreme = resultConverterSurpreme;

                var resultConverterCriteria = function (item, index) {
                    item.index = index;
                }
                this.resultConverterCriteria = resultConverterCriteria;

                var getGetCriterionListData = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    return AppData.call("PRC_GetCriterionList", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pLanguageSpecID: AppData.getLanguageId()
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        if (criteriadrop && criteriadrop.winControl) {
                            if (json.d.results && json.d.results[0].CriterionID) {
                                json.d.results.forEach(function (item, index) {
                                    that.resultConverterCriteria(item, index);
                                });
                                var results = json.d.results.filter(function (item) {
                                    return (item && item.CriterionID && item.CriterionID !== -3); /*&& item.CriterionID !== 40*/
                                });
                                criteriadrop.winControl.data = new WinJS.Binding.List(results);
                                criteriadrop.selectedIndex = 0;
                                that.binding.criteriaMain = results[0].CriterionID;
                            } else {
                                criteriadrop.winControl.data = new WinJS.Binding.List(json.d.results);
                            }
                        }
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                }
                this.getGetCriterionListData = getGetCriterionListData;

                var sortFunc = function (result) {
                    return a.NumHits - b.NumHits;
                }
                this.sortFunc = sortFunc;

                var getGetDashboardDataPremium = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    return AppData.call("PRC_GetDashboardData", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pCriterion1ID: parseInt(that.binding.criteriaMain),
                        pCriterion2ID: parseInt(that.binding.criteriaDays),
                        pLandID: parseInt(that.binding.criteriaCountry),
                        pDay: 0,
                        pLanguageSpecID: AppData.getLanguageId()
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var results = json.d.results;
                        /*results.sort(function (a, b) {
                            return b.NumHits - a.NumHits;
                        });*/
                        if (results.length > 10) {
                            results.length = 10;
                        }
                        results.forEach(function (item, index) {
                            that.resultConverterPremium(item, index);
                        });
                        if (that.isSupreme === 1) {
                            that.redraw();
                            that.createCountryIndustriesPremiumChart();
                        }
                        //complete({});
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                }
                this.getGetDashboardDataPremium = getGetDashboardDataPremium;

                var getGetDashboardDataSurpreme = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    return AppData.call("PRC_GetDashboardData", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"), //
                        pCriterion1ID: parseInt(that.binding.criteriaMain),
                        pCriterion2ID: parseInt(that.binding.criteriaDays),
                        pLandID: 0,
                        pDay: 0,
                        pLanguageSpecID: AppData.getLanguageId()
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var results = json.d.results;
                        if (results.length > 10) {
                            results.length = 10;
                        }
                        results.forEach(function (item, index) {
                            that.resultConverterSurpreme(item, index);
                        });
                        that.redraw();
                        that.createCountryIndustriesSupremeChart();
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                }
                this.getGetDashboardDataSurpreme = getGetDashboardDataSurpreme;

                var drawChart = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    var ret = new WinJS.Promise.as().then(function () {
                        return that.clearArrays();
                    }).then(function () {
                        return that.getGetDashboardDataPremium();
                    }).then(function () {
                        if (that.isSupreme === 2) {
                            return that.getGetDashboardDataSurpreme();
                        }
                    });
                    Log.ret(Log.l.trace);
                    return ret;
                }
                this.drawChart = drawChart;

                this.eventHandlers = {
                    changedCriteria: function (event) {
                        Log.call(Log.l.trace, "Contact.Controller.");
                        that.binding.criteriaMain = event.target.value;
                        that.drawChart();
                        Log.ret(Log.l.trace);
                    },
                    changedCountry: function (event) {
                        Log.call(Log.l.trace, "Event.Controller.");
                        that.binding.criteriaCountry = parseInt(event.target.value);
                        that.drawChart();
                        Log.ret(Log.l.trace);
                    },
                    changedDay: function (event) {
                        Log.call(Log.l.trace, "Event.Controller.");
                        that.drawChart();
                        Log.ret(Log.l.trace);
                    },
                    cleardDay: function (event) {
                        Log.call(Log.l.trace, "Event.Controller.");
                        that.drawChart();
                        Log.ret(Log.l.trace);
                    }
                };

                if (criteriadrop) {
                    this.addRemovableEventListener(criteriadrop, "change", this.eventHandlers.changedCriteria.bind(this));
                }

                if (countrydrop) {
                    this.addRemovableEventListener(countrydrop, "change", this.eventHandlers.changedCountry.bind(this));
                }
                var loadData = function () {
                    Log.call(Log.l.trace, "DiaCountrys.");
                    AppData.setErrorMsg(that.binding);
                    var ret = new WinJS.Promise.as().then(function () {
                        return DiaCountrysIndustries.reportLand.select(function (json) {
                            Log.print(Log.l.trace, "reportLand: success!");
                            if (json && json.d && json.d.results && json.d.results.length > 0) {
                                var color = Colors.dashboardColor;
                                that.countryKeyData = {};
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    //that.resultConverterPremium(item, index);
                                });// store result for next use
                                var countryresult = json.d.results;
                                for (var ci = 0; ci < countryresult.length; ci++) {
                                    if (countryresult[ci].Land === null) {
                                        countryresult[ci].Land = getResourceText("reporting.nocountry");
                                    }
                                    if (countryresult[ci].Land) {
                                        that.countryColors[ci] = color;
                                        var rgbColor = Colors.hex2rgb(color);
                                        var hsvColor = Colors.rgb2hsv(rgbColor);
                                        hsvColor.s *= 0.8;
                                        hsvColor.v /= 0.8;
                                        rgbColor = Colors.hsv2rgb(hsvColor);
                                        color = Colors.rgb2hex(rgbColor);
                                    }
                                    var isoCode = countryresult[ci].Alpha3_ISOCode;
                                    if (isoCode) {
                                        that.countryKeyData[isoCode] = {
                                            fillKey: "COUNTRYFILL" + ci
                                        }
                                    }
                                }
                                that.worldMapHeight = 0;
                                var countrydropdata = json.d.results;
                                if (countrydrop && countrydrop.winControl) {
                                    var empty = { LandID: 0, Land: "" };
                                    countrydropdata.unshift(empty);
                                    countrydrop.winControl.data = new WinJS.Binding.List(countrydropdata);
                                    countrydrop.selectedIndex = 0;
                                    that.binding.criteriaCountry = json.d.results[0].LandID;
                                }
                                Log.print(Log.l.trace, "reportLand: success!");
                            }
                            return WinJS.Promise.as();
                        },
                            function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                    }).then(function () {
                        return DiaCountrysIndustries.veranstaltungView.select(function (json) {
                            Log.print(Log.l.trace, "reportLand: success!");
                            if (json && json.d && json.d.results && json.d.results.length > 0) {
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverterPremium(item, index);
                                });
                                daydrop.min = that.formatDate(results[0].Startdatum);
                                daydrop.max = that.formatDate(results[0].Enddatum);
                                daydrop.value = '';
                                Log.print(Log.l.trace, "reportLand: success!");
                            }
                            return WinJS.Promise.as();
                        }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                    });
                    Log.ret(Log.l.trace);
                    return ret;
                };
                this.loadData = loadData;

                /**
                 * Funktion die über über alle ComboboxWerten - criteriadrop durchloopt und
                 * jedes Mal PRC_GetDashboardData aufruft mit dem jeweiligen Wert in der Combobox
                 * dann zeichne Chart
                 * dann rufe Export auf!!
                 */
                var exportCharts = function (zipCharts) {
                    Log.print(Log.l.trace, "DiaCountrys.");
                    if (criteriadrop.winControl.data && criteriadrop.winControl.data.length > 0) {
                        //criteriadrop.winControl.data.forEach(function (criteria, index, array) {
                        return WinJS.Promise.as().then(function () {
                            that.binding.criteriaMain = 40;
                            that.binding.criteriaCountry = 0;
                            that.binding.fileName = "Jahrgangsgruppe Ihrer gescannten Besucher";
                            return drawChart();
                        }).then(function () {
                            that.binding.criteriaMain = 41;
                            that.binding.criteriaCountry = 0;
                            that.binding.fileName = "Branche Ihrer gescannten Besucher";
                            return drawChart();
                        }).then(function () {
                            that.binding.criteriaMain = 61;
                            that.binding.criteriaCountry = 0;
                            that.binding.fileName = "Interessengebiet Ihrer gescannten Besucher";
                            return drawChart();
                        }).then(function () {
                            that.binding.criteriaMain = -1;
                            that.binding.criteriaCountry = 0;
                            that.binding.fileName = "Abteilung Ihrer gescannten Besucher";
                            return drawChart();
                        }).then(function () {
                            that.binding.criteriaMain = -2;
                            that.binding.criteriaCountry = 0;
                            that.binding.fileName = "Funktion Ihrer gescannten Besucher";
                            return drawChart();
                        });
                        //});
                    } else {
                        return WinJS.Promise.as();
                    }
                    Log.ret(Log.l.trace);
                };
                this.exportCharts = exportCharts;

                that.processAll().then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return that.loadIcon();
                })/*.then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return dropdowncolor();
                })*/.then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    return that.setTooltipText();
                }).then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    return that.getGetCriterionListData();
                }).then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return loadData();
                }).then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return drawChart();
                }).then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    //return createWorldChart(true);
                }).then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    //return that.highlightMap();
                });
                Log.ret(Log.l.trace);
            }, {

            })
    });
})();