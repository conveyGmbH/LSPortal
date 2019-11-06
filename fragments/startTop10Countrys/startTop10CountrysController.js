// controller for page: startTop10Countrys
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/startTop10Countrys/startTop10CountrysService.js" />
/// <reference path="~/www/lib/d3/scripts/d3.min.js" />
/// <reference path="~/www/lib/topojson/scripts/topojson.js" />
/// <reference path="~/www/lib/jqPlot/scripts/jquery.jqplot.js" />
/// <reference path="~/www/lib/jqPlot/scripts/plugins/jqplot.donutRenderer.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("StartTop10Countrys", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "StartTop10Countrys.Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                
            }, options]);

            var that = this;
            this.countrydata = null;

            this.isClicked = false;
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
                        var countryChart = fragmentElement.querySelector("#" + countryChartId);
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
                                                var fragmentControl = fragmentElement.winControl;
                                                if (fragmentControl && fragmentControl.updateLayout) {
                                                    fragmentControl.prevWidth = 0;
                                                    fragmentControl.prevHeight = 0;
                                                    fragmentControl.updateLayout.call(fragmentControl, fragmentElement);
                                                }
                                            });
                                        });
                                    } else {
                                        var fragmentControl = fragmentElement.winControl;
                                        if (fragmentControl && fragmentControl.updateLayout) {
                                            fragmentControl.prevWidth = 0;
                                            fragmentControl.prevHeight = 0;
                                            fragmentControl.updateLayout.call(fragmentControl, fragmentElement);
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

            var setRestriction = function (restriction) {
                AppData.setRestriction("Kontakt", restriction);
            }
            this.setRestriction = setRestriction;

            var getRecordId = function () {
                return AppData.getRecordId("Mitarbeiter");
            };
            this.getRecordId = getRecordId;

            var resultConverter = function (item, index) {
                item.index = index;
            }
            this.resultConverter = resultConverter;

            var loadData = function (recordId) {
                Log.call(Log.l.trace, "StartTop10Countrys.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return StartTop10Countrys._startTop10CountrysmitarbeiterView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "mitarbeiterView: success!");
                            // mitarbeiterView returns object already parsed from json file in response
                            if (json && json.d && json.d.results && json.d.results.length > 0) {
                                var results = json.d.results[0];
                                that.dataCountryTop10Data = results;
                                }
                            }, function (errorResponse) {
                                that.dataCountryTop10Data = {};
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                return WinJS.Promise.as();
                        }, recordId);
                }).then(function () {
                    return StartTop10Countrys.reportLand.select(function (json) {
                        Log.print(Log.l.trace, "reportLand: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            var color = Colors.navigationColor;
                            that.countryKeyData = {};
                            // store result for next use
                            var countryresult = json.d.results;
                            for (var ci = 0; ci < countryresult.length; ci++) {
                                if (countryresult[ci].Land === null) {
                                    countryresult[ci].Land = getResourceText("reporting.nocountry");
                                }
                                if (countryresult[ci].Land) {
                                    var percent = 100 * countryresult[ci].Anzahl / that.dataCountryTop10Data.AnzKontakte;
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
                            }
                            that.countryChartWidth = 0;
                            that.showDonutChart("countryPie", true);
                        }

                    },
                        function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            WinJS.Promise.timeout(5000).then(function () {
                                Application.navigateById("login");
                            });
                        });
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            // define handlers
            this.eventHandlers = {
                
            };

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData(getRecordId());
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
            dataCountryTop10Data: {}
            })
    });
})();