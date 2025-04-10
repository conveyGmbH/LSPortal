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

    var namespaceName = "ClientManagement";

    WinJS.Namespace.define("ClientManagement", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataClientManagement: getEmptyDefaultValue(ClientManagement.fairMandantView.defaultValue),
                recordID : 0,
                InitLandItem: { InitLandID: 0, TITLE: "" },
                showapiUserCreate: null,
                apiUserCreate: null
            }, commandList]);

            var that = this;

            var initLand = pageElement.querySelector("#InitLand");
            var apiToggle = pageElement.querySelector("#createApiUser");

            var createApiUserValue = 0;

            var getRecordId = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                that.binding.recordID = AppData.getRecordId("FairMandant");
                Log.ret(Log.l.trace, that.binding.recordID);
                return that.binding.recordID;
            }
            this.getRecordId = getRecordId;

            var resultConverter = function (item, index) {
                item.index = index;
            }
            this.resultConverter = resultConverter;

            // update data
            var saveData = function (complete, error) {
                var ret;
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                var dataClientManagement = that.binding.dataClientManagement;
                if (dataClientManagement.NumLicenses === null) {
                    dataClientManagement.NumLicenses = -2;
                    parseInt(dataClientManagement.NumLicenses);
                }
                AppData.setErrorMsg(that.binding);
                if (!dataClientManagement.FairMandantVIEWID || dataClientManagement.FairMandantVIEWID < 0) {
                    Log.print(Log.l.info, "FairMandantVIEWID is undefined or 0! ");
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete({});
                        }
                    });
                } else {
                    if (dataClientManagement && AppBar.modified && !AppBar.busy) {
                        ret = AppData.call("PRC_UpdateFairMandant", {
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
                            pTelefonFestnetz: dataClientManagement.TelefonFestnetz,
                            pCreateEventUser: createApiUserValue
                        }, function(json) {
                            Log.print(Log.l.info, "call PRC_UpdateFairMandant success! ");
                            AppBar.busy = false;
                            AppBar.modified = false;
                            //createApiUserValue = null;
                            //that.loadData(dataClientManagement.FairMandantVIEWID);
                            //Application.navigateById("localevents");
                            if (typeof complete === "function") {
                                complete(that.binding.dataClientManagement);
                            }
                        }, function(errorResponse) {
                            Log.print(Log.l.error, "call PRC_UpdateFairMandant error");
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                            if (typeof error === "function") {
                                error(errorResponse);
                            }
                        });
                    } else if (AppBar.busy) {
                        ret = WinJS.Promise.timeout(100).then(function() {
                            return that.saveData(complete, error);
                        });
                    } else {
                        ret = new WinJS.Promise.as().then(function () {
                            if (typeof complete === "function") {
                                complete({});
                            }
                        });
                    }
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            var showApiUser = function(apiUser) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (apiUser) {
                    that.binding.showapiUserCreate = null;
                } else {
                    that.binding.showapiUserCreate = 1;
                }
                Log.ret(Log.l.trace);
            }
            this.showApiUser = showApiUser;

            var createApiUserValueToggle = function (toggleId, checked) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "toggleId=" + toggleId + " checked=" + checked);
                switch (toggleId) {
                    case "createApiUser":
                        if (checked) {
                            createApiUserValue = 1;
                        } else {
                            createApiUserValue = 0;
                        }
                        break;
                }
                Log.ret(Log.l.trace);
            };
            this.createApiUserValueToggle = createApiUserValueToggle;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickUpdate: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "update mandant");
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && typeof master.controller.loadData === "function") {
                            master.controller.loadData(response.FairMandantVIEWID).then(function() {
                                master.controller.selectRecordId(response.FairMandantVIEWID);
                            });
                        } else {
                            Application.navigateById("clientManagementSearchList");
                        };
                    }, function (error) {
                        Log.print(Log.l.trace, "error update mandant");
                    });
                    Log.ret(Log.l.trace);
                },
                clickCreateApiUser: function(event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (event.currentTarget) {
                        var toggle = event.currentTarget.winControl;
                        AppBar.modified = true;
                        if (toggle) {
                            var value = toggle.checked || event.currentTarget.value;
                            that.createApiUserValueToggle(event.currentTarget.id, value);
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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

            var loadData = function (mandantId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (apiToggle) {
                        apiToggle.winControl.checked = false;
                    }
                    return WinJS.Promise.as();
                }).then(function () {
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
                            Log.print(Log.l.error, "initLandView: error!");
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
                    if (mandantId) {
                        Log.print(Log.l.trace, "calling select fairMandantView...");
                        return ClientManagement.fairMandantView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.trace, "ClientManagement.fairMandantView: success!");
                            // select returns object already parsed from json file in response
                            if (json && json.d) {
                                //that.nextUrl = MandatoryList.mandatoryView.getNextUrl(json);
                                var results = json.d;
                                that.showApiUser(results.APIUser);
                                that.binding.dataClientManagement = results;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            Log.print(Log.l.error, "fairMandantView: error!");
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, mandantId);
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
                return that.loadData(getRecordId());
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();
