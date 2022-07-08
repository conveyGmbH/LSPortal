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
/// <reference path="~/www/lib/OpenXml/scripts/jszip.js" />
/// <reference path="~/www/lib/OpenXml/scripts/jszip-load.js" />
/// <reference path="~/www/lib/OpenXml/scripts/jszip-inflate.js" />
/// <reference path="~/www/lib/OpenXml/scripts/jszip-deflate.js" />
/// <reference path="~/www/lib/OpenXml/scripts/FileSaver.js" />
/// <reference path="~/www/pages/pdfExport/pdfexportXlsx.js" />

(function () {
    "use strict";
    var b64 = window.base64js;
    /*WinJS.Namespace.define("Reporting", {
        controller: null,
        gesamtZahl: AppData.generalData.AnzahlKontakte
    });*/
    WinJS.Namespace.define("Reporting", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement) {
            Log.call(Log.l.trace, "Reporting.Controller.");
            Application.Controller.apply(this, [
                pageElement, {
                    restriction: {
                        ErfasserID: null,
                        InitLandID: null,
                        Erfassungsdatum: null,
                        showErfassungsdatum: false,
                        ModifiedTs: null,
                        showModifiedTS: false
                    },
                    restrictionExcel: getEmptyDefaultValue(Reporting.defaultrestriction),
                    restrictionPdf: getEmptyDefaultValue(Reporting.exportAudioDataView.defaultValue),
                    dataContactAudio: getEmptyDefaultValue(Reporting.exportAudioDataView.defaultValue),
                    curOLELetterID: null,
                    progress: {
                        count: 0,
                        max: 0,
                        percent: 0,
                        text: getResourceText("reporting.outOf"),
                        show: null,
                        showOther: null
                    },
                    templatexlsx: "",
                    showExcelExportErfassungsdatum: false, // excel 
                    showExportAllExportErfassungsdatum: false, // Stand 22.10 für pdf-export/all und audiodaten
                    showModifiedTS: false,
                    showFilter: false,
                    showPdfReportingFilter: false
                }
            ]);
            
            this.audiozip = null;
            this.audioIddata = [];
            this.nextUrl = null;
            this.curAudioIdx = 0;
            this.analysis = null;
            this.employees = null;
            this.templatestr = null;
            this.landHisto = null;
            this.employeeHisto = null;
            this.employeechart = null;
            this.xlsxfilename = "PDFExport.xlsx";

            var that = this;

            var initLand = pageElement.querySelector("#InitLandReporting");
            var erfasserID = pageElement.querySelector("#ErfasserIDReporting");
            var erfassungsdatum = pageElement.querySelector("#ReportingExcelErfassungsdatum.win-datepicker");
            var pdfErfassungsdatum = pageElement.querySelector("#ReportingPDFErfassungsdatum.win-datepicker");
            var modifiedTs = pageElement.querySelector("#ModifiedTs.win-datepicker");
            
            this.dispose = function () {
                if (that.audioIddata) {
                    that.audioIddata = null;
                }
                if (that.xlsxblob) {
                    that.xlsxblob = null;
                }
                if (that.templatexlsx) {
                    that.templatexlsx = null;
                }
                if (that.employeedata) {
                    that.employeedata = null;
                }
                if (that.employeedataID) {
                    that.employeedataID = null;
                }
            }

            //audio
            var showProgress = function (percent, text, max) {
                if (that.binding.progress && typeof that.binding.progress === "object") {
                    if (!percent) {
                        //this.progressFirst = 0;
                        //this.progressNext = 0;
                        //this.progressStep = 40;
                    }
                    that.binding.progress.max = max;
                    that.binding.progress.count++;
                    that.binding.progress.showOther = percent >= 0 && percent <= max ? 1 : null;
                    that.binding.progress.text = text ? text : getResourceText("reporting.progressMsg");
                }
            }
            this.showProgress = showProgress;

            var resultConverter = function(item, index) {
                item.index = index;
                item.fullName = (item.Nachname ? (item.Nachname + ", ") : "") + (item.Vorname ? item.Vorname : "");
                item.fullNameValue = (item.Nachname ? (item.Nachname + ", ") : "") + (item.Vorname ? item.Vorname : "");
            }
            this.resultConverter = resultConverter;

            var title = function(t) {
                return  getResourceText(t);
            }
            this.title = title;

            var setInitialDate = function () {
                if (typeof that.binding.restriction.Erfassungsdatum === "undefined") {
                    that.binding.restriction.Erfassungsdatum = new Date();
                }
                if (typeof that.binding.restriction.ModifiedTS === "undefined") {
                    that.binding.restriction.ModifiedTS = new Date();
                }
                Log.call(Log.l.trace, "Initialdate set");
            }
            this.setInitialDate = setInitialDate;

            var showDateRestrictions = function() {
                if (typeof that.binding.showExcelExportErfassungsdatum === "undefined") {
                    that.binding.showExcelExportErfassungsdatum = false;
                }
                if (typeof that.binding.showModifiedTS === "undefined") {
                    that.binding.showModifiedTS = false;
                }
                if (modifiedTs && modifiedTs.winControl) {
                    modifiedTs.winControl.disabled = !that.binding.showModifiedTS;
                }
                if (typeof that.binding.showExportAllExportErfassungsdatum === "undefined") {
                    that.binding.showExportAllExportErfassungsdatum = false;
                }
                // excel export
                if (erfassungsdatum && erfassungsdatum.winControl) {
                    erfassungsdatum.winControl.disabled = !that.binding.showErfassungsdatum;
                }
                //pdfErfassungsdatum export all und audiodaten
                if (pdfErfassungsdatum && pdfErfassungsdatum.winControl) {
                    pdfErfassungsdatum.winControl.disabled = !that.binding.showExportAllExportErfassungsdatum;
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
                        typeof that.binding.restriction.Erfassungsdatum === "undefined") {
                        that.binding.restriction.Erfassungsdatum = new Date();
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

            var setRestriction = function () {
                var reportingRestriction = {};
                //if (that.binding.restriction.InitLandID && that.binding.restriction.InitLandID !== null) {
                    if (AppData.getLanguageId() === 1031) {
                        reportingRestriction.Land = that.binding.restriction.InitLandID;
                    } else {
                        reportingRestriction.Land = that.binding.restriction.InitLandID;
                    }
                //}
                if (that.binding.restriction.ErfasserID && that.binding.restriction.ErfasserID !== "undefined") {
                    if (AppData.getLanguageId() === 1031) {
                        reportingRestriction.Mitarbeiter = that.binding.restriction.ErfasserID;
                    } else {
                        reportingRestriction.Mitarbeiter = that.binding.restriction.ErfasserID;
                    }
                } else {
                    that.binding.restriction.ErfasserID = null;
                    reportingRestriction.Mitarbeiter = that.binding.restriction.ErfasserID;

                }
                if (that.binding.showErfassungsdatum && that.binding.restriction.Erfassungsdatum) {
                    if (AppData.getLanguageId() === 1031) {
                        reportingRestriction.Erfassungsdatum = that.binding.restriction.Erfassungsdatum;
                        reportingRestriction.ErfassungsdatumValue =
                            that.binding.restriction.Erfassungsdatum; //.toISOString().substring(0, 10)
                    } else {
                        reportingRestriction.RecordDate = that.binding.restriction.Erfassungsdatum;
                    }
                } else {
                    reportingRestriction.Erfassungsdatum = null;
                    reportingRestriction.ErfassungsdatumValue = null;
                }
                if (that.binding.showModifiedTS && that.binding.restriction.AenderungsDatum) {
                    if (AppData.getLanguageId() === 1031) {
                        reportingRestriction.AenderungsDatumValue = that.binding.restriction.AenderungsDatum;
                        reportingRestriction.AenderungsDatum = that.binding.restriction.AenderungsDatum;
                        
                    } else {
                        reportingRestriction.ModificationDate = that.binding.restriction.ModifiedTs;
                    }
                    reportingRestriction.KontaktModifiedTS = that.binding.restriction.AenderungsDatum;
                } else {
                    reportingRestriction.AenderungsDatumValue = null;
                    reportingRestriction.ModificationDate = null;
                    reportingRestriction.AenderungsDatum = null;
                    reportingRestriction.KontaktModifiedTS = null;

                }
                return reportingRestriction;
            }
            this.setRestriction = setRestriction;

            /*var templatecall = function(tID) {
                Log.call(Log.l.trace, "Reporting.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                ret = Reporting.exportTemplate.select(function (json) {
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
                    }, 32);
                Log.ret(Log.l.trace);
                return ret;
            };
            this.templatecall = templatecall;
            */
            var addAudioToZip = function (filename, docContent) {
                if (filename && docContent) {
                    if (!that.audiozip) {
                        that.audiozip = new JSZip();

                    }
                    if (!that.pdfzip) {
                        that.pdfzip = new JSZip();
                    }
                    that.audiozip.file(filename, docContent);
                    that.pdfzip.file(filename, docContent);
                }
            }
            this.addAudioToZip = addAudioToZip;

            var getAudioData = function () {
                Log.call(Log.l.trace, "Reporting.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return Reporting.exportAudioDataView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.info, "exportAudioDataView select: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            var results = json.d.results;
                            that.audioIddata(results);
                        }
                        }, function (errorResponse) {
                        Log.print(Log.l.error, "error selecting audiofiles");
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {  });
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.getAudioData = getAudioData;

            var exportContactAudio = function (audioData) {
                AppBar.busy = true;
                for (var i = 0; i < audioData.length; i++) {
                    var audioType = audioData[i].DocExt;
                    var audioDataraw = audioData[i].DocContentDOCCNT1;
                    var audioDataBase64 = audioDataraw;
                    var audioDatac = that.base64ToBlob(audioDataBase64, audioType);
                    var audioName = audioData[i].DateiName;
                    that.addAudioToZip(audioName, audioDatac);
                }
                AppBar.busy = false;
            }
            this.exportContactAudio = exportContactAudio;
            
            var disableReportingList = function(disableFlag) {
                var reportingListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("ReportingList"));
                if (reportingListFragmentControl && 
                    reportingListFragmentControl.controller) {
                    reportingListFragmentControl.controller.disableList(disableFlag);
                }
            }
            this.disableReportingList = disableReportingList;

            var base64ToBlob = function (base64Data, contentType) {
                contentType = contentType || '';
                var sliceSize = 1024;
                var byteCharacters = atob(base64Data);
                var bytesLength = byteCharacters.length;
                var slicesCount = Math.ceil(bytesLength / sliceSize);
                var byteArrays = new Array(slicesCount);

                for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
                    var begin = sliceIndex * sliceSize;
                    var end = Math.min(begin + sliceSize, bytesLength);

                    var bytes = new Array(end - begin);
                    for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
                        bytes[i] = byteCharacters[offset].charCodeAt(0);
                    }
                    byteArrays[sliceIndex] = new Uint8Array(bytes);
                }
                return new Blob(byteArrays, { type: contentType });
            }
            this.base64ToBlob = base64ToBlob;

            var getAudioIdDaten = function () {
                that.audiozip = null;
                that.audioIddata = [];
                that.nextUrl = null;
                that.curaudioIdx = 0;
                var hasRestriction = false;
                var prop = null;
                Log.call(Log.l.trace, "PDFExport.Controller.");
                that.binding.restrictionAudio = that.setRestriction();
                for (prop in that.binding.restrictionAudio) {
                    if (that.binding.restrictionAudio.hasOwnProperty(prop)) {
                        hasRestriction = true;
                        switch (prop) {
                            case "ErfassungsdatumValue":
                            case "RecordDate":
                                that.binding.restrictionAudio["KontaktErfassungsdatum"] = that.binding.restrictionAudio[prop];
                                break;
                            case "Mitarbeiter":
                                that.binding.restrictionAudio["ErfasserName"] = that.binding.restrictionAudio[prop];
                                break;
                            case "Land":
                                that.binding.restrictionAudio["LandName"] = that.binding.restrictionAudio[prop];
                                break;
                            default:
                                that.binding.restrictionAudio[prop] = that.binding.restrictionAudio[prop];
                        }
                    }
                }
                that.showDateRestrictions();
                AppData.setErrorMsg(that.binding);
                if (that.binding.showFilter) {
                var ret = Reporting.exportAudioDataView.select(function (json) {
                        Log.print(Log.l.trace, "exportTemplate: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            var results = json.d.results;
                            that.showProgress(0, "Audiodateien", results.length);
                            // store result for next use
                            that.nextUrl = Reporting.exportAudioDataView.getNextUrl(json);
                            that.audioIddata = json.d.results;
                            that.exportContactAudio(json.d.results);
                        }
                        that.getNextAudioData();
                    },
                        function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        },
                        that.binding.restrictionAudio
                    );
                } else {
                    var ret = Reporting.exportAudioDataView.select(function (json) {
                        Log.print(Log.l.trace, "exportTemplate: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            // store result for next use
                            var results = json.d.results;
                            //that.showProgress(0, "Audiodateien", results.length);
                            that.nextUrl = Reporting.exportAudioDataView.getNextUrl(json);
                            that.audioIddata = json.d.results;
                            that.exportContactAudio(json.d.results);
                        }
                        that.getNextAudioData();
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    },
                        {}
                );
                }

                Log.ret(Log.l.trace);
                return ret;
            }
            this.getAudioIdDaten = getAudioIdDaten;

            var getNextAudioData = function () {
                var ret;
                Log.call(Log.l.trace, "PDFExport.Controller.");
                if (that.nextUrl) {
                    var nextUrl = that.nextUrl;
                    Log.print(Log.l.trace, "nextUrl=%d" + nextUrl);
                    that.nextUrl = null;
                    ret = Reporting.exportAudioDataView.selectNext(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "exportAudioDataView selectNext: success!");
                        // employeeView returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            that.nextUrl = Reporting.exportAudioDataView.getNextUrl(json);
                            that.audioIddata = json.d.results;
                        }
                        that.getNextAudioData();
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        //that.disablePdfExportList(false);
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, that.pdfIddata, nextUrl);
                } else if (++that.curAudioIdx < that.audioIddata.length) {
                    AppData.setErrorMsg(that.binding);
                    var recordId = that.audioIddata[that.curaudioIdx].KontaktNotizVIEWID;
                    Log.print(Log.l.trace, "that.audioIddata[%d" + that.curaudioIdx + "].KontaktNotizVIEWID=" + recordId + " audioIddata.length=" + that.audioIddata.length);
                    ret = Reporting.exportAudioDataView.select(function (json) {
                        Log.print(Log.l.trace, "exportAudioDataView: success!");
                        if (json && json.d) {
                            // store result for next use
                            that.exportContactAudio(json.d.results);
                        }
                        that.getNextAudioData();
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        //that.disablePdfExportList(false);
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, recordId);
                } else if (that.audioIddata.length > 0) {
                    Log.print(Log.l.trace, "collected all, audioIddata.length=" + that.audioIddata.length);
                    /*that.audiozip.generateAsync({
                        blob: true,
                        base64: false,
                        compression: "STORE",
                        type: "blob"
                    }).then(function (blob) {
                        saveAs(blob, "AudioExport.zip");
                        //location.href = "data:application/zip;base64," + pdfData;
                        that.disablePdfExportList(false);
                        //that.binding.progress.show = null;
                    });*/
                    ret = WinJS.Promise.as();
                } else {
                    Log.print(Log.l.trace, "no data");
                    //that.disablePdfExportList(false);
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.getNextAudioData = getNextAudioData;

            var exportData = function(exportselection) {
                Log.call(Log.l.trace, "Reporting.Controller.");
                var dbViewTitle = null;
                var dbView = null;
                var fileName = null;
                var restriction = null;
                var hasRestriction = false;
                var tempRestriction = null;
                var prop = null;
                that.binding.progress.showOther = false;
                // ExportXlsx.restriction = that.getRestriction();
                var exportselectionId = parseInt(exportselection);
                switch (exportselectionId) {
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
                        hasRestriction = false;
                        tempRestriction = that.setRestriction();
                        for (prop in tempRestriction) {
                            if (tempRestriction.hasOwnProperty(prop)) {
                                hasRestriction = true;
                                if (!restriction) {
                                    restriction = {};
                                }
                                switch (prop) {
                                    case "ErfassungsdatumValue":
                                    case "RecordDate":
                                        restriction["Datum"] = tempRestriction[prop];
                                        break;
                                    default:
                                        restriction[prop] = tempRestriction[prop];
                                }
                            }
                        }
                        break;
                    case 10:
                        if (AppData.getLanguageId() === 1031) {
                            dbView = Reporting.xLAuswertungViewNoQuest;
                            dbViewTitle = Reporting.xLAuswertungViewNoQuestTitle;
                            fileName = "KontakteKeineFragen";
                            //restriction["KontaktVIEWID"] = ["<0", ">0"];
                          /*  if (!that.binding.showErfassungsdatum) {
                                restriction.Erfassungsdatum = "NOT NULL";
                            }*/
                        } else {
                            dbView = Reporting.xLReportViewNoQuest;
                            dbViewTitle = Reporting.xLReportViewNoQuestTitle;
                            fileName = "ContactsNoQuestion";
                            //ExportXlsx.restriction.ContactID = [-2,-1];
                            if (!that.binding.showErfassungsdatum) {
                                restriction.RecordDate = "NOT NULL";
                            }
                        }
                        restriction.bUseOr = true;
                        break;

                    case 13:
                        if (AppData.getLanguageId() === 1031) {
                            dbView = Reporting.mitarbeiterHistoDe;
                            fileName = "Mitarbeiterstatistik";
                        } else {
                            dbView = Reporting.mitarbeiterHistoEn;
                            fileName = "Employeestatistics";
                        }
                        hasRestriction = false;
                        tempRestriction = that.setRestriction();
                        for (prop in tempRestriction) {
                            if (tempRestriction.hasOwnProperty(prop)) {
                                hasRestriction = true;
                                if (!restriction) {
                                    restriction = {};
                                }
                                switch (prop) {
                                    case "ErfassungsdatumValue":
                                    case "RecordDate":
                                        restriction["Datum"] = tempRestriction[prop];
                                        break;
                                    default:
                                        restriction[prop] = tempRestriction[prop];
                                }
                            }
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
                        hasRestriction = false;
                        tempRestriction = that.setRestriction();
                        for (prop in tempRestriction) {
                            if (tempRestriction.hasOwnProperty(prop)) {
                                hasRestriction = true;
                                if (!restriction) {
                                    restriction = {};
                                }
                                switch (prop) {
                                    case "Erfassungsdatum":
                                    case "RecordDate":
                                        restriction["ErfassungsdatumValue"] = [null, tempRestriction[prop]]; //[null, tempRestriction[prop]]
                                        break;
                                    case "AenderungsDatum":
                                    case "ModificationDate":
                                        restriction["AenderungsDatumValue"] = [null, tempRestriction[prop]];//[null, tempRestriction[prop]]
                                        break;
                                    default:
                                        restriction[prop] = [null, tempRestriction[prop]];
                                }
                            }
                        }
                        if (hasRestriction) {
                            restriction["KontaktVIEWID"] = ["<0", ">0"];
                            restriction.bAndInEachRow = true;
                            restriction.bExact = true;
                        }
                        break;
                    case 31:
                        if (AppData.getLanguageId() === 1031) {
                            //dbView = Reporting.KontaktPDF;
                            fileName = "KontaktemitPDF";
                        } else {
                            //dbView = Reporting.KontaktPDF;
                            fileName = "ContactswithPDF";
                        }
                        hasRestriction = false;
                        tempRestriction = that.setRestriction();
                        for (prop in tempRestriction) {
                            if (tempRestriction.hasOwnProperty(prop)) {
                                hasRestriction = true;
                                if (!restriction) {
                                    restriction = {};
                                }
                                switch (prop) {
                                case "Erfassungsdatum":
                                case "RecordDate":
                                    restriction["ErfassungsdatumValue"] = [null, tempRestriction[prop]];
                                    break;
                                case "AenderungsDatum":
                                case "ModificationDate":
                                    restriction["AenderungsDatumValue"] = [null, tempRestriction[prop]];
                                    break;
                                default:
                                    restriction[prop] = [null, tempRestriction[prop]];
                                }
                            }
                        }
                        if (hasRestriction) {
                            restriction["KontaktVIEWID"] = ["<0", ">0"];
                            restriction.bAndInEachRow = true;
                            restriction.bExact = true;
                        }
                        break;
                    case 32:
                        if (AppData.getLanguageId() === 1031) {
                            dbView = Reporting.Fragenstatistik;
                            fileName = "Fragenstatistik";
                        } else {
                            dbView = Reporting.FragenstatistikEN;
                            fileName = "Questionstatistics";
                        }
                        that.templatestr = that.binding.templatexlsx;
                        hasRestriction = false;
                        tempRestriction = that.setRestriction();
                        for (prop in tempRestriction) {
                            if (tempRestriction.hasOwnProperty(prop)) {
                                hasRestriction = true;
                                if (!restriction) {
                                    restriction = {};
                                }
                                switch (prop) {
                                case "Erfassungsdatum":
                                case "RecordDate":
                                    restriction["ErfassungsdatumValue"] = [null, tempRestriction[prop]];
                                    break;
                                case "AenderungsDatum":
                                case "ModificationDate":
                                    restriction["AenderungsDatumValue"] = [null, tempRestriction[prop]];
                                    break;
                                default:
                                    restriction[prop] = [null, tempRestriction[prop]];
                                }
                            }
                        }
                        if (hasRestriction) {
                            restriction["KontaktVIEWID"] = ["<0", ">0"];
                            restriction.bAndInEachRow = true;
                            restriction.bExact = true;
                        }
                        break;
                    default:
                        Log.print(Log.l.error, "curOLELetterID=" + that.binding.curOLELetterID + "not supported");
                }
                if (dbView) {
                    //var exporter = ExportXlsx.exporter;
                    //if (!exporter) {
                    var exporter = new ExportXlsx.ExporterClass(that.binding.progress);/*that.binding.progress*/
                    //}
                    //exporter.showProgress(0);
                    //that.disableReportingList(true);
                    if (!restriction) {
                        restriction = that.setRestriction();
                    }
                    if (!restriction) {
                        dbViewTitle = null;
                        restriction = {};
                    }
                    if (dbView) {
                    if (that.binding.showFilter) {
                        exporter.saveXlsxFromView(dbView,
                            fileName,
                            function (result) {
                                that.disableReportingList(false);
                                AppBar.busy = false;
                                AppBar.triggerDisableHandlers();
                            },
                            function (errorResponse) {
                                that.disableReportingList(false);
                                AppData.setErrorMsg(that.binding, errorResponse);
                                AppBar.busy = false;
                                AppBar.triggerDisableHandlers();
                            },
                            restriction,
                            dbViewTitle,
                            that.templatestr);
                    } else {
                            exporter.saveXlsxFromView(dbView,
                                fileName,
                                function(result) {
                        that.disableReportingList(false);
                        AppBar.busy = false;
                        AppBar.triggerDisableHandlers();
                                },
                                function(errorResponse) {
                        that.disableReportingList(false);
                        AppData.setErrorMsg(that.binding, errorResponse);
                        AppBar.busy = false;
                        AppBar.triggerDisableHandlers();
                                },
                                {},
                                dbViewTitle,
                                that.templatestr);
                        }
                    }
                } else {
                    //that.disableReportingList(true);
                    WinJS.Promise.timeout(1000).then(function () {
                        that.getAudioIdDaten();
                    }).then(function () {
                        that.insertExcelFiletoZip();
                    });
                    //disableReportingList(false);
                    AppBar.busy = false;
                    AppBar.triggerDisableHandlers();
                }
                Log.ret(Log.l.trace);
               // return WinJS.Promise.as();
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
                                    for (var i = 0; i < that.resi ; i++) {
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

            var insertExcelFiletoZip = function (event) {
                Log.call(Log.l.trace, "Reporting.Controller.");
                that.binding.progress.showOther = true;
                var exporter = new PDFExportXlsx.ExporterClass();
                var dbView = Reporting.KontaktPDF;
                //var dbViewTitle = PDFExport.xLAuswertungViewNoQuestTitle;
                var fileName = "PDFExcel";
                //if (!that.binding.restrictionPdf) {
                    that.binding.restrictionPdf = {};
                //}
                // rufe setrestriction auf 
                that.binding.restrictionPdf = setRestriction();
                that.binding.restrictionPdf.LandTitle = that.binding.restriction.InitLandID;
                that.binding.restrictionPdf.Erfasser = that.binding.restriction.ErfasserID; // mögliches Problem?!
                /*if (AppData.getLanguageId() === 1031) {
                    that.binding.restrictionPdf.Erfassungsdatum = that.binding.restriction.Erfassungsdatum;  //that.binding.restriction.Erfassungsdatum;.toISOString().substring(0, 10)
                } else {
                    that.binding.restrictionPdf.RecordDate = that.binding.restriction.Erfassungsdatum;
                }*/
                for (var prop in that.binding.restrictionPdf) {
                    if (that.binding.restrictionPdf.hasOwnProperty(prop)) {
                        //hasRestriction = true;
                        /*if (!restriction) {
                            restriction = {};
                        }*/
                        switch (prop) {
                            case "Erfassungsdatum":
                            case "RecordDate":
                                that.binding.restrictionExcel["ErfassungsdatumValue"] = [null, that.binding.restrictionPdf[prop]];
                                break;
                            case "AenderungsDatum":
                            case "ModificationDate":
                                that.binding.restrictionExcel["AenderungsDatumValue"] = [null, that.binding.restrictionPdf[prop]];
                                break;
                            default:
                                that.binding.restrictionExcel[prop] = [null, that.binding.restrictionPdf[prop]];
                        }
                        //that.binding.restrictionExcel["Land"] = that.binding.restrictionPdf.Land;
                        that.binding.restrictionExcel["Land"] = [null, that.binding.restrictionPdf.Land];
                        that.binding.restrictionExcel["Erfasser"] = [null, that.binding.restrictionPdf.Erfasser];
                    }
                }
                //var hasRestriction = false;
                if (that.binding.showFilter || that.binding.restrictionPdf.Erfassungsdatum || that.binding.restrictionPdf.AenderungsDatum || that.binding.restrictionPdf.Land || that.binding.restrictionPdf.Erfasser) {
                    //hasRestriction = true;
                    that.binding.restrictionExcel["KontaktVIEWID"] = ["<0", ">0"];
                    that.binding.restrictionExcel.bAndInEachRow = true;
                    that.binding.restrictionExcel.bExact = true;
                }
                if (that.binding.showFilter) {
                    exporter.saveXlsxFromView(dbView,
                        fileName,
                        function (result) {
                            AppBar.busy = false;
                            AppBar.triggerDisableHandlers();
                            that.xlsxblob = result;
                            that.getPdfIdDaten();
                        },
                        function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                            AppBar.busy = false;
                            AppBar.triggerDisableHandlers();
                            //that.binding.restrictionExcel
                        }, that.binding.restrictionExcel, null, null);
                } else {
                exporter.saveXlsxFromView(dbView, fileName, function (result) {
                    AppBar.busy = false;
                    AppBar.triggerDisableHandlers();
                    that.xlsxblob = result;
                    that.getPdfIdDaten();
                }, function (errorResponse) {
                    AppData.setErrorMsg(that.binding, errorResponse);
                    AppBar.busy = false;
                    AppBar.triggerDisableHandlers();
                    }, {}, null, null);
                }

                Log.ret(Log.l.trace);
            }
            this.insertExcelFiletoZip = insertExcelFiletoZip;

            var getPdfIdDaten = function () {
                /*that.pdfzip = null;*/
                that.pdfIddata =[];
                that.nextUrl = null;
                that.curPdfIdx = -1;
                that.binding.progress.showOther = true;
                Log.call(Log.l.trace, "PDFExport.Controller.");
                var ret;
                //that.binding.restrictionPdf = that.binding.; //that.setRestriction();
                that.showDateRestrictions();
                AppData.setErrorMsg(that.binding);
                if (that.binding.showFilter) {
                    ret = Reporting.contactView.select(function (json) {
                        Log.print(Log.l.trace, "exportTemplate: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            // store result for next use
                            that.nextUrl = Reporting.contactView.getNextUrl(json);
                            that.pdfIddata = json.d.results;
                                that.binding.progress.max = that.pdfIddata.length;
                            }
                        that.getNextPdfData();
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, that.binding.restrictionPdf);
                } else {
                    ret = Reporting.contactView.select(function (json) {
                        Log.print(Log.l.trace, "exportTemplate: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            // store result for next use
                            that.nextUrl = Reporting.contactView.getNextUrl(json);
                            that.pdfIddata = json.d.results;
                                that.binding.progress.max = that.pdfIddata.length;
                            }
                        that.getNextPdfData();
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {});
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.getPdfIdDaten = getPdfIdDaten;

            var getNextPdfData = function () {
                var ret;
                that.binding.progress.show = false;
                that.binding.progress.showOther = true;
                Log.call(Log.l.trace, "PDFExport.Controller.");
                if (that.nextUrl) {
                    var nextUrl = that.nextUrl;
                    Log.print(Log.l.trace, "nextUrl=%d" + nextUrl);
                    that.nextUrl = null;
                    ret = Reporting.contactView.selectNext(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "ExportKontaktDataView selectNext: success!");
                        // employeeView returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            that.nextUrl = Reporting.contactView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                //that.resultConverter(item, that.binding.count);
                                that.pdfIddata.push(item);
                            });
                            that.binding.progress.max = that.pdfIddata.length;
                        }
                        that.getNextPdfData();
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        //that.disablePdfExportList(false);
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, null, nextUrl);
                } else if (++that.curPdfIdx < that.pdfIddata.length) {
                    AppData.setErrorMsg(that.binding);
                    var recordId = that.pdfIddata[that.curPdfIdx].DOC3ExportKontaktDataVIEWID;
                    Log.print(Log.l.trace, "that.pdfIddata[%d" + that.curPdfIdx + "].DOC3ExportKontaktDataVIEWID=" + recordId + " pdfIddata.length=" + that.pdfIddata.length);
                    ret = Reporting.exportKontaktDataView.select(function (json) {
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
                        //that.disablePdfExportList(false);
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, recordId);
                } else if (that.pdfIddata.length >= 0) {
                    Log.print(Log.l.trace, "collected all, pdfIddata.length=" + that.pdfIddata.length);
                    // XLSX Einfügen
                    if (!that.pdfzip) {
                        that.pdfzip = new JSZip();
                    }
                    that.pdfzip.file(that.xlsxfilename, that.xlsxblob);
                    that.pdfzip.generateAsync({
                        blob: true,
                        base64: false,
                        compression: "STORE",
                        type: "blob"
                    }).then(function (blob) {
                        saveAs(blob, "PDFExport.zip");
                        //location.href = "data:application/zip;base64," + pdfData;
                        //that.disablePdfExportList(false);
                        //that.binding.progress.show = null;
                        that.binding.progress.count = that.binding.progress.max;
                    }).then(function() {
                        var reportingListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("ReportingList"));
                        if (reportingListFragmentControl && reportingListFragmentControl.controller) {
                            reportingListFragmentControl.controller.disableList(false);
                        }
                    });
                    ret = WinJS.Promise.as();
                } else {
                    Log.print(Log.l.trace, "no data");
                    var reportingListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("ReportingList"));
                    if (reportingListFragmentControl && reportingListFragmentControl.controller) {
                        reportingListFragmentControl.controller.disableList(false);
                    }
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.getNextPdfData = getNextPdfData;

            var addPdfToZip = function (filename, docContent) {
                if (!that.pdfzip) {
                    that.pdfzip = new JSZip();
                }
                if (filename && docContent) {
                    if (filename === "PDFExcel.xlsx") {
                        var data = b64.toByteArray(docContent);
                        that.pdfzip.file(filename, data);
                    } else {
                        var sub = docContent.search("\r\n\r\n");
                        if (sub > 0) {
                            var data = b64.toByteArray(docContent.substr(sub + 4));
                            that.pdfzip.file(filename, data);
                        } else {
                            that.pdfzip.file(filename, docContent);
                        }
                    }
                }
            }
            this.addPdfToZip = addPdfToZip;

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
                    if (event.currentTarget.id === "clickOk") {
                        AppBar.barControl.opened = true;
                    }
                    if (AppBar.barControl) {
                        AppBar.barControl.open();
                    }
                    Log.ret(Log.l.trace);
                },
                clickExport: function(event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    if (event && event.currentTarget) {
                        that.pdfzip = new JSZip();
                        that.audiozip = new JSZip();
                        that.binding.progress.count = 0;
                        that.binding.progress.max = 0;
                        var exportselection = event.currentTarget.value;
                        that.disableFlag = event.currentTarget.index;
                        AppBar.busy = true;
                        AppBar.triggerDisableHandlers();
                        var reportingListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("ReportingList"));
                        if (reportingListFragmentControl && reportingListFragmentControl.controller) {
                            reportingListFragmentControl.controller.disableList(true);
                        }
                        WinJS.Promise.timeout(0).then(function () {
                            return that.exportData(exportselection);
                        });
                    }
                    Log.ret(Log.l.trace);
                },
                clickExportAudio: function (event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    that.getAudioIdDaten();
                    //that.disablePdfExportList(true);
                    Log.ret(Log.l.trace);
                },
                clickExportAll: function (event) {
                    // Erstmal soll der pdfexport mit excel funktionieren 
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    that.binding.progress.count = 0;
                    that.binding.progress.max = 0;
                    //that.binding.showErfassungsdatum = 1;
                    if (event && event.currentTarget) {
                        var exportselection = event.currentTarget.value;
                        that.disableFlag = event.currentTarget.index;
                        AppBar.busy = true;
                        AppBar.triggerDisableHandlers();
                       // that.disablePdfExportList(true);

                    }

                            WinJS.Promise.timeout(1000).then(function () {
                        that.getAudioIdDaten();
                    }).then(function () {
                                that.insertExcelFiletoZip();
                    }).then(function() {

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
                        that.binding.restriction.Erfassungsdatum = new Date();
                    }
                    that.showDateRestrictions();
                },
                clickModifiedTs: function(event) {
                    if (event.currentTarget) {
                        that.binding.showModifiedTS = event.currentTarget.checked;
                        that.binding.restriction.AenderungsDatum = new Date();
                        that.binding.restriction.KontaktModifiedTS = new Date();
                    }
                    that.showDateRestrictions();
                },
                changeModifiedTS: function(event) {
                    if (event.currentTarget) {
                        that.binding.restriction.ModifiedTs = event.currentTarget.current;
                    }
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "Account.Controller.");
                    AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                },
                clickshowReportingFilter: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    if (event.currentTarget) {
                        var toggle = event.currentTarget.winControl;
                        that.binding.showFilter = toggle.checked;
                    }
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
                clickOk: function() {
                    var ret = true;
                    if (!AppBar.busy) {
                        ret = false;
                    }
                    return ret;
                }
            }

            // if there is still employees to load 
            var getNextData = function () {
                if (that.nextUrl !== null) {
                    that.loading = true;
                    AppData.setErrorMsg(that.binding);
                    Log.print(Log.l.trace, "calling select Search.employeeView...");
                    Reporting.employeeView.selectNext(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "Search.employeeView: success!");
                        var savediD = erfasserID.value;
                        var saveIndex = erfasserID.selectedIndex;
                        // employeeView returns object already parsed from json file in response
                        if (json && json.d) {
                            that.nextUrl = Reporting.employeeView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                                that.binding.count = that.employees.push(item);
                            });
                            if (erfasserID && erfasserID.winControl) {
                                erfasserID.winControl.data = that.employees;
                            }
                        } else {
                            that.nextUrl = null;
                        }

                        for (var i = 0; i < erfasserID.length; i++) {
                            if (erfasserID[i].value === that.binding.restriction.MitarbeiterID) {
                                saveIndex = i;
                            }
                        }
                        //erfasserIDname.selectedIndex = saveIndex; 
                        erfasserID.selectedIndex = saveIndex;
                    },
                        function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            if (progress && progress.style) {
                                progress.style.display = "none";
                            }
                            that.loading = false;
                        },
                        null,
                        that.nextUrl);
                    that.loading = false;
                }
            }
            this.getNextData = getNextData;

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
                                    initLand.value = json.d.results[0];
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
                        initLand.selectedIndex = 0;
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
                                    that.employees.push(item);
                                });
                                if (erfasserID && erfasserID.winControl) {
                                    erfasserID.winControl.data = that.employees;
                                }
                                erfasserID.selectedIndex = 0;
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
                            erfasserID.winControl.data = that.employees;
                        }
                        erfasserID.selectedIndex = 0;
                        //that.binding.mitarbeiterId = Reporting.employeeView.defaultValue.MitarbeiterVIEWID;
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (that.nextUrl !== null) {
                        that.getNextData();
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
                    return Reporting.exportTemplate.select(function (json) {
                        Log.print(Log.l.trace, "exportTemplate: success!");
                        if (json && json.d) {
                            // store result for next use
                            var template = json.d.DocContentDOCCNT1;
                            var sub = template.search("\r\n\r\n");
                            that.binding.templatexlsx = template.substr(sub + 4);
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, 32);
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
                    if (typeof that.binding.restriction.Erfassungsdatum === "undefined" || that.binding.restriction.Erfassungsdatum === null) {
                        //that.binding.restriction.ReportingErfassungsdatum = new Date();
                        that.binding.restriction.Erfassungsdatum = new Date();
                    }
                    // always define date types
                    if (typeof that.binding.restriction.AenderungsDatum === "undefined" || that.binding.restriction.AenderungsDatum === null) {
                        that.binding.restriction.AenderungsDatum = new Date();
                    }
                    if (typeof that.binding.restriction.KontaktModifiedTS === "undefined" || that.binding.restriction.KontaktModifiedTS) {
                        that.binding.restriction.KontaktModifiedTS = new Date();
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
})
    });
})();
