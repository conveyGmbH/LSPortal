// controller for page: voucherAdministrationList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/eventSession/eventSessionService.js" />
/// <reference path="~/www/fragments/eventSession/eventSession.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.js" />



(function () {
    "use strict";

    WinJS.Namespace.define("EventSession", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "EventSession.Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                recordID: 0,
                btnLabel: getResourceText("voucheradministrationlist.btnlabelO"),
                selectedData: null,
                moderatorData: null,
                eventName: null,
                showEventNameStatus: null,
                eventStatusState: "",
                dwlink: null,
                sessionEndBtn: null,
                sessionEndData: []
            }]);
            var that = this;
            
            var layout = null;
            this.sessions = null;

            // now do anything...
            var listView = fragmentElement.querySelector("#eventSessionList.listview");
           
            this.dispose = function () {
                if (that.binding.moderatorData) {
                    that.binding.moderatorData = null;
                }
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.sessions) {
                    that.sessions = null;
                }
                listView = null;
            }

            var getEventId = function () {
                return EventSession._eventId;
            }
            this.getEventId = getEventId;

            var setEventId = function (value) {
                Log.print(Log.l.trace, "setEventId=" + value);
                EventSession._eventId = value;
                return that.loadData();
            }
            this.setEventId = setEventId;

            var setVaName = function(eventName) {
                Log.print(Log.l.trace, "setVaName=" + eventName);
                that.binding.eventName = eventName;
                that.binding.showEventNameStatus = 1;
            }
            this.setVaName = setVaName;

            var scopeFromRecordId = function (recordId) {
                var i;
                Log.call(Log.l.trace, "MandatoryList.Controller.", "recordId=" + recordId);
                var item = null;
                var recordidint = parseInt(recordId);
                for (i = 0; i < that.listView.length; i++) {
                    var field = that.listView.getAt(i);
                    if (field && typeof field === "object" &&
                        field.BBBSessionVIEWID === recordidint) {
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

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "MandatoryList.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    if (fields) {
                        for (var i = 0; i < that.fields.length; i++) {
                            var field = that.fields.getAt(i);
                            if (field &&
                                typeof field === "object" &&
                                field.BBBSessionVIEWID === recordId) {
                                listView.winControl.selection.set(i);
                                break;
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;
            
            var getRecordId = function () {
                Log.call(Log.l.trace, "EventSession.Controller.");
                that.binding.recordID = AppData.getRecordId("VeranstaltungAnlage");
                Log.ret(Log.l.trace, that.binding.recordID);
                return that.binding.recordID;
            }
            this.getRecordId = getRecordId;

            var getDateObject = function (dateData) {
                var ret;
                if (dateData) {
                    var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                    var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    ret = moment(milliseconds).format("DD.MM.YYYY HH:mm");//new Date(milliseconds).toLocaleTimeString().slice(0, -3);
                    //.toLocaleString('de-DE').substr(0, 10);
                } else {
                    ret = "";
                }
                return ret;
            };
            this.getDateObject = getDateObject;

            var getDurationObject = function(startDate, endDate) {
                var ret;
                var start;
                var end;
                if (startDate) {
                    var startDateNew = startDate.replace("\/Date(", "").replace(")\/", "");
                    var millisecondsStart = parseInt(startDateNew) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    start = moment(millisecondsStart).format();//new Date(milliseconds).toLocaleTimeString().slice(0, -3);
                    //.toLocaleString('de-DE').substr(0, 10);
                }
                if (endDate) {
                    var endDateNew = endDate.replace("\/Date(", "").replace(")\/", "");
                    var millisecondsEnd = parseInt(endDateNew) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    end = moment(millisecondsEnd).format();//new Date(milliseconds).toLocaleTimeString().slice(0, -3);
                    //.toLocaleString('de-DE').substr(0, 10);
                }
                if (start && end) {
                    Log.call(Log.l.trace, "EventSession.Controller.");
                    var a = moment(new Date(start));
                    var b = moment(new Date(end));
                    var diffs = moment.duration(b.diff(a));
                    return diffs.minutes();
                } else {
                    ret = "";
                }
                return ret;
            }
            this.getDurationObject = getDurationObject;

            var setStatus = function (statusid) {
                Log.call(Log.l.trace, "EventSession.Controller.");
                if (that.statuscounter < statusid) {
                    that.statuscounter = statusid;
                }
                if (that.statuscounter === 1) {
                    that.binding.eventStatusState = "Vorbereitung";
                }
                if (that.statuscounter === 2) {
                    that.binding.eventStatusState = "Aktiv laufend";
                }
                if (that.statuscounter === 3) {
                    that.binding.eventStatusState = "Beendet mit Aufnahme laufend";
                }
                if (that.statuscounter === 4) {
                    that.binding.eventStatusState = "Beendet mit Aufnahme fertig";
                }
                if (that.statuscounter === 5) {
                    that.binding.eventStatusState = "beendet ohne Aufnahme";
                }
                Log.ret(Log.l.trace);
            }
            this.setStatus = setStatus;

            var setDownloadLink = function(link) {
                Log.call(Log.l.trace, "EventSession.Controller.");
                if (link) {
                    that.binding.dwlink = link;
                }
                Log.ret(Log.l.trace);
            }
            this.setDownloadLink = setDownloadLink;

            var setSesssionEndButton = function(vid) {
                Log.call(Log.l.trace, "EventSession.Controller.");
                if (vid) {
                    that.binding.sessionEndBtn = 1;
                } else {
                    that.binding.sessionEndBtn = null;
                }
                that.binding.sessionEndData.VeranstaltungID = vid;
                that.binding.sessionEndData.modToken = that.binding.moderatorData.UserToken;
                Log.ret(Log.l.trace);
            }
            this.setSesssionEndButton = setSesssionEndButton;

            var getSessionEndData = function() {
                return that.binding.sessionEndData;
            }
            this.getSessionEndData = getSessionEndData;

            var getModeratorData = function(veranstId) {
                Log.call(Log.l.trace, "EventSession.Controller.");
                AppData.call("PRC_GetLBModerator",
                    {
                        pVeranstaltungID: veranstId
                    },
                    function (json) {
                        Log.print(Log.l.info, "call success! ");
                        that.binding.moderatorData = json.d.results[0];
                        if (that.binding.sessionEndBtn) {
                            that.setSesssionEndButton(veranstId);
                        }
                        Log.print(Log.l.info, "call success! ");
                    },
                    function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                Log.ret(Log.l.trace);
            }
            this.getModeratorData = getModeratorData;

            var getSelectedData = function() {
                Log.call(Log.l.trace, "EventSession.Controller.");
                return that.binding.selectedData;
            }
            this.getSelectedData = getSelectedData;

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
                                    if (item.data && item.data.BBBSessionVIEWID) {
                                        that.binding.selectedData = item.data;
                                        that.getModeratorData(item.data.VeranstaltungID);
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
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
                                layout = EventSessionList.ListLayout.EventSessionListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        }
                        if (listView.winControl.loadingState === "itemsLoaded") {
                            Log.call(Log.l.trace, "EventSession.Controller.");
                        } else if (listView.winControl.loadingState === "complete") {
                            if (that.loading) {
                                that.loading = false;
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                }
            }
            this.eventHandlers = eventHandlers;

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
            }
            this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
            
            var resultConverter = function (item, index) {
                item.index = index;
                if (item.StartTSUTC) {
                    item.SessionStart = that.getDateObject(item.StartTSUTC);
                }
                if (item.StartTSUTC && item.EndTSUTC) {
                    item.Dauer = that.getDurationObject(item.StartTSUTC, item.EndTSUTC);
                } else {
                    item.Dauer = "-";
                }
                if (item.StartTSUTC === null && item.EndTSUTC === null && item.RecordingExpected === 0 || item.RecordingExpected === null  && item.RecordingLink === null) {
                    item.Status = "Vorbereitung";
                    that.setStatus(1);
                }
                else if (item.StartTSUTC && item.EndTSUTC === null && item.RecordingExpected === 0 || item.RecordingExpected === null && item.RecordingLink === null) {
                    item.Status = "Aktiv laufend";
                    that.binding.sessionEndBtn = 1;
                    that.setStatus(2);
                }
                else if (item.StartTSUTC && item.EndTSUTC && item.RecordingExpected === 1 && item.RecordingLink === null) {
                    item.Status = "Beendet mit Aufnahme laufend";
                    that.setStatus(3);
                }
                else if (item.StartTSUTC && item.EndTSUTC && item.RecordingExpected === 0 || item.RecordingExpected === null && item.RecordingLink) {
                    item.Status = "Beendet mit Aufnahme fertig";
                    that.setDownloadLink(item.RecordingLink);
                    that.setStatus(4);
                }
                else if (item.StartTSUTC && item.EndTSUTC && item.RecordingExpected === 0 && item.RecordingLink === null) {
                    item.Status = "beendet ohne Aufnahme";
                    that.setStatus(5);
                }
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, "EventSession.");
                that.sessions = [];
                that.binding.moderatorData = null;
                that.binding.dwlink = null;
                that.binding.eventStatusState = "";
                that.binding.sessionEndBtn = null;
                that.statuscounter = 0;
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return EventSession.BBBSessionODataView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "voucherOrderView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results) {
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            that.sessions = new WinJS.Binding.List(results);
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.sessions.dataSource;
                            }
                        } else {
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = null;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                            VeranstaltungID: that.getEventId()
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
                statuscounter: 0
            })
    });
})();