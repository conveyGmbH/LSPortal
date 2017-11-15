// controller for page: start
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/start/startService.js" />
/// <reference path="~/www/lib/datamaps/scripts/datamaps.world.js" />
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
            switch (lang) {
            case 1033:
                var srcDatamaps = "lib/datamaps/scripts/datamaps.world.en.js";
                break;
            case 1036:
                var srcDatamaps = "lib/datamaps/scripts/datamaps.world.en.js";
                break;
            case 1040:
                var srcDatamaps = "lib/datamaps/scripts/datamaps.world.en.js";
                break;
            default:
                var srcDatamaps = "lib/datamaps/scripts/datamaps.world.de.js";
            }
            //var srcDatamaps = "lib/datamaps/scripts/datamaps.world.js";

            Application.Controller.apply(this, [pageElement, {
                dataStart: {},
                disableEditEvent: NavigationBar.isPageDisabled("event"),
                comment: getResourceText("info.comment"),
                // add dynamic scripts to page element, src is either a file or inline text:
                scripts: [{ src: srcDatamaps, type: "text/javascript" }]
            }, commandList]);
            this.kontaktanzahldata = null;
            this.countrydata = null;
            this.applist = null;

            var that = this;

            this.dispose = function () {
                if (that.kontaktanzahldata) {
                    that.kontaktanzahldata = null;
                }
                if (that.applist) {
                    that.applist = null;
                }
            }

            this.countryKeyData = {};
            this.worldChartData = [];
            var worldChart = function (countryKeyData) {
                Log.call(Log.l.trace, "Start.Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    var worldCD = pageElement.querySelector('#worldcontainer');
                    if (worldCD) {
                        try {
                            worldCD.innerHTML = "";
                            var map = new Datamap(
                                {
                                    element: worldCD,
                                    height: 350,
                                    width: 600,
                                    fills: {
                                        HIGH: '#d8613e',
                                        LOW: '#123456',
                                        MEDIUM: 'blue',
                                        UNKNOWN: 'rgb(0,0,0)',
                                        defaultFill: "#d3d3d3"
                                    },
                                    // Array --> 'Countrykey' : { fillKey : 'Rate of importance'}
                                    data: countryKeyData
                                }
                            );
                        } catch (ex) {
                            Log.print(Log.l.error, "exception occurred: " + ex.message);
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
                Application.navigateById("contact", event);
                Log.ret(Log.l.trace);
            }
            this.clickPieSlice = clickPieSlice;

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
                    Application.navigateById("contact", event);
                }
                Log.ret(Log.l.trace);
            }
            this.clickBarSlice = clickBarSlice;

            var setLabelColor = function(element, labelClass, color) {
                var labels = element.querySelectorAll("." + labelClass);
                for (var i = 0; i < labels.length; i++) {
                    var label = labels[i];
                    if (label && label.style) {
                        label.style.color = color;
                    }
                }
            }
            this.setLabelColor = setLabelColor;

            this.countryChart = null;
            //this.countrytitle = that.title("reporting.countrychart");
            this.countryChartArray = [];
            this.countrydata = [];
            this.countryticks = [];
            var countryresult = null, ci = 9, cl = 0;
            var showcountryChart = function (countryChartId, bAnimated) {
                Log.call(Log.l.trace, "Start.Controller.");
                var countryChart = pageElement.querySelector("#" + countryChartId);
                if (countryChart) {
                    var width = countryChart.clientWidth;
                    var diameter = width / 2 - 48;
                    var tileMiddle = pageElement.querySelector(".tile-middle");
                    if (tileMiddle) {
                        var offsetDonutChart = countryChart.offsetTop;
                        var offsetMiddle = tileMiddle.offsetTop;
                        Log.print(Log.l.trace, "offsetDonutChart=" + offsetDonutChart + " offsetMiddle=" + offsetMiddle);
                        if (diameter > offsetMiddle - offsetDonutChart - 98) {
                            diameter = offsetMiddle - offsetDonutChart - 98;
                        }
                        if (diameter < 128) {
                            diameter = 128;
                        } else if (diameter > 256) {
                            diameter = 256;
                        }
                    }
                    Log.print(Log.l.trace, "diameter=" + diameter);
                    WinJS.Promise.timeout(0).then(function () {
                        try {
                            countryChart.innerHTML = "";
                            that.countryChart = $.jqplot(countryChartId, [that.countrydata], {
                                seriesDefaults: {
                                    renderer: $.jqplot.DonutRenderer,
                                    rendererOptions: {
                                        diameter: diameter,
                                        sliceMargin: 1,
                                        startAngle: -145,
                                        showDataLabels: true,
                                        dataLabels: 'percent',
                                        padding: '5',
                                        ringMargin: '5',
                                        dataLabelThreshold: '1',
                                        highlightMouseOver: true,
                                        shadowAlpha: 0
                                    }
                                },
                                legend: { show: true, rendererOptions: { numberRows: 10 }, location: 'w', marginLeft: '30px' }
                            });
                            $("#" + countryChartId).unbind("jqplotDataClick");
                            $("#" + countryChartId).bind("jqplotDataClick",
                                function (ev, seriesIndex, pointIndex, data) {
                                    that.clickCountrySlice(that.countrydata, pointIndex);
                                }
                            );
                            /*that.setLabelColor(showcountryChart, "jqplot-xaxis-tick", "#f0f0f0");
                            that.setLabelColor(showcountryChart, "jqplot-point-label", "#f0f0f0");*/
                        } catch (ex) {
                            Log.print(Log.l.error, "exception occurred: " + ex.message);
                        }
                    });
                }
                Log.ret(Log.l.trace);
            };
            this.showcountryChart = showcountryChart;

            this.pieChart = null;
            var buttonEdited = getResourceText("start.buttonEdited");
            var buttonNotEdited = getResourceText("start.buttonNotEdited");
            var showPieChart = function (pieChartId, bAnimated) {
                Log.call(Log.l.trace, "Start.Controller.");
                var visitorsEditedChart = pageElement.querySelector("#" + pieChartId);
                if (visitorsEditedChart &&
                    that.binding.dataStart &&
                    typeof that.binding.dataStart.AnzNichtEditierteKontakte !== "undefined" &&
                    typeof that.binding.dataStart.AnzEditierteKontakte !== "undefined") {

                    var width = visitorsEditedChart.clientWidth;
                    var diameter = width / 2;
                    /*
                    var tileBottom = pageElement.querySelector(".tile-bottom");
                    if (tileBottom) {
                        var offsetPieChart = visitorsEditedChart.offsetTop;
                        var offsetBottom = tileBottom.offsetTop;
                        Log.print(Log.l.trace, "offsetPieChart=" + offsetPieChart + " offsetMiddle=" + offsetBottom);
                        if (diameter > offsetBottom - offsetPieChart - 48) {
                            diameter = offsetBottom - offsetPieChart - 48;
                        }
                    }
                     * 
                     */
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
                    if (visitorsEditedChart.style) {
                        visitorsEditedChart.style.height = (diameter + 48).toString() + "px";
                        visitorsEditedChart.innerHTML = "";
                        if (bAnimated) {
                            visitorsEditedChart.style.visibility = "hidden";
                        }
                        if (width < 452) {
                            visitorsEditedChart.style.left = (pageElement.clientWidth / 2 - width / 2).toString() + "px";
                        } else {
                            visitorsEditedChart.style.left = "calc(50% - 226px)";
                        }
                    }
                    WinJS.Promise.timeout(0).then(function () {
                        if (!series.length || diameter < 96) {
                            Log.ret(Log.l.trace, "extra ignored");
                            return;
                        } 
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
                                /*
                                legend: {
                                    show: true,
                                    rendererOptions: {
                                        numberColumns: 1
                                    },
                                    location: 'e'
                                }
                                 */
                            });
                            $("#" + pieChartId).unbind("jqplotDataClick");
                            $("#" + pieChartId).bind("jqplotDataClick",
                              function (ev, seriesIndex, pointIndex, data) {
                                  that.clickPieSlice(ev, pointIndex);
                              }
                            );
                            that.setLabelColor(visitorsEditedChart, "jqplot-data-label", Colors.textColor);
                            if (bAnimated) {
                                WinJS.Promise.timeout(50).then(function() {
                                    if (visitorsEditedChart.style) {
                                        visitorsEditedChart.style.visibility = "";
                                    }
                                    WinJS.UI.Animation.fadeIn(visitorsEditedChart);
                                });
                            }
                        } catch (ex) {
                            Log.print(Log.l.error, "exception occurred: " + ex.message);
                        }
                    });
                }
                Log.ret(Log.l.trace);
            }
            this.showPieChart = showPieChart;

            this.barChart = null;
            var showBarChart = function(barChartId, bAnimated) {
                Log.call(Log.l.trace, "Start.Controller.");
                var visitorsPerDayChart = pageElement.querySelector("#" + barChartId);
                if (visitorsPerDayChart) {
                    var width = visitorsPerDayChart.clientWidth;
                    var series = [];
                    var ticks = [];
                    if (that.kontaktanzahldata && that.kontaktanzahldata.length > 0) {
                        var offset = 0;
                        if (that.kontaktanzahldata.length > 10) {
                            offset = that.kontaktanzahldata.length - 10;
                        }
                        for (var i = offset; i < that.kontaktanzahldata.length; i++) {
                            var row = that.kontaktanzahldata[i];
                            series[i - offset] = [AppData.toDateString(row.Datum, true), row.AnzahlProTag];
                            ticks[i - offset] = i;
                        }    
                    }
                    var seriesColors = [
                        Colors.backgroundColor
                    ];
                    visitorsPerDayChart.innerHTML = "";
                    WinJS.Promise.timeout(0).then(function () {
                        if (!series.length) {
                            Log.ret(Log.l.trace, "extra ignored");
                            return;
                        } 
                        try {
                            visitorsPerDayChart.innerHTML = "";
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
                                    rendererOptions: {
                                        animation: {
                                            speed: 500
                                        }
                                    },
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
                                function(ev, seriesIndex, pointIndex, data) {
                                    that.clickBarSlice(ev, pointIndex);
                                }
                            );
                            that.setLabelColor(visitorsPerDayChart, "jqplot-xaxis-tick", "#f0f0f0");
                            that.setLabelColor(visitorsPerDayChart, "jqplot-point-label", "#f0f0f0");
                        } catch (ex) {
                            Log.print(Log.l.error, "exception occurred: " + ex.message);
                        }
                    });
                }
                Log.ret(Log.l.trace);
            }
            this.showBarChart = showBarChart;

            // define data handling standard methods
            var getRecordId = function () {
                return AppData.getRecordId("Mitarbeiter");
            };
            this.getRecordId = getRecordId;

            var loadData = function() {
                Log.call(Log.l.trace, "Start.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
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
                                that.showPieChart("visitorsEditedChart", true);
                            }
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
                            that.showBarChart("visitorsPerDayChart", true);
                        }
                        return WinJS.Promise.as();
                    }, function(errorResponse) {
                        that.kontaktanzahldata = null;
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        return WinJS.Promise.as();
                    })
                }).then(function () {
                    return Start.reportLand.select(function(json) {
                        Log.print(Log.l.trace, "reportLand: success!");
                            that.countryKeyData = {};
                            if (json && json.d && json.d.results && json.d.results.length > 0) {
                                // store result for next use
                                countryresult = json.d.results;
                                for (ci; ci >= 0; ci--) {
                                    if (countryresult[ci].Land === null) {
                                        countryresult[ci].Land = getResourceText("reporting.nocountry");
                                    }
                                    if (countryresult[ci].Land) {
                                        that.countrydata[ci] = [countryresult[ci].Land, countryresult[ci].Anzahl];
                                    }
                                    var isoCode = countryresult[ci].Alpha3_ISOCode;
                                    if (!isoCode) {
                                       
                                    } else {
                                        that.countryKeyData[isoCode] = {
                                            fillKey: "HIGH"
                                        }
                                    }
                                }
                                that.showcountryChart("countryPie", true);
                                that.worldChart(that.countryKeyData);
                            }
                            
                        },
                        function(errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                });
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
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Start.Controller.");
                    Application.navigateById("publish", event);
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

            // finally, load the data
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function() {
                Log.print(Log.l.trace, "Splash time over");
                return that.worldChart();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                return WinJS.Promise.timeout(Application.pageframe.splashScreenDone ? 0 : 1000);
            }).then(function () {
                Log.print(Log.l.trace, "Splash time over");
                return Application.pageframe.hideSplashScreen();
            }).then(function() {
                Log.print(Log.l.trace, "Splash screen vanished");
            });
            Log.ret(Log.l.trace);
        })
    });
})();







