// controller for page: StartQuestions
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/diaCountrysIndustries/diaCountrysIndustriesService.js" />
/// <reference path="~/www/lib/chartJS/scripts/dist/Chart.js" />
/// <reference path="~/www/lib/chartJS/scripts/dist/Chart.bundle.js" />
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
                
                var industrieschart = null;

                var selectedCountryBefore = null;

                var criteriadrop = fragmentElement.querySelector("#criteriadropdown");
                var countrydrop = fragmentElement.querySelector("#countrydropdown");
                var daydrop = fragmentElement.querySelector("#daydropdown");

                this.countryfills = [];

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

                var getMilliseconts = function(date) {
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
                                            height: height - 20,
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

                var redrawMap = function() {
                    Log.call(Log.l.trace, "StartCountrys.Controller.");
                    var map = d3.select('#container').append("svg").attr('class', 'map');
                    map.resize();
                    Log.ret(Log.l.trace);
                }
                this.redrawMap = redrawMap;

                // countryIndustriesChart

                var countryIndustriesLabels = [];
                var countryIndustriesRawData = [];

                var countryIndustriesData = {
                    labels: countryIndustriesLabels,
                    datasets: [{
                        data: countryIndustriesRawData,
                        backgroundColor: Colors.dashboardColor,
                        hoverBackgroundColor: Colors.dashboardColor
                    }]
                };

                var createCountryIndustriesDia = function () {
                    industrieschart = new Chart(fragmentElement.querySelector("#countrysIndustriesChart"), {
                        type: 'horizontalBar',
                        data: countryIndustriesData,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            tooltips: {
                                enabled: false
                            },
                            hover: {
                                animationDuration: 0
                            },
                            scales: {
                                xAxes: [{
                                    display: false,
                                    gridLines: {
                                        display: false
                                    },
                                    ticks: {
                                        beginAtZero: true
                                    },
                                }],
                                yAxes: [{
                                    gridLines: {
                                        display: false,
                                        color: "#fff",
                                        zeroLineColor: "#fff",
                                        zeroLineWidth: 0
                                    },
                                    ticks: {
                                        fontSize: 16
                                    },
                                    stacked: true
                                }]
                            },
                            legend: {
                                display: false
                            },
                            animation: {
                                onComplete: function () {
                                    var chartInstance = this.chart;
                                    var ctx = chartInstance.ctx;
                                    ctx.textAlign = "left";
                                    ctx.font = "15px Open Sans";
                                    ctx.fillStyle = "#000000";

                                    Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
                                        var meta = chartInstance.controller.getDatasetMeta(i);
                                        Chart.helpers.each(meta.data.forEach(function (bar, index) {
                                            countryIndustriesData = dataset.data[index];
                                            if (i === 0) {
                                                ctx.fillText(countryIndustriesData, bar._xScale.left + 5, bar._model.y + 4);
                                            } else {
                                                ctx.fillText(countryIndustriesData, bar._model.x - 25, bar._model.y + 4);
                                            }
                                        }),
                                            this);
                                    }), this);
                                }
                            },
                            pointLabelFontFamily: "Quadon Extra Bold",
                            scaleFontFamily: "Quadon Extra Bold",
                        }
                    });
                }
                this.createCountryIndustriesDia = createCountryIndustriesDia;

                var redraw = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    industrieschart.data.labels = countryIndustriesLabels;
                    industrieschart.data.datasets[0].data = countryIndustriesRawData;
                    industrieschart.update();
                }
                this.redraw = redraw;
                
                var resultConverter = function (item, index) {
                    item.index = index;
                    if (item.LandID === 0) {
                        item.Land = "-";
                    }
                    if (item.Qualifier) {
                        countryIndustriesLabels.push(item.Qualifier);
                    }
                    if (item.NumHits) {
                        countryIndustriesRawData.push(item.NumHits);
                    }
                    if (item.Startdatum) {
                        item.Startdatum = getDateObject(item.Startdatum);
                    }
                    if (item.Enddatum) {
                        item.Enddatum = getDateObject(item.Enddatum);
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

                var dayData = 0;

                var getGetDashboardData = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    if (daydrop.value === "") {
                        dayData = 0;
                    } else {
                        dayData = getMilliseconts(daydrop.value);
                    }
                    countryIndustriesLabels = [];
                    countryIndustriesRawData = [];
                    AppData.call("PRC_GetDashboardData", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                        pCriterion1ID: parseInt(that.binding.criteriaMain),
                        pCriterion2ID: parseInt(that.binding.criteriaDays),
                        pLandID: parseInt(that.binding.criteriaCountry),
                        pDay: dayData,
                        pLanguageSpecID: AppData.getLanguageId()
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var results = json.d.results;
                        results.forEach(function (item, index) {
                            that.resultConverter(item, index);
                        });
                        if (industrieschart) {
                            that.redraw();
                        } else {
                            that.createCountryIndustriesDia();
                            that.redraw();
                        }

                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                }
                this.getGetDashboardData = getGetDashboardData;

                this.eventHandlers = {
                    changedCriteria: function (event) {
                        Log.call(Log.l.trace, "Contact.Controller.");
                        that.binding.criteriaMain = event.target.value;
                        that.getGetDashboardData();
                        Log.ret(Log.l.trace);
                    },
                    changedCountry: function (event) {
                        Log.call(Log.l.trace, "Event.Controller.");
                        that.binding.criteriaCountry = parseInt(event.target.value);
                        that.getGetDashboardData();
                        Log.ret(Log.l.trace);
                    },
                    changedDay: function (event) {
                        Log.call(Log.l.trace, "Event.Controller.");
                        that.getGetDashboardData();
                        Log.ret(Log.l.trace);
                    },
                    cleardDay: function (event) {
                        Log.call(Log.l.trace, "Event.Controller.");
                        daydrop.value = "";
                        that.getGetDashboardData();
                        Log.ret(Log.l.trace);
                    }
                };


                if (criteriadrop) {
                    this.addRemovableEventListener(criteriadrop, "change", this.eventHandlers.changedCriteria.bind(this));
                }

                if (countrydrop) {
                    this.addRemovableEventListener(countrydrop, "change", this.eventHandlers.changedCountry.bind(this));
                }
                if (daydrop) {
                    this.addRemovableEventListener(daydrop, "change", this.eventHandlers.changedDay.bind(this));
                    this.addRemovableEventListener(daydrop, "focus", this.eventHandlers.cleardDay.bind(this));
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
                                    that.resultConverter(item, index);
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

                                if (countrydrop && countrydrop.winControl) {
                                    countrydrop.winControl.data = new WinJS.Binding.List(json.d.results);
                                    for (var i = 0; i < json.d.results.length; i++) {
                                        if (json.d.results[i].LandID === 0) {
                                            countrydrop.selectedIndex = i;
                                            that.binding.criteriaCountry = json.d.results[i].LandID;
                                        }
                                    }
                                    //countrydrop.selectedIndex = 0;
                                    //that.binding.criteriaCountry = json.d.results[0].LandID;
                                }
                                Log.print(Log.l.trace, "reportLand: success!");
                            }
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
                                        that.resultConverter(item, index);
                                    });
                                    daydrop.min = that.formatDate(results[0].Startdatum);
                                    daydrop.max = that.formatDate(results[0].Enddatum);
                                    daydrop.value = '';
                                    Log.print(Log.l.trace, "reportLand: success!");
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

                that.processAll().then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    return that.getGetCriterionListData();
                }).then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return loadData();
                }).then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return getGetDashboardData();
                }).then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return createWorldChart(true);
                }).then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    //return that.highlightMap();
                });
                Log.ret(Log.l.trace);
            }, {

            })
    });})();