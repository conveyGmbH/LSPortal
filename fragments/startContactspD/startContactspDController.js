﻿// controller for page: StartContactspD
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/startContactspD/startContactspDService.js" />
/// <reference path="~/www/lib/d3/scripts/d3.min.js" />
/// <reference path="~/www/lib/topojson/scripts/topojson.js" />
/// <reference path="~/www/lib/jqPlot/scripts/jquery.jqplot.js" />
/// <reference path="~/www/lib/jqPlot/scripts/plugins/jqplot.barRenderer.js" />
/// <reference path="~/www/lib/jqPlot/scripts/plugins/jqplot.CategoryAxisRenderer.js" />
/// <reference path="~/www/lib/jqPlot/scripts/plugins/jqplot.categoryAxisRenderer.min.js" />


(function () {
    "use strict";

    WinJS.Namespace.define("StartContactspD", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "StartContactspD.Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                
            }, options]);

            var that = this;
            this.kontaktanzahldata = null;

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

            var setRestriction = function (restriction) {
                AppData.setRestriction("Kontakt", restriction);
            }
            this.setRestriction = setRestriction;

            this.barChart = null;
            this.barChartWidth = 0;
            var showBarChart = function (barChartId, bAnimated) {
                Log.call(Log.l.trace, "StartContactspD.Controller.");
                WinJS.Promise.timeout(0).then(function () {
                    if (!that.kontaktanzahldata || !that.kontaktanzahldata.length) {
                        Log.print(Log.l.trace, "extra ignored");
                    } else {
                        var visitorsPerDayChart = fragmentElement.querySelector("#" + barChartId);
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
                                    Colors.tileTextColor
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
                                    var fragmentControl = fragmentElement.winControl;
                                    if (fragmentControl && fragmentControl.updateLayout) {
                                        fragmentControl.prevWidth = 0;
                                        fragmentControl.prevHeight = 0;
                                        fragmentControl.updateLayout.call(fragmentControl, fragmentElement);
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

            var getRecordId = function () {
                return AppData.getRecordId("Mitarbeiter");
            };
            this.getRecordId = getRecordId;

            var resultConverter = function (item, index) {
                item.index = index;
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, "StartContactspD.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return StartContactspD.kontaktanzahlView.select(function (json) {
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
                        function (errorResponse) {
                            that.kontaktanzahldata = null;
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            return WinJS.Promise.as();
                        });
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {

            })
    });
})();