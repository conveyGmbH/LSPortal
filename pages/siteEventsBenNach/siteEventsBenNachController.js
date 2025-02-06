// controller for page: siteEventsBenNachs
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/employee/employeeService.js" />
/// <reference path="~/www/pages/empList/empListController.js" />
/// <reference path="~/www/fragments/empRoles/empRolesController.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("SiteEventsBenNach", {
        Controller: WinJS.Class.derive(Application.Controller,
            function Controller(pageElement, commandList) {
                Log.call(Log.l.trace, "SiteEventsBenNach.Controller.");
                Application.Controller.apply(this,
                    [
                        pageElement, {
                            dataReorderEvent: getEmptyDefaultValue(SiteEventsBenNach.VeranstaltungView.defaultValue),
                            restriction: getEmptyDefaultValue(SiteEventsBenNach.VeranstaltungView.defaultRestriction),
                            recordID: 0,
                            reorderDevicesShowFlag: false,
                            newdevices: 0,
                            category: null,
                            orderbtnLabel: getResourceText("siteeventsbennach.btnlabelorder")
                        }, commandList
                    ]);

                var that = this;

                var exibitorcategory = pageElement.querySelector("#exibitorCategoryBenNach");

                var creatingExhibitorCategory = function () {
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
                            value: "FLOW",
                            title: "FLOW"
                        },
                        {
                            value: "API",
                            title: "API"
                        }
                    ];
                    if (exibitorcategory && exibitorcategory.winControl) {
                        exibitorcategory.winControl.data = new WinJS.Binding.List(exhibitorCategory);
                        exibitorcategory.selectedIndex = 0;
                    }
                }
                this.creatingExhibitorCategory = creatingExhibitorCategory;

                var saveRestriction = function() {
                    AppData.setRestriction("", that.binding.restriction);
                }
                this.saveRestriction = saveRestriction;

                var getRecordId = function() {
                    Log.call(Log.l.trace, "SiteEventsBenNach.Controller.");
                    that.binding.recordID = AppData.getRecordId("VeranstaltungAnlage");
                    Log.ret(Log.l.trace, that.binding.recordID);
                    return that.binding.recordID;
                }
                this.getRecordId = getRecordId;

                var getDateObject = function (dateData) {
                    var ret;
                    if (dateData) {
                        var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                        var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                        ret = new Date(milliseconds).toLocaleDateString();
                        //.toLocaleString('de-DE').substr(0, 10);
                    } else {
                        ret = "";
                    }
                    return ret;
                };
                this.getDateObject = getDateObject;

                var unlockDevice = function(id) {
                    Log.call(Log.l.trace, "SiteEventsBenNach.Controller.");
                    var parid = parseInt(id);
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_VeranstaltungAddDevice", {
                        pBestellungID: parid
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        that.loadData();
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                }
                this.unlockDevice = unlockDevice;

                var resultConverter = function (item, index) {
                    item.index = index;
                    item.Startdatum = that.getDateObject(item.Startdatum);
                    item.Enddatum = that.getDateObject(item.Enddatum);
                }
                this.resultConverter = resultConverter;

                // define handlers
                this.eventHandlers = {
                    clickBack: function(event) {
                        Log.call(Log.l.trace, "SiteEventsBenNach.Controller.");
                        if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                            WinJS.Navigation.back(1).done();
                        }
                        Log.ret(Log.l.trace);
                    },
                    clickUnlockDevice: function(event) {
                        Log.call(Log.l.trace, "SiteEventsBenNach.Controller.");
                        that.unlockDevice(event.target.value);
                        Log.ret(Log.l.trace);
                    },
                    clickShowNewDevices: function (event) {
                        Log.call(Log.l.trace, "SiteEventsBenNach.Controller.");
                        if (that.binding.reorderDevicesShowFlag === false) {
                            that.binding.reorderDevicesShowFlag = true;
                        } else {
                            that.binding.reorderDevicesShowFlag = false;
                        }
                        Log.ret(Log.l.trace);
                    },
                    clickOrderNewDevices: function (event) {
                        Log.call(Log.l.trace, "SiteEventsBenNach.Controller.");
                        AppData.setErrorMsg(that.binding);
                        AppData.call("PRC_VeranstaltungAddUser", {
                            pVeranstaltungID: parseInt(event.target.value),
                            pAppUser: parseInt(that.binding.newdevices),
                            pUserType: that.binding.category
                        }, function (json) {
                            Log.print(Log.l.info, "call success! ");
                            that.binding.reorderDevicesShowFlag = false;
                            that.binding.newdevices = 0;
                            that.loadData();
                        }, function (error) {
                            Log.print(Log.l.error, "call error");
                        });
                        Log.ret(Log.l.trace);
                    },
                    clickChangeUserState: function(event) {
                        Log.call(Log.l.trace, "SiteEventsBenNach.Controller.");
                        Application.navigateById("userinfo", event);
                        Log.ret(Log.l.trace);
                    },
                    clickGotoPublish: function(event) {
                        Log.call(Log.l.trace, "SiteEventsBenNach.Controller.");
                        Application.navigateById("publish", event);
                        Log.ret(Log.l.trace);
                    },
                    clickTopButton: function(event) {
                        Log.call(Log.l.trace, "SiteEventsBenNach.Controller.");
                        var anchor = document.getElementById("menuButton");
                        var menu = document.getElementById("menu1").winControl;
                        var placement = "bottom";
                        menu.show(anchor, placement);
                        Log.ret(Log.l.trace);
                    },
                    clickLogoff: function(event) {
                        Log.call(Log.l.trace, "SiteEventsBenNach.Controller.");
                        AppData._persistentStates.privacyPolicyFlag = false;
                        if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                            AppHeader.controller.binding.userData = {};
                            if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                                AppHeader.controller.binding.userData.VeranstaltungName = "";
                            }
                        }
                        Application.navigateById("login", event);
                        Log.ret(Log.l.trace);
                    },
                    clickChange: function (event) {
                        Log.call(Log.l.trace, "SiteEvents.Controller.");
                        that.changeEvent();
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
                    clickChange: function () {
                        if (AppData.generalData.eventId !== that.getRecordId()) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                };

                var changeEvent = function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_ChangeSiteVeranstaltung", {
                        pNewVeranstaltungID: that.getRecordId(),
                        pLoginName: AppData._persistentStates.odata.login
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        AppData.prevLogin = AppData._persistentStates.odata.login;
                        AppData.prevPassword = AppData._persistentStates.odata.password;
                        Application.navigateById("login");
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                }
                this.changeEvent = changeEvent;

                var loadData = function () {
                    Log.call(Log.l.trace, "SiteEventsBenNach.Controller.");
                    that.loading = true;
                    AppData.setErrorMsg(that.binding);
                    var ret = new WinJS.Promise.as().then(function() {
                        return AppData.call("PRC_View20564", {
                            pVeranstaltungID: that.binding.recordID
                        }, function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "SiteEventsBenNach: success!");
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d && json.d.results && json.d.results.length) {
                                var results = json.d.results[0];
                                results.Startdatum = that.getDateObject(results.Startdatum);
                                results.Enddatum = that.getDateObject(results.Enddatum);
                                that.binding.dataReorderEvent = results;
                                that.binding.count = results.length;
                            } else {
                                that.binding.count = 0;
                            }
                        }, function (error) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    })/*.then(function () {
                        return SiteEventsBenNach.VeranstaltungView.select(function (json) {
                            // this callback will be called asynchronously
                            // when the response is available
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "SiteEventsBenNach: success!");
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d && json.d.results && json.d.results.length) {
                                var results = json.d.results[0];
                                results.Startdatum = that.getDateObject(results.Startdatum);
                                results.Enddatum = that.getDateObject(results.Enddatum);
                                that.binding.dataReorderEvent = results;
                                that.binding.count = results.length;
                            } else {
                                that.binding.count = 0;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            
                            }, { VeranstaltungVIEWID: that.binding.recordID}
                        );
                    })*/.then(function () {
                        var empRolesFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("reorderList"));
                        if (empRolesFragmentControl && empRolesFragmentControl.controller) {
                            return empRolesFragmentControl.controller.loadData(that.binding.recordID);
                        } else {
                            var parentElement = pageElement.querySelector("#reodershost");
                            if (parentElement) {
                                return Application.loadFragmentById(parentElement, "reorderList", { VeranstaltungID: that.binding.recordID });
                            } else {
                                return WinJS.Promise.as();
                            }
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
                    that.creatingExhibitorCategory();
                    Log.print(Log.l.trace, "creatingExhibitorCategory loaded!");
                }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



