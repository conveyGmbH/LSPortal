// controller for page: reorderList
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

    WinJS.Namespace.define("ReorderList", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "ReorderList.Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                recordID: 0,
                btnLabel : ""
            }]);
            var that = this;

            var btnLabelO = getResourceText("reorderlist.btnlabelO");
            var btnLabelB = getResourceText("reorderlist.btnlabelB");

            var layout = null;

            // now do anything...
            var listView = fragmentElement.querySelector("#reorderList.listview");

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.orderItem) {
                    that.orderItem = null;
                }
                listView = null;
            }

            var getRecordId = function () {
                Log.call(Log.l.trace, "SiteEventsNeuAus.Controller.");
                that.binding.recordID = AppData.getRecordId("VeranstaltungAnlage");
                Log.ret(Log.l.trace, that.binding.recordID);
                return that.binding.recordID;
            }
            this.getRecordId = getRecordId;

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "LocalEvents.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    for (var i = 0; i < that.orderItem.length; i++) {
                        var orderItem = that.orderItem.getAt(i);
                        if (orderItem && typeof orderItem === "object" &&
                            orderItem.VeranstaltungAnlageVIEWID === recordId) {
                            listView.winControl.selection.set(i);
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

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

            var eventHandlers = {
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "MailingProductLine.Controller.");
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
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = ReorderList.ListLayout.ReorderListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            if (that.loading) {
                                that.loading = false;
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
            }
            this.eventHandlers = eventHandlers;

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
            }

            var resultConverter = function (item, index) {
                item.index = index;
                item.OrderedTS = that.getDateObject(item.OrderedTS);
                if (item.OpenOrderForDevice === 0) {
                    that.binding.btnLabel = btnLabelO;
                } else {
                    that.binding.btnLabel = btnLabelB;
                }
            }
            this.resultConverter = resultConverter;

            var createEventHandler = function (id) {
                Log.call(Log.l.trace, "ReorderList.Controller.", "id=" + id);
                eventHandlers["clickVeranstaltungAnlageVIEWID" + id] = function (event) {
                    Log.call(Log.l.trace, "ReorderList.Controller.");
                    if (event && event.currentTarget) {
                        event.currentTarget.value = id;
                        AppBar.handleEvent('click', 'clickOrder', event);
                    }
                    Log.ret(Log.l.trace);
                }
                Log.ret(Log.l.trace);
            }
            
            var loadData = function () {
                Log.call(Log.l.trace, "ReorderList.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return ReorderList.VeranstaltunganlageView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "ReorderList: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            that.orderItem = new WinJS.Binding.List(results);
                            if (listView && listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.orderItem.dataSource;
                            }
                            var blup = { id: "clickZoomIn", label: getResourceText("command.zoomin"), tooltip: getResourceText("tooltip.zoomin"), section: "primary", svg: "zoom_in" }
                            var commandList = [];
                            for (var i = 0; i < results.length; i++) {
                                var id = results[i].VeranstaltungAnlageVIEWID;
                                commandList.push({
                                    id: "clickVeranstaltungAnlageVIEWID" + id,
                                    label: results[i].Text,
                                    section: "secondary"
                                });
                                createEventHandler(id);
                            }
                            that.eventHandlers = eventHandlers;
                            that.commandList = commandList;
                        } else {
                            that.orderItem = null;
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
                        VeranstaltungID : that.binding.recordID
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
                return that.getRecordId();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
                orderItem: null,
                disableFlag: 0
            })
    });
})();