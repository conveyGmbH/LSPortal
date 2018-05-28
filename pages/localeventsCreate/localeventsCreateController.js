// controller for page: localEvents
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/localEvents/localEventsService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("LocalEventsCreate", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "LocalEventsCreate.Controller.");
            Application.Controller.apply(this,
                [pageElement, {
                    eventData: getEmptyDefaultValue(LocalEventsCreate.VeranstaltungView.defaultValue)
                }, commandList]
            );

            var that = this;

            this.newEventData = [];

            var getRecordId = function() {
                Log.call(Log.l.trace, "LocalEventsCreate.Controller.");
                var recordId = that.binding.eventData && that.binding.eventData.VeranstaltungVIEWID;
                if (!recordId) {
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        recordId = master.controller.binding.veranstaltungid;
                    }
                }
                Log.ret(Log.l.trace, recordId);
                return recordId;
            };
            this.getRecordId = getRecordId;

            var getDateObject = function(dateData) {
                var ret;
                if (dateData) {
                    var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                    var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    ret = new Date(milliseconds).toDateString();
                } else {
                    ret = new Date();
                }
                return ret;
            };
            this.getDateObject = getDateObject;

            var getEventData = function() {
                that.binding.eventData.StartDatum = "/Date(" + Date.parse(that.binding.eventData.StartDatum) + ")/";
                that.binding.eventData.EndDatum = "/Date(" + Date.parse(that.binding.eventData.EndDatum) + ")/";
                if (that.binding.eventData.MobilerBarcodescanner === 0){
                    delete that.binding.eventData.MobilerBarcodescanner;
                }
                if (that.binding.eventData.LeadSuccessMobileApp === 0) {
                    delete that.binding.eventData.LeadSuccessMobileApp;
                }
            }
            this.getEventData = getEventData;

            var insertData = function() {
                Log.call(Log.l.trace, "LocalEventsCreate.Controller.");
                AppData.setErrorMsg(that.binding);
                //that.templatecall();
                var ret = new WinJS.Promise.as().then(function () {
                    return LocalEventsCreate.VeranstaltungView.insert(function (json) {
                        AppBar.busy = false;
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.info, "VeranstaltungView insert: success!");
                        AppBar.modified = false;
                        // employeeView returns object already parsed from json file in response
                        if (json && json.d) {
                            Application.navigateById("localevents", event);
                        }
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error inserting event");
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                        }, that.binding.eventData);
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.insertData = insertData;
            
            // Then, do anything special on this page
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "LocalEventsCreate.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "LocalEventsCreate.Controller.");
                    that.getEventData();
                    that.insertData();
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "LocalEventsCreate.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "LocalEventsCreate.Controller.");
                    Application.navigateById("publish", event);
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
                clickSave: function () {
                    if (that.binding.eventData) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };
            
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                //return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        }, {
            
        })
    });
})();