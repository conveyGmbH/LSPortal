// controller for page: siteEventsNeuAus
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/info/infoService.js" />
/// <reference path="~/www/lib/jstz/scripts/jstz.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("SiteEventsTermin", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "SiteEventsTermin.Controller.");
            Application.Controller.apply(this, [pageElement, {
                restriction: getEmptyDefaultValue(SiteEventsTermin.defaultRestriction),
                dataTermin: SiteEventsTermin.defaultRestriction,
                VeranstaltungTerminID: 0,
                VeranstaltungName: "",
                VeranstaltungNameDisplay: ""
            }, commandList]);
            
            this.binding.dataTermin.StartDatum = new Date();
            this.binding.dataTermin.EndDatum = new Date();

            var that = this;

            var getRecordId = function () {
                Log.call(Log.l.trace, "SiteEventsTermin.Controller.");
                that.binding.VeranstaltungTerminID = AppData.getRecordId("VeranstaltungTermin");
                Log.ret(Log.l.trace, that.binding.VeranstaltungTerminID);
                return that.binding.VeranstaltungTerminID;
            }
            this.getRecordId = getRecordId;

            var getExibitorData = function() {
                var dataTermin = that.binding.dataTermin;
               
                if (dataTermin.VeranstaltungName === "") {
                    dataTermin.VeranstaltungName = null;
                }
                return dataTermin;
            }
            this.getExibitorData = getExibitorData;

            var saveExhibitor = function () {
                //var dataEvent = that.binding.eventData;
                that.binding.dataTermin.StartDatum = getDateIsoString(that.binding.dataTermin.StartDatum);
                that.binding.dataTermin.EndDatum = getDateIsoString(that.binding.dataTermin.EndDatum);
                that.binding.dataTermin.FairVeranstalterID = 1; // nur auf deimos 
                //var dataTermin = getExibitorData();
                Log.call(Log.l.trace, "SiteEventsTermin.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_CreateVATerminRT",
                    {
                        pShortName: that.binding.VeranstaltungName,
                        pDisplayName: that.binding.VeranstaltungNameDisplay,
                        pStartDate: that.binding.dataTermin.StartDatum,
                        pEndDate: that.binding.dataTermin.EndDatum,
                        pFairVeranstalterID: that.binding.dataTermin.FairVeranstalterID,
                        pFairLocationID: null,
                        pMailBCC: "",
                        pMailFrom: "",
                        pMailReplyTo: ""
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        AppBar.busy = false;
                        Application.navigateById("siteevents", event);
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "call error");
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                Log.ret(Log.l.trace); 
            }
            this.saveExhibitor = saveExhibitor;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "SiteEventsTermin.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "SiteEventsTermin.Controller.");
                    that.saveExhibitor();
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "SiteEventsTermin.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "SiteEventsTermin.Controller.");
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
            }

            this.disableHandlers = {
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickSave: function () {
                    if (that.binding.VeranstaltungName && that.binding.dataTermin.FairVeranstalterID) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }

            var loadData = function (complete, error) {
                AppData.setErrorMsg(that.binding);
                var ret = WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select MaildokumentView...");
                    return SiteEventsTermin.VeranstaltungTerminView.select(function (json) {
                        Log.print(Log.l.trace, "MaildokumentView: success!");
                        if (json && json.d && json.d.results) {
                            // store result for next use
                            var result = json.d.results[0];
                            that.binding.VeranstaltungName = "";
                            that.binding.VeranstaltungNameDisplay = "";
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                         VeranstaltungTerminVIEWID: that.binding.VeranstaltungTerminID
                    });
                });
                return ret;
            }
            this.loadData = loadData;

            that.processAll().then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Binding wireup page complete");
            }).then(function () {
                that.getRecordId();
                Log.print(Log.l.trace, "getRecordId loaded!");
            })/*.then(function () {
                that.loadData();
                Log.print(Log.l.trace, "loadData loaded!");
            })*/;
            Log.ret(Log.l.trace);
        }, {
                eventChangeId: null
            })

    });
})();