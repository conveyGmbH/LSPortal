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

(function () {
    "use strict";
    WinJS.Namespace.define("SiteEvents", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "SiteEvents.Controller.");
            Application.Controller.apply(this, [pageElement, {
                restriction: getEmptyDefaultValue(SiteEvents.defaultRestriction),
                dataEvents: getEmptyDefaultValue(SiteEvents.VeranstaltungView.defaultValue),
                siteeventsdata: null,
                count: 0,
                veranstaltungId: 0,
                fairmandantId: 0,
                firstentry: 0,
                eventText: getResourceText("siteevents.placeholder"),
                active: null
            }, commandList]);

            var that = this;

            var suggestionBox = pageElement.querySelector("#suggestionBox");
            var autosuggestbox = pageElement.querySelector(".win-autosuggestbox");

            var prevMasterLoadPromise = null;
            // ListView control
            var listView = pageElement.querySelector("#siteevents.listview");
            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.siteeventsdata) {
                    that.siteeventsdata = null;
                }
                listView = null;
            }
            
            var restriction; 
            if (!restriction) {
                restriction = SiteEvents.defaultRestriction;
            }
            that.binding.restriction = restriction;

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

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "LocalEvents.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    for (var i = 0; i < that.siteeventsdata.length; i++) {
                        var siteevents = that.siteeventsdata.getAt(i);
                        if (siteevents && typeof siteevents === "object" &&
                            siteevents.VeranstaltungVIEWID === recordId) {
                            listView.winControl.selection.set(i);
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

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
                    AppData.call("PRC_DeleteVeranstaltung", {
                        pVeranstaltungID: recordId
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var master = Application.navigator.masterControl;
                        master.controller.loadData();
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                }
                Log.ret(Log.l.trace);
            };
            this.deleteData = deleteData;

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
                        if (that.suggestionListAus[i].substr(0, query.length).toLowerCase() === query) {
                            suggestionCollection.appendQuerySuggestion(that.suggestionListAus[i]);
                        }
                    }
                }
            };
            this.suggestionsRequestedHandler = suggestionsRequestedHandler;

            var loadNextUrl = function (recordId) {
                Log.call(Log.l.trace, "SiteEvents.Controller.", "recordId=" + recordId);
                if (that.siteeventsdata && that.nextUrl && listView) {
                    progress = listView.querySelector(".list-footer .progress");
                    counter = listView.querySelector(".list-footer .counter");
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

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                onSuggestionsRequested: function (eventInfo) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    var queryText = eventInfo && eventInfo.detail && eventInfo.detail.queryText;
                    Log.print(Log.l.trace, queryText);
                    function filterEvents(item) {
                        var srtrLower = this.queryText.toLowerCase();
                        if (srtrLower.length > 0 &&
                        (item.FirmenName &&
                            item.FirmenName.toLowerCase().substr(0, srtrLower.length) === srtrLower)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    if (that.siteeventsdata) {
                        var hits = that.siteeventsdata.filter(filterEvents, { queryText: queryText });
                        for (var i = 0; i < hits.length; i++) {
                            eventInfo.detail.searchSuggestionCollection.appendQuerySuggestion(hits[i].FirmenName);
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickChange: function (event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    that.changeEvent();
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    var confirmTitle = getResourceText("siteevents.eventdelete");
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            Log.print(Log.l.trace, "clickDelete: user choice OK");
                            deleteData(function (response) {
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
                            Log.print(Log.l.trace, "clickDelete: user choice CANCEL");
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                changeSearchField: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    that.binding.restriction.Firmenname = [];
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
                    /*var master = Application.navigator.masterControl;
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
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        // single list selection
                        if (listView.winControl.selectionMode !== WinJS.UI.SelectionMode.single) {
                            listView.winControl.selectionMode = WinJS.UI.SelectionMode.single;
                        }
                        // direct selection on each tap
                        if (listView.winControl.tapBehavior !== WinJS.UI.TapBehavior.directSelect) {
                            listView.winControl.tapBehavior = WinJS.UI.TapBehavior.directSelect;
                        }
                        // Double the size of the buffers on both sides
                        if (!maxLeadingPages) {
                            maxLeadingPages = listView.winControl.maxLeadingPages * 4;
                            listView.winControl.maxLeadingPages = maxLeadingPages;
                        }
                        if (!maxTrailingPages) {
                            maxTrailingPages = listView.winControl.maxTrailingPages * 4;
                            listView.winControl.maxTrailingPages = maxTrailingPages;
                        }
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.SiteEventsLayout.SiteEventsLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor);
                            Colors.loadSVGImageElements(listView, "action-image-flag", 40);
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    Application.showDetail();
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                        Log.call(Log.l.trace, "LocalEvents.Controller.");
                        if (eventInfo && eventInfo.detail) {
                            var visible = eventInfo.detail.visible;
                            if (visible) {
                                var contentHeader = listView.querySelector(".content-header");
                                if (contentHeader) {
                                    var halfCircle = contentHeader.querySelector(".half-circle");
                                    if (halfCircle && halfCircle.style) {
                                        if (halfCircle.style.visibility === "hidden") {
                                            halfCircle.style.visibility = "";
                                            WinJS.UI.Animation.enterPage(halfCircle);
                                        }
                                    }
                                }
                            }
                        }
                        Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                        Log.call(Log.l.trace, "LocalEvents.Controller.");
                        if (eventInfo && eventInfo.detail) {
                            progress = listView.querySelector(".list-footer .progress");
                            counter = listView.querySelector(".list-footer .counter");
                            var visible = eventInfo.detail.visible;
                            if (visible && that.siteeventsdata && that.nextUrl) {
                                that.loading = true;
                                that.loadNextUrl();
                            } else {
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                                that.loading = false;
                            }
                        }
                        Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    that.binding.active = null;
                                    if (item.data.Aktiv) {
                                        that.binding.active = 1;
                                    }
                                    that.actualSelectedItem = item.data;
                                    if (item.data && item.data.VeranstaltungVIEWID) {
                                        var newRecId = item.data.VeranstaltungVIEWID;
                                        that.binding.veranstaltungId = item.data.VeranstaltungVIEWID;
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
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    Application.navigateById("siteEventsNeuAus", event);
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
                    Log.call(Log.l.trace, "Contact.Controller.");
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
                    if (!that.reorderId || that.binding.active === 1) {
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
                    if (AppData.getRecordId("VeranstaltungTermin")) {
                        if (AppBar.busy) {
                        return true;
                    } else {
                        return false;
                    }
                    } else {
                        return true;
                    }
                }
            }

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
            }
            if (suggestionBox) {
                //this.addRemovableEventListener(suggestionBox, "suggestionsrequested", this.eventHandlers.onSuggestionsRequested.bind(this));
            }

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

            var loadData = function (vid) {
                Log.call(Log.l.trace, "LocalEvents.Controller.");
                that.loading = true;
                if (vid) {
                    that.binding.restriction.VeranstaltungTerminID = vid;
                    that.vidID = vid;
                } else {
                    that.binding.restriction.VeranstaltungTerminID = that.vidID;
                }
                progress = listView.querySelector(".list-footer .progress");
                counter = listView.querySelector(".list-footer .counter");
                if (progress && progress.style) {
                    progress.style.display = "inline";
                }
                if (counter && counter.style) {
                    counter.style.display = "none";
                }
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
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
                            
                            that.vidID2 = vid;
                            that.siteeventsdata = new WinJS.Binding.List(results);

                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.siteeventsdata.dataSource;
                            }
                            Log.print(Log.l.trace, "Data loaded");
                            if (results[0] && results[0].VeranstaltungVIEWID) {
                                WinJS.Promise.timeout(0).then(function () {
                                    that.selectRecordId(results[0].VeranstaltungVIEWID);
                                });
                            }
                        } else {
                            that.binding.count = 0;
                            that.nextUrl = null;
                            that.siteeventsdata = null;
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = null;
                            }
                            progress = listView.querySelector(".list-footer .progress");
                            counter = listView.querySelector(".list-footer .counter");
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
                    }, that.binding.restriction
                    );
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                AppBar.notifyModified = true;
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
                reorderId: null
        })
        
    });
})();