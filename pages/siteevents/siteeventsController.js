// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/lib/jstz/scripts/jstz.js" />
/// <reference path="~/www/lib/base64js/scripts/base64js.min.js" />
/// <reference path="~/www/pages/siteevents/siteeventsService.js"/>
/// <reference path="~/www/pages/siteevents/exportXlsx.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("SiteEvents", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "SiteEvents.Controller.");
            Application.Controller.apply(this, [pageElement, {
                restriction: getEmptyDefaultValue(SiteEvents.defaultRestriction),
                dataEvents: getEmptyDefaultValue(SiteEvents.VeranstaltungView.defaultValue),
                newFileID: getEmptyDefaultValue(SiteEvents.importfileView.defaultValue),
                newFileData: getEmptyDefaultValue(SiteEvents.doc3import_file.defaultValue),
                siteeventsdataCombobox: null,
                siteeventsdata: null,
                mailingtrackingrestriction: null,
                count: 0,
                veranstaltungId: 0,
                fairmandantId: 0,
                firstentry: 0,
                eventText: getResourceText("siteevents.placeholder"),
                active: null,
                searchString: ""
            }, commandList]);

            var that = this;

            var suggestionBox = pageElement.querySelector("#suggestionBox");
            var autosuggestbox = pageElement.querySelector(".win-autosuggestbox");
            var fileinputbox = pageElement.querySelector(".fileinputbox");
            var inputbox = pageElement.querySelector("#myFile");
            var inputmsg = pageElement.querySelector("#inputmsg");
            var searchInput = pageElement.querySelector("#searchInput");

            var prevMasterLoadPromise = null;
            // ListView control
            var table = pageElement.querySelector("#tableId");
            var tableHeader = pageElement.querySelector(".table-header");
            var tableBody = pageElement.querySelector(".table-body");
            var tableBodyRow = pageElement.querySelector(".list-symbol-ID");
            var progress = null;
            var counter = null;
            var layout = null;

            //picturedata
            this.imageData = "";
            this.imageName = "";
            this.imageLength = 0;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var timer = null;

            this.dispose = function () {
                if (tableBody && tableBody.winControl) {
                    tableBody.winControl.data = null;
                }
                if (that.siteeventsdata) {
                    that.siteeventsdata = null;
                }
                if (that.siteeventsdataraw) {
                    that.siteeventsdataraw = null;
                }
            }
            
            var restriction; 
            if (!restriction) {
                restriction = SiteEvents.defaultRestriction;
            }
            that.binding.restriction = restriction;

            var setDataLabels = function() {
                Log.call(Log.l.trace, "Contact.Controller.");
                var row = pageElement.querySelectorAll("table tr");
                for (var i = 0; i < row.length; i++) {
                    var cell = row[i].cells;
                    for (var j = 0; j < cell.length; j++) {
                        if (j === 0) {
                            cell[j].setAttribute("data-label", getResourceText("siteevents.event"));
                        }
                        if (j === 1) {
                            cell[j].setAttribute("data-label", getResourceText("siteevents.adminuser"));
                        }
                        if (j === 2) {
                            cell[j].setAttribute("data-label", getResourceText("siteevents.hall"));
                        }
                        if (j === 3) {
                            cell[j].setAttribute("data-label", getResourceText("siteevents.stand"));
                        }
                        if (j === 4) {
                            cell[j].setAttribute("data-label", getResourceText("siteevents.appusercount"));
                        }
                        if (j === 5) {
                            cell[j].setAttribute("data-label", getResourceText("siteevents.freeolockappuser"));
                        }
                        if (j === 6) {
                            cell[j].setAttribute("data-label", getResourceText("siteevents.numContacts"));
                        }
                    }
                }
                Log.call(Log.l.trace, "Contact.Controller.");
            }
            this.setDataLabels = setDataLabels;

            var getDateObject = function (dateData) {
                var ret;
                if (dateData) {
                    var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                    var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    ret = new Date(milliseconds).toLocaleDateString();
                    //.toLocaleString('de-DE').substr(0, 10);
                } else {
                    ret = "";
                }
                return ret;
            };
            this.getDateObject = getDateObject;
            
            var checkId = function() {
                if (that.vidID) {
                    fileinputbox.style.display = "block";
                } else {
                    fileinputbox.style.display = "none";
                }
            }
            this.checkId = checkId;

            var resetSearchFilter = function () {
                that.binding.dataEvents = getEmptyDefaultValue(SiteEvents.VeranstaltungView.defaultValue),
                that.binding.restriction = getEmptyDefaultValue(SiteEvents.defaultRestriction);
                that.binding.restriction.Firmenname = "";
                autosuggestbox.winControl.queryText = "";
                autosuggestbox.winControl._prevQueryText = "";
                AppData.setRestriction("Veranstaltung", that.binding.restriction);
            }
            this.resetSearchFilter = resetSearchFilter;

            var deleteData = function (complete, error) {
                Log.call(Log.l.trace, "Contact.Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = that.binding.veranstaltungId;
                if (recordId) {
                    AppData.setErrorMsg(that.binding);
                    return AppData.call("PRC_DeleteVeranstaltung", {
                        pVeranstaltungID: recordId
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var master = Application.navigator.masterControl;
                        master.controller.loadData();
                        complete({});
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                        error(error);
                    });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                }
                Log.ret(Log.l.trace);
            };
            this.deleteData = deleteData;

            var changeToPermanentUser = function (complete, error) {
                Log.call(Log.l.trace, "SiteEvents.Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = that.binding.veranstaltungId;
                if (recordId) {
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_ConvertExhibitor", {
                        pVeranstaltungID: recordId
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        that.loadData(that.binding.restriction.VeranstaltungTerminID);
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                }
                Log.ret(Log.l.trace);
            };
            this.changeToPermanentUser = changeToPermanentUser;

            var changeEvent = function () {
                Log.call(Log.l.trace, "LocalEvents.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_ChangeSiteVeranstaltung", {
                    pNewVeranstaltungID: that.eventChangeId,
                    pLoginName: AppData._persistentStates.odata.login
                }, function (json) {
                    Log.print(Log.l.info, "call success! ");
                    AppData.prevLogin = AppData._persistentStates.odata.login;
                    AppData.prevPassword = AppData._persistentStates.odata.password;
                    Application.navigateById("login");
                }, function (error) {
                    Log.print(Log.l.error, "call error");
                });
                Log.ret(Log.l.trace);
            }
            this.changeEvent = changeEvent;

            var suggestionsRequestedHandler = function (eventObject) {
                Log.call(Log.l.trace, "SiteEventsList.Controller.");
                var queryText = eventObject.detail.queryText,
                    query = queryText.toLowerCase(),
                    suggestionCollection = eventObject.detail.searchSuggestionCollection;
                if (queryText.length > 0) {
                    for (var i = 0, len = that.suggestionListAus.length; i < len; i++) {
                        if (that.suggestionListAus[i].toLowerCase().indexOf(query)) {
                            suggestionCollection.appendQuerySuggestion(that.suggestionListAus[i]);
                        }
                    }
                }
            };
            this.suggestionsRequestedHandler = suggestionsRequestedHandler;

            var resultConverter = function (item, index) {
                item.index = index;
                if (!item.StandHall) {
                    item.StandHall = "";
                }
                if (!item.StandNo) {
                    item.StandNo = "";
                }
                if (typeof item.DevicesLicensed === "undefined") {
                    item.DevicesLicensed = "0";
                }
                if (typeof item.DevicesNotLicensed === "undefined") {
                    item.DevicesNotLicensed = "0";
                }
                if (item.OrderedApp === null) {
                    item.OrderedApp = "0";
                }
                item.LULUsers = item.DevicesLicensed + " / " + item.DevicesNotLicensed;
            }
            this.resultConverter = resultConverter;

            var loadNextUrl = function (recordId) {
                Log.call(Log.l.trace, "SiteEvents.Controller.", "recordId=" + recordId);
                if (that.siteeventsdata && that.nextUrl) {
                    that.loading = true;
                    if (progress && progress.style) {
                        progress.style.display = "inline";
                    }
                    if (counter && counter.style) {
                        counter.style.display = "none";
                    }
                    AppData.setErrorMsg(that.binding);
                    Log.print(Log.l.trace, "calling select SiteEvents.VeranstaltungView...");
                    var nextUrl = that.nextUrl;
                    that.nextUrl = null;
                    SiteEvents.VeranstaltungView.selectNext(function (json) { //json is undefined
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "SiteEvents.VeranstaltungView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && that.siteeventsdata) {
                            that.nextUrl = SiteEvents.VeranstaltungView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, that.binding.count);
                                that.binding.count = that.siteeventsdata.push(item);
                            });
                        }
                        if (recordId) {
                            that.selectRecordId(recordId);
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        Log.print(Log.l.error, "SiteEvents.VeranstaltungView: error!");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (progress && progress.style) {
                            progress.style.display = "none";
                        }
                        if (counter && counter.style) {
                            counter.style.display = "inline";
                        }
                        that.loading = false;
                    }, null, nextUrl);
                }
                Log.ret(Log.l.trace);
            }
            this.loadNextUrl = loadNextUrl;

            var querySubmittedHandler = function (eventObject) {
                Log.call(Log.l.trace, "SiteEventsList.Controller.");
                var queryText = eventObject.detail.queryText;
                WinJS.log && WinJS.log(queryText, "sample", "status");
            };
            this.querySubmittedHandler = querySubmittedHandler;

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

            var exportPwdQrCodeEmployeePdf = function () {
                Log.call(Log.l.trace, "Contact.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var recordId = AppData.getRecordId("VeranstaltungTermin");
                if (recordId) {
                    ret = AppData.call("PRC_GetQRPdf", { 
                        pVeranstaltungTerminID: recordId
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        if (json && json.d && json.d.results.length > 0) {
                            var results = json.d.results[0];
                            var pdfDataraw = results.DocContentDOCCNT1;
                            var sub = pdfDataraw.search("\r\n\r\n");
                            var pdfDataBase64 = pdfDataraw.substr(sub + 4);
                            var pdfData = that.base64ToBlob(pdfDataBase64, "pdf");
                            var pdfName = results.szOriFileNameDOC1;
                            saveAs(pdfData, pdfName);
                            AppBar.busy = false;
                            AppBar.triggerDisableHandlers();
                        }
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                        AppBar.busy = false;
                        AppBar.triggerDisableHandlers();
                        AppData.setErrorMsg(that.binding, error);
                        if (typeof error === "function") {
                            error(error);
                        }
                    });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.exportPwdQrCodeEmployeePdf = exportPwdQrCodeEmployeePdf;

            var showMessage = function (msgText) {
                Log.call(Log.l.trace, "Contact.Controller.");
                if (msgText === true) {
                    inputmsg.textContent = getResourceText("siteevents.successmsg");
                } else {
                    inputmsg.textContent = getResourceText("siteevents.errormsg");
                }
                Log.call(Log.l.trace, "Contact.Controller.");
            }
            this.showMessage = showMessage;

            var createCsvString = function(id) {

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
                var ret = SiteEvents.doc3import_file.insert(function (json) {
                        AppBar.busy = false;
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.info, "doc3import_file insert: success!");
                        // doc3import_file returns object already parsed from json file in response
                        if (json && json.d) {
                            Log.print(Log.l.info, "doc3import_file insert: success!");
                            that.showMessage(true);
                        }
                        AppBar.modified = true;
                    },
                    function (errorResponse) {
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
                var ret = SiteEvents.importfileView.insert(function(json) {
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
                    },
                    function(errorResponse) {
                        Log.print(Log.l.error, "error inserting csv");
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    },
                    newFileUploadId);
                return ret;
            }
            this.uploadCsv = uploadCsv;

            var exportData = function (dbView, fileName) {
                Log.call(Log.l.trace, "SiteEvents.Controller.");
                var dbViewTitle = null;
                if (dbView) {
                    var exporter = ExportXlsx.exporter;
                    if (!exporter) {
                        exporter = new ExportXlsx.ExporterClass(that.binding.progress);
                    }
                    exporter.showProgress(0);
                    WinJS.Promise.timeout(50).then(function () {
                        exporter.saveXlsxFromView(dbView, fileName, function (result) {
                            AppBar.busy = false;
                            AppBar.triggerDisableHandlers();
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                            AppBar.busy = false;
                            AppBar.triggerDisableHandlers();
                        }, that.binding.restriction, dbViewTitle);
                    });
                } else {
                    AppBar.busy = false;
                    AppBar.triggerDisableHandlers();
                }
                Log.ret(Log.l.trace);
            }
            that.exportData = exportData;

            var processSearch = function (searchString) {
                Log.call(Log.l.trace, "SiteEvents.Controller.");
                AppData.setErrorMsg(that.binding);
                if (tableBody && tableBody.winControl) {
                    if (tableBody.winControl.data) {
                        tableBody.winControl.data.length = 0;
                    } else {
                        tableBody.winControl.data = WinJS.Binding.List([]);
                    }
                }
                var cleanSearchString = searchString.replace("\'", " ").replace("\"", " ");
                var ret;
                var recordId = AppData.getRecordId("VeranstaltungTermin");
                if (recordId) {
                    ret = AppData.call("PRC_GetExhibitorList", {
                        pVeranstaltungTerminID: recordId,
                        pSearchString: cleanSearchString
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        if (json && json.d) {
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            that.siteeventsdata = new WinJS.Binding.List(results);
                            if (tableBody.winControl) {
                                // add ListView dataSource
                                tableBody.winControl.data = that.siteeventsdata;
                            }
                            that.addBodyRowHandlers();
                            that.setDataLabels();
                            that.binding.count = results.length;
                            AppBar.busy = false;
                            AppBar.triggerDisableHandlers();
                        }
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                        AppBar.busy = false;
                        AppBar.triggerDisableHandlers();
                        AppData.setErrorMsg(that.binding, error);
                        if (typeof error === "function") {
                            error(error);
                        }
                    });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.processSearch = processSearch;

            var searchStringProcess = function() {
                Log.call(Log.l.trace, "SiteEvents.Controller.");
                var searchstring = searchInput.value;
                if (searchstring !== "") {
                    that.processSearch(searchstring);
                } else {
                    that.loadData(that.binding.restriction.VeranstaltungTerminID);
                }
                Log.ret(Log.l.trace);
            }
            this.searchStringProcess = searchStringProcess;

            var addBodyRowHandlers = function () {
                if (tableBody) {
                    var rows = tableBody.getElementsByTagName("tr");
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        if (!row.onclick) {
                            row.onclick = function (myrow) {
                                return function () {
                                    var id = myrow.value;
                                    for (var i = 0; i < that.siteeventsdataraw.length; i++) {
                                        if (that.siteeventsdataraw[i].VeranstaltungVIEWID === id) {
                                            for (var rowi = 0; rowi < rows.length; rowi++) {
                                                rows[rowi].style.backgroundColor = "";
                                                rows[rowi].classList.remove('selected');
                                            }
                                            myrow.style.backgroundColor  = Colors.navigationColor;
                                            myrow.className += " selected";
                                            var newRecId = that.siteeventsdataraw[i].VeranstaltungVIEWID;
                                            AppData.setRecordId("ExhibitorMailingStatus", that.siteeventsdataraw[i].FairMandantVeranstID);
                                            that.binding.veranstaltungId = that.siteeventsdataraw[i].VeranstaltungVIEWID;
                                            that.isConvertable = that.siteeventsdataraw[i].CanConvert;
                                            that.binding.active = that.siteeventsdataraw[i].Aktiv;
                                            AppData.setRecordId("VeranstaltungTermin", that.siteeventsdataraw[i].VeranstaltungTerminID);
                                            Log.print(Log.l.trace, "newRecId:" + newRecId + " curRecId:" + that.curRecId);
                                            if (newRecId !== 0 && newRecId !== that.curRecId) {
                                                if (that.curRecId) {
                                                    that.prevRecId = that.curRecId;
                                                }
                                                that.curRecId = newRecId;
                                                that.eventChangeId = that.curRecId;
                                                that.reorderId = that.curRecId;
                                                AppData.setRecordId("VeranstaltungAnlage", that.reorderId);
                                                AppBar.triggerDisableHandlers();
                                            }
                                        }
                                    }
                                    
                                };
                            }(row);
                        }
                    }
                }
            }
            this.addBodyRowHandlers = addBodyRowHandlers;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                onSearchInput: function() {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    clearTimeout(timer);
                    timer = setTimeout(that.searchStringProcess(), 1000);
                    Log.ret(Log.l.trace);
                },
                clickCreatePermanentUser: function () {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    var confirmTitle = getResourceText("siteevents.eventpermuser");
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            Log.print(Log.l.trace, "clickCreatePermanentUser: user choice OK");
                            changeToPermanentUser(function (response) {
                                // delete OK - goto start
                            }, function (errorResponse) {
                                // delete ERROR
                                var message = null;
                                Log.print(Log.l.error, "error status=" + errorResponse.status + " statusText=" + errorResponse.statusText);
                                if (errorResponse.data && errorResponse.data.error) {
                                    Log.print(Log.l.error, "error code=" + errorResponse.data.error.code);
                                    if (errorResponse.data.error.message) {
                                        Log.print(Log.l.error, "error message=" + errorResponse.data.error.message.value);
                                        message = errorResponse.data.error.message.value;
                                    }
                                }
                                if (!message) {
                                    message = getResourceText("error.delete");
                                }
                                alert(message);
                            });
                        } else {
                            Log.print(Log.l.trace, "clickCreatePermanentUser: user choice CANCEL");
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                onquerychanged: function (eventInfo) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    /*var queryText = eventInfo && eventInfo.detail && eventInfo.detail.queryText;
                    Log.print(Log.l.trace, queryText);
                    function filterEvents(item) {
                        var srtrLower = queryText.toLowerCase();
                        var re = new RegExp(srtrLower, "g");
                        if (srtrLower.length > 0 &&
                        (item.Firmenname &&
                            item.Firmenname.toLowerCase().match(re))) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    if (that.siteeventsdata) {
                        var hits = that.siteeventsdata.filter(filterEvents, { queryText: queryText });
                        for (var i = 0; i < hits.length; i++) {
                            eventInfo.detail.searchSuggestionCollection.appendQuerySuggestion(hits[i].Firmenname);
                        }
                    }*/
                    var queryText = eventInfo.detail.queryText, query = queryText.toLowerCase(), suggestionCollection = eventInfo.detail.searchSuggestionCollection;
                    if (queryText.length > 0 && that.siteeventsdata && that.siteeventsdata.length > 0) {
                        for (var i = 0, len = that.siteeventsdata.length; i < len; i++) {
                            if (that.siteeventsdata.getAt(i).Firmenname.toLowerCase().indexOf(query) >= 0 ||
                                that.siteeventsdata.getAt(i).StandHall.toLowerCase().indexOf(query) >= 0 ||
                                that.siteeventsdata.getAt(i).StandNo.toLowerCase().indexOf(query) >= 0 ||
                                that.siteeventsdata.getAt(i).FairMandant_Email.toLowerCase().indexOf(query) >= 0) {
                                suggestionCollection.appendQuerySuggestion(that.siteeventsdata.getAt(i).Firmenname);
                            }
                        }
                    } else {
                        that.loadData(AppData.getRecordId("VeranstaltungTermin"));
                    }
                    Log.ret(Log.l.trace);
                },
                clickChange: function (event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    that.changeEvent();
                    Log.ret(Log.l.trace);
                },
                clickMailTracking: function (event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    AppData.setRestriction("ExhibitorMailingStatus", that.binding.mailingtrackingrestriction);
                    Application.navigateById("mailingTracking", event);
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    var confirmTitle = getResourceText("siteevents.eventdelete");
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            Log.print(Log.l.trace, "clickDelete: user choice OK");
                            AppBar.busy = true;
                            AppBar.triggerDisableHandlers();
                            deleteData(function (response) {
                                // delete OK - goto start
                                AppBar.busy = false;
                                AppBar.triggerDisableHandlers();
                            }, function (errorResponse) {
                                // delete ERROR
                                var message = null;
                                Log.print(Log.l.error, "error status=" + errorResponse.status + " statusText=" + errorResponse.statusText);
                                if (errorResponse.data && errorResponse.data.error) {
                                    Log.print(Log.l.error, "error code=" + errorResponse.data.error.code);
                                    if (errorResponse.data.error.message) {
                                        Log.print(Log.l.error, "error message=" + errorResponse.data.error.message.value);
                                        message = errorResponse.data.error.message.value;
                                    }
                                }
                                if (!message) {
                                    message = getResourceText("error.delete");
                                }
                                alert(message);
                                AppBar.busy = false;
                                AppBar.triggerDisableHandlers();
                            });
                        } else {
                            Log.print(Log.l.trace, "clickDelete: user choice CANCEL");
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                ondateiupload: function() {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    var files = pageElement.querySelector("#myFile").files;
                    if (files[0].name.match(/\.(csv)/g) != null) {
                        var newFileUploadId = that.binding.newFileID;
                        newFileUploadId.INITImportFileTypeID = 1;
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
                changeSearchField: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                   /* that.binding.restriction.Firmenname = [];
                    if (event.target.value) {
                        that.binding.restriction.Firmenname = event.target.value;
                        that.binding.restriction.VeranstaltungTerminID = that.vidID;
                        that.binding.restriction.bUseOr = false;
                        that.binding.restriction.bAndInEachRow = true;
                    } else {
                        that.binding.restriction.Firmenname = event.target.value;
                        delete that.binding.restriction.bUseOr;
                    }
                    AppData.setRestriction("Veranstaltung", that.binding.restriction);
                    that.loadData();
                    that.binding.restriction.Firmenname = "";
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        if (prevMasterLoadPromise &&
                            typeof prevMasterLoadPromise.cancel === "function") {
                            prevMasterLoadPromise.cancel();
                        }
                        //master.controller.binding.contactId = that.binding.dataContact.KontaktVIEWID;
                        prevMasterLoadPromise = master.controller.loadData().then(function () {
                            prevMasterLoadPromise = null;
                            if (master && master.controller && that.binding.employeeId) {
                                master.controller.selectRecordId(that.binding.employeeId);
                            }
                        });
                    }*/
                    Log.ret(Log.l.trace);
                },
                onquerysubmitted: function (eventInfo) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    that.binding.restriction.Firmenname = "";
                    if (eventInfo.detail.queryText) {
                        that.binding.restriction.Firmenname = eventInfo.detail.queryText;
                        that.binding.restriction.VeranstaltungTerminID = that.vidID;
                        that.binding.restriction.bUseOr = false;
                        that.binding.restriction.bAndInEachRow = true;
                    } else {
                        that.binding.restriction.Firmenname = eventInfo.detail.queryText;
                        delete that.binding.restriction.bUseOr;
                    }
                    AppData.setRestriction("Veranstaltung", that.binding.restriction);
                    that.loadData();
                    that.binding.restriction.Firmenname = "";
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    Application.showDetail();
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    Application.navigateById("siteEventsNeuAus", event);
                    Log.ret(Log.l.trace);
                },
                clickNewTermin: function (event) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    //AppData.setRecordId("VeranstaltungTermin", that.reorderId);
                    AppData.setRecordId("VeranstaltungTermin", 0);
                    Application.navigateById("siteEventsTermin", event);
                    Log.ret(Log.l.trace);
                },
                clickEventTerminEdit: function () {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    //AppData.setRecordId("VeranstaltungTermin", that.binding.restriction.VeranstaltungTerminID);
                    Application.navigateById("siteEventsTermin", event);
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickReorder: function (event) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    Application.navigateById("siteEventsBenNach", event);
                    Log.ret(Log.l.trace);
                },
               clickTopButton: function (event) {
                   Log.call(Log.l.trace, "SiteEvents.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
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
                clickExport: function (event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    if (AppBar.barControl) {
                        AppBar.barControl.open();
                    }
                    Log.ret(Log.l.trace);
                },
                clickExportRegistrationList: function (event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    //registrationEnglishView
                    var dbView, fileName;
                    if (AppData.getLanguageId() === 1031) {
                        dbView = SiteEvents.registrationView;
                        fileName = "Liste der Registrierten Testuser";
                    } else if (AppData.getLanguageId() === 1033) {
                        dbView = SiteEvents.registrationEnglishView;
                        fileName = "List of registered test users";
                    } else if (AppData.getLanguageId() === 1036) {
                        dbView = SiteEvents.registrationFranzView;
                        fileName = "Liste des utilisateurs test enregistrés";
                    } else if (AppData.getLanguageId() === 1040) {
                        dbView = SiteEvents.registrationItalienView;
                        fileName = "Elenco degli utenti di test registrati";
                    } else {
                        dbView = SiteEvents.OIMPImportJobEnglishView;
                        fileName = "List of registered test users";
                    }
                    AppBar.busy = true;
                    AppBar.triggerDisableHandlers();
                    WinJS.Promise.timeout(0).then(function () {
                        that.exportData(dbView, fileName);
                    }).then(function () {
                        var registrations = pageElement.querySelector("#registrations.listview");
                        if (registrations && registrations.style) {
                            var contentarea = pageElement.querySelector(".contentarea");
                            var contentheader = pageElement.querySelector(".content-header");
                            var progressbar = pageElement.querySelector("#progress");
                            var filter = pageElement.querySelector("#restrictions");
                            if (contentarea) {
                                var height = contentarea.clientHeight;
                                if (contentheader) {
                                    height = height - contentheader.clientHeight;
                                }
                                if (progressbar) {
                                    height = height - 80;
                                }
                                if (filter) {
                                    if (that.binding.showFilter) {
                                        height = height - filter.clientHeight;
                                    }
                                }
                                registrations.style.height = height.toString() + "px";
                            }
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                clickExportLockedDeviceList: function(event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    var dbView, fileName;
                    if (AppData.getLanguageId() === 1031) {
                        dbView = SiteEvents.OIMPImportJobView;
                        fileName = "Liste der gesperrten Geräte";
                    } else if (AppData.getLanguageId() === 1033) {
                        dbView = SiteEvents.OIMPImportJobEnglishView;
                        fileName = "List of locked Devices";
                    } else if (AppData.getLanguageId() === 1036) {
                        dbView = SiteEvents.OIMPImportJobFranzView;
                        fileName = "Liste des appareils verrouillés";
                    } else if (AppData.getLanguageId() === 1040) {
                        dbView = SiteEvents.OIMPImportJobItalienView;
                        fileName = "Elenco di dispositivi bloccati";
                    } else {
                        dbView = SiteEvents.OIMPImportJobEnglishView;
                        fileName = "List of locked Devices";
                    }
                    AppBar.busy = true;
                    AppBar.triggerDisableHandlers();
                    WinJS.Promise.timeout(0).then(function() {
                        that.exportData(dbView, fileName);
                    });
                    Log.ret(Log.l.trace);
                },
                clickExportQrcode: function (event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    AppBar.busy = true;
                    AppBar.triggerDisableHandlers();
                    WinJS.Promise.timeout(0).then(function() {
                        return that.exportPwdQrCodeEmployeePdf();
                    });
                    Log.ret(Log.l.trace);
                }
            }

            this.disableHandlers = {
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickCreatePermanentUser: function(parameters) {
                    if (that.isConvertable) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickChange: function () {
                    if (that.eventChangeId && AppData.generalData.eventId !== that.eventChangeId) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickNew: function () {
                    if (typeof that.vidID2 !== "undefined") {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickDelete: function () {
                    if (!that.reorderId || that.binding.active === 1 || AppData.generalData.eventId === that.reorderId || AppBar.busy) {
                        return true;
                    } else {
                        return false;
                    }
                },
                clickReorder: function () {
                    if (!that.reorderId) {
                        return true;
                    } else {
                        return false;
                    }
                },
                clickExport: function() {
                        if (AppBar.busy) {
                        return true;
                    } else {
                        return false;
                    }
                },
                clickExportQrcode: function() {
                    if (AppData.getRecordId("VeranstaltungTermin")) {
                        if (AppBar.busy) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return true;
                    }
                },
                clickExportRegistrationList: function () {
                        if (AppBar.busy) {
                            return true;
                        } else {
                            return false;
                        }
                },
                clickExportLockedDeviceList: function() {
                        if (AppBar.busy) {
                            return true;
                        } else {
                            return false;
                        }
                }
            }

            // register ListView event handler
            if (suggestionBox) {
                this.addRemovableEventListener(suggestionBox, "suggestionsrequested", this.eventHandlers.onquerychanged.bind(this));
                this.addRemovableEventListener(suggestionBox, "querysubmitted", this.eventHandlers.onquerysubmitted.bind(this));
            }
            if (searchInput) {
                this.addRemovableEventListener(searchInput, "keyup", this.eventHandlers.onSearchInput.bind(this));
            }
            
            var loadData = function (vid) {
                Log.call(Log.l.trace, "LocalEvents.Controller.");
                inputmsg.textContent = " ";
                inputbox.value = null;
                that.siteeventsdata = null;
                that.siteeventsdataraw = null;
                that.loading = true;
                if (vid) {
                    that.binding.restriction.VeranstaltungTerminID = vid;
                    that.vidID = vid;
                } else {
                    that.binding.restriction.VeranstaltungTerminID = that.vidID;
                }
                if (tableBody && tableBody.winControl) {
                    if (tableBody.winControl.data) {
                        tableBody.winControl.data.length = 0;
                    } else {
                        tableBody.winControl.data = WinJS.Binding.List([]);
                    }
                }
                AppData.setErrorMsg(that.binding);
                var ret = null;
                if (that.binding.restriction.VeranstaltungTerminID) {
                    ret = new WinJS.Promise.as().then(function () {
                    return SiteEvents.VeranstaltungView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "LocalEvent: success!");
                        // employeeView returns object already parsed from json file in response
                        if (json && json.d && json.d.results.length > 0) {
                            that.binding.count = json.d.results.length;
                            that.nextUrl = SiteEvents.VeranstaltungView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            that.siteeventsdataraw = results;
                            that.vidID2 = vid;
                            that.siteeventsdata = new WinJS.Binding.List(results);
                            if (tableBody.winControl) {
                                // add ListView dataSource
                                tableBody.winControl.data = that.siteeventsdata;
                            }
                            Log.print(Log.l.trace, "Data loaded");
                        } else {
                            that.binding.count = 0;
                            that.nextUrl = null;
                            that.siteeventsdata = null;
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
                        if (tableBody && typeof tableBody !== 'undefined') {
                        if (progress && progress.style) {
                            progress.style.display = "none";
                        }
                        if (counter && counter.style) {
                            counter.style.display = "inline";
                        }
                            }
                        that.loading = false;
                        }, that.binding.restriction);
                    }).then(function () {
                    return that.addBodyRowHandlers();
                    }).then(function () {
                        return that.setDataLabels();
                    });
                } else {
                    ret = new WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData(AppData.getRecordId("VeranstaltungTermin"));
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Binding wireup page complete");
            }).then(function () {
                that.checkId();
                Log.print(Log.l.trace, "Binding wireup page complete");
            });
            Log.ret(Log.l.trace);
        }, {
                eventChangeId: null,
                vidID: null,
                vidID2: null,
                nextUrl: null,
                loading: false,
                siteeventsdata: null,
                deleteEventData: null,
                suggestionList: null,
                reorderId: null,
                imageData: null,
                isConvertable: null,
                siteeventsdataraw: null
        })
        
    });
})();