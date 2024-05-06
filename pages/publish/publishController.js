// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/publish/publishService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("Publish", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Publish.Controller.");
            Application.Controller.apply(this, [pageElement, {
                
            }, commandList]);

            var that = this;

            var getPublishFlag = function () {
                var publishFlag = null;
                Log.call(Log.l.trace, "Reporting.Controller.");
                var master = Application.navigator.masterControl;
                /*if (master && master.controller) {
                    publishFlag = master.controller.binding.publishFlag;
                } else {*/
                    publishFlag = that.binding.generalData.publishFlag;
                //}
                Log.ret(Log.l.trace, publishFlag);
                return publishFlag;
            }
            this.getPublishFlag = getPublishFlag;

            var getEventId = function () {
                var eventId = null;
                Log.call(Log.l.trace, "Reporting.Controller.");
                var master = Application.navigator.masterControl;
                if (master && master.controller) {
                    eventId = master.controller.binding.eventId;
                } else {
                    eventId = AppData.getRecordId("Veranstaltung");
                }
                Log.ret(Log.l.trace, eventId);
                return eventId;
            }
            this.getEventId = getEventId;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Publish.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickPublish: function (event) {
                    Log.call(Log.l.trace, "Publish.Controller.");
                    that.saveData(function (response) {
                        AppData.getUserData();
                        //that.loadData();
                        if (WinJS.Navigation.canGoBack === true) {
                            WinJS.Navigation.back(1).done();
                        } else {
                            Navigator.navigateById(Application.startPageId);
                        }
                    }, function (errorResponse) {
                        // delete ERROR
                        var message = null;
                        Log.print(Log.l.error,
                            "error status=" + errorResponse.status + " statusText=" + errorResponse.statusText);
                        if (errorResponse.data && errorResponse.data.error) {
                            Log.print(Log.l.error, "error code=" + errorResponse.data.error.code);
                            if (errorResponse.data.error.message) {
                                Log.print(Log.l.error, "error message=" + errorResponse.data.error.message.value);
                                message = errorResponse.data.error.message.value;
                            }
                        }
                        if (!message) {
                            message = getResourceText("error.delete");
                        }
                        alert(message);
                    });
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Publish.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "userinfo.Controller.");
                    //Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickPublish: function () {
                    var publishButton = pageElement.querySelector("#publishButton");
                    if (publishButton) {
                        publishButton.disabled = !that.getPublishFlag();
                    }
                    // disabled if not to publish!
                    return !that.getPublishFlag();
                },
                clickGotoPublish: function () {
                    return false;
                }
            };

            // save data
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Publish.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                if (!AppBar.busy) {
                    AppBar.busy = true;
                    ret = AppData.call("PRC_FragebogenPublizieren", {
                        pVeranstaltungID: that.getEventId()
                    }, function (json) {
                        AppBar.busy = false;
                        // called asynchronously if ok
                        Log.print(Log.l.info, "questionView update: success!");
                        AppBar.modified = false;
                        var master = Application.navigator.masterControl;
                        if (master && master.controller) {
                            master.controller.loadData();
                        }
                        complete(json);
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        error(errorResponse);
                    });
                } else if (AppBar.busy) {
                    ret = WinJS.Promise.timeout(100).then(function () {
                        return that.saveData(complete, error);
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        complete({});
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.saveData = saveData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();



