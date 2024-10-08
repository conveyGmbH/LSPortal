﻿// controller for page: reportingList
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

    var namespaceName = "PdfExportList";

    WinJS.Namespace.define("PdfExportList", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
            }]);
            var pageBinding = AppBar.scope && AppBar.scope.binding;
            var that = this;

            // now do anything...
            var listView = fragmentElement.querySelector("#pdfExportList.listview");

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

            var disableList = function (disableFlag) {
                if (that.reportingItem) {
                    for (var i = 0; i < that.reportingItem.length; i++) {
                        var element = listView.winControl.elementFromIndex(i);
                        if (element) {
                            var reportingButton = element.querySelector(".pdfexport-button");
                            if (reportingButton) {
                                reportingButton.disabled = disableFlag;
                            }
                            if (disableFlag) {
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
            this.disableList = disableList;

            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(pageBinding);
                var ret = new WinJS.Promise.as().then(function () {
                    return PdfExportList.pdfExportListView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "analysisListView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            var results = json.d.results;
                            that.reportingItem = new WinJS.Binding.List(results);
                            if (listView && listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.reportingItem.dataSource;
                            }
                            var blup = { id: "clickZoomIn", label: getResourceText("command.zoomin"), tooltip: getResourceText("tooltip.zoomin"), section: "primary", svg: "zoom_in" }
                            var commandList = [];
                            for (var i = 0; i < results.length; i++) {
                                var id = results[i].OLELetterID;
                                commandList.push({
                                    id: "clickOLELetterID" + id,
                                    label: results[i].Text,
                                    section: "secondary"
                                });
                                createEventHandler(id);
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
                        AppData.setErrorMsg(pageBinding, errorResponse);
                    }, {
                    }).then(function () {
                        Log.print(Log.l.trace, "Data loaded");
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
        }, {
            reportingItem: null,
            disableFlag: 0
        })
    });
})();
