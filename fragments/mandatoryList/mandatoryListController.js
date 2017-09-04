// controller for page: mandatoryList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/mandatoryList/mandatoryListService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("MandatoryList", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "MandatoryList.Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                
            }]);
            var that = this;

            this.questions = null;
            var layout = null;
            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            // now do anything...
            var listView = fragmentElement.querySelector("#mandatoryList.listview");

            // get field entries
            var getFieldEntries = function (index) {
                Log.call(Log.l.trace, "MandatoryList.Controller.");
                var ret = {};
                if (listView && listView.winControl) {
                    var element = listView.winControl.elementFromIndex(index);
                    if (element) {
                        var fields = element.querySelectorAll('input[type="checkbox"]');
                        ret["Active"] = (fields[0] && fields[0].checked) ? 1 : null;
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.getFieldEntries = getFieldEntries;

            var mergeRecord = function (prevRecord, newRecord) {
                Log.call(Log.l.trace, "MandatoryList.Controller.");
                var ret = false;
                for (var prop in newRecord) {
                    if (newRecord.hasOwnProperty(prop)) {
                        if (newRecord[prop] !== prevRecord[prop]) {
                            prevRecord[prop] = newRecord[prop];
                            ret = true;
                        }
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            }
            this.mergeRecord = mergeRecord;

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "MandatoryList.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    for (var i = 0; i < that.questions.length; i++) {
                        var question = that.questions.getAt(i);
                        if (question && typeof question === "object" &&
                            question.PflichtFelderVIEWID === recordId) {
                            listView.winControl.selection.set(i);
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            var scopeFromRecordId = function (recordId) {
                var i;
                Log.call(Log.l.trace, "MandatoryList.Controller.", "recordId=" + recordId);
                var item = null;
                for (i = 0; i < that.questions.length; i++) {
                    var question = that.questions.getAt(i);
                    if (question && typeof question === "object" &&
                        question.PflichtFelderVIEWID === recordId) {
                        item = question;
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

            var saveData = function (complete, error) {
                var ret = null;
                Log.call(Log.l.trace, "MandatoryList.Controller.");
                AppData.setErrorMsg(that.binding);
                // standard call via modify
                var recordId = that.prevRecId;
                if (!recordId) {
                    // called via canUnload
                    recordId = that.curRecId;
                    that.curRecId = 0;
                }
                that.prevRecId = 0;
                if (recordId) {
                    var curScope = that.scopeFromRecordId(recordId);
                    if (curScope && curScope.item) {
                        var newRecord = that.getFieldEntries(curScope.index);
                        if (that.mergeRecord(curScope.item, newRecord) || AppBar.modified) {
                            Log.print(Log.l.trace, "save changes of recordId:" + recordId);
                            ret = MandatoryList.mandatoryUpdate.update(function (response) {
                                Log.print(Log.l.info, "MandatoryList.Controller. update: success!");
                                // called asynchronously if ok
                                AppBar.modified = false;
                                if (typeof complete === "function") {
                                    complete(response);
                                }
                            }, function (errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (typeof error === "function") {
                                    error(errorResponse);
                                }
                            }, recordId, curScope.item);
                        } else {
                            Log.print(Log.l.trace, "no changes in recordId:" + recordId);
                        }
                    }
                }
                if (!ret) {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete({});
                        }
                    });
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.saveData = saveData;


            var eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "MandatoryList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "MandatoryList.Controller.");
                    Application.navigateById('mandatory', event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "MandatoryList.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "MandatoryList.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    if (item.data && item.data.PflichtFelderVIEWID) {
                                        var newRecId = item.data.PflichtFelderVIEWID;
                                        Log.print(Log.l.trace, "newRecId:" + newRecId + " curRecId:" + that.curRecId);
                                        if (newRecId !== 0 && newRecId !== that.curRecId) {
                                            AppData.setRecordId('PflichtFelder', newRecId);
                                            if (that.curRecId) {
                                                that.prevRecId = that.curRecId;
                                            }
                                            that.curRecId = newRecId;
                                            if (that.prevRecId !== 0) {
                                                that.saveData(function (response) {
                                                    Log.print(Log.l.trace, "mandatory question saved");
                                                    AppBar.triggerDisableHandlers();
                                                }, function (errorResponse) {
                                                    Log.print(Log.l.error, "error saving mandatory question");
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
                    Log.call(Log.l.trace, "MandatoryList.Controller.");
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
                                layout = new WinJS.UI.GridLayout();
                                layout.orientation = "horizontal";
                                listView.winControl.layout = { type: layout };
                            }
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

            this.disableHandlers = {
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickOk: function () {
                    var ret = true;
                    if (that.curRecId && !that.prevRecId) {
                        ret = false;
                    }
                    return ret;
                }
            }

            // register ListView event handler
            if (listView) {
                listView.addEventListener("selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                listView.addEventListener("loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
            }

            var loadData = function (curRecordId) {
                Log.call(Log.l.trace, "MandatoryList.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return MandatoryList.mandatoryView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "MandatoryList.mandatoryView: success!");
                        // select returns object already parsed from json file in response
                        if (json && json.d) {
                            that.binding.count = json.d.results.length;
                            //that.nextUrl = MandatoryList.mandatoryView.getNextUrl(json);
                            var results = json.d.results;
                            // Now, we call WinJS.Binding.List to get the bindable list
                            that.questions = new WinJS.Binding.List(results);
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.questions.dataSource;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, null);
                }).then(function () {
                    AppBar.notifyModified = true;
                    AppBar.triggerDisableHandlers();
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData(that.binding.recordId);
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



