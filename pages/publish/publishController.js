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
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement) {
            Log.call(Log.l.trace, "Publish.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataPublish: getEmptyDefaultValue(Publish.questionView.defaultValue)
            }]);

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
                        that.loadData();
                    }, function(errorResponse) {
                        // error already shown
                    });
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function(event) {
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
                    // disabled if not to publish!
                    return !that.binding.generalData.publishFlag;
                },
                clickGotoPublish: function() {
                    return false;
                }
            };

            // save data
            var saveData = function(complete, error) {
                Log.call(Log.l.trace, "Publish.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var dataPublish = that.binding.dataPublish;
                if (dataPublish && !AppBar.busy && that.binding.generalData.publishFlag) {
                    dataPublish.Aktionflag = 1;
                    var recordId = dataPublish.FragenVIEWID;
                    if (recordId) {
                        AppBar.busy = true;
                        ret = Publish.questionView.update(function (response) {
                            AppBar.busy = false;
                            // called asynchronously if ok
                            Log.print(Log.l.info, "questionView update: success!");
                            AppBar.modified = false;
                            complete(response);
                        }, function(errorResponse) {
                            AppBar.busy = false;
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            error(errorResponse);
                        }, recordId, dataPublish);
                    } else {
                        Log.print(Log.l.info, "not supported");
                        ret = WinJS.Promise.as();
                    }
                } else if (AppBar.busy) {
                    ret = WinJS.Promise.timeout(100).then(function() {
                        return that.saveData(complete, error);
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function() {
                        complete(dataPublish);
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.saveData = saveData;

            var loadData = function () {
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
            this.loadData = loadData;
            
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();



