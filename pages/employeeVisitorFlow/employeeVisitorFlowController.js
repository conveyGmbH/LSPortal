// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/employeeVisitorFlow/employeeVisitorFlowService.js" />
/// <reference path="~/www/pages/empList/empListController.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("EmployeeVisitorFlow", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "EmployeeVisitorFlow.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataEmployee: getEmptyDefaultValue(EmployeeVisitorFlow.employeeView.defaultValue),
                restriction: getEmptyDefaultValue(EmployeeVisitorFlow.employeeView.defaultRestriction),
                InitLandItem: { InitLandID: 0, TITLE: "" }
            }, commandList]);

            var that = this;

            var cr_V_bereich = pageElement.querySelector("#cr_V_bereich");
            var initLand = pageElement.querySelector("#InitLand");

            var setDataEmployee = function (newDataEmployee) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.dataEmployee = newDataEmployee;
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
            }
            this.setDataEmployee = setDataEmployee;

            var setInitLandItem = function (newInitLandItem) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.InitLandItem = newInitLandItem;
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
            }
            this.setInitLandItem = setInitLandItem;

            var loadInitSelection = function () {
                Log.call(Log.l.trace, "Contact.Controller.");
                if (typeof that.binding.dataEmployee.BenutzerVIEWID !== "undefined") {
                    var map, results, curIndex;
                    if (typeof that.binding.dataEmployee.INITLandID !== "undefined") {
                        Log.print(Log.l.trace, "calling select initLandData: Id=" + that.binding.dataEmployee.INITLandID + "...");
                        map = AppData.initLandView.getMap();
                        results = AppData.initLandView.getResults();
                        if (map && results) {
                            curIndex = map[that.binding.dataEmployee.INITLandID];
                            if (typeof curIndex !== "undefined") {
                                that.setInitLandItem(results[curIndex]);
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace);
                return WinJS.Promise.as();
            }
            this.loadInitSelection = loadInitSelection;

            var getRecordId = function () {
                Log.call(Log.l.trace, "Employee.Controller.");
                var recordId = that.binding.dataEmployee && that.binding.dataEmployee.BenutzerVIEWID;
                if (!recordId) {
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        recordId = master.controller.binding.employeeId;
                    }
                }
                Log.ret(Log.l.trace, recordId);
                return recordId;
            }
            this.getRecordId = getRecordId;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "employee saved");
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding && typeof master.controller.selectRecordId !== "undefined") {
                            master.controller.binding.employeeId = that.binding.dataEmployee.MitarbeiterVIEWID;
                            master.controller.loadData().then(function () {
                                Log.print(Log.l.info, "master.controller.loadData: success!");
                                master.controller.selectRecordId(that.binding.dataEmployee.MitarbeiterVIEWID);
                            });
                        }
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee");
                    });
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    Application.navigateById("publish", event);
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
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickOk: function () {
                    return AppBar.busy;
                }
            };

            var resultCrVBereichConverter = function (item, index) {
                item.TITLE = item.TITLE + (!!item.Eingang ? " " + getResourceText("employeeVisitorFlow.entry") : "") + (!!item.Ausgang ? " " + getResourceText("employeeVisitorFlow.exit") : "");
            };
            this.resultCrVBereichConverter = resultCrVBereichConverter;

            var loadData = function (recordId) {
                Log.call(Log.l.trace, "Employee.Controller.");
                AppData.setErrorMsg(that.binding);
                var id = AppData.getRecordId("MitarbeiterVIEW_20471");
                if (id) {
                    recordId = id;
                }
                var ret = new WinJS.Promise.as().then(function () {
                    if (AppBar.modified) {
                        return that.saveData(function () {
                            Log.print(Log.l.trace, "saveData completed...");
                            var master = Application.navigator.masterControl;
                            if (master && master.controller) {
                                master.controller.loadData().then(function () {
                                    master.controller.selectRecordId(recordId);
                                });
                            }
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "saveData error...");
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    Log.print(Log.l.trace, "calling select CR_V_Bereich_ODataVIEW...");
                    return EmployeeVisitorFlow.CR_V_Bereich_ODataVIEW.select(function (json) {
                        Log.print(Log.l.trace, "CR_V_Bereich_ODataVIEW: success!");
                        if (json && json.d && json.d.results) {
                            var results = [
                                { CR_V_BereichVIEWID: 0, TITLE: "" }
                            ];
                            json.d.results.forEach(function (item, index) {
                                that.resultCrVBereichConverter(item, index);
                                results.push(item);
                            });
                            if (cr_V_bereich && cr_V_bereich.winControl) {
                                cr_V_bereich.winControl.data = new WinJS.Binding.List(results);
                            }
                        }
                    }, function (errorResponse) {
                        // ignore that
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
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
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initLand && initLand.winControl &&
                            (!initLand.winControl.data || !initLand.winControl.data.length)) {
                            initLand.winControl.data = new WinJS.Binding.List(AppData.initLandView.getResults());
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select employeeView...");
                        return EmployeeVisitorFlow.benutzerView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "employeeView: success!");
                            if (json && json.d) {
                                // now always edit!
                                that.setDataEmployee(json.d);
                                if (that.binding.dataEmployee.Login) {
                                    AppBar.busy = false;
                                }
                                loadInitSelection();
                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, recordId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    AppBar.notifyModified = true;
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            // save data
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Employee.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                if (typeof that.binding.dataEmployee.CR_V_BereichID === "string") {
                    that.binding.dataEmployee.CR_V_BereichID = parseInt(that.binding.dataEmployee.CR_V_BereichID);
                    if (that.binding.dataEmployee.CR_V_BereichID === 0) {
                        that.binding.dataEmployee.CR_V_BereichID = null;
                    }
                }
                var dataEmployee = that.binding.dataEmployee;
                if (dataEmployee && AppBar.modified && !AppBar.busy) {
                    var recordId = getRecordId();
                    if (recordId) {
                        AppBar.busy = true;
                        ret = EmployeeVisitorFlow.benutzerView.update(function (response) {
                            AppBar.busy = false;
                            // called asynchronously if ok
                            Log.print(Log.l.info, "employeeData update: success!");
                            complete(response);
                            AppBar.modified = false;
                        }, function (errorResponse) {
                            AppBar.busy = false;
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            //error(errorResponse);
                            ;
                        }, recordId, dataEmployee);
                    } else {
                        Log.print(Log.l.info, "not supported");
                        ret = WinJS.Promise.as();
                    }
                } else if (AppBar.busy) {
                    ret = WinJS.Promise.timeout(100).then(function () {
                        return that.saveData(complete, error);
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete(dataEmployee);
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            that.processAll().then(function () {
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



