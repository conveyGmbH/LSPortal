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

    var namespaceName = "EventSession";

    WinJS.Namespace.define(namespaceName, {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                recordID: 0,
                btnLabel: getResourceText("voucheradministrationlist.btnlabelO"),
                selectedData: EventSession.BBBSessionView.defaultValue,
                moderatorData: null,
                eventName: "",
                showEventNameStatus: null,
                eventStatusState: "",
                dwlink: null,
                sessionEndData: [],
                sessiondownloadData: [],
                oldPlayback: false
            }]);
            var that = this;

            var layout = null;
            this.sessions = null;

            // now do anything...
            var listView = fragmentElement.querySelector("#eventSessionList.listview");
            var linkcontainer = fragmentElement.querySelector("#dwlinkcontainer");
            var oldRecordingLink = fragmentElement.querySelector("#playbackLink"); // with playback

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

            var scopeFromRecordId = function (recordId) {
                var i;
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                var item = null;
                if (typeof recordId === "string") {
                    recordId = parseInt(recordId);
                }
                for (i = 0; i < that.listView.length; i++) {
                    var field = that.listView.getAt(i);
                    if (field && typeof field === "object" &&
                        field.BBBSessionVIEWID === recordId) {
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
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
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

            var getDurationObject = function (startDate, endDate) {
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
                    var a = moment(new Date(start));
                    var b = moment(new Date(end));
                    var diff = b.diff(a);
                    return moment.utc(diff).format("HH:mm:ss");
                } else {
                    ret = "";
                }
                return ret;
            }
            this.getDurationObject = getDurationObject;

            var setDownloadLink = function (link) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (link) {
                    that.binding.dwlink = link;
                }
                Log.ret(Log.l.trace);
            }
            this.setDownloadLink = setDownloadLink;

            var getModeratorData = function (veranstId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var ret = AppData.call("PRC_GetLBModerator", {
                    pVeranstaltungID: veranstId
                }, function (json) {
                    Log.print(Log.l.info, "call PRC_GetLBModerator success! ");
                    that.binding.moderatorData = json.d.results[0];
                }, function (error) {
                    Log.print(Log.l.error, "call PRC_GetLBModerator error");
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.getModeratorData = getModeratorData;

            var converterToArray = function (item) {
                for (var i = 0; i < item.length; i++) {
                    if (item[i]) {
                        that.binding.sessiondownloadData.push({ "Link": item[i] });
                    }
                }
            }
            this.converterToArray = converterToArray;

            var createButtonFromArray = function (url) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                that.binding.dwlink = true;
                if (url) {
                    if (that.binding.sessiondownloadData.length !== 0) {
                        for (var i = 0; i < that.binding.sessiondownloadData.length; i++) {
                            var newA = document.createElement("a");
                            newA.textContent = that.binding.sessiondownloadData[i].Link;
                            newA.id = "dwlinktext";
                            newA.href = url + that.binding.sessiondownloadData[i].Link;
                            newA.target = "_blank";
                            linkcontainer.appendChild(newA);
                        }
                    } else {
                        var newB = document.createElement("a");
                        newB.textContent = "Download Session";
                        newB.id = "dwlinktext";
                        newB.target = "_blank";
                        newB.href = url;
                        linkcontainer.appendChild(newB);
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.createButtonFromArray = createButtonFromArray;

            var getSessionDownloadFiles = function (rawurl) {
                var ret = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.", "rawurl=" + rawurl);
                if (rawurl) {
                    if (rawurl.search("/recording/") > 0) {
                        var urlsuffix = rawurl.substring(rawurl.indexOf("/recording/") + 11, rawurl.length);
                        var urlsuffix2 = rawurl.substring(rawurl.indexOf("/recording/") + 11, rawurl.length - 9);
                        var url = AppData.getBaseURL(AppData.appSettings.odata.onlinePort) + "/recording/" + urlsuffix;
                        var url2 = AppData.getBaseURL(AppData.appSettings.odata.onlinePort) + "/recording/" + urlsuffix2;
                        var options = AppData.initXhrOptions("GET", url, false);
                        Log.print(Log.l.info, "calling xhr method=GET url=" + options.url);
                        ret = WinJS.xhr(options).then(function xhrSuccess(response) {
                            Log.print(Log.l.info, "AppData.call xhr success! method=GET" + options.url);
                            try {
                                var result = response.responseText;
                                var breakfinal = result.split(/\r?\n|\r|\n/g);
                                that.converterToArray(breakfinal);
                                that.createButtonFromArray(url2);
                            } catch (exception) {
                                Log.print(Log.l.error, "resource parse error " + (exception && exception.message));
                                AppData.setErrorMsg(AppBar.scope.binding, (exception && exception.message));
                            }
                        }, function xhrError(errorResponse) {
                            Log.print(Log.l.error, "error=" + AppData.getErrorMsgFromResponse(errorResponse));
                            AppData.setErrorMsg(AppBar.scope.binding, errorResponse);
                        });
                    } else if (rawurl.search("/playback/") > 0) {
                        that.binding.oldPlayback = true;
                        if (oldRecordingLink) {
                            oldRecordingLink.innerHTML = "<a target=\"_blank\" href=" + rawurl + ">" + getResourceText("eventSession.sessionlink") + "</a>";
                        }
                    } else {
                        linkcontainer.innerHTML = "";
                        that.binding.oldPlayback = false;
                        that.createButtonFromArray(rawurl);
                    }
                } else {
                    Log.print(Log.l.trace, "null param");
                }
                Log.ret(Log.l.trace);
                return ret || WinJS.Promise.as();
            }
            this.getSessionDownloadFiles = getSessionDownloadFiles;

            var eventHandlers = {
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    that.binding.moderatorData = null;
                                    that.binding.dwlink = null;
                                    that.binding.sessionEndData = [];
                                    that.binding.sessiondownloadData = [];
                                    linkcontainer.innerHTML = "";
                                    if (item.data && item.data.BBBSessionVIEWID && item.data.BBBSessionVIEWID !== that.binding.recordID) {
                                        oldRecordingLink.innerHTML = "";
                                        that.binding.selectedData = item.data;
                                        that.binding.recordID = that.binding.selectedData.BBBSessionVIEWID;
                                        that.binding.eventStatusState = that.binding.selectedData.Status;
                                        that.getModeratorData(item.data.VeranstaltungID);
                                        if (that.binding.selectedData.StartTSUTC && that.binding.selectedData.EndTSUTC === null && that.binding.selectedData.RecordingLink === null) {
                                            that.binding.selectedData.sessionEndBtn = true;
                                        }
                                        if (that.binding.selectedData.StartTSUTC && that.binding.selectedData.RecordingLink) {
                                            that.getSessionDownloadFiles(that.binding.selectedData.RecordingLink);
                                        }
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
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
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = EventSessionList.ListLayout.EventSessionListLayout;
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
                if (item.RecordingExpected === 0) {
                    if (item.EndTSUTC) {
                        item.Status = "Session beendet! (Keine Aufzeichnung)";
                    } else {
                        item.Status = "Session läuft! (Aufzeichnung nicht gestartet)";
                    }
                } else if (item.RecordingExpected === 1) {
                    if (item.StartTSUTC === null && item.EndTSUTC === null && item.RecordingLink === null) {
                        item.Status = "Vorbereitung";
                    }
                    if (item.StartTSUTC && item.EndTSUTC === null && item.RecordingLink === null) {
                        item.Status = "Aktiv laufend";
                    }
                    if (item.StartTSUTC && item.EndTSUTC && item.RecordingLink === null) {
                        item.Status = "Beendet mit Aufnahme laufend";
                    }
                } else {
                    if (item.StartTSUTC && item.RecordingLink) {
                        item.Status = "Beendet mit Aufnahme fertig";
                    }
                    if (item.StartTSUTC && item.EndTSUTC && item.RecordingLink === null) {
                        item.Status = "beendet ohne Aufnahme";
                    }
                }
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var eventId = AppBar.scope.binding.eventId;
                that.sessions = [];
                that.binding.recordID = 0;
                that.binding.moderatorData = null;
                that.binding.dwlink = null;
                that.binding.oldPlayback = false;
                that.binding.selectedData = EventSession.BBBSessionView.defaultValue;
                that.statuscounter = 0;
                that.binding.sessiondownloadData = [];
                that.binding.eventName = AppBar.scope.binding.eventName;
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return EventSession.BBBSessionView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "BBBSessionView: success!");
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
                            listView.winControl.selection.set(0);
                        } else {
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = null;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        Log.print(Log.l.error, "BBBSessionView: error!");
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, { VeranstaltungID: eventId });
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
            statuscounter: 0,
            linkname: ""
        })
    });
})();
