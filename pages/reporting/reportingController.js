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
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.js" />

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
                        MitarbeiterVIEWID: null,
                        INITLandID: null,
                            TITLE: null,
                        Erfassungsdatum: null,
                        showErfassungsdatum: false,
                        AenderungsDatum: null,
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
                    showExportAllExportErfassungsdatum: false, // Stand 22.10 f�r pdf-export/all und audiodaten
                    showModifiedTS: false,
                    showFilter: false,
                    showPdfReportingFilter: false
                }
            ]);

            this.audiozip = null;
            this.audioIddata = [];
            this.nextUrl = null;
            this.nextINITLandUrl = null;
            this.curAudioIdx = 0;
            this.analysis = null;
            this.employees = null;
            this.initLand = null;
            this.templatestr = null;
            this.landHisto = null;
            this.employeeHisto = null;
            this.employeechart = null;
            this.xlsxfilename = "PDFExport.xlsx";
            this.isSupreme = parseInt(AppData._userData.IsSupreme);

            var that = this;

            var initLand = pageElement.querySelector("#InitLandReporting");
            var erfasserID = pageElement.querySelector("#ErfasserIDReporting");
            var erfassungsdatum = pageElement.querySelector("#ReportingExcelErfassungsdatum.win-datepicker");
            var pdfErfassungsdatum = pageElement.querySelector("#ReportingPDFErfassungsdatum.win-datepicker");
            var modifiedTs = pageElement.querySelector("#ModifiedTs.win-datepicker");
            var pdfZipDownload = pageElement.querySelector(".pdfZipDownload");
            var pdfZipDownloadData = pageElement.querySelector(".pdfZipDownloadData");
            var collapsibleDiv = pageElement.querySelector("#collapsibleDiv");
            var content = pageElement.querySelector(".content");
            var selectedValues = pageElement.querySelector("#selectedValues");
            var selectedErfassungsdatum = pageElement.querySelector("#selectedErfassungsdatum");
            var selectedModifiedTs = pageElement.querySelector("#selectedModifiedTs");
            var selectedLand = pageElement.querySelector("#selectedLand");
            var selectedErfasser = pageElement.querySelector("#selectedErfasser");

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

            /*var landRefSearch = function (landId) {
                Log.call(Log.l.trace, "Reporting.Controller.");
                for (var i = 0; i < landRef.length; i++) {
                    var initLand = that.initLand.getAt(i);
                    if (initLand.INITLandID === landId) {
                        selectedLand.textContent = getResourceText("reporting.entrydatelabel") + initLand.TITLE;
                    }
                }
                Log.ret(Log.l.trace, landId);
            }
            this.landRefSearch = landRefSearch;*/

            var showDate = function(date) {
                Log.call(Log.l.trace, "Reporting.Controller.");
                var showDate = moment(date).format('DD.MM.YYYY');
                Log.ret(Log.l.trace, showDate);
                return showDate;
            }
            this.showDate = showDate;

            var getEventId = function () {
                var eventId = null;
                Log.call(Log.l.trace, "Reporting.Controller.");
                var master = Application.navigator.masterControl;
                if (master && master.controller) {
                    eventId = master.controller.binding.eventId;
                } else {
                    eventId = AppData.getRecordId("Veranstaltung");
                }
                Log.ret(Log.l.trace, eventId);
                return eventId;
            }
            this.getEventId = getEventId;

            var langSet = function () {
                Log.call(Log.l.trace, "DiaIndustries.Controller.");
                var lang = AppData.getLanguageId();
                if (lang === 1031) {
                    return 1031;
                } else {
                    return 1033;
                }
            }
            this.langSet = langSet;

            var setpdfZipDownloadData = function (aktiv, data) {
                Log.call(Log.l.trace, "Reporting.Controller.");
                if (aktiv) {
                    pdfZipDownload.style.display = "flex";
                    pdfZipDownloadData.href = data;
                } else {
                    pdfZipDownload.style.display = "none";
                    pdfZipDownloadData.href = "";
                }
            }
            this.setpdfZipDownloadData = setpdfZipDownloadData;

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

            var resultConverter = function (item, index) {
                item.index = index;
                item.fullName = item.EmployeeName;
                item.fullNameValue = item.EmployeeName;
            }
            this.resultConverter = resultConverter;

            var title = function (t) {
                return getResourceText(t);
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

            var restrictionDate = function (date) {
                if (date !== "null") {
                    return moment(date).format('YYYY-MM-DD');
                }

            }
            this.restrictionDate = restrictionDate;

            var showDateRestrictions = function () {
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
                var ret = WinJS.Promise.as().then(function () {
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
                        typeof that.binding.restriction.AenderungsDatum === "undefined") {
                        that.binding.restriction.AenderungsDatum = new Date();
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
                if (that.binding.restriction.INITLandID === "null" || that.binding.restriction.INITLandID === "0") {
                    that.binding.restriction.INITLandID = null;
                }
                reportingRestriction.Land = that.binding.restriction.INITLandID ? that.binding.restriction.INITLandID : null;
                if (that.binding.restriction.MitarbeiterVIEWID === "null") {
                    that.binding.restriction.MitarbeiterVIEWID = null;
                }
                reportingRestriction.Mitarbeiter = that.binding.restriction.MitarbeiterVIEWID ? that.binding.restriction.MitarbeiterVIEWID : null;
                if (that.binding.showErfassungsdatum && that.binding.restriction.Erfassungsdatum) {
                    reportingRestriction.Erfassungsdatum = that.binding.restriction.Erfassungsdatum;
                    reportingRestriction.ErfassungsdatumValue = that.binding.restriction.Erfassungsdatum;
                } else {
                    reportingRestriction.Erfassungsdatum = "null";
                    reportingRestriction.ErfassungsdatumValue = null;
                }
                if (that.binding.showModifiedTS && that.binding.restriction.AenderungsDatum) {
                    reportingRestriction.AenderungsDatumValue = that.binding.restriction.AenderungsDatum;
                    reportingRestriction.AenderungsDatum = that.binding.restriction.AenderungsDatum;
                    reportingRestriction.KontaktModifiedTS = that.binding.restriction.AenderungsDatum;
                } else {
                    reportingRestriction.AenderungsDatumValue = null;
                    reportingRestriction.AenderungsDatum = "null";
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
                    }, {});
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

            var disableReportingList = function (disableFlag) {
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
                            //that.binding.restrictionAudio[prop] = that.binding.restrictionAudio[prop];
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

            var showDashboardLoadingText = function (show) {
                var dashboardloadingcontainer = pageElement.querySelector(".dashboardloadingtext");
                if (show === false) {
                    dashboardloadingcontainer.style.display = "none";
                } else {
                    dashboardloadingcontainer.style.display = "block";
                }
            }
            this.showDashboardLoadingText = showDashboardLoadingText;

            var exportDbExcel = function (recordId) {
                Log.call(Log.l.trace, "Reporting.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                if (recordId) {
                    AppBar.busy = true;
                    ret = Reporting.DOC3ExportPDFView.select(function (json) {
                        Log.print(Log.l.trace, "exportKontaktDataView: success!");
                        if (json && json.d && json.d.results.length > 0) {
                            var results = json.d.results[0];
                            var excelDataraw = results.DocContentDOCCNT1;
                            var sub = excelDataraw.search("\r\n\r\n");
                            var excelDataBase64 = excelDataraw.substr(sub + 4);
                            var excelData = that.base64ToBlob(excelDataBase64, "xlsx");
                            var excelName = results.szOriFileNameDOC1;
                            saveAs(excelData, excelName);
                            that.disableReportingList(false);
                            that.showDashboardLoadingText(false);
                            AppBar.busy = false;
                            that.loadData();
                        } else {
                            Log.print(Log.l.error, "call error result of DOC3ExportPDFView is null");
                            that.disableReportingList(false);
                            that.showDashboardLoadingText(false);
                            var errorResponse = {
                                status: 204,
                                statusText: getResourceText("reporting.noFileAvailable")
                            };
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (typeof error === "function") {
                            error(errorResponse);
                        }
                    }, { DOC3ExportPDFVIEWID: recordId });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.exportDbExcel = exportDbExcel;

            var exportPdfExcelZip = function (recordId) {
                Log.call(Log.l.trace, "Reporting.Controller.");
                pdfZipDownload.style.display = "none";
                AppData.setErrorMsg(that.binding);
                var ret;
                if (recordId) {
                    AppBar.busy = true;
                    ret = Reporting.ExportPDFView.select(function (json) {
                        Log.print(Log.l.trace, "ExportPDFViewView: success!");
                        if (json && json.d) {
                            var results = json.d.results[0];
                            if (!results.DownloadLink) {
                                setTimeout(function () {
                                    console.log("Function called after 15 seconds.");
                                    exportPdfExcelZip(results.ExportPDFVIEWID); // Call itself to repeat after 15 seconds
                                }, 15000);
                            } else {
                                that.setpdfZipDownloadData(true, results.DownloadLink);
                                that.disableReportingList(false);
                                that.showDashboardLoadingText(false);
                                AppBar.busy = false;
                                that.loadData();
                            }
                        }
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (typeof error === "function") {
                            error(errorResponse);
                        }
                    }, { ExportPDFVIEWID: recordId });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.exportPdfExcelZip = exportPdfExcelZip;

            var exportDataPanel = function (fileName) {
                Log.call(Log.l.trace, "Reporting.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                if (fileName) {
                    AppBar.busy = true;
                    ret = Reporting.exportPDFPanelView.select(function (json) {
                        Log.print(Log.l.trace, "exportKontaktDataView: success!");
                        if (json && json.d && json.d.results.length > 0) {
                            var results = json.d.results[0];
                            if (results.DownloadFlag) {
                                location.href = results.DownloadLink;
                                AppBar.busy = false;
                            } else {
                                var excelDataraw = results.FileData;
                                var sub = excelDataraw.search("\r\n\r\n");
                                var excelDataBase64 = excelDataraw.substr(sub + 4);
                                var excelData = that.base64ToBlob(excelDataBase64, results.FileType);
                                var excelName = results.FileName;
                                saveAs(excelData, excelName);
                                AppBar.busy = false;
                            }
                        } else {
                            Log.print(Log.l.error, "call error result of exportPDFPanelView is null");
                            var errorResponse = {
                                status: 204,
                                statusText: getResourceText("reporting.noFileAvailable")
                            };
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (typeof error === "function") {
                            error(errorResponse);
                        }
                        }, { FileName: fileName });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.exportDataPanel = exportDataPanel;

            var exportData = function (exportselection) {
                Log.call(Log.l.trace, "Reporting.Controller.");
                that.binding.progress.showOther = false;
                var reportingRestriction = that.setRestriction();
                // ExportXlsx.restriction = that.getRestriction();
                if (reportingRestriction.Land === null) {
                    reportingRestriction.Land = "0";
                }
                var evId = that.getEventId();
                var exportselectionId = exportselection;
                if (exportselectionId) {
                    AppData.setErrorMsg(that.binding);
                    that.showDashboardLoadingText(true);
                    return AppData.call("PRC_ExcelRequest", {
                        pRecordID: parseInt(that.getEventId()),
                        pLanguageSpecID: that.langSet(),
                        pExportType: exportselectionId,
                        pFilterCreateDate: that.restrictionDate(reportingRestriction.Erfassungsdatum), // YYYY - MM - DD
                        pFilterModDate: that.restrictionDate(reportingRestriction.AenderungsDatum),
                        pFilterLandID: reportingRestriction.Land,
                        pFilterErfasserID: reportingRestriction.Mitarbeiter,
                        psyncRun: 1
                    }, function (json) {
                        Log.print(Log.l.info, "call success!");
                        if (that.binding.restriction.INITLandID === null)
                            that.binding.restriction.INITLandID = 0;
                        /*if (that.binding.restriction.INITLandID &&
                            typeof that.binding.restriction.INITLandID === "string") {
                            that.binding.restriction.INITLandID = parseInt(that.binding.restriction.INITLandID);
                        } else {
                            that.binding.restriction.INITLandID = null;
                        }
                        if (that.binding.restriction.MitarbeiterVIEWID &&
                            typeof that.binding.restriction.MitarbeiterVIEWID === "string") {
                            that.binding.restriction.MitarbeiterVIEWID =
                                parseInt(that.binding.restriction.MitarbeiterVIEWID);
                        } else {
                            that.binding.restriction.MitarbeiterVIEWID = null;
                        }*/
                        if (json && json.d.results[0].DOC3ExportPdfID && json.d.results[0].DownloadFlag === 0) {
                            that.exportDbExcel(json.d.results[0].DOC3ExportPdfID);
                        } else if (json && json.d.results[0].DOC3ExportPdfID && json.d.results[0].DownloadFlag === 1) {
                            that.exportPdfExcelZip(json.d.results[0].DOC3ExportPdfID);
                        } else {
                            Log.print(Log.l.error, "call error DOC3ExportPDFID is null");
                            that.disableReportingList(false);
                            that.showDashboardLoadingText(false);
                            var errorResponse = {
                                status: 204,
                                statusText: getResourceText("reporting.noFileAvailable")
                            };
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }
                    }, function (error) {

                        Log.print(Log.l.error, "call error");
                        that.showDashboardLoadingText(false);
                    });
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
            var clickCountrySlice = function (event, index) {
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
                                    for (var i = 0; i < that.resi; i++) {
                                        if (that.res[i].TITLE === that.country) {
                                            that.countryID = that.res[i].INITLandID;
                                        }
                                    }
                                }
                                that.binding.restriction.INITLandID = that.countryID;
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
                var fileName = "PDFExcel";
                that.binding.restrictionPdf = {};
                that.binding.restrictionExcel = {};
                // rufe setrestriction auf 
                that.binding.restrictionPdf = setRestriction();
                that.binding.restrictionPdf.LandTitle = that.binding.restriction.InitLandID ? that.binding.restriction.InitLandID : null;
                that.binding.restrictionPdf.Erfasser = that.binding.restriction.ErfasserID; // m�gliches Problem?!
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
                            //that.binding.restrictionExcel[prop] = [null, that.binding.restrictionPdf[prop]];
                        }
                        //that.binding.restrictionExcel["Land"] = that.binding.restrictionPdf.Land;
                        that.binding.restrictionExcel["Land"] = [null, that.binding.restrictionPdf.Land];
                        // anstatt Erfasser ->Mitarbeiter (NUR in Excel)
                        that.binding.restrictionExcel["Mitarbeiter"] = [null, that.binding.restrictionPdf.Erfasser];
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
                that.pdfIddata = [];
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
                    // XLSX Einf�gen
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
                    }).then(function () {
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

            var resetFilters = function () {
                Log.call(Log.l.trace, "PDFExport.Controller.");
                if (erfassungsdatum) {
                    erfassungsdatum.current = null;
                }
                if (modifiedTs) {
                    modifiedTs.current = null;
                }
                if (initLand) {
                    initLand.dataSource = [];
                }
                if (erfasserID) {
                    erfasserID.dataSource = [];
                }
                selectedErfassungsdatum.style.display = "none";
                selectedModifiedTs.style.display = "none";
                selectedLand.style.display = "none";
                selectedErfasser.style.display = "none";
                Log.ret(Log.l.trace);
            }
            this.resetFilters = resetFilters;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickReportingPanel: function(event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    var repId = event.currentTarget.value;
                    if (repId) {
                        that.exportDataPanel(repId);
                    } else {
                        Log.print(Log.l.trace, "repId: not found!");
                    }
                    Log.ret(Log.l.trace);
                },
                onClickFilters: function(event) {
                    if (content.style.maxHeight) {
                        content.style.maxHeight = null;
                        collapsibleDiv.textContent = getResourceText("reporting.filterup");
                        collapsibleDiv.appendChild(selectedValues); // Keep selected values visible
                    } else {
                        that.binding.restriction.INITLandID = "-1";
                        content.style.maxHeight = content.scrollHeight + "px";
                        collapsibleDiv.textContent = getResourceText("reporting.filterdown");
                        collapsibleDiv.appendChild(selectedValues); // Keep selected values visible
                    }
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    if (event.currentTarget.id === "clickOk") {
                        AppBar.barControl.opened = true;
                    }
                    if (AppBar.barControl) {
                        AppBar.barControl.open();
                    }
                    Log.ret(Log.l.trace);
                },
                clickExport: function (event) {
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
                    }).then(function () {

                    });
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickErfassungsdatum: function (event) {
                    if (event.currentTarget) {
                        that.binding.showErfassungsdatum = event.currentTarget.checked;
                        that.binding.restriction.Erfassungsdatum = new Date();
                        selectedErfassungsdatum.textContent = getResourceText("reporting.entrydatelabel") + that.showDate(new Date());
                    }
                    if (!event.currentTarget.checked) {
                        selectedErfassungsdatum.style.display = "none";
                    } else {
                        selectedErfassungsdatum.style.display = "block";
                    }
                    that.showDateRestrictions();
                },
                clickModifiedTs: function (event) {
                    if (event.currentTarget) {
                        that.binding.showModifiedTS = event.currentTarget.checked;
                        that.binding.restriction.AenderungsDatum = new Date();
                        that.binding.restriction.KontaktModifiedTS = new Date();
                        selectedModifiedTs.textContent = getResourceText("reporting.changedatelabel") + that.showDate(new Date());
                    }
                    if (!event.currentTarget.checked) {
                        selectedModifiedTs.style.display = "none";
                    } else {
                        selectedModifiedTs.style.display = "block";
                    }
                    that.showDateRestrictions();
                },
                changeErfassungsDatum: function (event) {
                    if (event.currentTarget) {
                        var eid = erfassungsdatum.winControl.current;
                        selectedErfassungsdatum.textContent = getResourceText("reporting.entrydatelabel") + that.showDate(eid);
                    }
                },
                changeModifiedTS: function (event) {
                    if (event.currentTarget) {
                        var mid = modifiedTs.winControl.current;
                        selectedModifiedTs.textContent = getResourceText("reporting.changedatelabel") + that.showDate(mid);
                    }
                },
                changeLand: function(event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    for (var i = 0; i < that.initLand.length; i++) {
                        var initLand = that.initLand.getAt(i);
                        if (event.currentTarget.value !== "0") {
                            if (initLand.INITLandID === parseInt(event.currentTarget.value)) {
                                selectedLand.textContent = getResourceText("reporting.countrylabel") + initLand.TITLE;
                                selectedLand.style.display = "block";
                            }
                        } else {
                            selectedLand.style.display = "none";
                        }
                    }
                    Log.ret(Log.l.trace, event.currentTarget.value);
                },
                changeMitarbeiter: function (event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    for (var i = 0; i < that.employees.length; i++) {
                        var employee = that.employees.getAt(i);
                        if (event.currentTarget.value !== "undefined") {
                            if (employee.EmployeeID === parseInt(event.currentTarget.value)) {
                                selectedErfasser.textContent = getResourceText("reporting.employeelabel") + employee.EmployeeName;
                                selectedErfasser.style.display = "block";
                            }
                        } else {
                            selectedErfasser.style.display = "none";
                        }
                    }
                    Log.ret(Log.l.trace, event.currentTarget.value);
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
                        if (!that.binding.showFilter) {
                            that.binding.restriction.INITLandID = "-1";
                            that.binding.restriction.MitarbeiterVIEWID = null;
                            that.binding.restriction.Erfassungsdatum = "null";
                            that.binding.restriction.ErfassungsdatumValue = null;
                            that.binding.restriction.AenderungsDatumValue = null;
                            that.binding.restriction.AenderungsDatum = "null";
                            that.binding.restriction.KontaktModifiedTS = null;
                            selectedErfassungsdatum.style.display = "none";
                            selectedModifiedTs.style.display = "none";
                            selectedLand.style.display = "none";
                            selectedErfasser.style.display = "none";
                        }
                    }
                    Log.ret(Log.l.trace);
                }
            };
            if (collapsibleDiv) {
                this.addRemovableEventListener(collapsibleDiv, "click", this.eventHandlers.onClickFilters.bind(this));
            }
            if (erfassungsdatum) {
                this.addRemovableEventListener(erfassungsdatum, "change", this.eventHandlers.changeErfassungsDatum.bind(this));
            }
            if (modifiedTs) {
                this.addRemovableEventListener(modifiedTs, "change", this.eventHandlers.changeModifiedTS.bind(this));
            }
            if (initLand) {
                this.addRemovableEventListener(initLand, "change", this.eventHandlers.changeLand.bind(this));
            }
            if (erfasserID) {
                this.addRemovableEventListener(erfasserID, "change", this.eventHandlers.changeMitarbeiter.bind(this));
            }

            this.disableHandlers = {
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickOk: function () {
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
                            if (that.nextUrl) {
                                that.getNextData();
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

            var getNextINITLandData = function () {
                Log.call(Log.l.trace, "Reporting.Controller.");
                if (that.nextINITLandUrl !== null) {
                    that.loading = true;
                    AppData.setErrorMsg(that.binding);
                    Log.print(Log.l.trace, "calling select Search.employeeView...");
                    Reporting.initLandView.selectNext(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "Search.employeeView: success!");
                        var savediD = initLand.value;
                        var saveIndex = initLand.selectedIndex;
                        // employeeView returns object already parsed from json file in response
                        if (json && json.d) {
                            that.nextINITLandUrl = Reporting.initLandView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                                that.binding.count = that.initLand.push(item);
                            });
                            if (initLand && initLand.winControl) {
                                initLand.winControl.data = that.initLand;
                            }
                            if (that.nextINITLandUrl) {
                                that.getNextINITLandData();
                            }
                        } else {
                            that.nextUrl = null;
                        }

                        for (var i = 0; i < initLand.length; i++) {
                            if (initLand[i].value === that.binding.restriction.INITLandID) {
                                saveIndex = i;
                            }
                        }
                        //erfasserIDname.selectedIndex = saveIndex; 
                        initLand.selectedIndex = saveIndex;
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (progress && progress.style) {
                            progress.style.display = "none";
                        }
                        that.loading = false;
                    },
                        null,
                        that.nextINITLandUrl);
                    that.loading = false;
                }
                Log.ret(Log.l.trace);
            }
            this.getNextINITLandData = getNextINITLandData;

            var loadData = function (eventId) {
                Log.call(Log.l.trace, "Reporting.Controller.");
                AppData.setErrorMsg(that.binding);
                that.resetFilters();
                var recordId = eventId;
                if (!recordId) {
                    recordId = that.getEventId();
                }
                var ret = new WinJS.Promise.as().then(function () {
                    var reportingListFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("reportingList"));
                    if (reportingListFragmentControl && reportingListFragmentControl.controller) {
                        return reportingListFragmentControl.controller.loadData(recordId);
                    } else {
                        var parentElement = pageElement.querySelector("#reportingListhost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "reportingList", { eventId: recordId });
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    var exportPanelsFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("reportingPanels"));
                    if (exportPanelsFragmentControl && exportPanelsFragmentControl.controller) {
                        return exportPanelsFragmentControl.controller.loadData({ VeranstaltungID: recordId, LanguageSpecID: AppData.getLanguageId(), LoginName: AppData._userData.Login });
                    } else {
                        var parentElement = pageElement.querySelector("#exportPanelsthost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "reportingPanels");
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    if (recordId) {
                        Log.print(Log.l.trace, "calling select initLandData...");
                        //@nedra:25.09.2015: load the list of INITLand for Combobox
                        return Reporting.initLandView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "initLandView: success!");
                            //Reporting.initLandView.defaultValue
                            that.initLand = new WinJS.Binding.List([]);
                            if (json && json.d && json.d.results) {
                                //that.nextINITLandUrl = Reporting.initLandView.getNextUrl(json);
                                var results = json.d.results;
                                // Now, we call WinJS.Binding.List to get the bindable list
                                /*if (initLand && initLand.winControl) {
                                    initLand.winControl.data = new WinJS.Binding.List(json.d.results);
                                }*/
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                    that.initLand.push(item);
                                });
                                if (initLand && initLand.winControl) {
                                    initLand.winControl.data = that.initLand;
                                }
                                initLand.selectedIndex = 0;
                                that.binding.restriction.INITLandID = "-1";
                            }
                        },
                            function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, {
                                VeranstaltungID: recordId,
                                LanguageSpecID: AppData.getLanguageId()
                            });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        return Reporting.employeeView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "Reporting: success!");
                            // employeeView returns object already parsed from json file in response
                            that.employees = new WinJS.Binding.List([Reporting.employeeView.defaultValue]);
                            if (json && json.d) {
                                that.nextUrl = Reporting.employeeView.getNextUrl(json);
                                var results = json.d.results;
                                results.forEach(function (item, index) {
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
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, {
                                VeranstaltungID: recordId
                            });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (that.nextINITLandUrl) {
                        that.getNextINITLandData();
                    }
                    if (that.nextUrl) {
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
            that.processAll().then(function () {
                //reset filter if showFilter false - m�glicherwei�e unn�tig (siehe Zeile 32) workaround 11.11.2023
                if (!that.binding.showFilter) {
                    that.binding.restriction.INITLandID = null;
                    that.binding.restriction.MitarbeiterVIEWID = null;
                    that.binding.restriction.Erfassungsdatum = "null";
                    that.binding.restriction.ErfassungsdatumValue = null;
                    that.binding.restriction.AenderungsDatumValue = null;
                    that.binding.restriction.AenderungsDatum = "null";
                    that.binding.restriction.KontaktModifiedTS = null;
                }
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.setpdfZipDownloadData(false);
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                return that.loadData();
            });
            Log.ret(Log.l.trace);
        })
    });
})();
