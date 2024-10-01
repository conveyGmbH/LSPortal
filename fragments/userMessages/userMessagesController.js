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
    var namespaceName = "UserMessages";

    WinJS.Namespace.define("UserMessages", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, commandList, options) {
            Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + (options && options.recordId));
            var getRecordId = function () {
                return UserMessages._userId;
            }
            this.getRecordId = getRecordId;

            var setRecordId = function (recordId) {
                UserMessages._userId = recordId;
            }
            this.setRecordId = setRecordId;

            if (options && options.recordId) {
                setRecordId(options.recordId);
            }
            Fragments.Controller.apply(this, [fragmentElement, {
                recordId: options ? options.recordId : null,
                newInfo1Flag: 0,
                message: ""
            }, commandList]);
            this.messages = null;

            var pageBinding = AppBar.scope && AppBar.scope.binding;
            var that = this;

            this.refreshPromise = null;
            this.refreshWaitTimeMs = 30000;

            this.dispose = function () {
                that.cancelPromises();
            };

            var cancelPromises = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                /*clickSendMessage: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.insertData();
                    Log.ret(Log.l.trace);
                },*/
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

            var disableHandlers = {
                clickSendMessage: AppBar.busy || !AppBar.modified || !that.binding.message
            }

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
            }

            var resultConverter = function (item, index) {
                item.index = index;
                if (item.index === 0 &&
                    item.EmpfaengerID === null && 
                    AppBar.scope.binding.dataBenutzer.Info1 &&
                    !AppBar.scope.binding.dataBenutzer.Info1TSRead) {
                    item.newInfo1Flag = 1;
                } else {
                    item.newInfo1Flag = 0;
                }
                /*if (item.Info1 && !item.Info1TSRead) {
                    item.newInfo1Flag = 1;
                } else {
                    item.newInfo1Flag = 0;
                }*/
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.getMessagesData();
                AppData.setErrorMsg(pageBinding);
                var restriction = {
                    BenutzerID: AppBar.scope.binding.dataBenutzer.BenutzerVIEWID
                }
                var ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select userMessageView...");
                    return UserMessages.userMessageView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "userMessageView: success!");
                        if (json && json.d) {
                            if (!that.messages) {
                                that.messages = new WinJS.Binding.List([]);
                                if (listView.winControl) {
                                    // add ListView dataSource
                                    listView.winControl.itemDataSource = that.messages.dataSource;
                                }
                            } else {
                                that.messages.length = 0;
                            }
                            json.d.results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                                // push to that.messages if (item.Info1) is not empty!
                                that.messages.push(item);
                            });
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(pageBinding, errorResponse);
                    }, restriction);
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

            var insertData = function (complete, error) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(pageBinding);
                var ret;
                if (that.binding.message && AppBar.modified && !AppBar.busy) {
                    /**
                     * INSERT in BenutzerNachricht_ODataVIEW
                     * BenutzerID, AbsenderID, EmpfaengerID, evtl. InfoID, InfoText, evtl. SendMAID, SendTS, evtl. ReadMAID, ReadTS
                     * Beispiel normale Nachricht
                     * recordID, null, recordID, null, "blabla", null, timestamp von der db, null, null
                     */
                    var newMessage = {
                        BenutzerID: getRecordId(),
                        EmpfaengerID: getRecordId(),
                        InfoText: that.binding.message
                    }
                    ret = UserMessages.userMessageView.insert(function (json) {
                        // called asynchronously if ok
                        // force reload of userData for Present flag
                        /**
                         * inserttrigger in db für timestamp setzen 
                         */
                        Log.print(Log.l.trace, "userMessageView: insert success!");
                        that.binding.message = "";
                        AppBar.modified = false;
                        if (typeof complete === "function") {
                            complete(json);
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(pageBinding, errorResponse);
                        if (typeof error === "function") {
                            error(errorResponse);
                        }
                    }, newMessage)/*Lade dann nochmal loaddata die neue nachricht?!*/;
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete(json);
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.insertData = insertData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        }, {
            })
    });
})();



