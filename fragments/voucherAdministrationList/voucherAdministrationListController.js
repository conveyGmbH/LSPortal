// controller for page: voucherAdministrationList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/voucherAdministrationList/voucherAdministrationListService.js" />
/// <reference path="~/www/fragments/voucherAdministrationList/voucherAdministrationList.js" />



(function () {
    "use strict";

    var namespaceName = "VoucherAdministrationList";

    WinJS.Namespace.define(namespaceName, {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                recordID: 0,
                btnLabel: getResourceText("voucheradministrationlist.btnlabelO"),
                OpenVoucherSecondary: 'block'
            }]);
            var that = this;

            this.voucherEvent = [];
            this.voucherSubItem = [];
            this.voucherMainItem = [];
            this.voucherHeaderString = "";
            this.voucherHeaderItem = new WinJS.Binding.List();
            this.voucherNoHeaderItem = new WinJS.Binding.List();

            var layout = null;

            // now do anything...
            var listView = fragmentElement.querySelector("#voucherAdministrationList.listview");

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }

                if (that.orderItem) {
                    that.orderItem = null;
                }
                listView = null;
            }

            var scopeFromRecordId = function (recordId) {
                var i;
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                var item = null;
                var recordidint = parseInt(recordId);
                for (i = 0; i < that.voucherHeaderItem.length; i++) {
                    var field = that.voucherHeaderItem.getAt(i);
                    if (field && typeof field === "object" &&
                        field.ESVoucherOrderVIEWID === recordidint) {
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
                                field.ESVoucherOrderVIEWID === recordId) {
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
                Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                    ret = new Date(milliseconds).toLocaleDateString();
                    //.toLocaleString('de-DE').substr(0, 10);
                } else {
                    ret = "";
                }
                return ret;
            };
            this.getDateObject = getDateObject;

            var getGroupKey = function (dataItem) {
                return dataItem.ArticleName;
            }
            this.getGroupKey = getGroupKey;

            var getGroupData = function (dataItem) {
                return dataItem.ArticleName;
            };
            this.getGroupData = getGroupData;

            var createList = function (myList, results) {
                var myGroupedList = myList.createGrouped(getGroupKey, getGroupData);

                var groups = myGroupedList.groups;
                var div = fragmentElement.querySelector(".header-templateitem");

                var i = groups.length;
                while (--i >= 0) {
                    var group = groups.getItem(i);

                    div.textContent = group.data;

                    var j = group.groupSize;
                    var start = group.firstItemIndexHint;
                    while (--j >= 0) {
                        var item = myGroupedList.getItem(start + j);
                        div.textContent = item.data.ArticleName;
                    }
                }
                return myGroupedList;
            }
            this.createList = createList;

            var eventHandlers = {
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
                                layout = VoucherAdministrationList.ListLayout.VoucherAdministrationListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        }
                        if (listView.winControl.loadingState === "complete") {
                            if (that.loading) {
                                that.loading = false;
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onGroupHeaderInvoked: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var id = AppData.getRecordId("VeranstaltungTermin");
                        }
                    }
                    Log.ret(Log.l.trace);
                }
            }
            this.eventHandlers = eventHandlers;

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "groupheaderinvoked", this.eventHandlers.onGroupHeaderInvoked.bind(this));
            }

            var resultConverter = function (item, index) {
                item.index = index;
                if (!that.voucherHeaderItem) {
                    that.voucherHeaderItem = new WinJS.Binding.List();
                }
                if (item.IsHeader === null) {
                    that.voucherSubItem.push(item);
                } else {
                    that.voucherHeaderItem.push(item);
                    that.voucherEvent.push(item);
                    that.voucherMainItem.push(item);
                }

            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, "VoucherAdministrationList.");
                that.voucherEvent = [];
                that.voucherSubItem = [];
                that.voucherMainItem = [];
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return VoucherAdministrationList.voucherOrderView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "voucherOrderView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            var resultList = new WinJS.Binding.List(that.voucherSubItem);
                            that.resultList = that.createList(resultList, that.voucherSubItem);
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.resultList.dataSource;
                                listView.winControl.groupDataSource = that.resultList.groups.dataSource;
                            }
                        } else {
                            that.voucherHeaderItem = null;
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = null;
                                listView.winControl.groupDataSource = null;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        Log.print(Log.l.error, "voucherOrderView: error!");
                        AppData.setErrorMsg(that.binding, errorResponse);
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
                esid : "",
                disableFlag: 0,
                index : null
            })
    });
})();