﻿// controller for page: siteEventsNeuAus
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/siteEventsTermin/siteEventsTerminService.js" />
/// <reference path="~/www/lib/jstz/scripts/jstz.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("SiteEventsTermin", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "SiteEventsTermin.Controller.");
            Application.Controller.apply(this, [pageElement, {
                restriction: getEmptyDefaultValue(SiteEventsTermin.defaultRestriction),
                dataTermin: SiteEventsTermin.defaultRestriction,
                InitFairVeranstalterItem: { FairVeranstalterID: 0, Name: "" },
                VeranstaltungTerminID: 0
            }, commandList]);
            
            var fairVeranstalter = pageElement.querySelector("#FairVeranstalter");
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
                if (dataTermin.DisyplayName === "") {
                    dataTermin.DisyplayName = null;
                }
                return dataTermin;
            }
            this.getExibitorData = getExibitorData;

            var saveExhibitor = function () {
                //var dataEvent = that.binding.eventData;
                that.binding.dataTermin.StartDatum = new Date(that.binding.dataTermin.StartDatum).toISOString();
                that.binding.dataTermin.EndDatum = new Date(that.binding.dataTermin.EndDatum).toISOString();
                that.binding.dataTermin.FairVeranstalterVIEWID =
                    parseInt(that.binding.dataTermin.FairVeranstalterVIEWID);
                //that.binding.dataTermin.FairVeranstalterID = 1; // nur auf deimos 
                //var dataTermin = getExibitorData();
                Log.call(Log.l.trace, "SiteEventsTermin.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_CreateVATerminPortal",
                    {
                        pShortName: that.binding.dataTermin.VeranstaltungName,
                        pDisplayName: that.binding.dataTermin.DisplayName,
                        pStartDate: that.binding.dataTermin.StartDatum,
                        pEndDate: that.binding.dataTermin.EndDatum,
                        pFairVeranstalterID: that.binding.dataTermin.FairVeranstalterVIEWID,
                        pFairLocationID: 0,
                        pVeranstaltungTerminID: that.binding.dataTermin.VeranstaltungTerminVIEWID
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
                        return false;
                    }
                }
            }

            var getDateObject = function (dateData) {
                var ret;
                if (dateData) {
                    var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                    var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    ret = new Date(milliseconds).toISOString();
                    //.toLocaleString('de-DE').substr(0, 10);
                } else {
                    ret = "";
                }
                return ret;
            };
            this.getDateObject = getDateObject;

            var setTerminData = function (terminData) {
                if (terminData.DisplayName === null) {
                    that.binding.dataTermin.DisplayName = "";
                }
                if (terminData.StartDatum) {
                    that.binding.dataTermin.StartDatum = that.getDateObject(terminData.StartDatum);
                }
                if (terminData.EndDatum) {
                    that.binding.dataTermin.EndDatum = that.getDateObject(terminData.EndDatum);
                }
            }
            this.setTerminData = setTerminData;

            var loadData = function (complete, error) {
                AppData.setErrorMsg(that.binding);
                var ret = WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select MaildokumentView...");
                    return SiteEventsTermin.FairVeranstalterView.select(function (json) {
                        Log.print(Log.l.trace, "FairVeranstalterView: success!");
                        /*if (!that.employees || !that.employees.length) {
                            that.employees = new WinJS.Binding.List([Search.employeeView.defaultValue]);*/
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            // store result for next use
                            var result = json.d.results;
                            if (fairVeranstalter && fairVeranstalter.winControl) {
                                fairVeranstalter.winControl.data = new WinJS.Binding.List(result);
                                that.binding.dataTermin.FairVeranstalterVIEWID = result[json.d.results.length - 1].FairVeranstalterVIEWID;
                            }
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                }).then(function () {
                    if (that.binding.VeranstaltungTerminID !== 0) {
                        Log.print(Log.l.trace, "calling select VeranstaltungView...");
                        //@nedra:25.09.2015: load the list of FragenView for Combobox
                        return SiteEventsTermin.VeranstaltungView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "VeranstaltungView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                var result = json.d.results[0];
                                that.binding.dataTermin = result;
                                that.setTerminData(that.binding.dataTermin);
                                fairVeranstalter.disabled = true; 
                                Log.print(Log.l.trace, "VeranstaltungView: success!");
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            }, { VeranstaltungTerminVIEWID: that.binding.VeranstaltungTerminID });
                    }
                });
                return ret;
            }
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "getRecordId loaded!");
                return that.getRecordId();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Binding wireup page complete");
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
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