// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/event/eventService.js" />
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/OpenXml/scripts/linq.js" />
/// <reference path="~/www/lib/OpenXml/scripts/ltxml.js" />
/// <reference path="~/www/lib/OpenXml/scripts/ltxml-extensions.js" />
/// <reference path="~/www/lib/OpenXml/scripts/jszip.js" />
/// <reference path="~/www/lib/OpenXml/scripts/jszip-load.js" />
/// <reference path="~/www/lib/OpenXml/scripts/jszip-inflate.js" />
/// <reference path="~/www/lib/OpenXml/scripts/jszip-deflate.js" />
/// <reference path="~/www/lib/OpenXml/scripts/FileSaver.js" />
/// <reference path="~/www/lib/OpenXml/scripts/openxml.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("PDFExport", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "PDFExport.Controller.");
            Application.Controller.apply(this, [pageElement, {
                restriction: getEmptyDefaultValue(PDFExport.pdfExportParamView.defaultValue),
                sampleName: getEmptyDefaultValue(PDFExport.pdfExportParamView.defaultValue),
                exportPdfString: "",
                exportPdfMsg: "",
                curOLELetterID: null,
                timerFlag: false
            }, commandList]);

            var that = this;

            // look for ComboBox element
            var exportFieldList1 = pageElement.querySelector("#InitExportField1");
            var exportFieldList2 = pageElement.querySelector("#InitExportField2");
            var exportFieldList3 = pageElement.querySelector("#InitExportField3");
            var exportFieldList4 = pageElement.querySelector("#InitExportField4");
            var pdfExportList = pageElement.querySelector("#PDFExportList");
            var spinner = pageElement.querySelector(".loader");

            var disableReportingList = function (disableFlag) {
                var reportingListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("PDFExportList"));
                if (reportingListFragmentControl &&
                    reportingListFragmentControl.controller) {
                    reportingListFragmentControl.controller.disableList(disableFlag);
                }
            }
            this.disableReportingList = disableReportingList;

            var spinnercontl = function (timerFlag) {
                if (timerFlag === true) {
                    spinner.style.display = 'block';
                } else {
                    spinner.style.display = 'none';
                }
            }
            this.spinnercontl = spinnercontl;

            var getPdfIdDaten = function() {
                Log.call(Log.l.trace, "PDFExport.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = PDFExport.contactView.select(function (json) {
                    Log.print(Log.l.trace, "exportTemplate: success!");
                    if (json && json.d) {
                        // store result for next use
                        that.nextUrl = PDFExport.contactView.getNextUrl(json);
                        var results = json.d.results;
                        var pdfIddata = [];
                        for (var i = 0; i < results.length; i++) {
                            pdfIddata.push({ DOC3ExportKontaktDataVIEWID: results[i].DOC3ExportKontaktDataVIEWID});
                        }
                        that.generateZip(pdfIddata);
                    }
                }, function (errorResponse) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    AppData.setErrorMsg(that.binding, errorResponse);
                });
                Log.ret(Log.l.trace);
                return ret;    
            }
            this.getPdfIdDaten = getPdfIdDaten;


            var statusExportPDF = function () {
                Log.call(Log.l.trace, "PDFExport.Controller.");
                
                
            }
            this.statusExportPDF = statusExportPDF;

            var addPdfToZip = function (filename, data) {
                that.pdfzip.file(filename, data);
            }
            this.addPdfToZip = addPdfToZip;

            var getPdfData = function (recordId) {
                Log.call(Log.l.trace, "PDFExport.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = PDFExport.exportKontaktDataView.select(function (json) {
                    Log.print(Log.l.trace, "ExportKontaktDataView: success!");
                    if (json && json.d) {
                        // store result for next use
                        var results = json.d;
                        that.addPdfToZip(results.szOriFileNameDOC1, results.DocContentDOCCNT1);
                    }
                }, function (errorResponse) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    AppData.setErrorMsg(that.binding, errorResponse);
                }, recordId);
                Log.ret(Log.l.trace);
                return ret;    
            }
            this.getPdfData = getPdfData;

            //ensure that all PDF are created and ready for download
            var ensurePdfDone = function () {
                that.binding.timerFlag = true;
                that.spinnercontl(that.binding.timerFlag);
                Log.call(Log.l.trace, "PDFExport.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_EnsurePDFdone",
                    {
                       
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        that.binding.timerFlag = false;
                        that.spinnercontl(that.binding.timerFlag);
                        that.getPdfIdDaten();
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                        that.binding.timerFlag = false;
                        that.spinnercontl(that.binding.timerFlag);
                    });
                Log.ret(Log.l.trace);
            }
            this.ensurePdfDone = ensurePdfDone;
            
            var generateZip = function (pdfIddata) {
                var l = pdfIddata.length;
                that.pdfzip = new JSZip();
                for (var i = 0; i < l; i++) {
                    that.getPdfData(pdfIddata[i].DOC3ExportKontaktDataVIEWID);
                }
                var pdfData = that.pdfzip.generate();
                location.href = "data:application/zip;base64," + pdfData;
                Log.call(Log.l.trace, "PDFExport.Controller.");
            }
            this.generateZip = generateZip;

            // save data
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "PDFExport.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var dataPdfExport = that.binding.restriction;
                if (dataPdfExport && AppBar.modified && !AppBar.busy) {
                    var recordId = dataPdfExport.PDFExportParamVIEWID;
                    if (recordId) {
                        AppBar.busy = true;
                        ret = PDFExport.pdfExportParamView.update(function (response) {
                            AppBar.busy = false;
                            // called asynchronously if ok
                            Log.print(Log.l.info, "dataPdfExport update: success!");
                            AppBar.modified = false;
                            if (typeof complete === "function") {
                                complete(response);
                            }
                                that.loadData();
                            },
                            function (errorResponse) {
                                AppBar.busy = false;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (typeof error === "function") {
                                    error(errorResponse);
                                }
                            },
                            recordId, dataPdfExport);
                    } else {
                        Log.print(Log.l.info, "not supported");
                        ret = WinJS.Promise.as();
                    }

                } else if (AppBar.busy) {
                    ret = WinJS.Promise.timeout(100).then(function () {
                        return that.saveData(complete, error);
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete(dataPdfExport);
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "PDFExport.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "PDFExport.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "PDFExport.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "PDFExport.Controller.");
                    that.saveData();
                    Log.ret(Log.l.trace);
                },
                clickExport: function (event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    if (event && event.currentTarget) {
                        var exportselection = event.target.value;
                        that.disableFlag = event.target.index;
                        AppBar.busy = true;
                        AppBar.triggerDisableHandlers();
                        WinJS.Promise.timeout(0).then(function () {
                           // return that.exportPDFData(exportselection);
                            that.getPdfIdDaten();
                        });
                    }
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickBack: function () {
                    // always enabled!
                    return false;
                }
            };
            
            var resultConverter = function (item, index) {
                item.index = index;
            }
            this.resultConverter = resultConverter;
            
            var loadData = function () {
                Log.call(Log.l.trace, "PDFExport.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    var reportingListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("PdfExportList"));
                    if (reportingListFragmentControl && reportingListFragmentControl.controller) {
                        return reportingListFragmentControl.controller.loadData();
                    } else {
                        var parentElement = pageElement.querySelector("#pdfExportListhost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "PdfExportList", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    return PDFExport.pdfExportView.select(function (json) {
                        Log.print(Log.l.trace, "Mailing.FragebogenzeileView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d && json.d.results) {
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });

                            // Now, we call WinJS.Binding.List to get the bindable list
                            if (exportFieldList1 && exportFieldList1.winControl) {
                                exportFieldList1.winControl.data = new WinJS.Binding.List(results);
                            }
                            if (exportFieldList2 && exportFieldList2.winControl) {
                                exportFieldList2.winControl.data = new WinJS.Binding.List(results);
                            }
                            if (exportFieldList3 && exportFieldList3.winControl) {
                                exportFieldList3.winControl.data = new WinJS.Binding.List(results);
                            }
                            if (exportFieldList4 && exportFieldList4.winControl) {
                                exportFieldList4.winControl.data = new WinJS.Binding.List(results);
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                            LanguageSpecID: AppData.getLanguageId()
                        });
                }).then(function () {
                    return PDFExport.pdfExportParamsView.select(function (json) {
                        Log.print(Log.l.trace, "Mailing.FragebogenzeileView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d && json.d.results) {
                            var results = json.d.results;
                            /*results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            }); */
                            that.binding.sampleName = results[0].SampleName;
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {

                        });
                }).then(function () {
                    return PDFExport.pdfExportParamView.select(function (json) {
                        Log.print(Log.l.trace, "Mailing.FragebogenzeileView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d && json.d.results) {
                            var results = json.d.results;
                            /*results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            }); */
                            that.binding.restriction = results[0];
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {

                        });
                }).then(function () {
                    AppBar.notifyModified = true;
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;
                        
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.spinnercontl(that.binding.timerFlag);
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        }, {
                exportPDFStringFlag: "",
                pdfzip: null,
                pdfzipfiles: []
            })
    });
})();