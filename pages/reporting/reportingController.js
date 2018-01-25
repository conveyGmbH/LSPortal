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
/// <reference path="~/www/fragments/reportingList/reportingListController.js" />

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
            // now do anything...
            var reportingList = pageElement.querySelector("#reportingList.listview");
            //var datePicker = pageElement.querySelector("#caBo");
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
                item.fullNameValue = (item.Nachname ? (item.Nachname + ", ") : "") + (item.Vorname ? item.Vorname : "");
            }
            this.resultConverter = resultConverter;

            var title = function(t) {
                var t = getResourceText(t);
                return t;
            }
            this.title = title;

           // var calendar = datePicker.calendar;
           // datePicker.calendar = calendar;
            
            var setInitialDate = function () {
                if (typeof that.binding.restriction.ReportingErfassungsdatum === "undefined") {
                    that.binding.restriction.ReportingErfassungsdatum = new Date();
                }
                if (typeof that.binding.restriction.ModifiedTS === "undefined") {
                    that.binding.restriction.ModifiedTS = new Date();
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
                if (!that.binding.showModifiedTS &&
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
                }
                return myrestriction;
            }
            this.getRestriction = getRestriction;

            var setRestriction = function () {
                var reportingRestriction = null;
                if (that.binding.restriction.InitLandID && that.binding.restriction.InitLandID !== "null") {
                    if (!reportingRestriction) {
                        reportingRestriction = {};
                    }
                    if (AppData.getLanguageId() === 1031) {
                        reportingRestriction.Land = that.binding.restriction.InitLandID;
                    } else {
                        reportingRestriction.Country = that.binding.restriction.InitLandID;
                    }
                }
                if (that.binding.restriction.ErfasserID && that.binding.restriction.ErfasserID !== "undefined") {
                    if (!reportingRestriction) {
                        reportingRestriction = {};
                    }
                    if (AppData.getLanguageId() === 1031) {
                        reportingRestriction.Mitarbeiter = that.binding.restriction.ErfasserID;
                    } else {
                        reportingRestriction.RecordedBy = that.binding.restriction.ErfasserID;
                    }
                }
                if (that.binding.showErfassungsdatum && that.binding.restriction.ReportingErfassungsdatum) {
                    if (!reportingRestriction) {
                        reportingRestriction = {};
                    }
                    if (AppData.getLanguageId() === 1031) {
                        reportingRestriction.Erfassungsdatum = that.binding.restriction.ReportingErfassungsdatum;
                    } else {
                        reportingRestriction.RecordDate = that.binding.restriction.ReportingErfassungsdatum;
                    }
                }
                if (that.binding.showModifiedTS && that.binding.restriction.ModifiedTs) {
                    if (!reportingRestriction) {
                        reportingRestriction = {};
                    }
                    if (AppData.getLanguageId() === 1031) {
                        reportingRestriction.AenderungsDatum = that.binding.restriction.ModifiedTs;
                    } else {
                        reportingRestriction.ModificationDate = that.binding.restriction.ModifiedTs;
                    }
                }
                return reportingRestriction;
            }
            this.setRestriction = setRestriction;

            var templatecall = function(tID) {
                Log.call(Log.l.trace, "Reporting.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = Reporting.exportTemplate.select(function (json) {
                    Log.print(Log.l.trace, "exportTemplate: success!");
                    if (json && json.d) {
                        // store result for next use
                        var template = json.d.DocContentDOCCNT1;
                        var sub = template.search("\r\n\r\n");
                        that.templatestr = template.substr(sub + 4);
                    }
                }, function (errorResponse) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    AppData.setErrorMsg(that.binding, errorResponse);
                    }, 26);
                Log.ret(Log.l.trace);
                return ret;
            };
            this.templatecall = templatecall;

            var exportData = function(exportselection) {
                Log.call(Log.l.trace, "Reporting.Controller.");
                var dbViewTitle = null;
                var dbView = null;
                var fileName = null;
                ExportXlsx.restriction = that.getRestriction();
                switch (parseInt(exportselection)) {
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
                        dbViewTitle = Reporting.xLAuswertungViewNoQuestTitle;
                        fileName = "KontakteKeineFragen";
                        //ExportXlsx.restriction.KontaktID = [-2,-1];
                        if (!that.binding.showErfassungsdatum) {
                            ExportXlsx.restriction.ReportingErfassungsdatum = "NOT NULL";
						}
                    } else {
                        dbView = Reporting.xLReportViewNoQuest;
                        dbViewTitle = Reporting.xLReportViewNoQuestTitle;
                        fileName = "ContactsNoQuestion";
                        //ExportXlsx.restriction.ContactID = [-2,-1];
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
                case 26:
                    if (AppData.getLanguageId() === 1031) {
                        dbView = Reporting.KontaktReport;
                        fileName = "BenutzerdefinierterReport";
                    } else {
                        dbView = Reporting.KontaktReport;
                        fileName = "CostumReport";
                    }
                    break;
                default:
                    Log.print(Log.l.error, "curOLELetterID=" + that.binding.curOLELetterID + "not supported");
                }
                if (dbView) {
                    var exporter = ExportXlsx.exporter;
                    if (!exporter) {
                        exporter = new ExportXlsx.ExporterClass(that.binding.progress);
                    }
                    exporter.showProgress(0);
                    var restriction = {};
                    if (exportselection != 26) {
                        restriction = that.setRestriction(); 
                    } else {
                        restriction = {};
                    }
                    if (!restriction) {
                        dbViewTitle = null;
                        restriction = {};
                    }
                    exporter.saveXlsxFromView(dbView, fileName, function (result) {
                        AppBar.busy = false;
                        AppBar.triggerDisableHandlers();
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                        AppBar.busy = false;
                        AppBar.triggerDisableHandlers();
                    }, restriction, dbViewTitle, that.templatestr);
                } else {
                    AppBar.busy = false;
                    AppBar.triggerDisableHandlers();
                }
                Log.ret(Log.l.trace);
            }
            that.exportData = exportData;

            
            this.employeeChart = null;
            this.barChartWidth = 0;
            this.employeetitle = that.title("reporting.employeechart");
            this.employeeChartArray = [];
            this.employeedata = [];
            this.employeedataID = [];
            this.employeeticks = [];
            var employeeResult = null, ei = 0, el = 0;
            var showemployeeChart = function (barChartId, bAnimated) {
                Log.call(Log.l.trace, "Reporting.Controller.");
                WinJS.Promise.timeout(0).then(function () {
                    if (!that.employeedata || !that.employeedata.length) {
                        Log.print(Log.l.trace, "extra ignored");
                    } else {
                        var reportingBarChart = pageElement.querySelector("#" + barChartId);
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
                                    that.employeeChart = $.jqplot(barChartId, [that.employeedata], {
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
                                            }
                                        },
                                        axes: {
                                            yaxis: {
                                                renderer: $.jqplot.CategoryAxisRenderer
                                            },
                                            xaxis: {
                                                renderer: $.jqplot.AxisThickRenderer
                                            }
                                        },
                                        tickOptions: {
                                            fontSize: '10pt'
                                        },
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
                                    that.binding.restriction.INITLandID = that.countryID;
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
                                that.binding.restriction.MitarbeiterID = that.employee;
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
                clickOk: function(event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    if (AppBar.barControl && !AppBar.barControl.opened) {
                        AppBar.barControl.open();
                    }
                    Log.ret(Log.l.trace);
                },
                clickExport: function(event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    if (event && event.currentTarget) {
                        var exportselection = event.currentTarget.value;
                        AppBar.busy = true;
                        AppBar.triggerDisableHandlers();
                        WinJS.Promise.timeout(0).then(function () {
                            //return that.templatecall(exportselection);
                        }).then(function() {
                            return that.exportData(exportselection);
                        });
                    }
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
                        that.binding.restriction.ModifiedTs = new Date();
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
                clickOk: function() {
                    var ret = true;
                    if (!AppBar.busy && AppBar.barControl && !AppBar.barControl.opened) {
                        ret = false;
                    }
                    return ret;
                }
            }

            var loadData = function() {
                Log.call(Log.l.trace, "Reporting.Controller.");
                AppData.setErrorMsg(that.binding);
                //that.templatecall();
                var ret = new WinJS.Promise.as().then(function() {
                    var reportingListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("ReportingList"));
                    if (reportingListFragmentControl && reportingListFragmentControl.controller) {
                        return reportingListFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#reportingListhost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "ReportingList", { });
                        } else {
                            return WinJS.Promise.as();
                        }
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
                    that.employeedata = [];
                    that.employeedataID = [];
                    return Reporting.reportMitarbeiter.select(function (json) {
                        Log.print(Log.l.trace, "reportMitarbeiter: success!");
                        if (json && json.d && json.d.results) {
                            // store result for next use
                            employeeResult = json.d.results;
                            el = json.d.results.length;
                            for (ei; ei < el; ei++) {
                                // y-axis is ascending to top
                                var ed = el - ei - 1;
                                that.employeedata[ed] = [employeeResult[ei].Anzahl, employeeResult[ei].EmployeeName];
                                that.employeedataID[ed] = [employeeResult[ei].EmployeeID];
                            }
                            that.barChartWidth = 0;
                            that.showemployeeChart("employeeChart", true);
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
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

                }).then(function () {
                    AppBar.notifyModified = true;
                    AppBar.triggerDisableHandlers();
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;
            that.setInitialDate();
            that.showDateRestrictions();
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
            analysis: null,
            employees: null,
            templatestr: null,
            landHisto: null,
            employeeHisto: null,
            employeechart:null
})
    });
})();



