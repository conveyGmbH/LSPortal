// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/reporting/reportingService.js" />
/// <reference path="~/www/pages/reporting/exportXlsx.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("Reporting", {
        controller: null
    });
    WinJS.Namespace.define("Reporting", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement) {
            Log.call(Log.l.trace, "Reporting.Controller.");
            Application.Controller.apply(this, [
                pageElement, {
                    restriction: getEmptyDefaultValue(Reporting.defaultrestriction),
                    curOLELetterID: null,
                    exportTemplateRestriction: {
                        DOC3OLELetterVIEWID: 0
                    },
                    progress: {
                        percent: 0,
                        text: "",
                        show: null
                    },
                    //showErfassungsdatum: false,
                    showModifiedTS: false
                }
            ]);
            
            var that = this;

            // look for ComboBox element
            var exportList = pageElement.querySelector("#ExportList");
            var initLand = pageElement.querySelector("#InitLandReporting");
            var erfasserID = pageElement.querySelector("#ErfasserIDReporting");
            var erfassungsdatum = pageElement.querySelector("#ReportingErfassungsdatum.win-datepicker");
            var modifiedTs = pageElement.querySelector("#ModifiedTs.win-datepicker");

            var resultConverter = function(item, index) {
                item.index = index;
                item.fullName = (item.Vorname ? (item.Vorname + " ") : "") + (item.Nachname ? item.Nachname : "");
                if (that.employees) {
                    that.employees.push(item);
                }
            }
            this.resultConverter = resultConverter;

            var title = function(t) {
                var t = getResourceText(t);
                return t;
            }
            this.title = title;

            var setInitialDate = function () {
                if (typeof that.binding.restriction.ReportingErfassungsdatum === "undefined") {
                    that.binding.restriction.ReportingErfassungsdatum = new Date();
                }
                Log.call(Log.l.trace, "Initialdate set");
            }
            this.setInitialDate = setInitialDate;

            var showDateRestrictions = function() {
                if (typeof that.binding.showErfassungsdatum === "undefined") {
                    that.binding.showErfassungsdatum = false;
                }
                if (typeof that.binding.showModifiedTS === "undefined") {
                    that.binding.showModifiedTS = false;
                }
                if (erfassungsdatum && erfassungsdatum.winControl) {
                    erfassungsdatum.winControl.disabled = !that.binding.showErfassungsdatum;
                }
                if (modifiedTs && modifiedTs.winControl) {
                    modifiedTs.winControl.disabled = !that.binding.showModifiedTS;
                }
            }
            this.showDateRestrictions = showDateRestrictions;

            var saveRestriction = function (complete, error) {
                var ret = WinJS.Promise.as().then(function() {
                    if (!that.binding.showErfassungsdatum &&
                        typeof that.binding.showErfassungsdatum !== "undefined") {
                        delete that.binding.showErfassungsdatum;
                    }
                    //@nedra:10.11.2015: Erfassungsdatum is undefined if it is not updated -> Erfassungsdatum = current date
                    if (that.binding.showErfassungsdatum &&
                        typeof that.binding.restriction.ReportingErfassungsdatum === "undefined") {
                        that.binding.restriction.ReportingErfassungsdatum = new Date();
                    }
                    if (!that.binding.restriction.usemodifiedTS &&
                        typeof that.binding.restriction.ModifiedTS !== "undefined") {
                        delete that.binding.restriction.ModifiedTS;
                    }
                    //@nedra:10.11.2015: modifiedTS is undefined if it is not updated -> modifiedTS = current date
                    if (that.binding.restriction.usemodifiedTS &&
                        typeof that.binding.restriction.ModifiedTS === "undefined") {
                        that.binding.restriction.ModifiedTS = new Date();
                    }
                    AppData.setRestriction("Kontakt", that.binding.restriction);
                    complete({});
                    return WinJS.Promise.as();
                });
                return ret;
            }
            this.saveRestriction = saveRestriction;

            var getRestriction = function(complete, error) {
                var myrestriction = {};
                if (that.binding.showErfassungsdatum &&
                    typeof that.binding.restriction.ReportingErfassungsdatum !== "undefined") {
                    if (AppData.getLanguageId() === 1031) {
                        myrestriction.Erfassungsdatum = that.binding.restriction.ReportingErfassungsdatum;
                    } else {
                        myrestriction.RecordDate = that.binding.restriction.ReportingErfassungsdatum;
                    }
                    AppData.entrydate = that.binding.restriction.ReportingErfassungsdatum;
                } else {
                    delete AppData.entrydate;
                }

                /*if (!that.binding.showModifiedTS &&
                    typeof that.binding.restriction.ModifiedTs !== "undefined") {
                    delete that.binding.restriction.ModifiedTs;
                }
                if (!that.binding.restriction.InitLandID &&
                    typeof that.binding.restriction.InitLandID !== "undefined") {
                    delete that.binding.restriction.InitLandID;
                }
                if ((!that.binding.restriction.ErfasserID || that.binding.restriction.ErfasserID === "0") &&
                    typeof that.binding.restriction.ErfasserID !== "undefined") {
                    delete that.binding.restriction.ErfasserID;
                }*/
                return myrestriction;
            }
            this.getRestriction = getRestriction;

            var setRestriction = function (restriction) {
                AppData.setRestriction("Kontakt", restriction);
            }
            this.setRestriction = setRestriction;

            var templatecall = function() {
                Log.call(Log.l.trace, "Reporting.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function() {
                    return Reporting.exportTemplate.select(function(json) {
                        Log.print(Log.l.trace, "exportTemplate: success!");
                        if (json && json.d && json.d.results) {
                            // store result for next use
                            var i = that.binding.curOLELetterID - 1;
                            that.template = json.d.results[i].DocContentDOCCNT1;
                            if (i === 0) {
                                that.templatestr = that.template.substring(131);
                                that.exportData();
                            } else {
                                that.templatestr = that.template.substring(131);
                                that.exportData();
                            }
                        }
                    }, function(errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                }).then(function() {
                    AppBar.notifyModified = true;
                    AppBar.triggerDisableHandlers();
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.templatecall = templatecall;

            var exportData = function() {
                Log.call(Log.l.trace, "Reporting.Controller.");
                var dbView = null;
                var fileName = null;
                ExportXlsx.restriction = that.getRestriction();
                switch (parseInt(that.binding.curOLELetterID)) {
                case 1:
                    if (AppData.getLanguageId() === 1031) {
                        dbView = Reporting.xLAuswertungView;
                        fileName = "Kontakte";
                    } else {
                        dbView = Reporting.xLReportView;
                        fileName = "Contacts";
                    }
                    break;
                case 8:
                    if (AppData.getLanguageId() === 1031) {
                        dbView = Reporting.landHistoDe;
                        fileName = "Landstatistik";
                    } else {
                        dbView = Reporting.landHistoEn;
                        fileName = "Countrystatistics";
                    }
                    break;
                case 10:
                    if (AppData.getLanguageId() === 1031) {
                        dbView = Reporting.xLAuswertungViewNoQuest;
                        fileName = "KontakteKeineFragen";
                        ExportXlsx.restriction.KontaktID = [-2,-1];
                        if (!that.binding.showErfassungsdatum) {
                            ExportXlsx.restriction.ReportingErfassungsdatum = "NOT NULL";
						        }
                    } else {
                        dbView = Reporting.xLReportViewNoQuest;
                        fileName = "ContactsNoQuestion";
                        ExportXlsx.restriction.ContactID = [-2,-1];
                        if (!that.binding.showErfassungsdatum) {
							              ExportXlsx.restriction.RecordDate = "NOT NULL";
						            }
                    }
                    ExportXlsx.restriction.bUseOr = true;
                    break;

                case 13:
                    if (AppData.getLanguageId() === 1031) {
                        dbView = Reporting.mitarbeiterHistoDe;
                        fileName = "Mitarbeiterstatistik";
                    } else {
                        dbView = Reporting.mitarbeiterHistoEn;
                        fileName = "Employeestatistics";
                    }
                    break;
                default:
                    Log.print(Log.l.error, "curOLELetterID=" + that.binding.curOLELetterID + "not supported");
                }
                if (dbView) {
                    var temp = that.templatestr;
                    var exporter = ExportXlsx.exporter;
                    if (!exporter) {
                        exporter = new ExportXlsx.ExporterClass(that.binding.progress);
                    }
                    exporter.showProgress(0);
                    WinJS.Promise.timeout(50).then(function() {
                        exporter.saveXlsxFromView(dbView, fileName, function(result) {
                                AppBar.busy = false;
                                AppBar.triggerDisableHandlers();
                            }, function(errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                                AppBar.busy = false;
                                AppBar.triggerDisableHandlers();
                            },
                            ExportXlsx.restriction);
                    });
                } else {
                    AppBar.busy = false;
                    AppBar.triggerDisableHandlers();
                }
                Log.ret(Log.l.trace);
            }
            that.exportData = exportData;

            /*
            this.countryChart = null;
            this.countrytitle = that.title("reporting.countrychart");
            this.countryChartArray = [];
            this.countrydata = [];
            this.countryticks = [];
            var countryresult = null, ci = 0, cl = 0;
            var showcountryChart = function(countryChartId, bAnimated) {
                Log.call(Log.l.trace, "Reporting.Controller.");
                var ret = new WinJS.Promise.as().then(function() {
                    return Reporting.reportLand.select(function(json) {
                        Log.print(Log.l.trace, "reportLand: success!");
                        if (json && json.d && json.d.results) {
                            // store result for next use
                            countryresult = json.d.results;
                            cl = json.d.results.length;
                            for (ci; ci < cl; ci++) {
                                if (countryresult[ci].Land === null) {
                                    countryresult[ci].Land = " ";
                                }
                                that.countrydata[ci] = [countryresult[ci].Land, countryresult[ci].Anzahl];
                            }
                        }
                    }, function(errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                }).then(function () {
                    try {
                        that.showcountryChart = $.jqplot(countryChartId, [that.countrydata], {
                            title: that.countrytitle,
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
                                    renderer: $.jqplot.AxisThickRenderer
                                }
                            },
                            legend: {
                                show: false
                            }
                        });
                        $("#" + countryChartId).unbind("jqplotDataClick");
                        $("#" + countryChartId).bind("jqplotDataClick",
                            function(ev, seriesIndex, pointIndex, data) {
                                that.clickCountrySlice(that.countrydata, pointIndex);
                            }
                        );
                        that.setLabelColor(showcountryChart, "jqplot-xaxis-tick", "#f0f0f0");
                        that.setLabelColor(showcountryChart, "jqplot-point-label", "#f0f0f0");
                    } catch (ex) {
                        Log.print(Log.l.error, "exception occurred: " + ex.message);
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.showcountryChart = showcountryChart;

            this.employeeChart = null;
            this.employeetitle = that.title("reporting.employeechart");
            this.employeeChartArray = [];
            this.employeedata = [];
            this.employeedataID = [];
            this.employeeticks = [];
            var employeeResult = null, ei = 0, el = 0;
            var showemployeeChart = function(employeeChartId, bAnimated) {
                Log.call(Log.l.trace, "Reporting.Controller.");
                var ret = new WinJS.Promise.as().then(function() {
                    return Reporting.reportMitarbeiter.select(function(json) {
                        Log.print(Log.l.trace, "reportMitarbeiter: success!");
                        if (json && json.d && json.d.results) {
                            // store result for next use
                            employeeResult = json.d.results;
                            el = json.d.results.length;
                            for (ei; ei < el; ei++) {
                                that.employeedata[ei] = [employeeResult[ei].EmployeeName, employeeResult[ei].Anzahl];
                                that.employeedataID[ei] = [employeeResult[ei].EmployeeID];
                            }
                        }
                    }, function(errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                }).then(function() {
                    try {
                        that.showemployeeChart = $.jqplot(employeeChartId, [that.employeedata], {
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
                                    renderer: $.jqplot.AxisThickRenderer

                                }
                            },
                            tickOptions: {
                                angle: -30,
                                fontSize: '10pt'
                            },
                            legend: {
                                show: false
                            }
                        });
                        $("#" + employeeChartId).unbind("jqplotDataClick");
                        $("#" + employeeChartId).bind("jqplotDataClick",
                            function(ev, seriesIndex, pointIndex, data) {
                                //that.clickBarSlice(ev, pointIndex);
                                that.clickEmployeeSlice(that.employeedataID, pointIndex);
                            }
                        );
                        that.setLabelColor(showemployeeChart, "jqplot-xaxis-tick", "#f0f0f0");
                        that.setLabelColor(showemployeeChart, "jqplot-point-label", "#f0f0f0");
                    } catch (ex) {
                        Log.print(Log.l.error, "exception occurred: " + ex.message);
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.showemployeeChart = showemployeeChart;
            */

            this.country = "";
            this.res = [];
            this.resi = 0;
            this.countryID = 0;
            var clickCountrySlice = function(event, index) {
                Log.call(Log.l.trace, "Reporting.Controller.", "index=" + index);
                if (event && index >= 0) {
                    that.country = event[index];
                    that.country = that.country[0];
                    if (that.country > "") {
                        return AppData.initLandView.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "initLandView: success!");
                                if (json && json.d && json.d.results) {
                                    that.res = json.d.results;
                                    that.resi = json.d.results.length;
                                    if (that.resi > 0) {
                                    for (var i = 0; i < that.resi ; i++)
                                        {
                                            if (that.res[i].TITLE === that.country) {
                                                that.countryID = that.res[i].INITLandID;
                                            }
                                        }
                                    }
                                    that.setRestriction({
                                        INITLandID: that.countryID
                                    });
                                    Application.navigateById("contact");
                                }
                            }, function(errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.clickCountrySlice = clickCountrySlice;

            this.employee = "";
            this.res = [];
            this.resi = 0;
            this.employeeID = 0;
            var clickEmployeeSlice = function (event, index) {
                Log.call(Log.l.trace, "Reporting.Controller.", "index=" + index);
                if (event && index >= 0) {
                    that.employee = event[index];
                    that.employee = that.employee[0];
                    if (that.employee > "") {
                        return Reporting.employeeView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "initLandView: success!");
                            if (json && json.d && json.d.results) {
                                that.setRestriction({
                                    MitarbeiterID: that.employee
                                });
                                Application.navigateById("contact");
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.clickEmployeeSlice = clickEmployeeSlice;

            // define handlers
            this.eventHandlers = {
                clickBack: function(event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickExport: function(event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    AppBar.busy = true;
                    AppBar.triggerDisableHandlers();
                    WinJS.Promise.timeout(0).then(function() {
                        that.templatecall();
                    });
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function(event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function(event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickErfassungsdatum: function(event) {
                    if (event.currentTarget) {
                        that.binding.showErfassungsdatum = event.currentTarget.checked;
                        that.binding.restriction.ReportingErfassungsdatum = new Date();
                    }
                    that.showDateRestrictions();
                   
                },
                clickModifiedTs: function(event) {
                    if (event.currentTarget) {
                        that.binding.showModifiedTS = event.currentTarget.checked;
                    }
                    that.showDateRestrictions();
                },
                changeModifiedTS: function(event) {
                    if (event.currentTarget) {
                        that.binding.ModifiedTs = event.currentTarget.current;
                    }
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
                clickExport: function() {
                    var ret = true;
                    if (that.binding.curOLELetterID && !AppBar.busy) {
                        ret = false;
                    }
                    return ret;
                }
            }

            var loadData = function() {
                Log.call(Log.l.trace, "Reporting.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function() {
                    if (!that.analysis || !that.analysis.length) {
                        Log.print(Log.l.trace, "calling select analysisListView...");
                        //load the list of analysisListView for Combobox (assume less than 100 hits)
                        return Reporting.analysisListView.select(function(json) {
                            Log.print(Log.l.trace, "analysisListView: success!");
                            if (json && json.d && json.d.results) {
                                // store result for next use
                                that.analysis = json.d.results;
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (exportList && exportList.winControl) {
                                    exportList.winControl.data = new WinJS.Binding.List(json.d.results);
                                }
                                that.binding.curOLELetterID = that.analysis[0].OLELetterID;
                            }
                        }, function(errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (exportList && exportList.winControl) {
                            exportList.winControl.data = new WinJS.Binding.List(that.analysis);
                        }
                        that.binding.curOLELetterID = that.analysis[0].OLELetterID;
                        return WinJS.Promise.as();
                    }
                }).then(function() {
                    if (!AppData.initLandView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initLandData...");
                        //@nedra:25.09.2015: load the list of INITLand for Combobox
                        return AppData.initLandView.select(function(json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "initLandDataView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initLand && initLand.winControl) {
                                    initLand.winControl.data = new WinJS.Binding.List(json.d.results);
                                }
                            }
                        }, function(errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initLand && initLand.winControl &&
                        (!initLand.winControl.data || !initLand.winControl.data.length)) {
                            initLand.winControl.data = new WinJS.Binding.List(AppData.initLandView.getResults());
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function() {
                    if (!that.employees || !that.employees.length) {
                        that.employees = new WinJS.Binding.List([Reporting.employeeView.defaultValue]);
                        return Reporting.employeeView.select(function(json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "Reporting: success!");
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d) {
                                that.nextUrl = Reporting.employeeView.getNextUrl(json);
                                var results = json.d.results;
                                results.forEach(function(item, index) {
                                    that.resultConverter(item, index);
                                });
                                if (erfasserID && erfasserID.winControl) {
                                    erfasserID.winControl.data = that.employees;
                                }
                                that.binding.mitarbeiterId = Reporting.employeeView.defaultValue.MitarbeiterVIEWID;
                            } else {
                                that.nextUrl = null;
                                that.employees = null;
                            }
                        }, function(errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, {
                            VeranstaltungID: AppData.getRecordId("Veranstaltung")
                        });
                    } else {
                        if (erfasserID && erfasserID.winControl) {
                            erfasserID.winControl.data = that.erfasserID;
                        }
                        that.binding.mitarbeiterId = Reporting.employeeView.defaultValue.MitarbeiterVIEWID;
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    var savedRestriction = AppData.getRestriction("Kontakt");
                    if (!savedRestriction) {
                        savedRestriction = {};
                    } 
                    var defaultRestriction = Reporting.defaultrestriction;
                    var prop;
                    for (prop in defaultRestriction) {
                        if (defaultRestriction.hasOwnProperty(prop)) {
                            if (typeof savedRestriction[prop] === "undefined") {
                                savedRestriction[prop] = defaultRestriction[prop];
                            }
                        }
                    }
                    that.binding.restriction = savedRestriction;
                    // always define date types
                    if (typeof that.binding.restriction.ReportingErfassungsdatum === "undefined") {
                        that.binding.restriction.ReportingErfassungsdatum = new Date();
                    }
                    // always define date types
                    if (typeof that.binding.modifiedTS === "undefined") {
                        that.binding.modifiedTS = new Date();
                    }

                }).then(function() {
                    AppBar.notifyModified = true;
                    AppBar.triggerDisableHandlers();
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;
            //that.setInitialDate();
            that.showDateRestrictions();
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function() {
                Log.print(Log.l.trace, "Data loaded");
                /*return that.showcountryChart("countryChart", true);*/
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                /*return that.showemployeeChart("employeeChart", true);*/
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
            analysis: null,
            employees: null,
            template: null,
            templatestr: null,
            landHisto: null,
            employeeHisto: null,
            employeechart:null
})
    });
})();



