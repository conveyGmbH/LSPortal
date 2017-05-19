// controller for page: start
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/start/startService.js" />

/*
 Structure of states to be set from external modules:
 {
    networkState: newNetworkstate:
 }
*/

(function () {
    "use strict";

    WinJS.Namespace.define("Start", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement) {
            Log.call(Log.l.trace, "Start.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataStart: {},
                disableEditEvent: true,
                comment: getResourceText("info.comment")
            }]);
            this.kontaktanzahldata = null;
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

            this.pieChart = null;
            var buttonEdited = getResourceText("start.buttonEdited");
            var buttonNotEdited = getResourceText("start.buttonNotEdited");
            var showPieChart = function (pieChartId, bAnimated) {
                Log.call(Log.l.trace, "Start.Controller.");
                var visitorsEditedChart = that.element.querySelector("#" + pieChartId);
                if (visitorsEditedChart &&
                    that.binding.dataStart &&
                    typeof that.binding.dataStart.AnzNichtEditierteKontakte !== "undefined" &&
                    typeof that.binding.dataStart.AnzEditierteKontakte !== "undefined") {
                    var width = visitorsEditedChart.clientWidth;
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
                    var diameter = width / 2;
                    Log.print(Log.l.trace, "diameter=" + diameter);
                    if (visitorsEditedChart.style) {
                        visitorsEditedChart.style.height = (diameter + 48).toString() + "px";
                        visitorsEditedChart.innerHTML = "";
                        if (bAnimated) {
                            visitorsEditedChart.style.visibility = "hidden";
                        }
                    }
                    WinJS.Promise.timeout(0).then(function () {
                        if (!series.length) {
                            Log.ret(Log.l.trace, "extra ignored");
                            return;
                        } 
                        try {
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
                                if (visitorsEditedChart.style) {
                                    visitorsEditedChart.style.visibility = "";
                                }
                                WinJS.UI.Animation.turnstileForwardIn(visitorsEditedChart).done();
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
                var visitorsPerDayChart = that.element.querySelector("#" + barChartId);
                if (visitorsPerDayChart) {
                    var width = visitorsPerDayChart.clientWidth;
                    var series = [];
                    var ticks = [];
                    if (that.kontaktanzahldata && that.kontaktanzahldata.length > 0) {
                        for (var i = 0; i < that.kontaktanzahldata.length; i++) {
                            var row = that.kontaktanzahldata[i];
                            series[i] = [AppData.toDateString(row.Datum, true),row.AnzahlProTag];
                            ticks[i] = i;//;
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

            var showGroupsMenu = function () {
                var i, updateMenu = false;
                Log.call(Log.l.trace, "Start.Controller.");
                if (that.applist && that.applist.length > 0) {
                    for (i = 1; i < Application.navigationBarGroups.length; i++) {
                        if (that.applist.indexOf(Application.navigationBarGroups[i].id) >= 0) {
                            if (Application.navigationBarGroups[i].disabled) {
                                Log.print(Log.l.trace, "enable id=" + Application.navigationBarGroups[i].id);
                                Application.navigationBarGroups[i].disabled = false;
                                updateMenu = true;
                            };
                        } else {
                            if (!Application.navigationBarGroups[i].disabled) {
                                Log.print(Log.l.trace, "disable id=" + Application.navigationBarGroups[i].id);
                                Application.navigationBarGroups[i].disabled = true;
                                updateMenu = true;
                            };
                        }
                    }
                } else {
                    for (i = 1; i < Application.navigationBarGroups.length; i++) {
                        if (!Application.navigationBarGroups[i].disabled) {
                            Log.print(Log.l.trace, "disable id=" + Application.navigationBarGroups[i].id);
                            Application.navigationBarGroups[i].disabled = true;
                            updateMenu = true;
                        }
                    }
                }
                if (updateMenu) {
                    NavigationBar.groups = Application.navigationBarGroups;
                }
                for (i = 1; i < Application.navigationBarGroups.length; i++) {
                    if (Application.navigationBarGroups[i].disabled) {
                        NavigationBar.disablePage(Application.navigationBarGroups[i].id);
                    } else {
                        NavigationBar.enablePage(Application.navigationBarGroups[i].id);
                    }
                    if (NavigationBar.pages && NavigationBar.pages.length > 0) {
                        for (var j = 0; j < NavigationBar.pages.length; j++) {
                            if (NavigationBar.pages[j]) {
                                if (NavigationBar.pages[j].group === Application.navigationBarGroups[i].group) {
                                    NavigationBar.pages[j].disabled = Application.navigationBarGroups[i].disabled;
                                }
                                if (NavigationBar.pages[j].id === "event") {
                                    that.binding.disableEditEvent = NavigationBar.pages[j].disabled;
                                }
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.showGroupsMenu = showGroupsMenu;


            // define data handling standard methods
            var getRecordId = function () {
                return AppData.getRecordId("Mitarbeiter");
            };
            this.getRecordId = getRecordId;


            var loadData = function() {
                Log.call(Log.l.trace, "Start.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function() {
                    return Start.appListSpecView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "appListSpecView: success!");
                        // kontaktanzahlView returns object already parsed from json file in response
                        if (json && json.d && json.d.results) {
                            that.applist = [];
                            for (var i = 0; i < json.d.results.length; i++) {
                                var row = json.d.results[i];
                                if (row && row.Title) {
                                    if (that.applist.indexOf(row.Title) >= 0) {
                                        Log.print(Log.l.trace, "extra ignored " + row.Title);
                                    } else {
                                        Log.print(Log.l.trace, "add applist[" + i + "]=" + row.Title);
                                        that.applist.push(row.Title);
                                    }
                                }
                            }
                        }
                        that.showGroupsMenu();
                        return WinJS.Promise.as();
                    }, function (errorResponse) {
                        that.applist = null;
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        return WinJS.Promise.as();
                    });
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
                }).then(function () {
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
                    }, function (errorResponse) {
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
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                return WinJS.Promise.timeout(Application.pageframe.splashScreenDone ? 0 : 1000);
            }).then(function() {
                Log.print(Log.l.trace, "Splash time over");
                return Application.pageframe.hideSplashScreen();
            }).then(function() {
                Log.print(Log.l.trace, "Splash screen vanished");
            });
            Log.ret(Log.l.trace);
        })
    });
})();







