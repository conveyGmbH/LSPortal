// controller for page: clientManagementList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/clientManagementList/clientManagementListService.js" />
/// <reference path="~/www/pages/clientManagementLicenses/clientManagementLicensesService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("ClientManagementLicenses", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "ClientManagementLicenses.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                licenseId: 0, //AppData.getRecordId("Mitarbeiter")
                veranstaltungdataLicenses: getEmptyDefaultValue(ClientManagementLicenses.veranstaltungView.defaultValue),
                dataLicense: getEmptyDefaultValue(ClientManagementLicenses.mandantTempLizenzView.defaultRestriction),
                newLicensesdata: getEmptyDefaultValue(ClientManagementLicenses.mandantTempLizenzView.defaultRestriction),
                newLicensesShowFlag: false,
                editLicensesShowFlag: false,
                licensebtnLabel: getResourceText("clientmanagementlicenses.licensebtnLabel"),
                editlicensebtnLabel: getResourceText("clientmanagementlicenses.editlicensebtnLabel")
            }, commandList]);
            this.nextUrl = null;
            this.loading = false;
            this.licenses = null;

            var that = this;

            // ListView control
            var listView = pageElement.querySelector("#clientmanagementlicenseslist.listview");
            var veranstaltungLicenses = pageElement.querySelector("#veranstaltungLicenses");
            var editveranstaltungLicenses = pageElement.querySelector("#editveranstaltungLicenses");
            var infotext = pageElement.querySelector("#infoText");

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.licenses) {
                    that.licenses = null;
                }
                if (that.binding.licenseId) {
                    that.binding.licenseId = 0;
                }
            }

            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var background = function (index) {
                if (index % 2 === 0) {
                    return 1;
                } else {
                    return null;
                }
            };
            this.background = background;

            var getRecordId = function () {
                Log.call(Log.l.trace, "ClientManagementLicenses.Controller.");
                that.binding.recordID = AppData.getRecordId("FairMandantVIEW_20582");
                Log.ret(Log.l.trace, that.binding.recordID);
                return that.binding.recordID;
            }
            this.getRecordId = getRecordId;

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

            /*var getStartEndDate = function(vid) {
                Log.call(Log.l.trace, "ClientManagementLicenses.Controller.", "VeranstaltungVIEWID=" + vid);
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return ClientManagementLicenses.veranstaltungView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.info, "veranstaltungView select: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            var results = json.d.results[0];
                            that.binding.newLicensesdata.VeranstaltungBeginn = results.Startdatum;
                            that.binding.newLicensesdata.VeranstaltungEnde = results.Enddatum;
                            Log.print(Log.l.info, "Start / End Date set!");
                        }
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error selecting event");
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, { VeranstaltungVIEWID: vid });
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.getStartEndDate = getStartEndDate;
            */
            /*
            var getTimeStamp = function() {
                Log.call(Log.l.trace, "ClientManagemenLicenses.Controller.");
                Log.print(Log.l.info, "creating timestamp");
                var date = new Date();

                var month = date.getMonth() + 1;
                var day = date.getDate();
                var hour = date.getHours();
                var min = date.getMinutes();
                var sec = date.getSeconds();

                month = (month < 10 ? "0" : "") + month;
                day = (day < 10 ? "0" : "") + day;
                hour = (hour < 10 ? "0" : "") + hour;
                min = (min < 10 ? "0" : "") + min;
                sec = (sec < 10 ? "0" : "") + sec;

                var str = date.getFullYear() + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

                Log.print(Log.l.info, "timestamp created and set");

                return str;
            
            }
            this.getTimeStamp = getTimeStamp;
            */

            var setSelIndex = function (index) {
                Log.call(Log.l.trace, "ClientManagemenLicenses.Controller.", "index=" + index);
                if (that.licenses && that.licenses.length > 0) {
                    if (index >= that.licenses.length) {
                        index = that.licenses.length - 1;
                    }
                    that.binding.selIdx = index;
                    listView.winControl.selection.set(index);
                }
                Log.ret(Log.l.trace);
            }
            this.setSelIndex = setSelIndex;

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "ClientManagementLicenses.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection && that.licenses) {
                    for (var i = 0; i < that.licenses.length; i++) {
                        var licenses = that.licenses.getAt(i);
                        if (licenses && typeof licenses === "object" &&
                            licenses.MandantTempLizenzVIEWID === recordId) {
                            listView.winControl.selection.set(i);
                            setSelIndex(i);
                            break;
                        } /*else {
                            var firstEmployee = that.licenses.getAt(0);
                            //listView.winControl.selection.set(0);
                        }*/
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            var scopeFromRecordId = function (recordId) {
                var i;
                Log.call(Log.l.trace, "ClientManagementLicenses.Controller.", "recordId=" + recordId);
                var item = null;
                for (i = 0; i < that.licenses.length; i++) {
                    var license = that.licenses.getAt(i);
                    if (license && typeof license === "object" &&
                        license.MandantTempLizenzVIEWID === recordId) {
                        item = license;
                        break;
                    }
                }
                if (item) {
                    Log.ret(Log.l.trace, "i=" + i);
                    return { index: i, item: item };
                } else {
                    Log.ret(Log.l.trace, "not found");
                    return null;
                }
            };
            this.scopeFromRecordId = scopeFromRecordId;

            var resultConverter = function (item, index) {
                item.index = index;
                item.VeranstaltungBeginn = that.getDateObject(item.VeranstaltungBeginn);
                item.VeranstaltungEnde = that.getDateObject(item.VeranstaltungEnde);
            }
            this.resultConverter = resultConverter;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "ClientManagementLicenses.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickShowNewLicenses: function (event) {
                    Log.call(Log.l.trace, "ClientManagementLicenses.Controller.");
                    infotext.value = "Info zur Lizenz hier eintragen";
                    that.binding.editLicensesShowFlag = false;
                    if (that.binding.newLicensesShowFlag === false) {
                        that.binding.newLicensesShowFlag = true;
                    } else {
                        that.binding.newLicensesShowFlag = false;
                    }
                    Log.ret(Log.l.trace);
                },
                clickVeranstaltungLicenses: function (event) {
                    Log.call(Log.l.trace, "ClientManagementLicenses.Controller.");
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_CreateMandantLizenz", {
                        pVeranstaltungID: parseInt(that.binding.newLicensesdata.VeranstaltungVIEWID),
                        pNumLicenses: parseInt(that.binding.newLicensesdata.NumLicenses),
                        pInfoText: that.binding.newLicensesdata.InfoText
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        that.binding.newLicensesShowFlag = false;
                        that.binding.newLicensesdata = getEmptyDefaultValue(ClientManagementLicenses.mandantTempLizenzView.defaultRestriction);
                        that.loadData(getRecordId());
                        }, function (errorResponse) {
                        Log.print(Log.l.error, "call error");
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                    Log.ret(Log.l.trace);
                },
                clickEditVeranstaltungLicenses: function (event) {
                    Log.call(Log.l.trace, "ClientManagementLicenses.Controller.");
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_CreateMandantLizenz", {
                        pMandantTempLizenzID: parseInt(that.binding.dataLicense.MandantTempLizenzVIEWID),
                        //pVeranstaltungID: parseInt(that.binding.dataLicense.VeranstaltungID),
                        pNumLicenses: parseInt(that.binding.dataLicense.NumLicenses),
                        pInfoText: that.binding.dataLicense.InfoText
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        that.binding.editLicensesShowFlag = false;
                        that.binding.dataLicense = getEmptyDefaultValue(ClientManagementLicenses.mandantTempLizenzView.defaultRestriction);
                        that.loadData(getRecordId());
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "call error");
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                    Log.ret(Log.l.trace);
                    
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "ClientManagementLicenses.Controller.");
                    that.binding.licenseId = 0;
                    that.binding.newLicensesShowFlag = false;
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "ClientManagementLicenses.Controller.");
                    Application.showDetail();
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    that.binding.dataLicense = item.data;
                                    //that.binding.editLicensesShowFlag = true;
                                    if (item.data &&
                                        item.data.MandantTempLizenzVIEWID &&
                                        item.data.MandantTempLizenzVIEWID !== that.binding.licenseId) {
                                        // called asynchronously if ok
                                        that.binding.editLicensesShowFlag = true;
                                        that.binding.licenseId = item.data.MandantTempLizenzVIEWID;
                                        that.binding.clientId = item.data.FairMandantID;
                                        that.binding.selIdx = item.index;
                                        } else {
                                        if (that.binding.editLicensesShowFlag === false) {
                                            that.binding.editLicensesShowFlag = true;
                                        } else {
                                        that.binding.editLicensesShowFlag = false;
                                    }
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    var i;
                    Log.call(Log.l.trace, "ClientManagementLicenses.Controller.");
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
                                layout = Application.ClientManagementLicensesLayout.ClientManagementLicensesLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "itemsLoaded") {
                            if (that.licenses && that.licenses.length > 0) {
                                var indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                                var indexOfLastVisible = listView.winControl.indexOfLastVisible;
                                for (i = indexOfFirstVisible; i <= indexOfLastVisible; i++) {
                                    var element = listView.winControl.elementFromIndex(i);
                                    if (element) {
                                        if (element.firstElementChild) {
                                            if (element.firstElementChild.disabled) {
                                                if (!WinJS.Utilities.hasClass(element, "win-nonselectable")) {
                                                    WinJS.Utilities.addClass(element, "win-nonselectable");
                                                    element.style.backgroundColor = "grey";
                                                }
                                            } else {
                                                if (WinJS.Utilities.hasClass(element, "win-nonselectable")) {
                                                    WinJS.Utilities.removeClass(element, "win-nonselectable");
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor);
                            Colors.loadSVGImageElements(listView, "warning-image", 40, "red");
                            if (that.loading) {
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
                            /*var i;
                            if (that.licenses) {
                                for (i = 0; i < that.licenses.length; i++) {
                                    var employee = that.licenses.getAt(i);
                                    if (employee.Gesperrt === 1) {
                                        var itemElement = listView.winControl.elementFromIndex(i);
                                        itemElement.oncontextmenu = function (e) { e.stopPropagation(); };
                                        // disable touch selection
                                        itemElement.addEventListener('MSPointerDown', function (e) {
                                            e.stopPropagation();
                                        });
                                        itemElement.addEventListener('pointerdown', function (e) {
                                            e.stopPropagation();
                                        });
                                        itemElement.style.backgroundColor = "grey";
                                    }
                                }
                            }*/
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "ClientManagementLicenses.Controller.");
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
                    Log.call(Log.l.trace, "ClientManagementLicenses.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;
                        if (visible && that.licenses && that.nextUrl) {
                            that.loading = true;
                            if (progress && progress.style) {
                                progress.style.display = "inline";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "none";
                            }
                            AppData.setErrorMsg(that.binding);
                            var nextUrl = that.nextUrl;
                            //that.nextUrl = null;
                            Log.print(Log.l.trace, "calling select ClientManagementLicenses.mandantTempLizenzView...");
                            ClientManagementLicenses.mandantTempLizenzView.selectNext(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "ClientManagementLicenses.mandantTempLizenzView: success!");
                                // employeeView returns object already parsed from json file in response
                                if (json && json.d && json.d.results.length > 0) {
                                    that.nextUrl = ClientManagementLicenses.mandantTempLizenzView.getNextUrl(json);
                                    var results = json.d.results;
                                    results.forEach(function (item, index) {
                                        that.resultConverter(item, index);
                                        that.binding.count = that.licenses.push(item);
                                    });
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                                that.loading = false;
                            }, null, nextUrl);
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
                }
            };

            this.disableHandlers = null;

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
            }

            var loadData = function (recordId) {
                Log.call(Log.l.trace, "ClientManagementLicenses.Controller.");
                that.loading = true;
                AppData.setRecordId("FairMandantVIEW_20582", recordId);
                that.binding.newLicensesShowFlag = false;
                that.binding.editLicensesShowFlag = false;
                //progress = listView.querySelector(".list-footer .progress");
                //counter = listView.querySelector(".list-footer .counter");
                if (progress && progress.style) {
                    progress.style.display = "inline";
                }
                if (counter && counter.style) {
                    counter.style.display = "none";
                }
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return ClientManagementLicenses.mandantTempLizenzView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "ClientManagementLicenses.mandantTempLizenzView: success!");
                        // employeeView returns object already parsed from json file in response
                        if (!recordId) {
                            that.licenses = new WinJS.Binding.List();
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.licenses.dataSource;
                            }
                        } else {
                            if (json && json.d && json.d.results.length > 0) {
                                that.binding.count = json.d.results.length;
                                that.nextUrl = ClientManagementLicenses.mandantTempLizenzView.getNextUrl(json);
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                that.licenses = new WinJS.Binding.List(results);
                                that.binding.dataLicense = results[0];
                                if (listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = that.licenses.dataSource;
                                }
                                //that.selectRecordId(json.d.results[0].MitarbeiterVIEWID);
                            } else {
                                that.binding.count = 0;
                                that.nextUrl = null;
                                that.licenses = null;
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
                        }, { FairMandantID: recordId});
                }).then(function () {
                    Log.print(Log.l.trace, "calling select veranstaltungView...");
                    return ClientManagementLicenses.veranstaltungView.select(function (json) {
                        Log.print(Log.l.trace, "ClientManagementLicenses.veranstaltungView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            var results = json.d.results;
                            that.binding.newLicensesdata.VeranstaltungVIEWID = results[0].VeranstaltungVIEWID;
                            // Now, we call WinJS.Binding.List to get the bindable list
                            if (veranstaltungLicenses && veranstaltungLicenses.winControl) {
                                veranstaltungLicenses.winControl.data = new WinJS.Binding.List(results);
                                editveranstaltungLicenses.winControl.data = new WinJS.Binding.List(results);
                                veranstaltungLicenses.selectedIndex = 0;
                                editveranstaltungLicenses.selectedIndex = 0;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, { FairMandantID: recordId });
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData(getRecordId());
            }).then(function () {
                Log.print(Log.l.trace, "Record selected");
            });
            Log.ret(Log.l.trace);
        })
    });
})();