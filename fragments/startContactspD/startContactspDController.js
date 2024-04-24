// controller for page: StartContactspD
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

    var namespaceName = "StartContactspD";

    WinJS.Namespace.define("StartContactspD", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
            }]);

            var that = this;
            this.kontaktanzahldata = null;

            var clickBarSlice = function (event, index) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "index=" + index);
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
                        VeranstaltungID: AppBar.scope.getEventId(),
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
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                WinJS.Promise.timeout(0).then(function () {
                    if (!that.kontaktanzahldata || !that.kontaktanzahldata.length) {
                        Log.print(Log.l.trace, "extra ignored");
                    } else {
                        that.setMarginChart(that.kontaktanzahldata.length);
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
                                    Colors.dashboardColor
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
                                                renderer: $.jqplot.CategoryAxisRenderer,
                                                tickOptions: {
                                                    textColor: Colors.textColor
                                                }
                                            },
                                            yaxis: {
                                                renderer: $.jqplot.AxisThickRenderer,
                                                show: false,
                                                showTicks: false,
                                                showTickMarks: false
                                            }
                                        },
                                        highlighter: {
                                            tooltipContentEditor: function (series, seriesIndex, pointIndex, plot) {
                                                //return that.tooltipformater(plot.data[seriesIndex][pointIndex]);
                                                var antwort = plot.data[seriesIndex][pointIndex][0];
                                                var anzahl = plot.data[seriesIndex][pointIndex][1];

                                                var html = "<div class = 'tooltip'>Datum : ";
                                                html += antwort;
                                                html += "  <br>Anzahl : ";
                                                html += anzahl;
                                                html += "  </div>";

                                                return html;
                                            },

                                            // other options just for completeness
                                            show: true,
                                            showTooltip: true,
                                            tooltipFade: true,
                                            sizeAdjust: 10,
                                            formatString: '%s',
                                            tooltipLocation: 'n',
                                            useAxesFormatters: false,
                                            tooltipOffset: 14
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

            var setMarginChart = function (chartlength) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var dchart = fragmentElement.querySelector("#visitorsPerDayChart");
                if (dchart) {
                    switch (chartlength) {
                        case 1:
                            //dchart.style.width = "200px";
                            dchart.style.marginLeft = "30%";
                            break;
                        /*case 2:
                            dchart.style.width = "400px";
                                dchart.style.marginLeft = "5%";
                                break;*/
                        default:
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.setMarginChart = setMarginChart;

            var resultConverter = function (item, index) {
                item.index = index;
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var eventId = AppBar.scope.getEventId();
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return StartContactspD.kontaktanzahlView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "kontaktanzahlView: success!");
                        // kontaktanzahlView returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            that.kontaktanzahldata = json.d.results;
                            var chartlength = that.kontaktanzahldata.length;
                            //that.setMarginChart(chartlength);
                            that.barChartWidth = 0;
                            that.showBarChart("visitorsPerDayChart", true);
                        } else {
                            if (that.barChart) {
                                that.kontaktanzahldata = {};
                                that.barChart.destroy();
                            }
                        }
                        return WinJS.Promise.as();
                    }, function (errorResponse) {
                        that.kontaktanzahldata = null;
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        return WinJS.Promise.as();
                        }, { VeranstaltungID: eventId});
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
