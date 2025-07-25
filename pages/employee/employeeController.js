// controller for page: info
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
    var namespaceName = "Employee";
    WinJS.Namespace.define("Employee", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Application.Controller.apply(this, [pageElement, {
                actualEventID: 0,
                dataEmployee: getEmptyDefaultValue(Employee.employeeView.defaultValue),
                restriction: copyByValue(Employee.employeeView.defaultRestriction),
                eventname: AppData._userData.VeranstaltungName,
                noLicence: null,
                userStatus: null,
                userLocked: null,
                allowEditLogin: null,
                noLicenceText: getResourceText("info.nolicenceemployee"),
                disableLoginName: false,
                disableLoginFirstPart: false,
                disableDomain: false,
                disablePassword: false
            }, commandList]);

            var that = this;

            var prevMasterLoadPromise = null;
            var prevLogin = null;
            var prevPassword;

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
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                prevLogin = newDataEmployee.Login;
                prevPassword = newDataEmployee.Password;
                that.resultConverter(newDataEmployee);
                that.binding.dataEmployee = newDataEmployee;
                that.checkingLicence(newDataEmployee);
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                Log.ret(Log.l.trace);
            }
            this.setDataEmployee = setDataEmployee;

            var saveRestriction = function () {
                AppData.setRestriction("Employee", that.binding.restriction);
            }
            this.saveRestriction = saveRestriction;

            var getRecordId = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var recordId = that.binding.dataEmployee && that.binding.dataEmployee.MitarbeiterVIEWID;
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

            var getHasTwoFactor = function () {
                var hasTwoFactor = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var master = Application.navigator.masterControl;
                if (master && master.controller && master.controller.binding) {
                    hasTwoFactor = master.controller.binding.hasTwoFactor;
                }
                Log.ret(Log.l.trace, hasTwoFactor);
                return hasTwoFactor;
            }
            this.getHasTwoFactor = getHasTwoFactor;

            var getLocked = function () {
                var locked = null;
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var master = Application.navigator.masterControl;
                if (master && master.controller && master.controller.binding) {
                    locked = master.controller.binding.locked;
                }
                Log.ret(Log.l.trace, locked);
                return locked;
            }
            this.getLocked = getLocked;

            var deleteData = function (complete, error) {
                var ret;
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = getRecordId();
                if (recordId) {
                    AppBar.busy = true;
                    ret = Employee.employeeView.deleteRecord(function (response) {
                        AppBar.busy = false;
                        // called asynchronously if ok
                        that.setDataEmployee(getEmptyDefaultValue(Employee.employeeView.defaultValue));
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
                    if (typeof error === "function") {
                        error(err);
                    }
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.deleteData = deleteData;

            var checkingLicence = function (result) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                if (result && result.Gesperrt) {
                    that.binding.userLocked = result.Gesperrt;
                } else {
                    that.binding.userLocked = null;
                }
                if (result && result.IconID) {
                    that.binding.iconID = result.IconID;
                }
                // neues Flag UserIsActive -> wenn user bereits eingelogt ist dann sollte das Feld Login und Passwort static sein 
                // wenn user den Ändern will dann klicke explizit auf das icon für Ändern user und bestätige die Alertbox 
                // -> result.HatKontakte ist dirty Trick um festzustellen ob normale Admin oder nicht
                that.binding.allowEditLogin = !getHasTwoFactor() &&
                    (AppHeader.controller.binding.userData.SiteAdmin ||
                        AppHeader.controller.binding.userData.IsCustomerAdmin);
                if (that.binding.allowEditLogin) {
                    that.binding.disableLoginFirstPart = false;
                    that.binding.disableDomain = false;
                    that.binding.disableLoginName = false;
                    that.binding.disablePassword = getHasTwoFactor();
                } else {
                    that.binding.disableLoginFirstPart = true;
                    that.binding.disableDomain = true;
                    that.binding.disableLoginName = true;
                    that.binding.disablePassword = true;
                }
                AppBar.triggerDisableHandlers();
                Log.ret(Log.l.trace);
            }
            this.checkingLicence = checkingLicence;

            var checkingReadonlyFlag = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                if (AppHeader.controller.binding.userData.SiteAdmin ||
                    AppHeader.controller.binding.userData.IsCustomerAdmin) {
                    that.binding.disableLoginFirstPart = false;
                    that.binding.disableDomain = false;
                    that.binding.disableLoginName = false;
                    that.binding.disablePassword = getHasTwoFactor();
                } else {
                    that.binding.disableLoginFirstPart = false;
                    that.binding.disableDomain = true;
                    that.binding.disableLoginName = true;
                    that.binding.disablePassword = true;
                }
                Log.ret(Log.l.trace);
            }
            this.checkingReadonlyFlag = checkingReadonlyFlag;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var newEmployeeId = null;
                    that.saveData(function (response) {
                        AppBar.busy = true;
                        Log.print(Log.l.trace, "employee saved");
                        var newEmployee = copyByValue(Employee.employeeView.defaultValue);
                        Log.print(Log.l.info, "calling insert employeeView...");
                        return Employee.employeeView.insert(function (json) {
                            AppBar.busy = false;
                            // this callback will be called asynchronously when the response is available
                            Log.print(Log.l.info, "insert employeeView: success!");
                            // employeeView returns object already parsed from json file in response
                            var employee = null;
                            that.binding.noLicence = null;
                            that.binding.allowEditLogin = null;
                            if (json && json.d) {
                                employee = json.d;
                                that.setDataEmployee(employee);
                                if (!AppHeader.controller.binding.userData.SiteAdmin) {
                                    var userName = AppData.generalData.userName;
                                    if (userName && userName.indexOf("@") > 0) {
                                        item.LogInNameAfterAtSymbol = userName.substr(item.Login.lastIndexOf("@"));
                                    }
                                    that.binding.dataEmployee.LogInNameBeforeAtSymbol = "";
                                }
                                newEmployeeId = that.binding.dataEmployee.MitarbeiterVIEWID;
                            }
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "insert employeeView: error!");
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, newEmployee).then(function () {
                            var master = Application.navigator.masterControl;
                            if (master && master.controller && master.controller.binding) {
                                master.controller.binding.employeeId = newEmployeeId;
                                return master.controller.loadData();
                            } else {
                                return WinJS.Promise.as();
                            }
                        });
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee");
                    });
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var confirmTitle = getResourceText("employee.questionDelete");
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            Log.print(Log.l.trace, "clickDelete: user choice OK");
                            deleteData(function (response) {
                                var master = Application.navigator.masterControl;
                                if (master && master.controller && master.controller.binding) {
                                    master.controller.loadData();
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
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "employee saved");
                        that.loadData();
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee");
                    });
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
                changeLogin: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        that.binding.dataEmployee.Password = "";
                        that.binding.dataEmployee.Password2 = "";
                        that.binding.dataEmployee.Login = that.binding.dataEmployee.LogInNameBeforeAtSymbol + event.currentTarget.value;
                    }
                    Log.ret(Log.l.trace);
                },
                changePassword: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (AppBar.notifyModified) {
                        that.binding.dataEmployee.Password2 = "";
                    }
                    Log.ret(Log.l.trace);
                },
                changeSearchField: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.binding.restriction.Vorname = [];
                    that.binding.restriction.Nachname = [];
                    that.binding.restriction.Login = [];
                    if (event.target.value) {
                        that.binding.restriction.Names = event.target.value;
                        that.binding.restriction.Vorname = [event.target.value, null, null];
                        that.binding.restriction.Login = [null, event.target.value, null];
                        that.binding.restriction.Nachname = [null, null, event.target.value];
                        that.binding.restriction.bUseOr = false;
                        that.binding.restriction.bAndInEachRow = true;
                    } else {
                        that.binding.restriction.Names = event.target.value;
                        that.binding.restriction.Login = event.target.value;
                        that.binding.restriction.Vorname = event.target.value;
                        that.binding.restriction.Nachname = event.target.value;
                        delete that.binding.restriction.bUseOr;
                    }
                    that.saveRestriction();
                    /*explizit AppBar.modified auf false setzen -> twoway binding */
                    AppBar.modified = false;
                    var master = Application.navigator.masterControl;
                    if (master && master.controller) {
                        master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderFirstname: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.binding.restriction.OrderAttribute = "SortVorname";
                    if (event.target.textContent === getResourceText("employee.firstNameAsc")) {
                        that.binding.restriction.OrderDesc = true;
                    } else {
                        that.binding.restriction.OrderDesc = false;
                    }
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller) {
                        master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderLastname: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.binding.restriction.OrderAttribute = "SortNachname";
                    if (event.target.textContent === getResourceText("employee.nameAsc")) {
                        that.binding.restriction.OrderDesc = true;
                    } else {
                        that.binding.restriction.OrderDesc = false;
                    }
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller) {
                        master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderLicence: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.binding.restriction.OrderAttribute = "NichtLizenzierteApp";
                    if (event.target.textContent === getResourceText("employee.licenceAsc")) {
                        that.binding.restriction.OrderDesc = true;
                    } else {
                        that.binding.restriction.OrderDesc = false;
                    }
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller) {
                        master.controller.loadData();
                    }
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
                        AppHeader.controller.binding.userData = {
                            VeranstaltungName: ""
                        };
                    }
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                },
                clickChangeLogin: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var confirmTitle = getResourceText("employee.changeUserLogin");
                    return confirm(confirmTitle, function (result) {
                        // called asynchronously if user-choice
                        if (result) {
                            if (that.binding.iconID === 5) {
                                that.binding.disableLoginName = true;
                                that.binding.disableLoginFirstPart = true;
                                that.binding.disablePassword = true;
                            } else {
                                that.binding.disableLoginName = false;
                                that.binding.disableLoginFirstPart = false;
                                that.binding.disablePassword = getHasTwoFactor();
                            }
                            that.binding.disableDomain = true;
                            that.binding.allowEditLogin = 1;
                        }
                        Log.ret(Log.l.trace);
                    });
                },
                clickExportQrcode: function(event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    AppBar.busy = true;
                    //AppBar.triggerDisableHandlers();
                    WinJS.Promise.timeout(0).then(function() {
                        return that.exportPwdQrCodeEmployeePdf();
                    });
                    Log.ret(Log.l.trace);
                },
                clickDelete2fa: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var confirmTitle = getResourceText("employee.questionDelete2fa");
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            Log.print(Log.l.trace, "clickDelete2fa: user choice OK");
                            AppData.call("PRC_DeleteTwoFactorUser", {
                                pUserLogin: that.binding.dataEmployee.Login
                            }, function (result) {
                                Log.print(Log.l.info, "call PRC_DeleteTwoFactorUser: success! ");
                                that.loadData();
                                var master = Application.navigator.masterControl;
                                if (master && master.controller &&
                                    typeof master.controller.loadData === "function") {
                                    master.controller.loadData(getRecordId());
                                }
                            }, function (errorResponse) {
                                Log.print(Log.l.error, "call PRC_DeleteTwoFactorUser: error");
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                        } else {
                            Log.print(Log.l.trace, "clickDelete2fa: user choice CANCEL");
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                clickUnlock: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    AppData.call("PRC_UnlockUser", {
                        pUserName: that.binding.dataEmployee.Login
                    }, function (result) {
                        Log.print(Log.l.info, "call PRC_UnlockUser: success! ");
                        that.loadData();
                        var master = Application.navigator.masterControl;
                        if (master && master.controller &&
                            typeof master.controller.loadData === "function") {
                            master.controller.loadData(getRecordId());
                        }
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "call PRC_UnlockUser: error");
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                    Log.ret(Log.l.trace);
                },
                clickFilterLicence: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    that.binding.restriction.OrderAttribute = "NichtLizenzierteApp";
                    var master = Application.navigator.masterControl;
                    if (master &&
                        master.controller &&
                        typeof master.controller.getOrderLicenceBtn === "function" &&
                        typeof master.controller.highlightorderLicenceBtn === "function") {
                        var orderLicenceButton = master.controller.getOrderLicenceBtn();
                        if (orderLicenceButton && orderLicenceButton.style && orderLicenceButton.style.borderColor === Colors.offColor) {
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
                    }
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
                        if (AppHeader.controller.binding.userData.HasLocalEvents) {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                },
                clickDelete: function () {
                    if (that.binding.dataEmployee && that.binding.dataEmployee.HatKontakte) {
                        return true;
                    }
                    if (!AppHeader.controller.binding.userData.HasLocalEvents) {
                        return true;
                    }
                    if (that.binding.dataEmployee && that.binding.dataEmployee.MitarbeiterVIEWID && !AppBar.busy &&
                        that.binding.dataEmployee.MitarbeiterVIEWID !== AppData.getRecordId("Mitarbeiter")) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickOk: function () {
                    return AppBar.busy;
                },
                clickChangeLogin: function () {
                    // svc bei nicht siteadmin nicht erlauben
                    return that.binding.allowEditLogin || that.binding.iconID === 5;
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
                },
                clickDelete2fa: function () {
                    return !getHasTwoFactor() || 
                        that.binding.dataEmployee && that.binding.dataEmployee.MitarbeiterVIEWID === AppData.getRecordId("Mitarbeiter") ||
                        AppBar.busy;
                },
                clickUnlock: function () {
                    return !getLocked() ||
                        AppBar.busy;
                }
            };

            var loadData = function (recordId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                AppData.setErrorMsg(that.binding);
                if (!recordId) {
                    recordId = getRecordId();
                }
                if (!recordId) {
                    that.setDataEmployee(getEmptyDefaultValue(Employee.employeeView.defaultValue));
                    Log.ret(Log.l.trace, "no record selected");
                    return WinJS.Promise.as();
                }
                var ret = new WinJS.Promise.as().then(function () {
                    Log.print(Log.l.trace, "calling select employeeView...");
                    return Employee.employeeView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "employeeView: success!");
                        if (json && json.d) {
                            // now always edit!
                            that.setDataEmployee(json.d);
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, recordId);
                }).then(function () {
                    AppBar.notifyModified = true;
                    Log.print(Log.l.trace, "Data loaded");
                    var master = Application.navigator.masterControl;
                    if (master && master.controller &&
                        typeof master.controller.scrollToRecordId === "function") {
                        master.controller.scrollToRecordId(recordId);
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
                Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                var ret = Employee.employeeView.update(function (response) {
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
                        if (master && master.controller && master.controller.binding) {
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

            that.saveRestriction();

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
                Log.call(Log.l.trace, namespaceName + ".Controller.");
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

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();
