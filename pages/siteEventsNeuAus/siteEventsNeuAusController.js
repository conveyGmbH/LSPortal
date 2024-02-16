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
    WinJS.Namespace.define("SiteEventsNeuAus", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "SiteEventsNeuAus.Controller.");
            Application.Controller.apply(this, [pageElement, {
                restriction: getEmptyDefaultValue(SiteEventsNeuAus.defaultRestriction),
                dataExhibitor: getEmptyDefaultValue(SiteEventsNeuAus.defaultRestriction),
                VeranstaltungTerminID: 0,
                VeranstaltungName: null
            }, commandList]);
            
            var that = this;
            this.mandatoryErrorCount = 0;
            this.mandatoryErrorMsg = "";

            var initLand = pageElement.querySelector("#InitLandReporting");
            var initSprache = pageElement.querySelector("#InitSprache");
            var exibitorcategory = pageElement.querySelector("#exibitorcategory");
            var companyname = pageElement.querySelector("#firmenname");
            var ordernr = pageElement.querySelector("#OrderNumber");
            var eventname = pageElement.querySelector("#veranstaltungname");
            
            var creatingExhibitorCategory = function() {
                Log.call(Log.l.trace, "SiteEventsNeuAus.Controller.");
                var exhibitorCategory = [
                    {
                        value: null,
                        title: ""
                    },
                    {
                        value: "APP",
                        title: "APP"
                    },
                    {
                        value: "SERVICE",
                        title: "SERVICE"
                    },
                    {
                        value: "FREE",
                        title: "FREE"
                    },
                    {
                        value: "RTW",
                        title: "RTW"
                    },
                    {
                        value: "IPAD",
                        title: "IPAD"
                    },
                    {
                        value: "API",
                        title: "API"
                    },
                    {
                        value: "FLOW",
                        title: "FLOW"
                    },
                    {
                        value: "ESUCCESS",
                        title: "ESUCCESS"
                    }
                ];
                if (exibitorcategory && exibitorcategory.winControl) {
                    exibitorcategory.winControl.data = new WinJS.Binding.List(exhibitorCategory);
                    exibitorcategory.selectedIndex = 0;
                }
            }
            this.creatingExhibitorCategory = creatingExhibitorCategory;
            
            var setLangID = function(langID) {
                switch (langID) {
                case 1031:
                     that.binding.dataExhibitor.INITSpracheID = 1;
                     break;
                case 1033:
                    that.binding.dataExhibitor.INITSpracheID = 2;
                    break;
                case 1036:
                    that.binding.dataExhibitor.INITSpracheID = 3;
                    break;
                case 1040:
                    that.binding.dataExhibitor.INITSpracheID = 4;
                    break;
                default:
                    that.binding.dataExhibitor.INITSpracheID = 1;
                    break;
                }
            }
            this.setLangID = setLangID;

            var isEmail = function (emailadress) {
                var validmailregex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.([a-z][a-z]+)|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
                return validmailregex.test(emailadress);
            }
            this.isEmail = isEmail;

            var getRecordId = function () {
                Log.call(Log.l.trace, "SiteEventsNeuAus.Controller.");
                that.binding.VeranstaltungTerminID = AppData.getRecordId("VeranstaltungTermin");
                Log.ret(Log.l.trace, that.binding.VeranstaltungTerminID);
                return that.binding.VeranstaltungTerminID;
            }
            this.getRecordId = getRecordId;
            
            var setMandetoryFields = function () {
                var inputfieldVeranstaltungname = pageElement.querySelector("#veranstaltungname");
                var inputfieldemailadress = pageElement.querySelector("#loginemail");
                var inputfieldfirmenname = pageElement.querySelector("#firmenname");

                if (Colors.isDarkTheme) {
                    WinJS.Utilities.removeClass(inputfieldVeranstaltungname, "lightthemeMandatory");
                    WinJS.Utilities.removeClass(inputfieldemailadress, "lightthemeMandatory");
                    WinJS.Utilities.removeClass(inputfieldfirmenname, "lightthemeMandatory");
                    WinJS.Utilities.addClass(inputfieldVeranstaltungname, "darkthemeMandatory");
                    WinJS.Utilities.addClass(inputfieldemailadress, "darkthemeMandatory");
                    WinJS.Utilities.addClass(inputfieldfirmenname, "darkthemeMandatory");
                } else {
                    WinJS.Utilities.removeClass(inputfieldVeranstaltungname, "darkthemeMandatory");
                    WinJS.Utilities.removeClass(inputfieldemailadress, "darkthemeMandatory");
                    WinJS.Utilities.removeClass(inputfieldfirmenname, "darkthemeMandatory");
                    WinJS.Utilities.addClass(inputfieldVeranstaltungname, "lightthemeMandatory");
                    WinJS.Utilities.addClass(inputfieldemailadress, "lightthemeMandatory");
                    WinJS.Utilities.addClass(inputfieldfirmenname, "lightthemeMandatory");
                }
            }
            this.setMandetoryFields = setMandetoryFields;

            var getExibitorData = function() {
                var dataExibitor = that.binding.dataExhibitor;
                if (typeof dataExibitor.AppUser === "string") {
                    dataExibitor.AppUser = parseInt(dataExibitor.AppUser);
                }
                if (!dataExibitor.AppUser || dataExibitor.AppUser < 1) {
                    dataExibitor.AppUser = 0;
                }
                if (typeof dataExibitor.LandID === "string") {
                    dataExibitor.LandID = parseInt(dataExibitor.LandID);
                }
                if (typeof dataExibitor.INITSpracheID === "string") {
                    dataExibitor.INITSpracheID = parseInt(dataExibitor.INITSpracheID);
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
                if (dataExibitor.InfoText === "") {
                    dataExibitor.InfoText = null;
                }
                if (dataExibitor.DBSYNCLogin === "") {
                    dataExibitor.DBSYNCLogin = null;
                }
                if (dataExibitor.DBSYNCPassword === "") {
                    dataExibitor.DBSYNCPassword = null;
                }
                if (dataExibitor.CustomerID === "") {
                    dataExibitor.CustomerID = null;
                }
                if (dataExibitor.ExhibitorCategory === "null") {
                    dataExibitor.ExhibitorCategory = null;
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
                    return AppData.call("PRC_CreateSiteVeranstaltung",
                        {
                            pVeranstaltungTerminID: that.binding.VeranstaltungTerminID,
                            pVeranstaltungName: that.binding.VeranstaltungName,
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
                            pInfoText: dataExibitor.InfoText,
                            pSpracheID: dataExibitor.INITSpracheID,
                            pDBSYNCLogin: dataExibitor.DBSYNCLogin,
                            pDBSYNCPassword: dataExibitor.DBSYNCPassword,
                            pCustomerID: dataExibitor.CustomerID,
                            pExhibitorCategory: dataExibitor.ExhibitorCategory
                        }, function (json) {
                            Log.print(Log.l.info, "call success! ");
                            AppBar.busy = false;
                            Application.navigateById("siteevents", event);
                            Log.ret(Log.l.trace);
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "call error");
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                            Log.ret(Log.l.trace);
                        });
                
            }
            this.saveExhibitor = saveExhibitor;

            var checkedEmail = function () {
                Log.call(Log.l.trace, "SiteEventsNeuAus.Controller.");
                var emailadress = pageElement.querySelector("#loginemail").value;
                var validemail = that.isEmail(emailadress);
                if (validemail === false) {
                    return false;
                } else {
                    return true;
                }
            }
            this.checkedEmail = checkedEmail;

            var checkMandatoryFields = function () {
                Log.call(Log.l.trace, "SiteEventsNeuAus.Controller.");
                var dataExibitor = getExibitorData();
                var ret = WinJS.Promise.as().then(function() {
                    Log.print(Log.l.trace, "calling select MaildokumentView...");
                    if (dataExibitor.FirmenName) {
                        that.mandatoryErrorCount += 0;
                    } else {
                        that.mandatoryErrorCount += 1;
                        that.mandatoryErrorMsg += getResourceText("siteeventsneuaus.firmenname") + " ";
                    }
                    if (dataExibitor.LoginEmail) {
                        that.mandatoryErrorCount += 0;
                    } else {
                        that.mandatoryErrorCount += 1;
                        that.mandatoryErrorMsg += getResourceText("siteeventsneuaus.loginemail") + " ";
                    }
                    if (dataExibitor.ExhibitorCategory) {
                        that.mandatoryErrorCount += 0;
                    } else {
                        that.mandatoryErrorCount += 1;
                        that.mandatoryErrorMsg += getResourceText("siteeventsneuaus.exhibitorcategory") + " ";
                    }
                }).then(function () {
                    if (that.mandatoryErrorCount > 0) {
                        that.mandatoryErrorMsg += getResourceText("siteeventsneuaus.mandatoryerrormsgadd");
                    }
                });
                return ret;
            }
            this.checkMandatoryFields = checkMandatoryFields;

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
                    AppBar.busy = true;
                    that.mandatoryErrorCount = 0;
                    that.mandatoryErrorMsg = "";
                    that.checkMandatoryFields();
                    if (that.mandatoryErrorCount > 0) {
                        alert(that.mandatoryErrorMsg);
                        AppBar.busy = false;
                    } else {
                        if (that.checkedEmail() === false) {
                            var confirmTitle = getResourceText("siteeventsneuaus.mailerrortext");
                            confirm(confirmTitle, function (result) {
                                if (result) {
                                    that.saveExhibitor();
                                    Log.print(Log.l.trace, "clickOk: event choice Ok");
                                } else {
                                    Log.print(Log.l.trace, "clickDelete: event choice CANCEL");
                                    AppBar.busy = false;
                                }
                            });
                        } else {
                            that.saveExhibitor();
                        }
                    }
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
                    if (that.binding.VeranstaltungTerminID && !AppBar.busy) {
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
                    return SiteEventsNeuAus.VeranstaltungTerminView.select(function (json) {
                        Log.print(Log.l.trace, "MaildokumentView: success!");
                        if (json && json.d && json.d.results) {
                            // store result for next use
                            var result = json.d.results[0];
                            that.binding.VeranstaltungName = result.VeranstaltungName;
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, {
                         VeranstaltungTerminVIEWID: that.binding.VeranstaltungTerminID
                    });
                }).then(function () {
                    if (!SiteEventsNeuAus.initSpracheView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initSpracheView...");
                        //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                        return SiteEventsNeuAus.initSpracheView.select(function (json) {
                            Log.print(Log.l.trace, "initSpracheView: success!");
                            if (json && json.d && json.d.results) {
                                var results = json.d.results;
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initSprache && initSprache.winControl) {
                                    initSprache.winControl.data = new WinJS.Binding.List(results);
                                    that.setLangID(AppData.getLanguageId());
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initSprache && initSprache.winControl &&
                            (!initSprache.winControl.data || !initSprache.winControl.data.length)) {
                            var results = SiteEventsNeuAus.initSpracheView.getResults();
                            initSprache.winControl.data = new WinJS.Binding.List(results);
                            that.setLangID(AppData.getLanguageId());
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function () {
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
                                for (var i = 0; i < json.d.results.length; i++) {
                                    if (json.d.results[i].INITLandID === 53) {
                                        that.binding.dataExhibitor.LandID = json.d.results[i].INITLandID;
                                        Log.print(Log.l.trace, "initLandDataView: success!");
                                        //initLand.selectedIndex = i;
                                    }
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
                        var storedResults = AppData.initLandView.getResults();
                        for (var i = 0; i < storedResults.length; i++) {
                            if (storedResults[i].INITLandID === 53) {
                                that.binding.dataExhibitor.LandID = storedResults[i].INITLandID;
                                Log.print(Log.l.trace, "initLandDataView: success!");
                                //initLand.selectedIndex = i;
                            }
                        }
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
                Log.print(Log.l.trace, "getRecordId loaded!");
            }).then(function () {
                that.loadData();
                Log.print(Log.l.trace, "loadData loaded!");
            }).then(function () {
                that.creatingExhibitorCategory();
                Log.print(Log.l.trace, "creatingExhibitorCategory loaded!");
            }).then(function () {
                that.setMandetoryFields();
                Log.print(Log.l.trace, "setMandetoryFields loaded!");
            });
            Log.ret(Log.l.trace);
        }, {
                eventChangeId: null
            })

    });
})();
