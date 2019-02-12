// controller for page: start
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/start/startService.js" />
/// <reference path="~/www/lib/datamaps/scripts/datamaps.world.de.js" />
/// <reference path="~/www/lib/datamaps/scripts/datamaps.world.en.js" />
/// <reference path="~/www/lib/d3/scripts/d3.min.js" />
/// <reference path="~/www/lib/topojson/scripts/topojson.js" />

/*
 Structure of states to be set from external modules:
 {
    networkState: newNetworkstate:
 }
*/

(function () {
    "use strict";

    WinJS.Namespace.define("Start", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Start.Controller.");

            var lang = AppData.getLanguageId();
            var srcDatamaps;
            switch (lang) {
                case 1033:
                    srcDatamaps = "lib/datamaps/scripts/datamaps.world.en.js";
                    break;
                case 1036:
                    srcDatamaps = "lib/datamaps/scripts/datamaps.world.en.js";
                    break;
                case 1040:
                    srcDatamaps = "lib/datamaps/scripts/datamaps.world.en.js";
                    break;
                default:
                    srcDatamaps = "lib/datamaps/scripts/datamaps.world.de.js";
            }
            Application.Controller.apply(this, [pageElement, {
                dataStart: {},
                noLicence: getResourceText("info.nolicence"),
                disableEditEvent: NavigationBar.isPageDisabled("event"),
                comment: getResourceText("info.comment"),
                dataLicence: null,
                dataLicenceUser : null,
                // add dynamic scripts to page element, src is either a file or inline text:
                scripts: [{ src: srcDatamaps, type: "text/javascript" }]
            }, commandList]);
            this.kontaktanzahldata = null;
            this.countrydata = null;
            this.applist = null;
            this.nextUrl = null;

            var that = this;

            var listView = pageElement.querySelector("#dataLicenceUserList.listview");

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.kontaktanzahldata) {
                    that.kontaktanzahldata = null;
                }
                if (that.applist) {
                    that.applist = null;
                }
            }

            var isotoInitlandId = function(isoCode) {
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

            this.worldMapMaxWidth = 600;
            this.worldMap = null;
            this.worldMapHeight = 0;
            this.countryKeyData = null;
            var worldChart = function (bAnimated) {
                Log.call(Log.l.trace, "Start.Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    if (!that.countryKeyData) {
                        Log.print(Log.l.trace, "extra ignored");
                    } else {
                        var worldContainer = pageElement.querySelector('#worldcontainer');
                        if (worldContainer) {
                            var height = worldContainer.clientWidth / 2;
                            if (height > that.worldMapMaxWidth / 2) {
                                height = that.worldMapMaxWidth / 2;
                            }
                            var width = 2 * height;
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
                                        fills["HIGH" + i] = that.countryColors[i];
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
                                        projection: 'mercator',
                                        height: height,
                                        width: width,
                                        fills: fills,
                                        // Array --> 'Countrykey' : { fillKey : 'Rate of importance'}
                                        data: that.countryKeyData,
                                        geographyConfig: {
                                            popupOnHover: false,
                                            highlightOnHover: true,
                                            highlightFillColor: Colors.navigationColor,
                                            highlightBorderColor: hiliBorderColor
                                        },
                                        done: function (datamap) {
                                            var allSubunits = datamap.svg.selectAll('.datamaps-subunit');
                                            allSubunits.on('click', function (geography) {
                                                var landId = that.isotoInitlandId(geography.id);
                                                that.setRestriction({
                                                    INITLandID: landId
                                                });
                                                AppData.setRecordId("Kontakt", null);
                                                WinJS.Promise.timeout(0).then(function () {
                                                    Application.navigateById("contact");
                                                });
                                            });
                                            if (bAnimated) {
                                                WinJS.Promise.timeout(50).then(function () {
                                                    if (worldContainer.style) {
                                                        worldContainer.style.visibility = "";
                                                    }
                                                    WinJS.UI.Animation.enterContent(worldContainer).done(function () {
                                                        var pageControl = pageElement.winControl;
                                                        if (pageControl && pageControl.updateLayout) {
                                                            pageControl.prevWidth = 0;
                                                            pageControl.prevHeight = 0;
                                                            pageControl.updateLayout.call(pageControl, pageElement);
                                                        }
                                                    });
                                                });
                                            } else {
                                                var pageControl = pageElement.winControl;
                                                if (pageControl && pageControl.updateLayout) {
                                                    pageControl.prevWidth = 0;
                                                    pageControl.prevHeight = 0;
                                                    pageControl.updateLayout.call(pageControl, pageElement);
                                                }
                                            }
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
            this.worldChart = worldChart;

            var setRestriction = function (restriction) {
                AppData.setRestriction("Kontakt", restriction);
            }
            this.setRestriction = setRestriction;

            this.isClicked = false;
            var clickPieSlice = function (event, index) {
                Log.call(Log.l.trace, "Start.Controller.", "index=" + index);
                if (that.isClicked) {
                    Log.ret(Log.l.trace, "extra ignored");
                    return;
                }
                that.isClicked = true;
                switch (index) {
                    case 0:
                    {
                        that.setRestriction({
                            Nachbearbeitet: "NULL"
                        });
                    }
                    break;
                    case 1:
                    {
                        that.setRestriction({
                            Nachbearbeitet: 1
                        });
                    }
                    break;
                    default:
                    {
                        that.setRestriction({
                            // no restriction
                        });
                    }
                }
                AppData.setRecordId("Kontakt", null);
                WinJS.Promise.timeout(0).then(function() {
                    Application.navigateById("contact", event);
                });
                Log.ret(Log.l.trace);
            }
            this.clickPieSlice = clickPieSlice;

            var clickDonutSlice = function (event, index) {
                Log.call(Log.l.trace, "Start.Controller.", "index=" + index);
                var data = event[2];
                if (that.isClicked) {
                    Log.ret(Log.l.trace, "extra ignored");
                    return;
                }
                that.isClicked = true;
                
                that.setRestriction({
                    INITLandID: data,
                    bExact: true
                });
               
                AppData.setRecordId("Kontakt", null);
                WinJS.Promise.timeout(0).then(function () {
                    Application.navigateById("contact", event);
                });
                Log.ret(Log.l.trace);
            }
            this.clickDonutSlice = clickDonutSlice;

            var clickBarSlice = function (event, index) {
                Log.call(Log.l.trace, "Start.Controller.", "index=" + index);
                if (that.isClicked) {
                    Log.ret(Log.l.trace, "extra ignored");
                    return;
                }
                that.isClicked = true;
                
                if (that.kontaktanzahldata && index >= 0 && index < that.kontaktanzahldata.length) {
                    var row = that.kontaktanzahldata[index];
                    var msString = row.Datum.replace("\/Date(", "").replace(")\/", "");
                    var milliseconds = parseInt(msString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    var date = new Date(milliseconds);
                    that.setRestriction({
                        useErfassungsdatum: true,
                        Erfassungsdatum: date
                    });
                    AppData.setRecordId("Kontakt", null);
                    WinJS.Promise.timeout(0).then(function () {
                        Application.navigateById("contact", event);
                    });
                }
                Log.ret(Log.l.trace);
            }
            this.clickBarSlice = clickBarSlice;

            this.countryChart = null;
            this.countryChartWidth = 0;
            this.countryChartArray = [];
            this.countryPercent = [];
            this.countrydata = [];
            this.countryColors = [];
            var showDonutChart = function (countryChartId, bAnimated) {
                Log.call(Log.l.trace, "Start.Controller.");
                WinJS.Promise.timeout(0).then(function () {
                    if (!that.countrydata || !that.countrydata.length) {
                        Log.print(Log.l.trace, "extra ignored");
                    } else {
                        var countryChart = pageElement.querySelector("#" + countryChartId);
                        if (countryChart) {
                            var width = countryChart.clientWidth;
                            if (that.countryChartWidth !== width) {
                                that.countryChartWidth = width;
                                var diameter = width / 2 - 48;
                                if (diameter < 128) {
                                    diameter = 128;
                                } else if (diameter > 250) {
                                    diameter = 250;
                                }
                                Log.print(Log.l.trace, "diameter=" + diameter);
                                countryChart.innerHTML = "";
                                if (countryChart.style) {
                                    if (bAnimated) {
                                        countryChart.style.visibility = "hidden";
                                    }
                                }
                                try {
                                    that.countryChart = $.jqplot(countryChartId, [that.countrydata], {
                                        seriesDefaults: {
                                            renderer: $.jqplot.DonutRenderer,
                                            rendererOptions: {
                                                diameter: diameter,
                                                sliceMargin: 1,
                                                startAngle: -145,
                                                showDataLabels: true,
                                                dataLabels: that.countryPercent,
                                                padding: '5',
                                                ringMargin: '5',
                                                dataLabelThreshold: '1',
                                                highlightMouseOver: true,
                                                shadowAlpha: 0
                                            },
                                            seriesColors: that.countryColors
                                        },
                                        legend: {
                                            show: true, rendererOptions: {
                                                numberRows: 10
                                            }, location: 'w', marginLeft: '30px'
                                        }
                                    });
                                    $("#" + countryChartId).unbind("jqplotDataClick");
                                    $("#" + countryChartId).bind("jqplotDataClick",
                                        function (ev, seriesIndex, pointIndex, data) {
                                            that.clickDonutSlice(data, pointIndex);
                                        }
                                    );
                                    if (bAnimated) {
                                        WinJS.Promise.timeout(50).then(function () {
                                            if (countryChart.style) {
                                                countryChart.style.visibility = "";
                                            }
                                            WinJS.UI.Animation.fadeIn(countryChart).done(function () {
                                                var pageControl = pageElement.winControl;
                                                if (pageControl && pageControl.updateLayout) {
                                                    pageControl.prevWidth = 0;
                                                    pageControl.prevHeight = 0;
                                                    pageControl.updateLayout.call(pageControl, pageElement);
                                                }
                                            });
                                        });
                                    } else {
                                        var pageControl = pageElement.winControl;
                                        if (pageControl && pageControl.updateLayout) {
                                            pageControl.prevWidth = 0;
                                            pageControl.prevHeight = 0;
                                            pageControl.updateLayout.call(pageControl, pageElement);
                                        }
                                    }
                                } catch (ex) {
                                    Log.print(Log.l.error, "exception occurred: " + ex.message);
                                }
                            }
                        }
                    }
                });
                Log.ret(Log.l.trace);
            };
            this.showDonutChart = showDonutChart;

            this.pieChart = null;
            this.pieChartWidth = 0;
            var buttonEdited = getResourceText("start.buttonEdited");
            var buttonNotEdited = getResourceText("start.buttonNotEdited");
            var showPieChart = function (pieChartId, bAnimated) {
                Log.call(Log.l.trace, "Start.Controller.");
                WinJS.Promise.timeout(0).then(function() {
                    var visitorsEditedChart = pageElement.querySelector("#" + pieChartId);
                    if (visitorsEditedChart &&
                        that.binding.dataStart &&
                        typeof that.binding.dataStart.AnzNichtEditierteKontakte !== "undefined" &&
                        typeof that.binding.dataStart.AnzEditierteKontakte !== "undefined") {
                        var width = visitorsEditedChart.clientWidth;
                        if (that.pieChartWidth !== width) {
                            that.pieChartWidth = width;
                            var diameter = width / 2;
                            if (diameter < 128) {
                                diameter = 128;
                            } else if (diameter > 250) {
                                diameter = 250;
                            }
                            Log.print(Log.l.trace, "diameter=" + diameter);
                            var series = [
                                [buttonEdited, that.binding.dataStart.AnzEditierteKontakte],
                                [buttonNotEdited, that.binding.dataStart.AnzNichtEditierteKontakte]
                            ];
                            var dataLabels = [
                                buttonEdited + ": " + that.binding.dataStart.AnzEditierteKontakte,
                                buttonNotEdited + ": " + that.binding.dataStart.AnzNichtEditierteKontakte
                            ];
                            Log.print(Log.l.trace, dataLabels[0]);
                            Log.print(Log.l.trace, dataLabels[1]);
                            var seriesColors = [
                                "#f0f0f0",
                                Colors.navigationColor
                            ];
                            visitorsEditedChart.innerHTML = "";
                            if (visitorsEditedChart.style) {
                                visitorsEditedChart.style.height = (diameter + 48).toString() + "px";
                                if (bAnimated) {
                                    visitorsEditedChart.style.visibility = "hidden";
                                }
                            }
                            if (!series || !series.length || diameter < 96) {
                                Log.print(Log.l.trace, "extra ignored");
                            } else {
                                try {
                                    visitorsEditedChart.innerHTML = "";
                                    that.pieChart = $.jqplot(pieChartId, [series], {
                                        title: "",
                                        grid: {
                                            drawBorder: false,
                                            drawGridlines: false,
                                            background: "transparent",
                                            shadow: false
                                        },
                                        axesDefaults: {},
                                        seriesDefaults: {
                                            shadow: false,
                                            renderer: $.jqplot.PieRenderer,
                                            rendererOptions: {
                                                diameter: diameter,
                                                dataLabels: dataLabels,
                                                showDataLabels: true,
                                                startAngle: -90,
                                                sliceMargin: 2
                                            }
                                        },
                                        seriesColors: seriesColors,
                                        legend: {
                                            show: false
                                        }
                                    });
                                    $("#" + pieChartId).unbind("jqplotDataClick");
                                    $("#" + pieChartId).bind("jqplotDataClick",
                                      function (ev, seriesIndex, pointIndex, data) {
                                          that.clickPieSlice(ev, pointIndex);
                                      }
                                    );
                                    if (bAnimated) {
                                        WinJS.Promise.timeout(50).then(function() {
                                            if (visitorsEditedChart.style) {
                                                visitorsEditedChart.style.visibility = "";
                                            }
                                            WinJS.UI.Animation.fadeIn(visitorsEditedChart).done(function() {
                                                var pageControl = pageElement.winControl;
                                                if (pageControl && pageControl.updateLayout) {
                                                    pageControl.prevWidth = 0;
                                                    pageControl.prevHeight = 0;
                                                    pageControl.updateLayout.call(pageControl, pageElement);
                                                }
                                            });
                                        });
                                    } else {
                                        var pageControl = pageElement.winControl;
                                        if (pageControl && pageControl.updateLayout) {
                                            pageControl.prevWidth = 0;
                                            pageControl.prevHeight = 0;
                                            pageControl.updateLayout.call(pageControl, pageElement);
                                        }
                                    }
                                } catch (ex) {
                                    Log.print(Log.l.error, "exception occurred: " + ex.message);
                                }
                            }
                        }
                    }
                });
                Log.ret(Log.l.trace);
            }
            this.showPieChart = showPieChart;

            this.barChart = null;
            this.barChartWidth = 0;
            var showBarChart = function(barChartId, bAnimated) {
                Log.call(Log.l.trace, "Start.Controller.");
                WinJS.Promise.timeout(0).then(function () {
                    if (!that.kontaktanzahldata || !that.kontaktanzahldata.length) {
                        Log.print(Log.l.trace, "extra ignored");
                    } else {
                        var visitorsPerDayChart = pageElement.querySelector("#" + barChartId);
                        if (visitorsPerDayChart) {
                            var width = visitorsPerDayChart.clientWidth;
                            if (that.barChartWidth !== width) {
                                that.barChartWidth = width;
                                var series = [];
                                var ticks = [];
                                if (that.kontaktanzahldata && that.kontaktanzahldata.length > 0) {
                                    for (var i = 0; i < that.kontaktanzahldata.length; i++) {
                                        var row = that.kontaktanzahldata[i];
                                        series[i] = [AppData.toDateString(row.Datum, true), row.AnzahlProTag];
                                        ticks[i] = i;
                                    }
                                }
                                var seriesColors = [
                                    Colors.backgroundColor
                                ];
                                visitorsPerDayChart.innerHTML = "";
                                try {
                                    visitorsPerDayChart.innerHTML = "";
                                    var rendererOptions = {};
                                    if (bAnimated) {
                                        rendererOptions.animation = {
                                            speed: 500
                                        };
                                    }
                                    that.barChart = $.jqplot(barChartId, [series], {
                                        grid: {
                                            drawBorder: false,
                                            drawGridlines: false,
                                            background: "transparent",
                                            shadow: false
                                        },
                                        animate: bAnimated,
                                        seriesDefaults: {
                                            renderer: $.jqplot.BarRenderer,
                                            rendererOptions: rendererOptions,
                                            shadow: false,
                                            pointLabels: {
                                                show: true
                                            }
                                        },
                                        axes: {
                                            xaxis: {
                                                renderer: $.jqplot.CategoryAxisRenderer
                                            },
                                            yaxis: {
                                                renderer: $.jqplot.AxisThickRenderer,
                                                show: false,
                                                showTicks: false,
                                                showTickMarks: false
                                            }
                                        },
                                        seriesColors: seriesColors,
                                        legend: {
                                            show: false
                                        }
                                    });
                                    $("#" + barChartId).unbind("jqplotDataClick");
                                    $("#" + barChartId).bind("jqplotDataClick",
                                        function (ev, seriesIndex, pointIndex, data) {
                                            that.clickBarSlice(ev, pointIndex);
                                        }
                                    );
                                    var pageControl = pageElement.winControl;
                                    if (pageControl && pageControl.updateLayout) {
                                        pageControl.prevWidth = 0;
                                        pageControl.prevHeight = 0;
                                        pageControl.updateLayout.call(pageControl, pageElement);
                                    }
                                } catch (ex) {
                                    Log.print(Log.l.error, "exception occurred: " + ex.message);
                                }
                            }
                        }
                    }
                });
                Log.ret(Log.l.trace);
            }
            this.showBarChart = showBarChart;

            var resultConverter = function (item, index) {
                item.index = index;
            }
            this.resultConverter = resultConverter;

            // define data handling standard methods
            var getRecordId = function () {
                return AppData.getRecordId("Mitarbeiter");
            };
            this.getRecordId = getRecordId;

            var loadData = function() {
                Log.call(Log.l.trace, "Start.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!AppData.initLandView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initLandData...");
                        //@nedra:25.09.2015: load the list of INITLand for Combobox
                        return AppData.initLandView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "initLandView: success!");
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    var recordId = getRecordId();
                    if (!recordId) {
                        that.binding.dataStart = {};
                        ret = WinJS.Promise.as();
                    } else {
                        Log.print(Log.l.trace, "calling select mitarbeiterView...");
                        ret = Start.mitarbeiterView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "mitarbeiterView: success!");
                            // mitarbeiterView returns object already parsed from json file in response
                            if (json && json.d) {
                                that.binding.dataStart = json.d;
                                that.binding.dataStart.AnzKontakte = 0;
                                if (that.binding.dataStart.AnzNichtEditierteKontakte) {
                                    that.binding.dataStart.AnzKontakte +=
                                        that.binding.dataStart.AnzNichtEditierteKontakte;
                                }
                                if (that.binding.dataStart.AnzEditierteKontakte) {
                                    that.binding.dataStart.AnzKontakte +=
                                        that.binding.dataStart.AnzEditierteKontakte;
                                }
                                that.pieChartWidth = 0;
                                that.showPieChart("visitorsEditedChart", true);
                            }
                            AppData.generalData.AnzahlKontakte = that.binding.dataStart.AnzKontakte;
                            return WinJS.Promise.as();
                        }, function(errorResponse) {
                            that.binding.dataStart = {};
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            return WinJS.Promise.as();
                        }, recordId);
                    }
                    return ret;
                }).then(function() {
                    return Start.kontaktanzahlView.select(function(json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "kontaktanzahlView: success!");
                            // kontaktanzahlView returns object already parsed from json file in response
                            if (json && json.d) {
                                that.kontaktanzahldata = json.d.results;
                                that.barChartWidth = 0;
                                that.showBarChart("visitorsPerDayChart", true);
                            }
                            return WinJS.Promise.as();
                        },
                        function(errorResponse) {
                            that.kontaktanzahldata = null;
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            return WinJS.Promise.as();
                        });
                }).then(function () {
                    return Start.licenceView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "licenceView: success!");
                            // kontaktanzahlView returns object already parsed from json file in response
                            if (json && json.d && json.d.results.length > 0) {
                                that.binding.dataLicence = json.d.results[0];
                                that.binding.dataLicence.UserListe = that.binding.dataLicence.UserListe.replace(/,/gi, " ");
                            }
                            return WinJS.Promise.as();
                        },
                        function (errorResponse) {
                            that.userLicence = null;
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            return WinJS.Promise.as();
                        });
                }).then(function () {
                    return Start.licenceUserView.select(function(json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "licenceView: success!");
                           
                            // licenceUserView returns object already parsed from json file in response
                            if (json && json.d && json.d.results.length > 0) {
                                that.nextUrl = Start.licenceUserView.getNextUrl(json);
                                var results = json.d.results;
                                that.dataLicenceUser = new WinJS.Binding.List(results);
                                if (listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = that.dataLicenceUser.dataSource;
                                }
                            } else {
                                that.nextUrl = null;
                                that.dataLicenceUser = null;
                                if (listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = null;
                                }
                            }
                            return WinJS.Promise.as();
                        },
                        function(errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            return WinJS.Promise.as();
                        }, 
                        {
                            LizenzFlag : 1
                        });
                }).then(function () {
                    return Start.reportLand.select(function(json) {
                        Log.print(Log.l.trace, "reportLand: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0 &&
                            that.binding.dataStart.AnzKontakte > 0) {
                            var color = Colors.navigationColor;
                            that.countryKeyData = {};
                            // store result for next use
                            var countryresult = json.d.results;
                            for (var ci = 0; ci < countryresult.length; ci++) {
                                if (countryresult[ci].Land === null) {
                                    countryresult[ci].Land = getResourceText("reporting.nocountry");
                                }
                                if (countryresult[ci].Land) {
                                    var percent = 100 * countryresult[ci].Anzahl / that.binding.dataStart.AnzKontakte;
                                    that.countryPercent[ci] = formatFloat(percent, 1) + "%";
                                    var label = countryresult[ci].Land + " (" + that.countryPercent[ci] + ")";
                                    that.countrydata[ci] = [label, percent, countryresult[ci].LandID];
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
                                        fillKey: "HIGH" + ci
                                    }
                                }
                            }
                            that.worldMapHeight = 0;
                            that.countryChartWidth = 0;
                            that.worldChart(true);
                            that.showDonutChart("countryPie", true);
                        }
                            
                    },
                    function(errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                });
                Log.ret(Log.l.trace);
            };
            this.loadData = loadData;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Settings.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickEditEvent: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    var command = event.currentTarget;
                    if (command) {
                        Log.print(Log.l.trace, "clickButton event command.name=" + command.name);
                        Application.navigateById(command.id, event);
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    Application.navigateById("account", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "Account.Controller.");
                    AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EmpList.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible && that.dataLicenceUser && that.nextUrl) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "calling select Start.licenceUserView...");
                            var nextUrl = that.nextUrl;
                            that.nextUrl = null;
                            Start.licenceUserView.selectNext(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "Start.licenceUserView: success!");
                                // employeeView returns object already parsed from json file in response
                                if (json && json.d) {
                                    that.nextUrl = Start.licenceUserView.getNextUrl(json);
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                        that.binding.count = that.dataLicenceUser.push(item);
                                    });
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                that.loading = false;
                            }, null, nextUrl);
                        } else {
                            that.loading = false;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickLicenceUser: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    AppData.setRecordId("MitarbeiterVIEW_20471", event.currentTarget.value);
                    Application.navigateById("employee", event);
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickBack: function() {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickEditEvent: function () {
                    return that.binding.disableEditEvent;
                }
            };

            if (listView) {
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
            }

            // finally, load the data
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function() {
                Log.print(Log.l.trace, "Data loaded");
                return WinJS.Promise.timeout(Application.pageframe.splashScreenDone ? 0 : 1000);
            }).then(function () {
                Log.print(Log.l.trace, "Splash time over");
                return Application.pageframe.hideSplashScreen();
            }).then(function () {
                WinJS.Promise.timeout(50).then(function() {
                    if (that.binding.generalData.publishFlag) {
                        var confirmTitle = getResourceText("start.confirmTextPublish");
                        confirm(confirmTitle, function (result) {
                            if (result) {
                                Application.navigateById("publish");
                            } else {
                                Log.print(Log.l.trace, "publishflag: user choice CANCEL");
                            }
                        });
                    }
                });
                Log.print(Log.l.trace, "Splash screen vanished");
            });
            Log.ret(Log.l.trace);
        })
    });
})();







