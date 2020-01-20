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
                newInfo1Flag: 0,
                message: ""
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

            var loadData = function (recordID) {
                Log.call(Log.l.trace, "UserMessages.");
                AppData.getMessagesData();
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select Benutzerview...");
                    if (recordID) {
                        return UserMessages.BenutzerNachrichtView.select(function (json) {
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
                                    if (item.InfoText) {
                                    that.messages.push(item);
                                }
                            });
                        }
                        if (listView.winControl) {
                            // add ListView dataSource
                            listView.winControl.itemDataSource = that.messages.dataSource;
                        }
                        Log.print(Log.l.trace, "Infodesk: success!");
                        },
                            function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                            },
                            { BenutzerID: recordID });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    Log.print(Log.l.trace, "Data loaded");
                    that.cancelPromises();
                    that.refreshPromise = WinJS.Promise.timeout(that.refreshWaitTimeMs).then(function () {
                        that.loadData(recordID);
                    });
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var saveData = function (recordId, complete, error) {
                Log.call(Log.l.trace, "Infodesk.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                if (recordId) {
                    AppBar.modified = true;

                    if (that.binding.message && AppBar.modified && !AppBar.busy) {
                        /**
                         * INSERT in BenutzerNachricht_ODataVIEW
                         * BenutzerID, AbsenderID, EmpfaengerID, evtl. InfoID, InfoText, evtl. SendMAID, SendTS, evtl. ReadMAID, ReadTS
                         * Beispiel normale Nachricht
                         * recordID, null, recordID, null, "blabla", null, timestamp von der db, null, null
                         */
                        ret = UserMessages.BenutzerNachricht.insert(function (json) {
                                // called asynchronously if ok
                                // force reload of userData for Present flag
                                AppBar.modified = false;
                            /**
                             * inserttrigger in db für timestamp setzen 
                             */
                            Log.print(Log.l.trace, "benutzerView: insert success!");
                            that.binding.message = "";
                                     }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                            //error(errorResponse);
                        }, {
                            BenutzerID: recordId,
                            EmpfaengerID: recordId,
                            InfoText: that.binding.message
                        })/*Lade dann nochmal loaddata die neue nachricht?!*/;
                    } else {
                        ret = new WinJS.Promise.as().then(function () {
                            //complete(dataBenutzer);
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



