// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/eventTextUsage/eventTextUsageService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("EventTextUsage", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "EventTextUsage.Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {

            }]);

            this.textUsage = new WinJS.Binding.List([]);
            var that = this;


            // now do anything...
            var listView = fragmentElement.querySelector("#dokVerwendungList.listview");

            var eventHandlers = {
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EmpRoles.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    if (item.data && item.data.CR_MA_APUSERRoleVIEWID) {
                                        var newRecId = item.data.CR_MA_APUSERRoleVIEWID;
                                        Log.print(Log.l.trace, "newRecId:" + newRecId + " curRecId:" + that.curRecId);
                                        if (newRecId !== 0 && newRecId !== that.curRecId) {
                                            AppData.setRecordId('CR_MA_APUSERRole', newRecId);
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
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "EmpRoles.Controller.");
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
                        /*if (!maxLeadingPages) {
                            maxLeadingPages = listView.winControl.maxLeadingPages * 4;
                            listView.winControl.maxLeadingPages = maxLeadingPages;
                        }
                        if (!maxTrailingPages) {
                            maxTrailingPages = listView.winControl.maxTrailingPages * 4;
                            listView.winControl.maxTrailingPages = maxTrailingPages;
                        }*/
                        if (listView.winControl.loadingState === "itemsLoading") {
                           /* if (!layout) {
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
                }
            }
            this.eventHandlers = eventHandlers;

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
                Log.call(Log.l.trace, "EmpRoles.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (that.textUsage.length === 0) {
                        var results = EventTextUsage.LGNTINITDokVerwendungView.getResults();
                        if (results && results.length > 0) {
                            results.forEach(function (item, index) {
                                //that.resultConverter(item, index);
                                that.textUsage.push(item);
                            });
                            if (listView && listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.textUsage.dataSource;
                            }
                            Log.print(Log.l.trace, "Data loaded");
                            return WinJS.Promise.as();
                        } else {
                            return EventTextUsage.LGNTINITDokVerwendungView.select(function (json) {
                                Log.print(Log.l.trace, "appInfoSpecView: success!");
                                if (json && json.d && json.d.results && json.d.results.length > 0) {
                                    results = json.d.results;
                                    results.forEach(function (item, index) {
                                        //that.resultConverter(item, index);
                                        that.textUsage.push(item);
                                    });
                                    if (listView && listView.winControl) {
                                        // add ListView dataSource
                                        listView.winControl.itemDataSource = that.textUsage.dataSource;
                                    }
                                    Log.print(Log.l.trace, "Data loaded");
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                that.loading = false;
                            });
                        }
                    } else {
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        }, {
            apuserRole: null
        })
    });
})();



