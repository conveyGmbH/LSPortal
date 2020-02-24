// controller for page: clientManagement
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/clientManagement/clientManagementService.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("ClientManagement", {
        Controller: WinJS.Class.derive(Application.Controller,
            function Controller(pageElement, commandList) {
                Log.call(Log.l.trace, "ClientManagement.Controller.");
                Application.Controller.apply(this,
                    [
                        pageElement, {
                            dataClientManagement: getEmptyDefaultValue(ClientManagement.fairMandantView.defaultValue),
                            recordID : 0,
                            InitLandItem: { InitLandID: 0, TITLE: "" }
                        }, commandList
                    ]);

                var that = this;

                var initLand = pageElement.querySelector("#InitLand");

                var getRecordId = function () {
                    Log.call(Log.l.trace, "ClientManagement.Controller.");
                    that.binding.recordID = AppData.getRecordId("FairMandantVIEW_20582");
                    Log.ret(Log.l.trace, that.binding.recordID);
                    return that.binding.recordID;
                }
                this.getRecordId = getRecordId;
                
                var resultConverter = function (item, index) {
                    item.index = index;
                    
                }
                this.resultConverter = resultConverter;

                // update data
                var updateMandant = function () {
                    Log.call(Log.l.trace, "ClientManagement.Controller.");
                    AppData.setErrorMsg(that.binding);
                    var dataClientManagement = that.binding.dataClientManagement;
                    if (dataClientManagement.NumLicenses === null) {
                        dataClientManagement.NumLicenses = -2;
                        parseInt(dataClientManagement.NumLicenses);
                    }
                    Log.call(Log.l.trace, "ClientManagement.Controller.");
                    AppData.setErrorMsg(that.binding);
                    if (!dataClientManagement.FairMandantVIEWID || dataClientManagement.FairMandantVIEWID < 0) {
                        Log.print(Log.l.info, "FairMandantVIEWID is undefined or 0! ");
                        return;
                    } else {
                        AppData.call("PRC_UpdateFairMandant",
                            {
                                pFairMandantID: dataClientManagement.FairMandantVIEWID,
                                pName: dataClientManagement.Name,
                                pAnsprechpartner: dataClientManagement.Ansprechpartner,
                                pEMail: dataClientManagement.EMail,
                                pNumLicenses: parseInt(dataClientManagement.NumLicenses),
                                pCustomerID: dataClientManagement.CustomerID,
                                pStrasse: dataClientManagement.Strasse,
                                pPLZ: dataClientManagement.PLZ,
                                pStadt: dataClientManagement.Stadt,
                                pLandID: parseInt(dataClientManagement.LandID),
                                pTelefonFestnetz: dataClientManagement.TelefonFestnetz

                            }, function (json) {
                                Log.print(Log.l.info, "call success! ");
                                AppBar.busy = false;
                                //Application.navigateById("localevents");
                            }, function (errorResponse) {
                                Log.print(Log.l.error, "call error");
                                AppBar.busy = false;
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                    }
                    Log.ret(Log.l.trace);
                }
                this.updateMandant = updateMandant;

                var newMandant = function() {
                    Log.call(Log.l.trace, "ClientManagement.Controller.");
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_CreateFairMandant",
                            {
                                pLandID: 0,
                                pNumLicenses: 0,
                                pINITFairManTypID : 2
                                
                            }, function (json) {
                                Log.print(Log.l.info, "call success! ");
                                AppBar.busy = false;
                                var master = Application.navigator.masterControl;
                                if (master && master.controller) {
                                    master.controller.loadData().then(function() {
                                            master.controller.selectRecordId(json.d.results[0].FairMandantID);
                                            if (typeof complete === "function") {
                                                complete(response);
                                            }
                                        }
                                    );
                                };
                            }, function (errorResponse) {
                                Log.print(Log.l.error, "call error");
                                AppBar.busy = false;
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                    Log.ret(Log.l.trace);
                }
                this.newMandant = newMandant;

                // define handlers
                this.eventHandlers = {
                    clickBack: function (event) {
                        Log.call(Log.l.trace, "ClientManagement.Controller.");
                        if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                            WinJS.Navigation.back(1).done();
                        }
                        Log.ret(Log.l.trace);
                    },
                    clickNew: function (event) {
                        Log.call(Log.l.trace, "SiteEventsBenNach.Controller.");
                        that.newMandant();
                        Log.ret(Log.l.trace);
                    },
                    clickUpdate: function (event) {
                        Log.call(Log.l.trace, "ClientManagement.Controller.");
                        that.updateMandant();
                        Log.ret(Log.l.trace);
                    },
                    clickChangeUserState: function (event) {
                        Log.call(Log.l.trace, "ClientManagement.Controller.");
                        Application.navigateById("userinfo", event);
                        Log.ret(Log.l.trace);
                    },
                    clickGotoPublish: function (event) {
                        Log.call(Log.l.trace, "ClientManagement.Controller.");
                        Application.navigateById("publish", event);
                        Log.ret(Log.l.trace);
                    },
                    clickTopButton: function (event) {
                        Log.call(Log.l.trace, "ClientManagement.Controller.");
                        var anchor = document.getElementById("menuButton");
                        var menu = document.getElementById("menu1").winControl;
                        var placement = "bottom";
                        menu.show(anchor, placement);
                        Log.ret(Log.l.trace);
                    },
                    clickLogoff: function (event) {
                        Log.call(Log.l.trace, "ClientManagement.Controller.");
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
                    clickBack: function () {
                        if (WinJS.Navigation.canGoBack === true) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                };
                
                var loadData = function (MandantID) {
                    Log.call(Log.l.trace, "SiteEventsBenNach.Controller.");
                    that.loading = true;
                    AppData.setErrorMsg(that.binding);
                    var ret = new WinJS.Promise.as().then(function () {
                        if (!AppData.initLandView.getResults().length) {
                            Log.print(Log.l.trace, "calling select initLandData...");
                            //@nedra:25.09.2015: load the list of INITLand for Combobox
                            return AppData.initLandView.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "initLandView: success!");
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
                    }).then(function () {
                        if (MandantID) {
                            return ClientManagement.fairMandantView.select(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "ClientManagement.fairMandantView: success!");
                                // select returns object already parsed from json file in response
                                if (json && json.d) {
                                    //that.nextUrl = MandatoryList.mandatoryView.getNextUrl(json);
                                    var results = json.d;
                                    that.binding.dataClientManagement = results;
                                }
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                              }, MandantID);
                        } else {
                            return WinJS.Promise.as();
                        }
                    });
                    Log.ret(Log.l.trace);
                    return ret;
                };
                this.loadData = loadData;

                that.processAll().then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    //return that.loadData();
                }).then(function () {
                    Log.print(Log.l.trace, "Binding wireup page complete");
                    return that.loadData(getRecordId());
                }).then(function () {
                    AppBar.notifyModified = true;
                    Log.print(Log.l.trace, "Data loaded");
                });
                Log.ret(Log.l.trace);
            })
    });
})();