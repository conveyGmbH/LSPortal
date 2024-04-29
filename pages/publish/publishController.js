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
                dataPublish: getEmptyDefaultValue(Publish.questionView.defaultValue)
            }, commandList]);

            var that = this;

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
                    },
                        function (errorResponse) {
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
                        publishButton.disabled = !that.binding.generalData.publishFlag;
                    }
                    // disabled if not to publish!
                    return !that.binding.generalData.publishFlag;
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
                if (!AppBar.busy && that.binding.generalData.publishFlag) {
                    AppBar.busy = true;
                    ret = AppData.call("PRC_FragebogenPublizieren", {
                        pVeranstaltungID: AppData.getRecordId("Veranstaltung")
                    }, function (json) {
                        AppBar.busy = false;
                        // called asynchronously if ok
                        Log.print(Log.l.info, "questionView update: success!");
                        AppBar.modified = false;
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

            /*var loadData = function () {
                Log.call(Log.l.trace, "Publish.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select questionView...");
                    return Publish.questionView.select(function (json) {
                        Log.print(Log.l.trace, "questionView: success!");
                        if (json && json.d && json.d.results) {
                            // store result for next use
                            that.binding.dataPublish = json.d.results[0];
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {

                        });
                }).then(function () {
                    AppBar.notifyModified = true;
                    AppBar.triggerDisableHandlers();
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;*/

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                //return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();



