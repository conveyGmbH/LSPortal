// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/reportingColumnList/reportingColumnListService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("ReportingColumnList", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "ReportingColumnList.Controller.");
            Application.Controller.apply(this, [pageElement, {
                restriction: ReportingColumnList.pdfExportParamView.defaultValue,
                //restrictionPdf: getEmptyDefaultValue(ReportingColumnList.exportKontaktDataView.defaultValue),
                //restrictionExcel: {},
                dataColumn: ReportingColumnList.ExportReportColumnU.defaultValue,
                sampleName: getEmptyDefaultValue(ReportingColumnList.pdfExportParamView.defaultValue)
            }, commandList]);

            this.curRecId = 0;
            this.prevRecId = 0;
            this.reportingColumn = null;
            
            var that = this;

            // look for ComboBox element
            var exportFieldList1 = pageElement.querySelector("#InitExportField1");
            var exportFieldList2 = pageElement.querySelector("#InitExportField2");
            var exportFieldList3 = pageElement.querySelector("#InitExportField3");
            var exportFieldList4 = pageElement.querySelector("#InitExportField4");
            var erfassungsdatum = pageElement.querySelector("#ReportingPDFErfassungsdatum.win-datepicker");

            var layout = null;
            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            // now do anything...
            var listView = pageElement.querySelector("#reportingColumnList.listview");

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

            // get field entries
            var getFieldEntries = function (index) {
                Log.call(Log.l.trace, "ReportingColumnList.Controller.");
                var ret = {};
                if (listView && listView.winControl) {
                    var element = listView.winControl.elementFromIndex(index);
                    if (element) {
                        var fields = element.querySelectorAll('input[type="checkbox"]');
                        ret["FieldFlag"] = (fields[0] && fields[0].checked) ? 1 : null;
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.getFieldEntries = getFieldEntries;

            var mergeRecord = function (prevRecord, newRecord) {
                Log.call(Log.l.trace, "ReportingColumnList.Controller.");
                var ret = false;
                for (var prop in newRecord) {
                    if (newRecord.hasOwnProperty(prop)) {
                        if (newRecord[prop] !== prevRecord[prop]) {
                            prevRecord[prop] = newRecord[prop];
                            ret = true;
                        }
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            }
            this.mergeRecord = mergeRecord;

            var scopeFromRecordId = function (recordId) {
                var i;
                Log.call(Log.l.trace, "ReportingColumnList.Controller.", "recordId=" + recordId);
                var item = null;
                for (i = 0; i < that.reportingColumn.length; i++) {
                    var column = that.reportingColumn.getAt(i);
                    if (column && typeof column === "object" &&
                        column.ExportReportColumnVIEWID === recordId) {
                        item = column;
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
            }
            this.resultConverter = resultConverter;

            var saveData = function (complete, error) {
                var ret = null;
                var dataColumn = that.binding.dataColumn;
                Log.call(Log.l.trace, "ReportingColumnList.Controller.");
                AppData.setErrorMsg(that.binding);
                // standard call via modify
                var recordId = that.prevRecId;
                if (!recordId) {
                    // called via canUnload
                    recordId = that.curRecId;
                }
                that.prevRecId = 0;
                if (recordId) {
                    var curScope = that.scopeFromRecordId(recordId);
                    if (curScope && curScope.item) {
                        var newRecord = that.getFieldEntries(curScope.index);
                        if (that.mergeRecord(curScope.item, newRecord) || AppBar.modified) {
                            dataColumn.ExportReportColumnVIEWID = curScope.item.ExportReportColumnVIEWID;
                            dataColumn.INITRFeldTypID = curScope.item.INITRFeldTypID;
                            dataColumn.VeranstaltungID = curScope.item.VeranstaltungID;
                            dataColumn.FieldFlag = curScope.item.FieldFlag;
                            Log.print(Log.l.trace, "save changes of recordId:" + recordId);
                            ret = ReportingColumnList.ExportReportColumnU.update(function (response) {
                                Log.print(Log.l.info, "ReportingColumnList.Controller. update: success!");
                                // called asynchronously if ok
                                AppBar.modified = false;
                                if (typeof complete === "function") {
                                    complete(response);
                                }
                            }, function (errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (typeof error === "function") {
                                    error(errorResponse);
                                }
                                }, recordId, dataColumn);
                        } else {
                            Log.print(Log.l.trace, "no changes in recordId:" + recordId);
                        }
                    }
                }
                AppData.setRestriction("PdfExportParam", that.binding.restriction);

                var savedRestriction = AppData.getRestriction("PdfExportParam");
                if (typeof savedRestriction === "undefined") {
                    savedRestriction = ReportingColumnList.pdfExportParamView.defaultValue;
                }
                that.binding.restriction.NameField1ID = parseInt(savedRestriction.NameField1ID);
                that.binding.restriction.NameField2ID = parseInt(savedRestriction.NameField2ID);
                that.binding.restriction.NameField3ID = parseInt(savedRestriction.NameField3ID);
                that.binding.restriction.NameField4ID = parseInt(savedRestriction.NameField4ID);
                if (savedRestriction && !AppBar.busy) { /*AppBar.modified &&*/
                    var recordId = savedRestriction.PDFExportParamVIEWID;
                    if (recordId) {
                        AppBar.busy = true;
                        ret = ReportingColumnList.pdfExportParamView.update(function (response) {
                            AppBar.busy = false;
                            // called asynchronously if ok
                            Log.print(Log.l.info, "dataPdfExport update: success!");
                            AppBar.modified = false;
                            if (typeof complete === "function") {
                                complete(response);
                            }
                            //that.loadData();
                        },
                            function (errorResponse) {
                                AppBar.busy = false;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (typeof error === "function") {
                                    error(errorResponse);
                                }
                            }, recordId, savedRestriction).then(function () {
                                return ReportingColumnList.pdfExportParamsView.select(function (json) {
                                    Log.print(Log.l.trace, "PDFExport.pdfExportParamsView: success!");
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
                            });
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
                            complete(savedRestriction);
                        }
                    });
                }
                if (!ret) {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete({});
                        }
                    });
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.saveData = saveData;

            var eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "ReportingColumnList.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "ReportingColumnList.Controller.");
                    //Application.navigateById("Reporting");
                    that.saveData(function(response) {},
                        function (errorResponse) {
                            Log.print(Log.l.error, "error saving employee");
                        });
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "ReportingColumnList.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    if (item.data && item.data.ExportReportColumnVIEWID) {
                                        var newRecId = item.data.ExportReportColumnVIEWID;
                                        Log.print(Log.l.trace, "newRecId:" + newRecId + " curRecId:" + that.curRecId);
                                        if (newRecId !== 0 && newRecId !== that.curRecId) {
                                            AppData.setRecordId('ExportReportColumnVIEWID', newRecId);
                                            if (that.curRecId) {
                                                that.prevRecId = that.curRecId;
                                            }
                                            that.curRecId = newRecId;
                                            if (that.prevRecId !== 0) {
                                                that.saveData(function (response) {
                                                    Log.print(Log.l.trace, "question saved");
                                                    AppBar.triggerDisableHandlers();
                                                }, function (errorResponse) {
                                                    Log.print(Log.l.error, "error saving question");
                                                });
                                            } else {
                                                AppBar.triggerDisableHandlers();
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "ReportingColumnList.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "ReportingColumnList.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "ReportingColumnList.Controller.");
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
                            /*if (!layout) {
                                layout = new WinJS.UI.GridLayout();
                                layout.orientation = "horizontal";
                                listView.winControl.layout = { type: layout };
                            }*/
                        } else if (listView.winControl.loadingState === "complete") {
                            if (that.loading) {
                                that.loading = false;
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
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
                }
            }
            this.eventHandlers = eventHandlers;

            this.disableHandlers = {
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView,
                    "selectionchanged",
                    this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView,
                    "loadingstatechanged",
                    this.eventHandlers.onLoadingStateChanged.bind(this));
            }
            
            var loadData = function () {
                Log.call(Log.l.trace, "ReportingColumnList.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return ReportingColumnList.ExportReportColumn.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "ExportReportColumn: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d) {
                            var results = json.d.results;
                            that.reportingColumn = new WinJS.Binding.List(results);

                            if (listView && listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.reportingColumn.dataSource;
                            }
                        } else {
                            that.reportingColumn = null;
                            if (listView && listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = null;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                            VeranstaltungID: that.getEventId(),
                            LanguageSpecID: AppData.getLanguageId()
                        });
                }).then(function () {
                    return ReportingColumnList.pdfExportView.select(function (json) {
                        Log.print(Log.l.trace, "Mailing.FragebogenzeileView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d && json.d.results) {
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            //var savedRestriction = AppData.getRestriction("PdfExportParam");
                            // Now, we call WinJS.Binding.List to get the bindable list
                            if (exportFieldList1 && exportFieldList1.winControl) {
                                exportFieldList1.winControl.data = new WinJS.Binding.List(results);
                                exportFieldList1.selectedIndex = 0;
                            }
                            if (exportFieldList2 && exportFieldList2.winControl) {
                                exportFieldList2.winControl.data = new WinJS.Binding.List(results);
                                exportFieldList2.selectedIndex = 0;
                            }
                            if (exportFieldList3 && exportFieldList3.winControl) {
                                exportFieldList3.winControl.data = new WinJS.Binding.List(results);
                                exportFieldList3.selectedIndex = 0;
                            }
                            if (exportFieldList4 && exportFieldList4.winControl) {
                                exportFieldList4.winControl.data = new WinJS.Binding.List(results);
                                exportFieldList4.selectedIndex = 0;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                        VeranstaltungID: that.getEventId(),
                        LanguageSpecID: AppData.getLanguageId()
                    });
                }).then(function() {
                    var savedRestriction = AppData.getRestriction("PdfExportParam");
                    if (typeof savedRestriction === "undefined") {
                        savedRestriction = ReportingColumnList.pdfExportParamView.defaultValue;
                    }
                    that.binding.restriction.NameField1ID = parseInt(savedRestriction.NameField1ID);
                    that.binding.restriction.NameField2ID = parseInt(savedRestriction.NameField2ID);
                    that.binding.restriction.NameField3ID = parseInt(savedRestriction.NameField3ID);
                    that.binding.restriction.NameField4ID = parseInt(savedRestriction.NameField4ID);
                }).then(function () {
                    return ReportingColumnList.pdfExportParamsView.select(function (json) {
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
                        VeranstaltungID: that.getEventId(),
                        LanguageSpecID: AppData.getLanguageId()
                    });
                }).then(function () {
                    return ReportingColumnList.pdfExportParamView.select(function (json) {
                        Log.print(Log.l.trace, "Mailing.FragebogenzeileView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d && json.d.results) {
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            }); 
                            that.binding.restriction = results[0];
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                        VeranstaltungID: that.getEventId(),
                        LanguageSpecID: AppData.getLanguageId()
                    });
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
            })
    });
})();



