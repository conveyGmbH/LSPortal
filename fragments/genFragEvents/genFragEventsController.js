// controller for page: genFragEvents
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/genFragEvents/genFragEventsService.js" />
/// <reference path="~/www/fragments/genFragEvents/genFragEvents.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.js" />



(function () {
    "use strict";

    WinJS.Namespace.define("GenFragEvents", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "EventSession.Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                recordID: 0,
                btnLabel: getResourceText("voucheradministrationlist.btnlabelO"),
                eventData: null,
                ecRecordID: 0,
                ecEventID: 0,
                count: 0
            }]);
            var that = this;

            var layout = null;
            this.events = null;

            // now do anything...
            var listView = fragmentElement.querySelector("#genFragEvents.listview");

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.events) {
                    that.events = null;
                }
                listView = null;
            }

            var scopeFromRecordId = function (recordId) {
                var i;
                Log.call(Log.l.trace, "MandatoryList.Controller.", "recordId=" + recordId);
                var item = null;
                var recordidint = parseInt(recordId);
                for (i = 0; i < that.listView.length; i++) {
                    var field = that.listView.getAt(i);
                    if (field && typeof field === "object" &&
                        field.BenutzerVIEWID === recordidint) {
                        item = field;
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

            var getDateObject = function (dateData, type) {
                var ret;
                if (dateData) {
                    if (type === 1) {
                        var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                        var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                        ret = moment(milliseconds).format("DD.MM");//new Date(milliseconds).toLocaleTimeString().slice(0, -3);
                        //.toLocaleString('de-DE').substr(0, 10);
                    } else {
                        var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                        var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                        ret = moment(milliseconds).format("DD.MM.YYYY");//new Date(milliseconds).toLocaleTimeString().slice(0, -3);
                        //.toLocaleString('de-DE').substr(0, 10);
                    }

                } else {
                    ret = "";
                }
                return ret;
            };
            this.getDateObject = getDateObject;

            var eventHandlers = {
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EmpList.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    if (item.data && item.data.BenutzerVIEWID) {
                                        that.binding.ecRecordID = item.data.MitarbeiterID;
                                        that.binding.ecEventID = item.data.VeranstaltungID;
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeEvent: function(event) {
                    Log.call(Log.l.trace, "EventSession.Controller.");
                    var newEmployeeId = null;
                    AppData.call("PRC_CopyAppMitarbeiter", {
                        pMitarbeiterID: that.binding.ecRecordID,
                        pNewVeranstaltungID: that.binding.ecEventID
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        if (json && json.d && json.d.results.length > 0) {
                            newEmployeeId = json.d.results[0] ? json.d.results[0].NewMitarbeiterID : null;
                        } else {
                            Log.print(Log.l.error, "ERROR: No Data found!");
                        }
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    }).then(function () {
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding && newEmployeeId) {
                            //AppData.setRecordId("MitarbeiterVIEW_20471", newEmployeeId);
                            master.controller.binding.employeeId = newEmployeeId;
                            return master.controller.loadData();
                        } else {
                            return WinJS.Promise.as();
                        }
                    }).then(function () {
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding) {
                            master.controller.binding.employeeId = newEmployeeId;
                            return master.controller.selectRecordId(master.controller.binding.employeeId);
                        } else {
                            return WinJS.Promise.as();
                        }
                    });
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EventSession.Controller.");
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
                                layout = GenFragEvents.ListLayout.GenFragEventsLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        }
                        if (listView.winControl.loadingState === "itemsLoaded") {
                            //
                        } else if (listView.winControl.loadingState === "complete") {
                            if (that.loading) {
                                that.loading = false;
                            }
                        }
                        var header = fragmentElement.querySelector(".list-header");
                        header.classList.toggle("sticky", window.scrollY > 0);
                    }
                    Log.ret(Log.l.trace);
                },
                onScroll: function (eventInfo) {

                }
            }
            this.eventHandlers = eventHandlers;

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "scroll", this.eventHandlers.onScroll.bind(this));
            }

            var resultConverter = function (item, index) {
                item.index = index;
                if (item.Startdatum) {
                    item.Startdatum = that.getDateObject(item.Startdatum, 1);
                }
                if (item.Enddatum) {
                    item.Enddatum = that.getDateObject(item.Enddatum, 2);
                }
                item.EndStartDatum = item.Startdatum + " - " + item.Enddatum;
                if (item.UserStatus === "ACTIVE" || item.UserStatus === "" || item.UserStatus === null) {
                    item.UserStatusID = 1;
                } else {
                    item.UserStatusID = "";
                }
                if (item.UserStatus === "INACTIVE") {
                    item.AktivButtonShowFlag = 1;
                } else {
                    item.AktivButtonShowFlag = "";
                }
                if (item.UserStatus === "TARGET" || item.UserStatus === "CHANGE") {
                    item.UserStatusShowFlag = 1;
                } else {
                    item.UserStatusShowFlag = "";
                }
            }
            this.resultConverter = resultConverter;

            var loadData = function (recordId) {
                var ret = null;
                Log.call(Log.l.trace, "EventSession.", "recordId=" + recordId);
                if (!recordId) {
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        Log.print(Log.l.trace, "employeeId=" + master.controller.binding.employeeId);
                        recordId = master.controller.binding.employeeId;
                    }
                }
                AppData.setErrorMsg(that.binding);
                if (recordId) {
                    ret = new WinJS.Promise.as().then(function () {
                        return GenFragEvents.BenutzerODataView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "voucherOrderView: success!");
                            // startContact returns object already parsed from json file in response
                            if (json && json.d && json.d.results) {
                                var results = json.d.results;
                                results.forEach(function (item, index) {
                                    that.resultConverter(item, index);
                                });
                                that.events = new WinJS.Binding.List(results);
                                if (listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = that.events.dataSource;
                                    that.binding.count = that.events.length;
                                }
                                listView.winControl.selection.set(0);
                            } else {
                                if (listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = null;
                                    that.binding.count = 0;
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            that.binding.count = 0;
                        }, { MitarbeiterID: recordId });
                    });
                } else {
                    Log.print(Log.l.trace, "No recordId set!");
                }
                Log.ret(Log.l.trace);
                return ret || WinJS.Promise.as();
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

            })
    });
})();