// controller for page: siteEventsBenNachs
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/siteeventsImport/siteeventsImportService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("SiteeventsImport", {
        Controller: WinJS.Class.derive(Application.Controller,
            function Controller(pageElement, commandList) {
                Log.call(Log.l.trace, "SiteeventsImport.Controller.");
                Application.Controller.apply(this,
                    [pageElement, {
                        newFileID: getEmptyDefaultValue(SiteeventsImport.importfileView.defaultValue),
                        newFileData: getEmptyDefaultValue(SiteeventsImport.doc3import_file.defaultValue),
                        dataSiteeventsImportHeaderValue: getEmptyDefaultValue(SiteeventsImport.Import_FileVIEW.defaultValue),
                        dataSiteeventsImportHeaderText: getEmptyDefaultValue(SiteeventsImport.Import_FileVIEW.defaultValue)
            }, commandList]);

                var that = this;
                
                var fileinputbox = pageElement.querySelector(".fileinputbox");
                var inputbox = pageElement.querySelector("#myFile");
                var inputmsg = pageElement.querySelector("#inputmsg");

                /**Table */
                var tableHeader = pageElement.querySelector(".table-header");
                var tableBody = pageElement.querySelector(".table-body");
                var progress = null;
                var counter = null;

                var setInitialHeaderTextValue = function () {
                    Log.print(Log.l.trace, "Setting up initial header texts and value shown in header of table");
                    //text part
                    that.binding.dataSiteeventsImportHeaderText.Import_Title = getResourceText("siteeventsimport.filename");
                    that.binding.dataSiteeventsImportHeaderText.Erfasser = getResourceText("siteeventsimport.creator");
                    that.binding.dataSiteeventsImportHeaderText.Erfasstam = getResourceText("siteeventsimport.timeofupload");
                    that.binding.dataSiteeventsImportHeaderText.Startts = getResourceText("siteeventsimport.startofimport");
                    that.binding.dataSiteeventsImportHeaderText.Endts = getResourceText("siteeventsimport.endofupload");
                    that.binding.dataSiteeventsImportHeaderText.INITImportstatusID = getResourceText("siteeventsimport.generalstatus");
                    that.binding.dataSiteeventsImportHeaderText.NumFailedLines = getResourceText("siteeventsimport.numberoflineswitherror");
                    that.binding.dataSiteeventsImportHeaderText.NumOKLines = getResourceText("siteeventsimport.numberoflineswithouterror");
                    //value part
                    that.binding.dataSiteeventsImportHeaderValue.Import_Title = 1; //32
                    that.binding.dataSiteeventsImportHeaderValue.Erfasser = 2;
                    that.binding.dataSiteeventsImportHeaderValue.Erfasstam = 3;// 35
                    that.binding.dataSiteeventsImportHeaderValue.Startts = 4;
                    that.binding.dataSiteeventsImportHeaderValue.Endts = 5;
                    that.binding.dataSiteeventsImportHeaderValue.INITImportstatusID = 6;
                    that.binding.dataSiteeventsImportHeaderValue.NumFailedLines = 7;
                    that.binding.dataSiteeventsImportHeaderValue.NumOKLines = 8;
                }
                this.setInitialHeaderTextValue = setInitialHeaderTextValue;

                var setCellTitle = function () {
                    Log.print(Log.l.trace, "Setting up initial Title of the cells!");
                    var cells = pageElement.querySelectorAll("td");
                    for (var i = 0; i < cells.length; i++) {
                        if (cells[i].title === "1") {
                            cells[i].title = getResourceText("siteeventsimport.filename");
                        }
                        if (cells[i].title === "2") {
                            cells[i].title = getResourceText("siteeventsimport.creator");
                        }
                        if (cells[i].title === "3") {
                            cells[i].title = getResourceText("siteeventsimport.timeofupload");
                        }
                        if (cells[i].title === "4") {
                            cells[i].title = getResourceText("siteeventsimport.startofimport");
                        }
                        if (cells[i].title === "5") {
                            cells[i].title = getResourceText("siteeventsimport.endofupload");
                        }
                        if (cells[i].title === "6") {
                            cells[i].title = getResourceText("siteeventsimport.generalstatus");
                        }
                        if (cells[i].title === "7") {
                            cells[i].title = getResourceText("siteeventsimport.numberoflineswitherror");
                        }
                        if (cells[i].title === "8") {
                            cells[i].title = getResourceText("siteeventsimport.numberoflineswithouterror");
                        }
                    }
                }
                this.setCellTitle = setCellTitle;

                var getDateObject = function (dateData) {
                    var ret;
                    if (dateData) {
                        var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                        var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                        if (AppData.getLanguageId() === 1031) {
                            moment().locale("de");
                            ret = moment(milliseconds).utc().format("DD.MM.YYYY HH:mm");//new Date(milliseconds).toLocaleTimeString().slice(0, -3);
                        } else {
                            moment().locale("en");
                            ret = moment(milliseconds).utc().format("DD/MM/YYYY HH:mm");//new Date(milliseconds).toLocaleTimeString().slice(0, -3);
                        }
                        //.toLocaleString('de-DE').substr(0, 10);
                    } else {
                        ret = "";
                    }
                    return ret;
                };
                this.getDateObject = getDateObject;

                var checkId = function () {
                    if (that.vidID) {
                        fileinputbox.style.display = "block";
                    } else {
                        fileinputbox.style.display = "none";
                    }
                }
                this.checkId = checkId;

                var showMessage = function (msgText) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    if (msgText === true) {
                        inputmsg.textContent = getResourceText("siteevents.successmsg");
                    } else if (msgText === false) {
                        inputmsg.textContent = getResourceText("siteevents.errormsg");
                    } else {
                        inputmsg.textContent = "";
                    }
                    Log.call(Log.l.trace, "Contact.Controller.");
                }
                this.showMessage = showMessage;

                var createCsvString = function (id) {
                    var tabId = id.split(",").pop();

                    var csvpart1 = "Content-Type: text/csv \r\n";
                    var csvpart2 = "Content-Length: " + that.imageLength + "\r\n" + "\r\n";
                    var csvpart3 = tabId;

                    return csvpart1 + csvpart2 + csvpart3;
                }
                this.createCsvString = createCsvString;

                var getCsvData = function (fileUploadId) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    var newFileUploadData = that.binding.newFileData;
                    //Data for .csv
                    newFileUploadData.DOC3Import_FileVIEWID = fileUploadId;
                    newFileUploadData.wFormat = 4004;
                    newFileUploadData.szOriFileNameDOC1 = that.imageName;
                    newFileUploadData.DocContentDOCCNT1 = that.imageData;
                    newFileUploadData.ContentEncoding = 4096;
                    return newFileUploadData;
                }
                this.getCsvData = getCsvData;

                var uploadCsvData = function (newFileUploadData) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    newFileUploadData.DocContentDOCCNT1 = that.createCsvString(newFileUploadData.DocContentDOCCNT1);
                    AppBar.busy = true;
                    var ret = SiteeventsImport.doc3import_file.insert(function (json) {
                        AppBar.busy = false;
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.info, "doc3import_file insert: success!");
                        // doc3import_file returns object already parsed from json file in response
                        if (json && json.d) {
                            Log.print(Log.l.info, "doc3import_file insert: success!");
                            that.showMessage(true);
                            that.loadData();
                        }
                        AppBar.modified = true;
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error inserting csv");
                        that.showMessage(false);
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    },
                        newFileUploadData);
                    return ret;
                }
                this.uploadCsvData = uploadCsvData;

                var uploadCsv = function (newFileUploadId) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    AppBar.busy = true;
                    var ret = SiteeventsImport.importfileView.insert(function (json) {
                        AppBar.busy = false;
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.info, "importfileView insert: success!");
                        // importfileView returns object already parsed from json file in response
                        if (json && json.d) {
                            Log.print(Log.l.info, "importfileView insert: success!");
                            var importFileViewId = json.d.Import_FileVIEWID;
                            var newFileUploadData = that.getCsvData(importFileViewId);
                            that.uploadCsvData(newFileUploadData);
                        }
                        AppBar.modified = true;
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error inserting csv");
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    },
                        newFileUploadId);
                    return ret;
                }
                this.uploadCsv = uploadCsv;

                var resultConverter = function (item, index) {
                    item.index = index;
                    if (item.Erfasstam) {
                        item.Erfasstam = that.getDateObject(item.Erfasstam);
                    }
                    if (item.Startts) {
                        item.Startts = that.getDateObject(item.Startts);
                    }
                    if (item.Endts) {
                        item.Endts = that.getDateObject(item.Endts);
                    }
                }
                this.resultConverter = resultConverter;

                // define handlers
                this.eventHandlers = {
                    clickBack: function(event) {
                        Log.call(Log.l.trace, "SiteeventsImport.Controller.");
                        if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                            WinJS.Navigation.back(1).done();
                        }
                        Log.ret(Log.l.trace);
                    },
                    clickUploadCsv: function(event) {
                        Log.call(Log.l.trace, "SiteEvents.Controller.");
                        var files = pageElement.querySelector("#myFile").files;
                        if (files[0].name.match(/\.(csv)/g) != null) {
                            var newFileUploadId = that.binding.newFileID;
                            newFileUploadId.INITImportfiletypeID = 1;
                            newFileUploadId.Import_Title = files[0].name;
                            newFileUploadId.EventID = that.vidID;
                            that.imageName = files[0].name;
                            that.imageLength = files[0].size;
                            if (files && files[0]) {
                                var reader = new FileReader();
                                reader.addEventListener(
                                    "load",
                                    function () {
                                        that.imageData = reader.result;
                                        Log.call(Log.l.trace, "SiteEvents.Controller.");
                                        that.uploadCsv(newFileUploadId);
                                    });
                                reader.readAsDataURL(files[0]);
                                Log.call(Log.l.trace, "SiteEvents.Controller.");
                            }
                        } else {
                            alert('Wrong file extension! File input is cleared.');
                            inputbox.value = null;
                        }
                    },
                    clickChangeUserState: function(event) {
                        Log.call(Log.l.trace, "SiteeventsImport.Controller.");
                        Application.navigateById("userinfo", event);
                        Log.ret(Log.l.trace);
                    },
                    clickGotoPublish: function(event) {
                        Log.call(Log.l.trace, "SiteeventsImport.Controller.");
                        Application.navigateById("publish", event);
                        Log.ret(Log.l.trace);
                    },
                    clickTopButton: function(event) {
                        Log.call(Log.l.trace, "SiteeventsImport.Controller.");
                        var anchor = document.getElementById("menuButton");
                        var menu = document.getElementById("menu1").winControl;
                        var placement = "bottom";
                        menu.show(anchor, placement);
                        Log.ret(Log.l.trace);
                    },
                    clickLogoff: function(event) {
                        Log.call(Log.l.trace, "SiteeventsImport.Controller.");
                        AppData._persistentStates.privacyPolicyFlag = false;
                        if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                            AppHeader.controller.binding.userData = {};
                            if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                                AppHeader.controller.binding.userData.VeranstaltungName = "";
                            }
                        }
                        Application.navigateById("login", event);
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
                    }
                };
                
                var loadData = function (vid) {
                    Log.call(Log.l.trace, "SiteeventsImport.Controller.");
                    that.loading = true;
                    that.showMessage();
                    that.siteeventsimportdata = null;
                    if (!vid) {
                        vid = AppData.getRecordId("VeranstaltungTermin");
                    }
                    if (tableBody && tableBody.winControl) {
                        if (tableBody.winControl.data) {
                            tableBody.winControl.data.length = 0;
                        } else {
                            tableBody.winControl.data = WinJS.Binding.List([]);
                        }
                    }
                    AppData.setErrorMsg(that.binding);
                    var ret = new WinJS.Promise.as().then(function () {
                        if (vid) {
                            return SiteeventsImport.Import_FileVIEW.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "Events: success!");
                                // employeeView returns object already parsed from json file in response
                                if (json && json.d && json.d.results.length > 0) {
                                    that.setInitialHeaderTextValue();
                                    that.binding.count = json.d.results.length;
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                    });
                                    that.siteeventsimportdata = new WinJS.Binding.List(results);
                                    if (tableBody.winControl) {
                                        // add ListView dataSource
                                        tableBody.winControl.data = that.siteeventsimportdata;
                                    }
                                    Log.print(Log.l.trace, "Data loaded");
                                    //that.setInitialHeaderTextValue();
                                    that.setCellTitle();
                                } else {
                                    that.binding.count = 0;
                                    that.nextUrl = null;
                                    that.siteeventsimportdata = null;
                                    if (tableBody.winControl) {
                                        // add ListView dataSource
                                        tableBody.winControl.data = null;
                                    }
                                    if (progress && progress.style) {
                                        progress.style.display = "none";
                                    }
                                    if (counter && counter.style) {
                                        counter.style.display = "inline";
                                    }
                                    that.loading = false;
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                progress = listView.querySelector(".list-footer .progress");
                                counter = listView.querySelector(".list-footer .counter");
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                                that.loading = false;
                            }, {
                                    EventID: vid, LanguageSpecID: AppData.getLanguageId()
                                });
                        } else {
                            Log.print(Log.l.trace, "No vid set!");
                        }
                    });
                    Log.ret(Log.l.trace);
                    return ret;
                };
                this.loadData = loadData;
            
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            });
            Log.ret(Log.l.trace);
            }, {
                vidID: AppData.getRecordId("VeranstaltungTermin"),
                siteeventsimportdata: null
            })
    });
})();



