﻿// controller for page: siteEventsNeuAus
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
    WinJS.Namespace.define("SiteEventsNeuAus", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "SiteEventsNeuAus.Controller.");
            Application.Controller.apply(this, [pageElement, {
                restriction: getEmptyDefaultValue(SiteEventsNeuAus.defaultRestriction),
                dataExhibitor: getEmptyDefaultValue(SiteEventsNeuAus.defaultRestriction),
                VeranstaltungTerminID : 0
            }, commandList]);
            
            var that = this;

            var initLand = pageElement.querySelector("#InitLandReporting");

            var getRecordId = function () {
                Log.call(Log.l.trace, "SiteEventsNeuAus.Controller.");
                that.binding.VeranstaltungTerminID = AppData.getRecordId("VeranstaltungTermin");
                Log.ret(Log.l.trace, that.binding.VeranstaltungTerminID);
                return that.binding.VeranstaltungTerminID;
            }
            this.getRecordId = getRecordId;

            
            var getExibitorData = function() {
                var dataExibitor = that.binding.dataExhibitor;
                if (typeof dataExibitor.AppUser === "string") {
                    dataExibitor.AppUser = parseInt(dataExibitor.AppUser);
                }
                if (!dataExibitor.AppUser || dataExibitor.AppUser < 1) {
                    dataExibitor.AppUser = 1;
                }
                if (typeof dataExibitor.LandID === "string") {
                    dataExibitor.LandID = parseInt(dataExibitor.LandID);
                }
                if (dataExibitor.LandID === "") {
                    dataExibitor.LandID = null;
                }
                if (dataExibitor.VeranstaltungName === "") {
                    dataExibitor.VeranstaltungName = null;
                }
                if (dataExibitor.FirmenName === "") {
                    dataExibitor.FirmenName = null;
                }
                if (dataExibitor.Strasse === "") {
                    dataExibitor.Strasse = null;
                }
                if (dataExibitor.PLZ === "") {
                    dataExibitor.PLZ = null;
                }
                if (dataExibitor.Stadt === "") {
                    dataExibitor.Stadt = null;
                }
                if (dataExibitor.WebAdresse === "") {
                    dataExibitor.WebAdresse = null;
                }
                if (dataExibitor.LoginEmail === "") {
                    dataExibitor.LoginEmail = null;
                }
                if (dataExibitor.OrderNumber === "") {
                    dataExibitor.OrderNumber = null;
                }
                if (dataExibitor.StandHall === "") {
                    dataExibitor.StandHall = null;
                }
                if (dataExibitor.StandNo === "") {
                    dataExibitor.StandNo = null;
                }
                if (dataExibitor.DisplayText === "") {
                    dataExibitor.DisplayText = null;
                }
                return dataExibitor;
            }
            this.getExibitorData = getExibitorData;

            var saveExhibitor = function () {
                Log.call(Log.l.trace, "SiteEventsNeuAus.Controller.");
                AppData.setErrorMsg(that.binding);
                var dataExibitor = getExibitorData();
                Log.call(Log.l.trace, "SiteEventsNeuAus.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_CreateSiteVeranstaltung",
                    {
                        pVeranstaltungTerminID: that.binding.VeranstaltungTerminID,
                        pVeranstaltungName: dataExibitor.VeranstaltungName,
                        pFirmenName: dataExibitor.FirmenName,
                        pStrasse: dataExibitor.Strasse,
                        pPLZ: dataExibitor.PLZ,
                        pStadt: dataExibitor.Stadt,
                        pLandID: dataExibitor.LandID,
                        pWebAdresse: dataExibitor.WebAdresse,
                        pLoginEmail: dataExibitor.LoginEmail,
                        pAppUser: dataExibitor.AppUser,
                        pOrderNumber: dataExibitor.OrderNumber,
                        pStandHall: dataExibitor.StandHall,
                        pStandNo: dataExibitor.StandNo,
                        pInfoText: dataExibitor.DisplayText

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
                    Log.call(Log.l.trace, "SiteEventsNeuAus.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "SiteEventsNeuAus.Controller.");
                    that.saveExhibitor();
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "SiteEventsNeuAus.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "SiteEventsNeuAus.Controller.");
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
                    if (that.binding.VeranstaltungTerminID) {
                        return false;
                    } else {
                        return true;
                    }
                },
            }

            var loadData = function (complete, error) {
                AppData.setErrorMsg(that.binding);
                var ret = WinJS.Promise.as().then(function () {
                    if (!AppData.initLandView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initLandData...");
                        //@nedra:25.09.2015: load the list of INITLand for Combobox
                        return AppData.initLandView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "initLandDataView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initLand && initLand.winControl) {
                                    initLand.winControl.data = new WinJS.Binding.List(json.d.results);
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initLand && initLand.winControl &&
                            (!initLand.winControl.data || !initLand.winControl.data.length)) {
                            initLand.winControl.data = new WinJS.Binding.List(AppData.initLandView.getResults());
                        }
                        initLand.selectedIndex = 0;
                        return WinJS.Promise.as();
                    }
                });
                return ret;
            }
            this.loadData = loadData;

            that.processAll().then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Binding wireup page complete");
            }).then(function () {
                that.getRecordId();
                Log.print(Log.l.trace, "loadData loaded!");
            }).then(function () {
                that.loadData();
                Log.print(Log.l.trace, "loadData loaded!");
            });
            Log.ret(Log.l.trace);
        }, {
                eventChangeId: null
            })

    });
})();