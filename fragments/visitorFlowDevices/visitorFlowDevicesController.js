// controller for page: startContacts
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/visitorFlowDevices/visitorFlowDevicesService.js" />

(function () {
    "use strict";

    var namespaceName = "VisitorFlowDevices";

    WinJS.Namespace.define("VisitorFlowDevices", {
        Controller: WinJS.Class.derive(Fragments.RecordsetController, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            var listView = fragmentElement.querySelector("#visitorFlowDevicesList.listview");
            Fragments.RecordsetController.apply(this, [fragmentElement, {
                visitordata: null,
                devicedata: null,
                devicetime: null,
                entextdev: null
            }, [], VisitorFlowDevices.visitorDeviceView, null, listView]);

            this.refreshWaitTimeMs = 30000;

            var that = this;

            var layout = null;

            // now do anything...
            /*var dotdevice = fragmentElement.querySelectorAll(".dotdev");

            var setcolordotdevices = function (index, time, element) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var dateact = new Date();
                var dateactdate = dateact.getDate();
                var dateacthours = dateact.getHours();
                var dateactminutes = dateact.getMinutes();
                var datedataday = time.getDate();
                var datedatahours = time.getHours();
                var datedataminutes = time.getMinutes();
                var dateactminsum = (dateacthours * 60) + dateactminutes;
                var datedataminsum = (datedatahours * 60) + datedataminutes;
                var datecomp = dateactminsum - datedataminsum;
                if (dateactdate === datedataday && dateactminsum >= datedataminsum) {
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
                Log.ret(log.l.trace);
            }
            this.setcolordotdevices = setcolordotdevices;*/

            var msToTime = function(s) {
                var actDate = new Date(s);
                var day = actDate.getDate();
                var month = actDate.getMonth() + 1;
                if (day < 10) {
                    day = "0" + day;
                }
                if (month < 10) {
                    month = "0" + month;
                }
                return "" + new Date(s).toTimeString().substring(0, 5) + " " + day + "." + month;// .slice(11, -8)
            }
            this.msToTime = msToTime;

            var getDateObject = function (dateData, timeData) {
                var ret;
                var dateString;
                var milliseconds;
                if (dateData) {
                    dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                    milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    //ret = that.msToTime(milliseconds);
                    ret = new Date(milliseconds); /*.toLocaleDateString()*/
                    //.toLocaleString('de-DE').substr(0, 10);
                }
                else if (timeData) {
                    dateString = timeData.replace("\/Date(", "").replace(")\/", "");
                    milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    ret = that.msToTime(milliseconds);
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
                if (item.Eingang === 1 && item.Ausgang === null) {
                    item.entextdev = getResourceText("visitorFlowDevices.entrance");
                }
                if (item.Ausgang === 1 && item.Eingang === null) {
                    item.entextdev = getResourceText("visitorFlowDevices.exit");
                }
                if (item.Eingang === 1 && item.Ausgang === 1) {
                    item.entextdev = getResourceText("visitorFlowDevices.entrance") + " + " + getResourceText("visitorFlowDevices.exit");
                }
                if (item.Eingang === null && item.Ausgang === null) {
                    item.entextdev = "none";
                }
                item.LastCallTimeStamp = that.getDateObject(null, item.LastCallTS);
                if (item.LastCallTS) {
                    item.LastCallDate = that.getDateObject(item.LastCallTS, null);
                    var dateact = new Date();
                    var dateactdate = dateact.getDate();
                    var dateacthours = dateact.getHours();
                    var dateactminutes = dateact.getMinutes();
                    var datedataday = item.LastCallDate.getDate();
                    var datedatahours = item.LastCallDate.getHours();
                    var datedataminutes = item.LastCallDate.getMinutes();
                    var dateactminsum = (dateacthours * 60) + dateactminutes;
                    var datedataminsum = (datedatahours * 60) + datedataminutes;
                    var datecomp = dateactminsum - datedataminsum;
                    if (dateactdate === datedataday && dateactminsum >= datedataminsum) {
                        if (datecomp >= 60) {
                            item.dotdevColor = "red";
                        }
                        else if (datecomp >= 30 && datecomp < 60) {
                            item.dotdevColor = "orange";
                        } else {
                            item.dotdevColor = "green";
                        }
                    } else {
                        item.dotdevColor = "red";
                    }
                } else {
                    item.dotdevColor = "red";
                }
            }
            this.resultConverter = resultConverter;

            // define handlers
            this.eventHandlers = {
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.selectionChanged().then(function () {
                        AppBar.triggerDisableHandlers();
                    });
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.VisitorFlowDevicesLayout.VisitorFlowDevicesLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            // load SVG images
                            /*var indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                            var indexOfLastVisible = listView.winControl.indexOfLastVisible;
                            for (var i = indexOfFirstVisible; i <= indexOfLastVisible; i++) {
                                var element = listView.winControl.elementFromIndex(i);
                                if (element && that.records) {
                                    var dotdev = element.querySelector(".dotdev");
                                    if (dotdev) {
                                        var item = that.records.getAt(i);
                                        that.setcolordotdevices(i, item.LastCallDate, dotdev);
                                    }
                                }
                            }*/
                        }
                    }
                    that.loadingStateChanged(eventInfo);
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible && that.nextUrl) {
                            that.loadNext();
                        }
                    }
                    Log.ret(Log.l.trace);
                }
            };

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
            }

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
