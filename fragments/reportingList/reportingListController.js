// controller for page: reportingList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/reportingList/reportingListService.js" />
/// <reference path="~/www/pages/reporting/reportingController.js" />



(function () {
    "use strict";

    var namespaceName = "ReportingList";

    WinJS.Namespace.define("ReportingList", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
            }]);
            var that = this;

            // now do anything...
            var listView = fragmentElement.querySelector("#reportingList.listview");
            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var eventHandlers = {
            }
            this.eventHandlers = eventHandlers;

            var createEventHandler = function (id) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "id=" + id);
                eventHandlers["clickOLELetterID" + id] = function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (event && event.currentTarget) {
                        event.currentTarget.value = id;
                        AppBar.handleEvent('click', 'clickExport', event);
                    }
                    Log.ret(Log.l.trace);
                }
                Log.ret(Log.l.trace);
            }
            var disableButton = function () {
                if (that.reportingItem) {
                    for (var i = 0; i < that.reportingItem.length; i++) {
                        var item = that.reportingItem.getItem(i);
                        var element = listView.winControl.elementFromIndex(i);
                        if (item && item.data.disabled) {
                            var reportingButton = element.querySelector(".reporting-button");
                            if (reportingButton) {
                                reportingButton.disabled = item.data.disabled;
                            }
                            if (item.data.disabled) {
                                if (!WinJS.Utilities.hasClass(element, "win-nonselectable")) {
                                    WinJS.Utilities.addClass(element, "win-nonselectable");
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
            this.disableButton = disableButton;

            var disableList = function (disableFlag) {
                if (that.reportingItem) {
                    for (var i = 0; i < that.reportingItem.length; i++) {
                        var element = listView.winControl.elementFromIndex(i);
                        var item = that.reportingItem.getItem(i);
                        if (element) {
                            var reportingButton = element.querySelector(".reporting-button");
                            if (item.data.disabled) {
                                if (reportingButton) {
                                    reportingButton.disabled = item.data.disabled;
                                }
                            } else {
                                if (reportingButton) {
                                    reportingButton.disabled = disableFlag;
                                }
                            }

                            if (disableFlag) {
                                if (!WinJS.Utilities.hasClass(element, "win-nonselectable")) {
                                    WinJS.Utilities.addClass(element, "win-nonselectable");
                                }
                            } else {
                                if (WinJS.Utilities.hasClass(element, "win-nonselectable") && !item.data.disabled) {
                                    WinJS.Utilities.removeClass(element, "win-nonselectable");
                                }
                            }

                        }
                    }
                }
            }
            this.disableList = disableList;

            var resultConverter = function (item, index) {
                item.index = index;
                //[3, 4, 5, 7]
                if (!AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic) {
                    if (item.SortIdx === 2 ||
                        item.SortIdx === 3 ||
                        item.SortIdx === 4 ||
                        item.SortIdx === 5) {
                        item.disabled = true;
                    }
                }
                if (item.TypeName) {
                    that.reportingItem.push(item);
                } else {
                    Log.print(Log.l.trace, "TypeName ++ blocked!");
                }
                if (item.TypeName === "KontaktlistePDF") {
                    item.exportTypeIcon = "audi_pdf_excel";
                } else if (item.TypeName) {
                    item.exportTypeIcon = "excel";
                } else {
                    item.exportTypeIcon = "";
                }
            }
            this.resultConverter = resultConverter;

            var loadData = function (eventId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = eventId;
                if (!recordId) {
                    recordId = options.eventId;
                }
                that.reportingItem = new WinJS.Binding.List();
                var ret = new WinJS.Promise.as().then(function () {
                    if (recordId) {
                    return ReportingList.analysisListView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "analysisListView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            if (listView && listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.reportingItem.dataSource;
                            }
                            var blup = {
                                id: "clickZoomIn",
                                label: getResourceText("command.zoomin"),
                                tooltip: getResourceText("tooltip.zoomin"),
                                section: "primary",
                                svg: "zoom_in"
                            }
                            var commandList = [];
                            for (var i = 0; i < results.length; i++) {
                                var item = results[i];
                                /*if (!AppHeader.controller.binding.userData.SiteAdmin &&
                                    AppData._persistentStates.leadsuccessBasic) {
                                    if (item.SortIdx === 3 ||
                                        item.SortIdx === 4 ||
                                        item.SortIdx === 5 ||
                                        item.SortIdx === 7) {
                                        // ignore handler
                                    }
                                } else {*/
                                var id = results[i].TypeName;
                                commandList.push({
                                    id: "clickOLELetterID" + id,
                                    label: results[i].Title,
                                    section: "secondary"
                                });
                                createEventHandler(id);
                                //}
                            }
                            that.eventHandlers = eventHandlers;
                            that.commandList = commandList;
                        } else {
                            that.reportingItem = null;
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
                                VeranstaltungID: recordId, LanguageSpecID: AppData.getLanguageId()
                            })
                    } else {
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            this.eventHandlers = {
                onLoadingStateChanged: function (eventInfo) {
                    var i;
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                        Colors.loadSVGImageElements(listView, "action-image", null, "#ffffff", "name");
                        that.disableButton();
                        if (listView.winControl.loadingState === "itemsLoading") {
                           /* if (!layout) {
                                layout = Application.EmpListLayout.EmployeesLayout;
                                listView.winControl.layout = { type: layout };
                            }*/
                            // load SVG images
                            //Colors.loadSVGImageElements(listView, "action-image", null, "#ffffff", "name");
                        } else if (listView.winControl.loadingState === "itemsLoaded") {
                            //that.disableButton();
                        } else if (listView.winControl.loadingState === "complete") {
                            //that.disableButton();
                        }
                        Log.ret(Log.l.trace);
                    }
                }
            };

            this.disableHandlers = null;

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
            }

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
            reportingItem: null,
            disableFlag: 0
        })
    });
})();
