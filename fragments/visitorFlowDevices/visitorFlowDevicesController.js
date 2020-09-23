﻿// controller for page: startContacts
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/visitorFlowDevices/visitorFlowDevicesService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("VisitorFlowDevices", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "VisitorFlowDevices.Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                visitordata: null,
                devicedata: null,
                devicetime: null,
                entextdev: null
        }, options]);

            var that = this;

            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            // now do anything...
            var listView = fragmentElement.querySelector("#visitorFlowDevicesList.listview");
            var dotdevice = fragmentElement.querySelectorAll(".dotdev");

            var setcolordotdevices = function (index, time, element) {
                var dateact = new Date();
                var dateacthours = dateact.getHours();
                var dateactminutes = dateact.getMinutes();
                var datedatahours = time.getHours();
                var datedataminutes = time.getMinutes();
                var dateactminsum = (dateacthours * 60) + dateactminutes;
                var datedataminsum = (datedatahours * 60) + datedataminutes;
                var datecomp = dateactminsum - datedataminsum;
                if (dateactminsum > datedataminsum) {
                    if (datecomp >= 60) {
                        element.style.backgroundColor = "red";
                    }
                    else if (datecomp >= 30 && datecomp < 60) {
                        element.style.backgroundColor = "orange";
                    } else {
                        element.style.backgroundColor = "green";
                    }
                } else {
                    element.style.backgroundColor = "red";
                }
                
                Log.call(Log.l.trace, "VisitorFlowDevices.Controller.");

            }
            this.setcolordotdevices = setcolordotdevices;

            var msToTime = function(s) {
                return new Date(s).toTimeString().substring(0, 5);// .slice(11, -8)
            }
            this.msToTime = msToTime;

            var getDateObject = function (dateData, timeData) {
                Log.call(Log.l.trace, "VisitorFlowDevices.Controller.");
                var ret;
                var dateString;
                var milliseconds;
                if (dateData) {
                    dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                    milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    ret = that.msToTime(milliseconds);
                    //ret = new Date(milliseconds).toLocaleDateString();
                    //.toLocaleString('de-DE').substr(0, 10);
                }
                else if (timeData) {
                    dateString = timeData.replace("\/Date(", "").replace(")\/", "");
                    milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    ret = new Date(milliseconds);
                    //.toLocaleString('de-DE').substr(0, 10);
                }
                else {
                    ret = "";
                }
                return ret;
            };
            this.getDateObject = getDateObject;
            
            var resultConverter = function (item, index) {
                item.index = index;
                if (item.Eingang === 1) {
                    item.entextdev = getResourceText("visitorFlowDevices.entrance");
                } else {
                    item.entextdev = getResourceText("visitorFlowDevices.exit");
                }
                if (item.LastCallTS) {
                    item.LastCallTS = that.getDateObject(item.LastCallTS, null);
                }
            }
            this.resultConverter = resultConverter;

            // define handlers
            this.eventHandlers = {
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
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
                                layout = Application.VisitorFlowDevicesLayout.VisitorFlowDevicesLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            // load SVG images
                            var indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                            var indexOfLastVisible = listView.winControl.indexOfLastVisible;
                            for (var i = indexOfFirstVisible; i <= indexOfLastVisible; i++) {
                                var element = listView.winControl.elementFromIndex(i);
                                if (element) {
                                    var dotdev = element.querySelectorAll(".dotdev");
                                    if (dotdev && dotdev.length > 0) {
                                        for (var y = 0; y < dotdev.length; y++) {
                                            that.setcolordotdevices(y, that.getDateObject(null, that.binding.devicetime[y].LastCallTS), dotdev[y]);
                                        }
                                    }
                                }
                            }
                            //that.loading = false;
                            //that.loadNextUrl();
                        }
                    }
                    Log.ret(Log.l.trace);
                }
            };

            // register ListView event handler
            if (listView) {
                //this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                //this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                //this.addRemovableEventListener(listView, "headervisibilitychanged", this.eventHandlers.onHeaderVisibilityChanged.bind(this));
            }

            var loadData = function () {
                Log.call(Log.l.trace, "VisitorFlowDevices.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                        Log.print(Log.l.trace, "calling selectvisitorView...");
                        ret = VisitorFlowDevices.visitorDeviceView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "mitarbeiterView: success!");
                            // mitarbeiterView returns object already parsed from json file in response
                            if (json && json.d && json.d.results && json.d.results.length > 0) {
                                var results = json.d.results;
                                that.binding.devicetime = results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                that.deviceItem = new WinJS.Binding.List(results);
                                if (listView && listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = that.deviceItem.dataSource;
                                }
                            } else {
                                that.deviceItem = null;
                                if (listView && listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = null;
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            WinJS.Promise.timeout(3000).then(function () {
                                
                            });
                            return WinJS.Promise.as();
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
            deviceItem: null
            })
    });
})();
