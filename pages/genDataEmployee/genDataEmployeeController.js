﻿// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/genDataEmployee/genDataEmployeeService.js" />
/// <reference path="~/www/pages/empList/empListController.js" />
/// <reference path="~/www/fragments/empRoles/empRolesController.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("GenDataEmployee", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "GenDataEmployee.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataEmployee: getEmptyDefaultValue(GenDataEmployee.employeeView.defaultValue),
                restriction: copyByValue(GenDataEmployee.employeeView.defaultRestriction),
                isEmpRolesVisible: AppHeader.controller.binding.userData.SiteAdmin || AppHeader.controller.binding.userData.HasLocalEvents,
                isEmpRolesCustomVisible: AppHeader.controller.binding.userData.HasLocalEvents,
                setRoleVisible: 0,
                setRoleCheckVisible: 0,
                noLicence: null,
                allowEditLogin: null,
                noLicenceText: getResourceText("info.nolicenceemployee"),
                addEventFormFlag: (AppHeader.controller.binding.userData.SiteAdmin || AppHeader.controller.binding.userData.HasLocalEvents),
                eventId: null,
                disableLoginName: false,
                disableLoginFirstPart: false,
                disableDomain: false
            }, commandList]);

            var that = this;

            var prevMasterLoadPromise = null;
            var prevLogin = null;
            var prevPassword;
            var progress = null;
            var counter = null;
            var layout = null;
            this.events = null;
            this.roles = null;

            var addEventFormfieldcombo = pageElement.querySelector("#addEventFormEventData");
            var roleschombo = pageElement.querySelector("#roles");

            that.loadDataDelayedPromise = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            this.dispose = function () {
                if (that.events) {
                    that.events = null;
                }
                if (that.roles) {
                    that.roles = null;
                }
            }

            var handleVisibleList = function(hasLocal, siteadmin) {
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                if (that.binding.addEventFormFlag) {
                    if (hasLocal === 1 || siteadmin === 1) {
                        that.binding.addEventFormFlag = null;
                    } else {
                        that.binding.addEventFormFlag = 1;
                    }
                }
                Log.ret(Log.l.trace);
            }
            that.handleVisibleList = handleVisibleList;

            var resetVisibleList = function() {
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                that.binding.addEventFormFlag = (AppHeader.controller.binding.userData.SiteAdmin ||
                    AppHeader.controller.binding.userData.HasLocalEvents);
                Log.ret(Log.l.trace);
            }
            this.resetVisibleList = resetVisibleList;

            var setRoleVisible = function () {
                    if (!AppHeader.controller.binding.userData.SiteAdmin && AppHeader.controller.binding.userData.HasLocalEvents) {
                        that.binding.setRoleVisible = 1;
                        that.binding.setRoleCheckVisible = 0;
                    } else if (AppHeader.controller.binding.userData.SiteAdmin) {
                        that.binding.setRoleVisible = 1;
                        that.binding.setRoleCheckVisible = 1;
                    } else {
                        that.binding.setRoleVisible = 0;
                        that.binding.setRoleCheckVisible = 0;
                    }
            }
            this.setRoleVisible = setRoleVisible;

            var loadDataDelayed = function (searchString) {
                if (that.loadDataDelayedPromise) {
                    that.loadDataDelayedPromise.cancel();
                    that.removeDisposablePromise(that.loadDataDelayedPromise);
                }
                that.loadDataDelayedPromise = WinJS.Promise.timeout(450).then(function () {
                    var master = Application.navigator.masterControl;
                    if (master && master.controller &&
                        typeof master.controller.loadData === "function") {
                        master.controller.loadData();
                    }
                });
                that.addDisposablePromise(that.loadDataDelayedPromise);
            }
            this.loadDataDelayed = loadDataDelayed;

            var resultConverter = function (item, index) {
                if (item.Login && item.Login.indexOf("@") > 0) {
                    item.LogInNameBeforeAtSymbol = item.Login.substr(0, item.Login.indexOf("@"));
                    item.LogInNameAfterAtSymbol = item.Login.substr(item.Login.lastIndexOf("@"));
                } else {
                    item.LogInNameBeforeAtSymbol = item.Login;
                    item.LogInNameAfterAtSymbol = "";
                }
                item.Password2 = item.Password;
            }
            this.resultConverter = resultConverter;

            var setDataEmployee = function (newDataEmployee) {
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                prevLogin = newDataEmployee.Login;
                prevPassword = newDataEmployee.Password;
                that.resultConverter(newDataEmployee);
                that.binding.dataEmployee = newDataEmployee;
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                Log.ret(Log.l.trace);
            }
            this.setDataEmployee = setDataEmployee;

            var saveRestriction = function () {
                /*if (that.binding.restriction.Names && that.binding.restriction.Names.length > 0) {
                    that.binding.restriction.Aktiv = ["X", "X", "X"];
                } else {
                    that.binding.restriction.Aktiv = ["X", "X", "X"];
                }
                that.binding.restriction.bAndInEachRow = true;
                that.binding.restriction.bUseOr = false;
                Log.print("restriction number:" + that.binding.restriction.countCombobox + ", restriction: " + that.binding.restriction);*/
                AppData.setRestriction("Employee", that.binding.restriction);
            }
            this.saveRestriction = saveRestriction;

            var getRecordId = function () {
                var recordId = null;
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                var master = Application.navigator.masterControl;
                if (master && master.controller && master.controller.binding) {
                    recordId = master.controller.binding.employeeId;
                }
                Log.ret(Log.l.trace, recordId);
                return recordId;
            }
            this.getRecordId = getRecordId;

            var deleteData = function (complete, error) {
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var recordId = getRecordId();
                if (recordId) {
                    AppBar.busy = true;
                    ret = GenDataEmployee.employeeView.deleteRecord(function (response) {
                        AppBar.busy = false;
                        // called asynchronously if ok
                        that.setDataEmployee(getEmptyDefaultValue(GenDataEmployee.employeeView.defaultValue));
                        if (typeof complete === "function") {
                            complete(response);
                        }
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (typeof error === "function") {
                            error(errorResponse);
                        }
                    }, recordId);
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.deleteData = deleteData;

            var checkingLicence = function (recordId) {
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = GenDataEmployee.licenceBView.select(function (json) {
                    // this callback will be called asynchronously
                    // when the response is available
                    Log.print(Log.l.info, "licenceBView select: success!");
                    var result = json.d;
                    if (result && result.NichtLizenzierteApp) {
                        that.binding.noLicence = result.NichtLizenzierteApp;
                    } else {
                        that.binding.noLicence = null;
                    }
                    if (result && result.UserStatus) {
                        that.binding.userStatus = result.UserStatus;
                    } else {
                        that.binding.userStatus = null;
                    }
                    // neues Flag UserIsActive -> wenn user bereits eingelogt ist dann sollte das Feld Login und Passwort static sein 
                    // wenn user den Ändern will dann klicke explizit auf das icon für Ändern user und bestätige die Alertbox 
                    // -> result.HatKontakte ist dirty Trick um festzustellen ob normale Admin oder nicht
                    that.binding.allowEditLogin = AppHeader.controller.binding.userData.SiteAdmin || AppHeader.controller.binding.userData.HasLocalEvents;
                    if (that.binding.allowEditLogin) {
                        that.binding.disableLoginFirstPart = false;
                        that.binding.disableDomain = false;
                        that.binding.disableLoginName = false;
                    } else {
                        that.binding.disableLoginFirstPart = true;
                        that.binding.disableDomain = true;
                        that.binding.disableLoginName = true;
                    }
                    AppBar.triggerDisableHandlers();
                    return WinJS.Promise.as();
                }, function (errorResponse) {
                    Log.print(Log.l.error, "error selecting licenceBView");
                    AppData.setErrorMsg(that.binding, errorResponse);
                }, recordId);
                Log.ret(Log.l.trace);
                return ret;
            }
            this.checkingLicence = checkingLicence;

            var checkingReadonlyFlag = function () {
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                if (AppHeader.controller.binding.userData.SiteAdmin) {
                    that.binding.disableLoginFirstPart = false;
                    that.binding.disableDomain = false;
                    that.binding.disableLoginName = false;
                } else {
                    that.binding.disableLoginFirstPart = false;
                    that.binding.disableDomain = true;
                    that.binding.disableLoginName = true;
                }
                Log.ret(Log.l.trace);
            }
            this.checkingReadonlyFlag = checkingReadonlyFlag;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    var newEmployeeId = null;
                    that.saveData(function (response) {
                        AppBar.busy = true;
                        Log.print(Log.l.trace, "eployee saved");
                        //var newEmployee = getEmptyDefaultValue(GenDataEmployee.employeeView.defaultValue);
                        var newEmployee = copyByValue(GenDataEmployee.employeeView.defaultValue);
                        // could be changed since load of service
                        newEmployee.VeranstaltungID = AppData.getRecordId("Veranstaltung2");
                        /* var restriction = {
                             OrderAttribute: ["Nachname"],
                             OrderDesc: false
                         };
                         AppData.setRestriction("Employee", restriction);*/
                        if (!newEmployee.VeranstaltungID) {
                            return confirmModal(null, getResourceText("genDataEmployee.chooseEvent"), getResourceText("genDataEmployee.chooseEventOk"), null, function (result) {
                                if (result) {
                                    Log.print(Log.l.trace, "clickDelete: user choice OK");
                                    AppBar.busy = false;
                                }
                            });
                        } else {
                            return GenDataEmployee.employeeView.insert(function (json) {
                                AppBar.busy = false;
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.info, "employeeView insert: success!");
                                // employeeView returns object already parsed from json file in response
                                that.binding.noLicence = null;
                                that.binding.allowEditLogin = null;
                                if (json && json.d) {
                                    var employee = json.d;
                                    that.setDataEmployee(employee);
                                    that.setRoleVisible();
                                    if (!AppHeader.controller.binding.userData.SiteAdmin) {
                                        var userName = AppData.generalData.userName;
                                        if (userName && userName.indexOf("@") > 0) {
                                            that.binding.dataEmployee.LogInNameAfterAtSymbol = userName.substr(userName.lastIndexOf("@"));
                                        }
                                        that.binding.dataEmployee.LogInNameBeforeAtSymbol = "";
                                    }
                                    newEmployeeId = that.binding.dataEmployee.MitarbeiterVIEWID;
                                }
                                //AppBar.modified = true;
                            }, function (errorResponse) {
                                Log.print(Log.l.error, "error inserting employee");
                                AppBar.busy = false;
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, newEmployee).then(function () {
                                var master = Application.navigator.masterControl;
                                if (master && master.controller &&
                                    master.controller.binding &&
                                    typeof master.controller.loadData === "function") {
                                    master.controller.binding.employeeId = newEmployeeId;
                                    return master.controller.loadData();
                                } else {
                                    return WinJS.Promise.as();
                                }
                            });
                        }
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee");
                    });
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    var confirmTitle = getResourceText("employee.questionDelete");
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            Log.print(Log.l.trace, "clickDelete: user choice OK");
                            deleteData(function (response) {
                                /* Mitarbeiter Liste neu laden und Selektion auf neue Zeile setzen */
                                var master = Application.navigator.masterControl;
                                if (master && master.controller &&
                                    typeof master.controller.loadData === "function" &&
                                    master.controller.binding) {
                                    //var prevSelIdx = master.controller.binding.selIdx;
                                    master.controller.loadData()/*.then(function () {
                                        Log.print(Log.l.info, "master.controller.loadData: success!");
                                        master.controller.setSelIndex(prevSelIdx);
                                    })*/;
                                }
                            }, function (errorResponse) {
                                // delete ERROR
                                var message = null;
                                Log.print(Log.l.error, "error status=" + errorResponse.status + " statusText=" + errorResponse.statusText);
                                if (errorResponse.data && errorResponse.data.error) {
                                    Log.print(Log.l.error, "error code=" + errorResponse.data.error.code);
                                    if (errorResponse.data.error.message) {
                                        Log.print(Log.l.error, "error message=" + errorResponse.data.error.message.value);
                                        message = errorResponse.data.error.message.value;
                                    }
                                }
                                if (!message) {
                                    message = getResourceText("error.delete");
                                }
                                alert(message);
                            });
                        } else {
                            Log.print(Log.l.trace, "clickDelete: user choice CANCEL");
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "employee saved");
                        that.loadData();
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee");
                    });
                    Log.ret(Log.l.trace);
                },
                clickExport: function (event) {
                    Log.call(Log.l.trace, "Reporting.Controller.");
                    var exporter = new ExportXlsx.ExporterClass();
                    var dbView = EmpList.employeePWExportView;
                    var fileName = "Passworte";
                    exporter.saveXlsxFromView(dbView, fileName, function (result) {
                        AppBar.busy = false;
                        AppBar.triggerDisableHandlers();
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                        AppBar.busy = false;
                        AppBar.triggerDisableHandlers();
                    }, null, null);
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                changeLogin: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        that.binding.dataEmployee.Password = "";
                        that.binding.dataEmployee.Password2 = "";
                        var value = event.currentTarget.value;
                        if (value && value.indexOf("@") > 0) {
                            that.binding.dataEmployee.LogInNameBeforeAtSymbol = value.substr(0, value.indexOf("@"));
                            that.binding.dataEmployee.LogInNameAfterAtSymbol = value.substr(value.lastIndexOf("@"));
                        } else {
                            that.binding.dataEmployee.LogInNameBeforeAtSymbol = value;
                            that.binding.dataEmployee.LogInNameAfterAtSymbol = "";
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                changeLogInNameBeforeAtSymbol: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        that.binding.dataEmployee.Password = "";
                        that.binding.dataEmployee.Password2 = "";
                        var value = event.currentTarget.value;
                        if (value && value.indexOf("@") > 0) {
                            that.binding.dataEmployee.LogInNameBeforeAtSymbol = value.substr(0, value.indexOf("@"));
                        } else {
                            that.binding.dataEmployee.LogInNameBeforeAtSymbol = value;
                        }
                        that.binding.dataEmployee.Login = that.binding.dataEmployee.LogInNameBeforeAtSymbol + that.binding.dataEmployee.LogInNameAfterAtSymbol;
                    }
                    Log.ret(Log.l.trace);
                },
                changeLogInNameAfterAtSymbol: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        that.binding.dataEmployee.Password = "";
                        that.binding.dataEmployee.Password2 = "";
                        that.binding.dataEmployee.Login = that.binding.dataEmployee.LogInNameBeforeAtSymbol + event.currentTarget.value;
                    }
                    Log.ret(Log.l.trace);
                },
                changePassword: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        that.binding.dataEmployee.Password2 = "";
                    }
                    Log.ret(Log.l.trace);
                },
                changeSearchField: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    // attention: use restriction arrays due to "AND VeranstaltungID=" restriction!
                    that.binding.restriction.Name = [];
                    that.binding.restriction.Vorname = [];
                    that.binding.restriction.Login = [];
                    that.binding.restriction.Nachname = [];
                    if (event.target.value) {
                        that.binding.restriction.Name = [event.target.value, null, null, null];
                        that.binding.restriction.Vorname = [null, event.target.value, null, null];
                        that.binding.restriction.Login = [null, null, event.target.value, null];
                        that.binding.restriction.Nachname = [null, null, null, event.target.value];
                        that.binding.restriction.bUseOr = false;
                        that.binding.restriction.bAndInEachRow = true;
                    }
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller &&
                        typeof master.controller.loadData === "function") {
                        that.loadDataDelayed(master.controller.loadData());
                    }
                    Log.ret(Log.l.trace);
                },
                changeEventId: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    if (event.target.value) {
                        that.binding.restriction.VeranstaltungID = event.target.value;
                        // use Veranstaltung2 for event selection of multi-event administrators !== Veranstaltung (admin's own event!)
                        AppData.setRecordId("Veranstaltung2",
                            (typeof that.binding.restriction.VeranstaltungID === "string") ?
                                parseInt(that.binding.restriction.VeranstaltungID) : that.binding.restriction.VeranstaltungID);
                    } else {
                        delete that.binding.restriction.VeranstaltungID;
                        AppData.setRecordId("Veranstaltung2", 0);
                    }
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller) {
                        master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderFirstname: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    that.binding.restriction.OrderAttribute = "Vorname";
                    if (event.target.textContent === getResourceText("employee.firstNameAsc")) {
                        that.binding.restriction.OrderDesc = true;
                    } else {
                        that.binding.restriction.OrderDesc = false;
                    }
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller &&
                        typeof master.controller.loadData === "function") {
                        master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderLastname: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    that.binding.restriction.OrderAttribute = "Nachname";
                    if (event.target.textContent === getResourceText("employee.nameAsc")) {
                        that.binding.restriction.OrderDesc = true;
                    } else {
                        that.binding.restriction.OrderDesc = false;
                    }
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller &&
                        typeof master.controller.loadData === "function") {
                        master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderLicence: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    that.binding.restriction.OrderAttribute = "NichtLizenzierteApp";
                    var master = Application.navigator.masterControl;
                    if (event.target.textContent === getResourceText("employee.licenceAsc")) {
                        that.binding.restriction.OrderDesc = true;
                        delete that.binding.restriction.NichtLizenzierteApp;
                        if (master && master.controller &&
                            typeof master.controller.highlightorderLicenceBtn === "function") {
                            master.controller.highlightorderLicenceBtn(0);
                        }
                    } else {
                        that.binding.restriction.OrderDesc = false;
                        that.binding.restriction.NichtLizenzierteApp = 1;
                        if (master && master.controller &&
                            typeof master.controller.highlightorderLicenceBtn === "function") {
                            master.controller.highlightorderLicenceBtn(1);
                        }
                    }
                    that.saveRestriction();
                    if (master && master.controller &&
                        typeof master.controller.loadData === "function") {
                        master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                clickFilterLicence: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    that.binding.restriction.OrderAttribute = "NichtLizenzierteApp";
                    var master = Application.navigator.masterControl;
                    var orderLicenceButton = master.controller.getOrderLicenceBtn();
                    if (orderLicenceButton && orderLicenceButton.style && orderLicenceButton.style.borderColor === "red") {
                        //that.binding.restriction.OrderDesc = true;
                        delete that.binding.restriction.NichtLizenzierteApp;
                        master.controller.highlightorderLicenceBtn(0);
                    } else {
                        //that.binding.restriction.OrderDesc = false;
                        that.binding.restriction.NichtLizenzierteApp = 1;
                        master.controller.highlightorderLicenceBtn(1);
                    }
                    that.saveRestriction();
                    if (master && master.controller) {
                        master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);


                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "Account.Controller.");
                    AppData._persistentStates.privacyPolicyFlag = false;
                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                        AppHeader.controller.binding.userData = {
                            VeranstaltungName: ""
                        };
                    }
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                },
                clickChangeLogin: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    var confirmTitle = getResourceText("employee.changeUserLogin");
                    return confirm(confirmTitle, function (result) {
                        // called asynchronously if user-choice
                        if (result) {
                            that.binding.disableLoginFirstPart = false;
                            that.binding.disableDomain = true;
                            that.binding.disableLoginName = false;
                            that.binding.allowEditLogin = 1;
                        }
                        Log.ret(Log.l.trace);
                    });
                },
                onLoadingStateChanged: function (eventInfo) {
                    var i;
                    Log.call(Log.l.trace, "EmpList.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        // single list selection
                        if (listView.winControl.selectionMode !== WinJS.UI.SelectionMode.single) {
                            listView.winControl.selectionMode = WinJS.UI.SelectionMode.single;
                        }
                        // direct selection on each tap
                        if (listView.winControl.tapBehavior !== WinJS.UI.TapBehavior.directSelect) {
                            listView.winControl.tapBehavior = WinJS.UI.TapBehavior.directSelect;
                        }
                        // Double the size of the buffers on both sides
                        if (!maxLeadingPages) {
                            maxLeadingPages = listView.winControl.maxLeadingPages * 4;
                            listView.winControl.maxLeadingPages = maxLeadingPages;
                        }
                        if (!maxTrailingPages) {
                            maxTrailingPages = listView.winControl.maxTrailingPages * 4;
                            listView.winControl.maxTrailingPages = maxTrailingPages;
                        }
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.GenDataEmpListLayout.GenDataEmpListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "itemsLoaded") {
                            if (that.employees && that.employees.length > 0) {
                                var indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                                var indexOfLastVisible = listView.winControl.indexOfLastVisible;
                                for (i = indexOfFirstVisible; i <= indexOfLastVisible; i++) {
                                    var element = listView.winControl.elementFromIndex(i);
                                    if (element) {
                                        if (element.firstElementChild) {
                                            if (element.firstElementChild.disabled) {
                                                element.style.backgroundColor = "grey";
                                                if (AppHeader.controller.binding.userData.SiteAdmin) {
                                                    if (WinJS.Utilities.hasClass(element, "win-nonselectable")) {
                                                        WinJS.Utilities.removeClass(element, "win-nonselectable");
                                                    }
                                                } else {
                                                    if (!WinJS.Utilities.hasClass(element, "win-nonselectable")) {
                                                        WinJS.Utilities.addClass(element, "win-nonselectable");
                                                    }
                                                }
                                            } else {
                                                if (WinJS.Utilities.hasClass(element, "win-nonselectable")) {
                                                    WinJS.Utilities.removeClass(element, "win-nonselectable");
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            //smallest List color change
                            var circleElement = pageElement.querySelector('#nameInitialcircle');
                            if (circleElement && circleElement.style) {
                            circleElement.style.backgroundColor = Colors.accentColor;
                            }
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor, "name");
                            Colors.loadSVGImageElements(listView, "warning-image", 40, "red");
                            if (that.loading) {
                                progress = listView.querySelector(".list-footer .progress");
                                counter = listView.querySelector(".list-footer .counter");
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                                that.loading = false;
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickExportQrcode: function (event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    AppBar.busy = true;
                    //AppBar.triggerDisableHandlers();
                    WinJS.Promise.timeout(0).then(function () {
                        return that.exportPwdQrCodeEmployeePdf();
                    });
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
                clickNew: function () {
                    if (!AppBar.busy) {
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding &&
                            master.controller.binding.hasLocalevents) {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                },
                clickDelete: function () {
                    if (that.binding.dataEmployee && that.binding.dataEmployee.MitarbeiterVIEWID && !AppBar.busy &&
                        that.binding.dataEmployee.MitarbeiterVIEWID !== AppData.getRecordId("Mitarbeiter")) {
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding &&
                            master.controller.binding.hasLocalevents &&
                            !master.controller.binding.hasContacts) {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                },
                clickOk: function () {
                    return AppBar.busy;
                },
                clickChangeLogin: function () {
                    return that.binding.allowEditLogin;
                },
                clickExportQrcode: function () {
                    if (getRecordId()) {
                        if (AppBar.busy) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return true;
                    }
                }
            };

            var resizeGenFragEvents = function () {
                var ret = null;
                Log.call(Log.l.u1, "GenDataEmployee.Controller.");
                var genFragEventsFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("genFragEvents"));
                if (genFragEventsFragmentControl &&
                    genFragEventsFragmentControl.controller) {
                    if (genFragEventsFragmentControl.controller.binding &&
                        genFragEventsFragmentControl.controller.binding.loadingState !== "complete") {
                        ret = WinJS.Promise.timeout(50).then(function () {
                            return that.resizeGenFragEvents();
                        });
                        Log.ret(Log.l.u1, "listview layout not yet completed");
                        return ret;
                    }
                }
                var genFragEventsHost = pageElement.querySelector("#genfrageventshost");
                ret = WinJS.Promise.timeout(20).then(function () {
                    if (genFragEventsHost &&
                        genFragEventsHost.style &&
                        genFragEventsFragmentControl &&
                        genFragEventsFragmentControl._element) {
                        var genFragEventsHeaderContainer =
                            genFragEventsFragmentControl._element.querySelector(".win-headercontainer");
                        var genFragEventsSurface =
                            genFragEventsFragmentControl._element.querySelector(".win-surface");
                        var genFragEventsFooterContainer =
                            genFragEventsFragmentControl._element.querySelector(".win-footercontainer");
                        var height = (genFragEventsHeaderContainer ? genFragEventsHeaderContainer.offsetHeight : 0) +
                            (genFragEventsSurface ? genFragEventsSurface.offsetHeight : 0) +
                            (genFragEventsFooterContainer ? genFragEventsFooterContainer.offsetHeight : 0) + 8;
                        genFragEventsHost.style.height = height.toString() + "px";
                    }
                    return WinJS.Promise.timeout(20);
                }).then(function () {
                    if (genFragEventsFragmentControl &&
                        typeof genFragEventsFragmentControl.updateLayout === "function") {
                        genFragEventsFragmentControl.prevWidth = 0;
                        genFragEventsFragmentControl.prevHeight = 0;
                        genFragEventsFragmentControl.updateLayout.call(genFragEventsFragmentControl, genFragEventsFragmentControl._element);
                    }
                });
                Log.ret(Log.l.u1);
                return ret;
            }
            this.resizeGenFragEvents = resizeGenFragEvents;

            var loadData = function (recordId) {
                Log.call(Log.l.trace, "GenDataEmployee.Controller.", "recordId=" + recordId);
                AppData.setErrorMsg(that.binding);
                if (!recordId) {
                    recordId = getRecordId();
                }
                var ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select employeeView...");
                    that.roles = null;
                    return GenDataEmployee.LGNTINITAPUserRoleView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "employeeView: success!");
                        if (json && json.d && json.d.results.length > 0) {
                            that.roles = new WinJS.Binding.List(json.d.results);
                        }
                        if (roleschombo && roleschombo.winControl) {
                            roleschombo.winControl.data = that.roles;
                        }
                        /*if (AppHeader.controller.binding.userData.SiteAdmin === 1 && AppHeader.controller.binding.userData.HasLocalEvents === 1) {
                            that.binding.isEmpRolesCustomVisible = 0;
                        }*/
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                        }, { LanguageSpecID: AppData.getLanguageId()});
                }).then(function () {
                    if (recordId) {
                        that.events = null;
                        return AppData.call("PRC_MAWeitereVeranstaltungen", {
                            pMitarbeiterID: recordId
                        }, function (json) {
                            Log.print(Log.l.info, "call success! ");
                            if (json && json.d && json.d.results.length > 0) {
                                that.events = new WinJS.Binding.List(json.d.results);
                            }
                            if (addEventFormfieldcombo && addEventFormfieldcombo.winControl) {
                                addEventFormfieldcombo.winControl.data = that.events;
                                addEventFormfieldcombo.selectedIndex = -1;
                            }
                        }, function (error) {
                            Log.print(Log.l.error, "call error");
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select employeeView...");
                        return GenDataEmployee.employeeView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "employeeView: success!");
                            if (json && json.d) {
                                // now always edit!
                                that.setDataEmployee(json.d);
                                that.setRoleVisible();
                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, recordId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        Log.print(Log.l.trace, "Checking for licence!");
                        return that.checkingLicence(recordId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        var empRolesFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("empRoles"));
                        if (empRolesFragmentControl && empRolesFragmentControl.controller) {
                            return empRolesFragmentControl.controller.loadData(recordId);
                        } else {
                            var parentElement = pageElement.querySelector("#emproleshost");
                            if (parentElement) {
                                return Application.loadFragmentById(parentElement, "empRoles", { employeeId: recordId });
                            } else {
                                return WinJS.Promise.as();
                            }
                        }
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        var genFragEventsFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("genFragEvents"));
                        if (genFragEventsFragmentControl && genFragEventsFragmentControl.controller) {
                            return genFragEventsFragmentControl.controller.loadData(recordId);
                        } else {
                            var parentElement = pageElement.querySelector("#genfrageventshost");
                            if (parentElement) {
                                return Application.loadFragmentById(parentElement, "genFragEvents", { employeeId: recordId });
                            } else {
                                return WinJS.Promise.as();
                            }
                        }
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    AppBar.notifyModified = true;
                    if (recordId) {
                        Log.print(Log.l.trace, "Data loaded");
                        var master = Application.navigator.masterControl;
                        if (master && master.controller &&
                            typeof master.controller.scrollToRecordId === "function") {
                            //master.controller.scrollToRecordId(recordId);
                        }
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            // save data
            var saveData = function (complete, error) {
                var errorMessage;
                var err = null;
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = getRecordId();
                var dataEmployee = that.binding.dataEmployee;
                if (!dataEmployee || !AppBar.modified || !recordId) {
                    Log.ret(Log.l.trace, "not modified");
                    return new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete(dataEmployee);
                        }
                    });
                }
                if (AppBar.busy) {
                    Log.ret(Log.l.error, "busy - try again...");
                    return WinJS.Promise.timeout(100).then(function () {
                        return that.saveData(complete, error);
                    });
                }
                if (dataEmployee.Login && typeof dataEmployee.Password === "string" && dataEmployee.Password.length < 5) {
                    errorMessage = getResourceText("employee.alertPasswordShort");
                    Log.print(Log.l.error, errorMessage);
                    alert(errorMessage);
                    if (typeof error === "function") {
                        error(errorMessage);
                    }
                    return WinJS.Promise.wrapError(errorMessage);
                }
                if (dataEmployee.Login && (!dataEmployee.Password || !dataEmployee.Password2 ||
                    dataEmployee.Password2 !== dataEmployee.Password)) {
                    errorMessage = getResourceText("employee.alertPassword");
                    Log.print(Log.l.error, errorMessage);
                    alert(errorMessage);
                    if (typeof error === "function") {
                        error(errorMessage);
                    }
                    return WinJS.Promise.wrapError(errorMessage);
                }
                AppBar.busy = true;
                var ret = GenDataEmployee.employeeView.update(function (response) {
                    // called asynchronously if ok
                    Log.print(Log.l.info, "employeeData update: success!");
                }, function (errorResponse) {
                    AppBar.busy = false;
                    err = errorResponse;
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    AppData.getErrorMsgFromErrorStack(errorResponse).then(function () {
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (typeof error === "function") {
                            error(errorResponse);
                        }
                    });
                }, recordId, dataEmployee).then(function () {
                    if (err) {
                        return WinJS.Promise.as();
                    } else if (AppData.getRecordId("Mitarbeiter") === recordId) {
                        AppData._persistentStates.privacyPolicyFlag = false;
                        if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                            AppHeader.controller.binding.userData = {
                                VeranstaltungName: ""
                            };
                        }
                        alert(getResourceText("employee.alertNewLoginPassword"), function (response) {
                            // always call 
                            if (typeof complete === "function") {
                                complete(dataEmployee);
                            }
                            Application.navigateById("login");
                        });
                        return WinJS.Promise.as();
                    } else {
                        var empRolesFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("empRoles"));
                        if (empRolesFragmentControl && empRolesFragmentControl.controller) {
                            return empRolesFragmentControl.controller.saveData(function () {
                                Log.print(Log.l.trace, "saveData completed...");
                            }, function (errorResponse) {
                                AppBar.busy = false;
                                Log.print(Log.l.error, "saveData error...");
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    AppBar.busy = false;
                    if (err || AppData.getRecordId("Mitarbeiter") === recordId) {
                        // ignore that
                    } else {
                        var master = Application.navigator.masterControl;
                        if (master && master.controller &&
                            typeof master.controller.loadData === "function") {
                            master.controller.loadData(recordId).then(function () {
                                if (typeof complete === "function") {
                                    complete(dataEmployee);
                                }
                            });
                        } else {
                            if (typeof complete === "function") {
                                complete(dataEmployee);
                            }
                        }
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            var base64ToBlob = function (base64Data, contentType) {
                contentType = contentType || '';
                var sliceSize = 1024;
                var byteCharacters = atob(base64Data);
                var bytesLength = byteCharacters.length;
                var slicesCount = Math.ceil(bytesLength / sliceSize);
                var byteArrays = new Array(slicesCount);

                for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
                    var begin = sliceIndex * sliceSize;
                    var end = Math.min(begin + sliceSize, bytesLength);

                    var bytes = new Array(end - begin);
                    for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
                        bytes[i] = byteCharacters[offset].charCodeAt(0);
                    }
                    byteArrays[sliceIndex] = new Uint8Array(bytes);
                }
                return new Blob(byteArrays, { type: contentType });
            }
            this.base64ToBlob = base64ToBlob;

            var exportPwdQrCodeEmployeePdf = function () {
                Log.call(Log.l.trace, "SiteEvents.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var recordId = getRecordId();
                if (recordId) {
                    ret = AppData.call("PRC_GetQRPdf", {
                        pRecID: recordId,
                        pExportType: "QRPDFMA"
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        if (json && json.d && json.d.results.length > 0) {
                            var results = json.d.results[0];
                            var pdfDataraw = results.DocContentDOCCNT1;
                            var sub = pdfDataraw.search("\r\n\r\n");
                            var pdfDataBase64 = pdfDataraw.substr(sub + 4);
                            var pdfData = that.base64ToBlob(pdfDataBase64, "pdf");
                            var pdfName = results.szOriFileNameDOC1;
                            saveAs(pdfData, pdfName);
                            //AppBar.triggerDisableHandlers();
                        }
                        AppBar.busy = false;
                        AppBar.triggerDisableHandlers();
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                        AppBar.busy = false;
                        AppBar.triggerDisableHandlers();
                        AppData.setErrorMsg(that.binding, error);
                        if (typeof error === "function") {
                            error(error);
                        }
                    });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.exportPwdQrCodeEmployeePdf = exportPwdQrCodeEmployeePdf;

            that.saveRestriction();

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



