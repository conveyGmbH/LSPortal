// controller for page: startTop10Users
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/startTop10Users/startTop10UsersService.js" />
/// <reference path="~/www/lib/d3/scripts/d3.min.js" />
/// <reference path="~/www/lib/topojson/scripts/topojson.js" />
/// <reference path="~/www/lib/jqPlot/scripts/jquery.jqplot.js" />
/// <reference path="~/www/lib/jqPlot/scripts/plugins/jqplot.barRenderer.js" />
/// <reference path="~/www/lib/jqPlot/scripts/plugins/jqplot.CategoryAxisRenderer.js" />
/// <reference path="~/www/lib/jqPlot/scripts/plugins/jqplot.categoryAxisRenderer.min.js" />

(function () {
    "use strict";

    var namespaceName = "StartTop10Users";

    WinJS.Namespace.define("StartTop10Users", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
            }]);

            var that = this;
            this.employeeticks = [];
            this.emplyeevalues = [];

            this.employee = "";
            this.res = [];
            this.resi = 0;
            this.employeeID = 0;
            var clickEmployeeSlice = function (event, index) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "index=" + index);
                if (event && index >= 0) {
                    that.employee = event[index];
                    if (that.employee) {
                                that.setRestriction({
                                    VeranstaltungID: AppBar.scope.getEventId(),
                                    MitarbeiterID: that.employee
                                });
                                WinJS.Promise.timeout(0).then(function () {
                                    Application.navigateById("contact", event);
                                });
                            }
                }
                Log.ret(Log.l.trace);
            }
            this.clickEmployeeSlice = clickEmployeeSlice;

            var tooltipformater = function (tooltiptext) {
                Log.call(Log.l.trace, "StartTop10Users.Controller.");
                return tooltiptext[0] + " , " + tooltiptext[1];
            }
            this.tooltipformater = tooltipformater;

            this.employeeChart = null;
            this.barChartWidth = 0;
            //this.employeetitle = that.title("Start.employeechart");
            this.employeeChartArray = [];
            this.employeedata = [];
            this.employeedataID = [];
            this.employeeticks = [];
            var employeeResult = null, ei = 0, el = 0;
            var showemployeeChart = function (barChartId, bAnimated) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (employeeResult && typeof employeeResult !== "undefined") {
                var employeeWithMostContacts = Math.max.apply(Math, employeeResult.map(function (employee) { return employee.Anzahl; }));
                }
                WinJS.Promise.timeout(0).then(function () {
                    if (!that.employeedata || !that.employeedata.length) {
                        Log.print(Log.l.trace, "extra ignored");
                    } else {
                        var reportingBarChart = fragmentElement.querySelector("#" + barChartId);
                        if (reportingBarChart) {
                            var width = reportingBarChart.clientWidth;
                            if (that.barChartWidth !== width) {
                                that.barChartWidth = width;
                                if (reportingBarChart.style) {
                                    reportingBarChart.style.height = (that.employeedata.length * 60 + 48).toString() + "px";
                                }
                                try {
                                    reportingBarChart.innerHTML = "";
                                    var rendererOptions = {
                                        barDirection: "horizontal"
                                        
                                    };
                                    if (bAnimated) {
                                        rendererOptions.animation = {
                                            speed: 500
                                        };
                                    }
                                    var seriesColors = [
                                        Colors.dashboardColor
                                    ];
                                    that.employeeChart = $.jqplot(barChartId, [that.emplyeevalues], {
                                        title: that.employeetitle,
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
                                            },
                                            type: 'column'
                                        },
                                        axes: {
                                            yaxis: {
                                                renderer: $.jqplot.CategoryAxisRenderer,
                                                ticks: that.employeeticks,
                                                tickOptions: {
                                                    showGridline: false,
                                                    markSize: 0,
                                                    formatString: '%d',
                                                    textColor: Colors.textColor
                                                }
                                            },
                                            xaxis: {
                                                renderer: $.jqplot.AxisThickRenderer,
                                                min: 0,
                                                tickInterval: employeeWithMostContacts > 2000 ? 500 : (employeeWithMostContacts > 100 ? 100 : (employeeWithMostContacts > 50 ? 50 : (employeeWithMostContacts > 20 ? 5 : 1))),
                                                tickOptions: {
                                                    formatString: '%d',
                                                    textColor: Colors.textColor
                                                }
                                            }
                                        },
                                        tickOptions: {
                                            fontSize: '10pt'
                                        },
                                        highlighter: {
                                            tooltipContentEditor: function (series, seriesIndex, pointIndex, plot) {
                                                //return that.tooltipformater(plot.data[seriesIndex][pointIndex]);
                                                var mitarbeiter = that.employeedata[pointIndex];
                                                var anzahl = that.emplyeevalues[pointIndex];

                                                var html = "<div class = 'tooltip'>Mitarbeiter : ";
                                                html += mitarbeiter;
                                                html += "  <br>Kontakte : ";
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
                                            tooltipOffset : 14
                                        },
                                        seriesColors: seriesColors,
                                        legend: {
                                            show: false
                                        }
                                    });
                                    $("#" + barChartId).unbind("jqplotDataClick");
                                    $("#" + barChartId).bind("jqplotDataClick",
                                        function (ev, seriesIndex, pointIndex, data) {
                                            that.clickEmployeeSlice(that.employeedataID, pointIndex);
                                        }
                                    );
                                } catch (ex) {
                                    Log.print(Log.l.error, "exception occurred: " + ex.message);
                                }
                            }
                        }
                    }
                });
                Log.ret(Log.l.trace);
            };
            this.showemployeeChart = showemployeeChart;

            var setMarginChart = function(chartlength) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var t10chart = fragmentElement.querySelector("#employeeChart");
                switch (chartlength) {
                    case 1:
                        t10chart.style.marginTop = "170px";
                        break;
                    case 2:
                        t10chart.style.marginTop = "140px";
                        break;
                    case 3:
                        t10chart.style.marginTop = "70px";
                        break;
                    default:
                }
                Log.ret(Log.l.trace);
            }
            this.setMarginChart = setMarginChart;

            var setRestriction = function (restriction) {
                AppData.setRestriction("Kontakt", restriction);
            }
            this.setRestriction = setRestriction;

            var resultConverter = function (item, index) {
                item.index = index;
                if (item.EmployeeName) {
                    var EmployeeName = item.EmployeeName;
                    var count = EmployeeName.length;
                    if (count > 8) {
                        that.employeedata.push(item.EmployeeName);
                        var ename = item.EmployeeName.slice(0, 6);
                        that.employeeticks.push(ename + "..");
                        that.emplyeevalues.push(item.Anzahl);
                        that.employeedataID.push(item.EmployeeID);
                    } else {
                        that.employeedata.push(item.EmployeeName);
                        that.employeeticks.push(item.EmployeeName);
                        that.emplyeevalues.push(item.Anzahl);
                        that.employeedataID.push(item.EmployeeID);
                    }
                }
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var eventId = AppBar.scope.getEventId();
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    that.employeedata = [];
                    that.employeedataID = [];
                    that.emplyeevalues = [];
                    that.employeeticks = [];
                    return StartTop10Users.reportMitarbeiter.select(function (json) {
                        Log.print(Log.l.trace, "reportMitarbeiter: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            // store result for next use
                            var results = json.d.results;
                            employeeResult = json.d.results;
                            var resultlength = employeeResult.length;
                            //that.setMarginChart(resultlength);
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            el = json.d.results.length;
                            for (ei; ei < el; ei++) {
                                // y-axis is ascending to top
                                var ed = el - ei - 1;
                                //that.employeedata[ed] = [employeeResult[ei].EmployeeName]; //, employeeResult[ei].EmployeeName
                                //that.employeedataID[ed] = [employeeResult[ei].EmployeeID];
                            }
                            that.barChartWidth = 0;
                            that.showemployeeChart("employeeChart", true);
                        } else {
                            if (that.employeeChart) {
                                that.employeeChart.destroy();
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        }, { VeranstaltungID: eventId});
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
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
            employees: null,
            employeechart: null
        })
    });
})();
