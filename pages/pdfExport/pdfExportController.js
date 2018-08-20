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
    var b64 = window.base64js;

    WinJS.Namespace.define("PDFExport", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "PDFExport.Controller.");
            Application.Controller.apply(this, [pageElement, {
                restriction: getEmptyDefaultValue(PDFExport.pdfExportParamView.defaultValue),
                sampleName: getEmptyDefaultValue(PDFExport.pdfExportParamView.defaultValue),
                exportPdfString: "",
                exportPdfMsg: "",
                curOLELetterID: null,
                timerFlag: false,
                progress: {
                    count: 0,
                    max: 0,
                    text: "",
                    show: null
                }
            }, commandList]);

            var that = this;

            // look for ComboBox element
            var exportFieldList1 = pageElement.querySelector("#InitExportField1");
            var exportFieldList2 = pageElement.querySelector("#InitExportField2");
            var exportFieldList3 = pageElement.querySelector("#InitExportField3");
            var exportFieldList4 = pageElement.querySelector("#InitExportField4");
            var pdfExportList = pageElement.querySelector("#PDFExportList");
            var spinner = pageElement.querySelector(".loader");

            this.pdfzip = null;
            this.pdfIddata = [];
            this.nextUrl = null;
            this.curPdfIdx = -1;

            var disablePdfExportList = function (disableFlag) {
                var pdfExportListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("PdfExportList"));
                if (pdfExportListFragmentControl &&
                    pdfExportListFragmentControl.controller) {
                    pdfExportListFragmentControl.controller.disableList(disableFlag);
                }
            }
            this.disablePdfExportList = disablePdfExportList;
            
            var getPdfIdDaten = function () {
                that.pdfzip = null;
                that.pdfIddata = [];
                that.nextUrl = null;
                that.curPdfIdx = -1;
                Log.call(Log.l.trace, "PDFExport.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = PDFExport.contactView.select(function (json) {
                    Log.print(Log.l.trace, "exportTemplate: success!");
                    if (json && json.d && json.d.results && json.d.results.length > 0) {
                        // store result for next use
                        that.nextUrl = PDFExport.contactView.getNextUrl(json);
                        that.pdfIddata = json.d.results;
                    }
                    that.getNextPdfData();
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

            var addPdfToZip = function (filename, docContent) {
                if (filename && docContent) {
                    if (!that.pdfzip) {
                        that.pdfzip = new JSZip();
                    }
                    var sub = docContent.search("\r\n\r\n");
                    if (sub > 0) {
                        var data = b64.toByteArray(docContent.substr(sub + 4));
                        that.pdfzip.file(filename, data);
                    } else {
                        that.pdfzip.file(filename, docContent);
                    }
                }
            }
            this.addPdfToZip = addPdfToZip;

            var getNextPdfData = function () {
                var ret;
                that.binding.progress.show = true;
                Log.call(Log.l.trace, "PDFExport.Controller.");
                if (that.nextUrl) {
                    var nextUrl = that.nextUrl;
                    Log.print(Log.l.trace, "nextUrl=%d" + nextUrl);
                    that.nextUrl = null;
                    ret = PDFExport.contactView.selectNext(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "ExportKontaktDataView selectNext: success!");
                        // employeeView returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            that.nextUrl = PDFExport.contactView.getNextUrl(json);
                            that.pdfIddata = json.d.results;
                            that.binding.progress.max = that.pdfIddata.length;
                        }
                        that.getNextPdfData();
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        that.disablePdfExportList(false);
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, that.pdfIddata, nextUrl);
                } else if (++that.curPdfIdx < that.pdfIddata.length) {
                    AppData.setErrorMsg(that.binding);
                    var recordId = that.pdfIddata[that.curPdfIdx].DOC3ExportKontaktDataVIEWID;
                    Log.print(Log.l.trace, "that.pdfIddata[%d" + that.curPdfIdx + "].DOC3ExportKontaktDataVIEWID=" + recordId + " pdfIddata.length=" + that.pdfIddata.length);
                    ret = PDFExport.exportKontaktDataView.select(function (json) {
                        Log.print(Log.l.trace, "ExportKontaktDataView: success!");
                        if (json && json.d) {
                            // store result for next use
                            that.addPdfToZip(json.d.szOriFileNameDOC1, json.d.DocContentDOCCNT1);
                            that.binding.progress.count++;
                        }
                        that.getNextPdfData();
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        that.disablePdfExportList(false);
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, recordId);
                } else if (that.pdfIddata.length > 0) {
                    Log.print(Log.l.trace, "collected all, pdfIddata.length=" + that.pdfIddata.length);
                    var pdfData = that.pdfzip.generate({
                        base64: false,
                        compression: "STORE",
                        type: "blob"
                    });
                    //location.href = "data:application/zip;base64," + pdfData;
                    saveAs(pdfData, "PDFExport.zip");
                    that.disablePdfExportList(false);
                    that.binding.progress.show = null;
                    that.binding.progress.count = 0;
                    ret = WinJS.Promise.as();
                } else {
                    Log.print(Log.l.trace, "no data");
                    that.disablePdfExportList(false);
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;    
            }
            this.getNextPdfData = getNextPdfData;

            //ensure that all PDF are created and ready for download
           /* var ensurePdfDone = function () {
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
            */
            var generateZip = function (pdfIddata) {
                /*
                var l = pdfIddata.length;
                if (!that.pdfzip) {
                    that.pdfzip = new JSZip();
                }
                for (var i = 0; i < l; i++) {
                    that.getPdfData(pdfIddata[i].DOC3ExportKontaktDataVIEWID);
                }
                var pdfData = that.pdfzip.generate();
                location.href = "data:application/zip;base64," + pdfData;
                 */
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
                    AppBar.busy = false;
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
                    that.saveData();
                    if (event && event.currentTarget) {
                        var exportselection = event.target.value;
                        that.disableFlag = event.target.index;
                        AppBar.busy = true;
                        AppBar.triggerDisableHandlers();
                        that.disablePdfExportList(true);
                        WinJS.Promise.timeout(0).then(function () {
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