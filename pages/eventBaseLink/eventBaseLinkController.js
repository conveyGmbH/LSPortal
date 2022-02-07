// controller for page: photo
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/eventBaseLink/eventBaseLink.js" />


(function () {
    "use strict";

    WinJS.Namespace.define("EventBaseLink", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "EventBaseLink.Controller.");
            Application.Controller.apply(this, [pageElement, {
                eventMandantStartData: getEmptyDefaultValue(EventBaseLink.mandantStartView.defaultValue)
            }, commandList]);
           
            var that = this;

            var getEventStartId = function () {
                return EventBaseLink._eventStartId;
            }
            that.getEventStartId = getEventStartId;

            var setEventStartId = function (value) {
                Log.print(Log.l.trace, "eventStartId=" + value);
                EventBaseLink._eventStartId = value;
                return that.loadData();
            }
            that.setEventStartId = setEventStartId;
            var master = Application.navigator.masterControl;
            if (master && master.controller && master.controller.binding) {
                //that.setEventStartId(master.controller.binding.startId);
            }

            // save data
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "EventBaseLink.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var dataEventStartUrl = that.binding.eventMandantStartData;
                if (dataEventStartUrl && AppBar.modified && !AppBar.busy) {
                        AppBar.busy = true;
                        ret = EventBaseLink.mandantStartView.update(function(response) {
                            AppBar.busy = false;
                            // called asynchronously if ok
                            Log.print(Log.l.info, "mandantStartView update: success!");
                            AppBar.modified = false;
                            complete(response);
                        },
                        function(errorResponse) {
                            AppBar.busy = false;
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            error(errorResponse);
                        },
                        dataEventStartUrl.MandantStartVIEWID,
                        dataEventStartUrl);
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete(dataEventStartUrl);//dataContact
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "EventBaseLink.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "EventBaseLink.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "starturl saved");
                        
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee");
                    });
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "EventBaseLink.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "EventBaseLink.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "Account.Controller.");
                    AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickBack: function() {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickSave: function() {
                    if (that.binding.eventMandantStartData.MandantStartVIEWID) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

            var loadData = function () {
                Log.call(Log.l.trace, "EventBaseLink.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return EventBaseLink.mandantStartView.select(function (json) {
                        Log.print(Log.l.trace, "mandantStartView: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            var result = json.d.results[0];
                            that.binding.eventMandantStartData = result;
                            Log.print(Log.l.trace, "Data loaded");
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.loading = false;
                    });
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();


