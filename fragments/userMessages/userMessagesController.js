// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/userMessages/userMessagesService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("UserMessages", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "UserMessages.Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                recordId: options ? options.recordId : null,
                newInfo1Flag: 0
            }]);
            this.messages = null;

            var that = this;

            this.refreshPromise = null;
            this.refreshWaitTimeMs = 30000;

            this.dispose = function () {
                that.cancelPromises();
            };

            var cancelPromises = function () {
                Log.call(Log.l.trace, "Barcode.Controller.");
                if (that.refreshPromise) {
                    Log.print(Log.l.trace, "cancel previous refresh Promise");
                    that.refreshPromise.cancel();
                    that.refreshPromise = null;
                }
                Log.ret(Log.l.trace);
            }
            this.cancelPromises = cancelPromises;

            var layout = null;

            // now do anything...
            var listView = fragmentElement.querySelector("#userMessageList.listview");

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
                                    if (item.data &&
                                        item.data.BenutzerVIEWID &&
                                        item.data.BenutzerVIEWID !== that.binding.employeeId &&
                                        item.data.Info1TSRead === null) {
                                        if (typeof that.saveData === "function") {
                                            //=== "function" save wird nicht aufgerufen wenn selectionchange
                                            // current detail view has saveData() function
                                            that.saveData(item,
                                                function(response) {
                                                    // called asynchronously if ok
                                                },
                                                function(errorResponse) {
                                                    that.selectRecordId(that.binding.employeeId);
                                                });
                                        }
                                    } 
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "UserMessages.Controller.");
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
                                layout = UserMessages.ListLayout.MessagesLayout;
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

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
            }

            var resultConverter = function (item, index) {
                if (item.Info1 && !item.Info1TSRead) {
                    item.newInfo1Flag = 1;
                } else {
                    item.newInfo1Flag = 0;
                }
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, "UserMessages.");
                AppData.getMessagesData();
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select Benutzerview...");
                    return UserMessages.BenutzerView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "Benutzerview: success!");
                        if (json && json.d) {
                            if (!that.messages) {
                                that.messages = new WinJS.Binding.List([]);
                            } else {
                                that.messages.length = 0;
                            }
                            json.d.results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                                // push to that.messages if (item.Info1) is not empty!
                                if (item.Info1) {
                                    that.messages.push(item);
                                }
                            });
                        }
                        if (listView.winControl) {
                            // add ListView dataSource
                            listView.winControl.itemDataSource = that.messages.dataSource;
                        }
                        Log.print(Log.l.trace, "Infodesk: success!");
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                }).then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    that.cancelPromises();
                    that.refreshPromise = WinJS.Promise.timeout(that.refreshWaitTimeMs).then(function () {
                        that.loadData();
                    });
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;


            var saveData = function (item, complete, error) {
                Log.call(Log.l.trace, "Infodesk.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var recordId;
                if (item && item.data && item.data.BenutzerVIEWID) {
                    recordId = item.data.BenutzerVIEWID;
                }

                if (recordId) {
                    AppBar.modified = true;
                    var dataBenutzer = that.binding.dataBenutzer;
                    if (item.data) { //!dataBenutzer && 
                        dataBenutzer = item.data;
                    }
                    if (dataBenutzer && AppBar.modified && !AppBar.busy) {
                        if (dataBenutzer.BenutzerVIEWID || item.data.BenutzerVIEWID) {
                            ret = UserMessages.BenutzerView.update(function (response) {
                                // called asynchronously if ok
                                // force reload of userData for Present flag
                                AppBar.modified = false;
                                Log.print(Log.l.trace, "benutzerView: update success!");
                                complete(response);
                            },
                            function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                error(errorResponse);
                            },
                            item.data.BenutzerVIEWID, dataBenutzer).then(function () {
                                if (recordId) {
                                    return that.loadData(recordId);
                                    /* //load of format relation record data
                                     AppData.setErrorMsg(that.binding);
                                     Log.print(Log.l.trace, "calling select benutzerView...");
                                     return UserMessages.BenutzerView.select(function (json) {
                                         Log.print(Log.l.trace, "benutzerView: success!");
                                         if (json && json.d) {
                                             that.binding.dataBenutzer = json.d.results;
                                             that.binding.dataBenutzer.forEach(function (item) {
                                                 that.resultConverter(item);
                                             });
                                             var selectedItem = that.messages.getAt(item.index);
                                             selectedItem.Info1TSRead = that.binding.dataBenutzer[0].Info1TSRead;
                                             that.messages.setAt(item.index, selectedItem);
                                         }
                                     }, function (errorResponse) {
                                         if (errorResponse.status === 404) {
                                             Log.print(Log.l.trace, "benutzerView: ignore NOT_FOUND error here!");
                                             //that.setDataBenutzer(getEmptyDefaultValue(Infodesk.benutzerView.defaultValue));
                                         } else {
                                             AppData.setErrorMsg(that.binding, errorResponse);
                                         }
                                     }, { BenutzerVIEWID: recordId });*/
                                } else {
                                    //that.setDataBenutzer(getEmptyDefaultValue(Infodesk.benutzerView.defaultValue));
                                    return WinJS.Promise.as();
                                }
                            });
                        } /*else if (that.binding.employeeId) {
                            dataBenutzer.BenutzerVIEWID = that.binding.employeeId;
                            ret = Infodesk.benutzerView.insert(function (json) {
                                // called asynchronously if ok
                                // force reload of userData for Present flag
                                AppBar.modified = false;
                                Log.print(Log.l.trace, "benutzerView: insert success!");
                                if (json && json.d) {
                                    that.setDataBenutzer(json.d);
                                }
                                complete(json);
                            },
                            function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                error(errorResponse);
                            },
                            dataBenutzer);
                        }*/
                    } else {
                        ret = new WinJS.Promise.as().then(function () {
                            complete(dataBenutzer);
                        });
                    }
                } else {
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;

            }
            this.saveData = saveData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Message selected");
            });;
            Log.ret(Log.l.trace);
        }, {
            apuserRole: null
        })
    });
})();



