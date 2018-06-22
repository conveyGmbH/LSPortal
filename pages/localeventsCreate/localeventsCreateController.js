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
                    eventData: copyByValue(LocalEventsCreate.VeranstaltungView.defaultValue)
                }, commandList]
            );
            this.binding.eventData.dateBegin = new Date();
            this.binding.eventData.dateEnd = new Date();

            var that = this;

            var setDataEvent = function (newDataEvent) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.eventData = newDataEvent;
                // convert StartDatum 
                that.binding.eventData.dateBegin = getDateObject(newDataEvent.StartDatum);
                // convert EndDatum 
                that.binding.eventData.dateEnd = getDateObject(newDataEvent.EndDatum);
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
            };
            this.setDataEvent = setDataEvent;

            var getEventData = function() {
                var dataEvent = that.binding.eventData;
                dataEvent.StartDatum = getDateIsoString(dataEvent.dateBegin);
                dataEvent.EndDatum = getDateIsoString(dataEvent.dateEnd);
                if (typeof dataEvent.LeadSuccessMobileApp === "string") {
                    dataEvent.LeadSuccessMobileApp = parseInt(dataEvent.LeadSuccessMobileApp);
                }
                if (!dataEvent.LeadSuccessMobileApp || dataEvent.LeadSuccessMobileApp < 1) {
                    dataEvent.LeadSuccessMobileApp = 1;
                }
                if (!dataEvent.MobilerBarcodescanner) {
                    dataEvent.MobilerBarcodescanner = 0;
                } else if (typeof dataEvent.MobilerBarcodescanner === "string") {
                    dataEvent.MobilerBarcodescanner = parseInt(dataEvent.LeadSuccessMobileApp);
                }
                return dataEvent;
            }
            this.getEventData = getEventData;
            
            var insertData = function() {
                Log.call(Log.l.trace, "LocalEventsCreate.Controller.");
                AppData.setErrorMsg(that.binding);
                var dataEvent = getEventData();
                Log.call(Log.l.trace, "PDFExport.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_CreateUserVeranstaltung",
                    {
                        pVeranstaltungName: dataEvent.VeranstaltungName,
                        pStartDatumString: dataEvent.StartDatum,
                        pEndDatumString: dataEvent.EndDatum,
                        pAppUser: dataEvent.LeadSuccessMobileApp,
                        pScanUser: dataEvent.MobilerBarcodescanner

                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        Application.navigateById("localevents", event);
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "call error");
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                Log.ret(Log.l.trace);
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
                    if (that.binding.eventData && AppBar.modified && !AppBar.busy) {
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