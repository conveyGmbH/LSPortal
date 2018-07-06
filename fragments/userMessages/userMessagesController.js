// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/userMessages/userMessagesService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("UserMessages", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options) {
            Log.call(Log.l.trace, "UserMessages.Controller.");
            Fragments.Controller.apply(this, [fragmentElement, {
                recordId: options ? options.recordId : null
            }]);
            this.messages = null;

            var that = this;

            this.refreshPromise = null;
            this.refreshWaitTimeMs = 30000;

            // idle wait Promise and wait time:
            this.restartPromise = null;
            this.idleWaitTimeMs = 60000;

            this.failurePromise = null;
            this.failureWaitTimeMs = 6000;

            this.animationPromise = null;

            var that = this;

            this.dispose = function () {
                that.cancelPromises();
            };

            var cancelPromises = function () {
                Log.call(Log.l.trace, "Barcode.Controller.");
                if (that.animationPromise) {
                    Log.print(Log.l.trace, "cancel previous animation Promise");
                    that.animationPromise.cancel();
                    that.animationPromise = null;
                }
                if (that.restartPromise) {
                    Log.print(Log.l.trace, "cancel previous restart Promise");
                    that.restartPromise.cancel();
                    that.restartPromise = null;
                }
                if (that.failurePromise) {
                    Log.print(Log.l.trace, "cancel previous failure Promise");
                    that.failurePromise.cancel();
                    that.failurePromise = null;
                }
                Log.ret(Log.l.trace);
            }
            this.cancelPromises = cancelPromises;

            var deleteAndNavigate = function (targetPage) {
                Log.call(Log.l.trace, "Barcode.Controller.", "targetPage=" + that.targetPage);
                that.cancelPromises();
                var contactId = AppData.getRecordId("Kontakt");
                Log.print(Log.l.trace, "contactId=" + contactId);
                if (contactId) {
                    Log.print(Log.l.trace, "delete existing contactID=" + contactId);
                    Barcode.contactView.deleteRecord(function (json) {
                        // this callback will be called asynchronously
                        Log.print(Log.l.trace, "contactView: deleteRecord success!");
                        AppData.setRecordId("Kontakt", null);
                        if (that.refreshPromise) {
                            Log.print(Log.l.trace, "cancel previous refresh Promise");
                            that.refreshPromise.cancel();
                            that.refreshPromise = null;
                        }
                        that.cancelPromises();
                        Application.navigateById(targetPage);
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, contactId);
                }
                Log.ret(Log.l.trace);
            }
            this.deleteAndNavigate = deleteAndNavigate;

            var waitForIdleAction = function () {
                Log.call(Log.l.trace, "Barcode.Controller.", "idleWaitTimeMs=" + that.idleWaitTimeMs);
                that.cancelPromises();
                that.restartPromise = WinJS.Promise.timeout(that.idleWaitTimeMs).then(function () {
                    Log.print(Log.l.trace, "timeout occurred, navigate back to start page!");
                    if (that.refreshPromise) {
                        Log.print(Log.l.trace, "cancel previous refresh Promise");
                        that.refreshPromise.cancel();
                        that.refreshPromise = null;
                    }
                    that.cancelPromises();
                    //Application.navigateById("start");
                });
                Log.ret(Log.l.trace);
            };
            this.waitForIdleAction = waitForIdleAction;

            var waitForFailureAction = function () {
                Log.call(Log.l.trace, "Barcode.Controller.", "failureWaitTimeMs=" + that.failureWaitTimeMs);
                that.cancelPromises();
                that.failurePromise = WinJS.Promise.timeout(that.failureWaitTimeMs).then(function () {
                    Log.print(Log.l.trace, "timeout occurred, navigate to failed page!");
                    if (that.refreshPromise) {
                        Log.print(Log.l.trace, "cancel previous refresh Promise");
                        that.refreshPromise.cancel();
                        that.refreshPromise = null;
                    }
                    that.cancelPromises();
                    Application.navigateById("failed");
                });
                Log.ret(Log.l.trace);
            };
            this.waitForFailureAction = waitForFailureAction;

            var layout = null;

            // now do anything...
            var listView = fragmentElement.querySelector("#userMessageList.listview");

            var eventHandlers = {
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
            }

            var resultConverter = function (item, index) {
                // push to that.messages if (item.Info1) is not empty!
                if (item.Info1) {
                    that.messages.push(item);
                }
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, "UserMessages.");
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
                    if (that.refreshPromise) {
                        that.refreshPromise.cancel();
                    }
                    that.refreshPromise = WinJS.Promise.timeout(that.refreshWaitTimeMs).then(function () {
                        that.loadData();
                    });
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                   return that.loadData();
            })/*.then(function () {
                var loadingTime = 30000;
                Log.print(Log.l.trace, "Loading Message: " + loadingTime + "sec");
                setInterval(function () {
                    return that.loadData();
                }, loadingTime);
                Log.print(Log.l.trace, "Data loaded");
            })*/;
            Log.ret(Log.l.trace);
        }, {
            apuserRole: null
        })
    });
})();



