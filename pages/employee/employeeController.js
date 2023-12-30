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
                isEmpRolesVisible: AppHeader.controller.binding.userData.SiteAdmin,
                eventname: AppData._userData.VeranstaltungName,
                noLicence: null,
                userStatus: null,
                allowEditLogin: null,
                noLicenceText: getResourceText("info.nolicenceemployee"),
                disableLoginName: false,
                disableLoginFirstPart: false,
                disableDomain: false
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
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                Log.ret(Log.l.trace);
            }
            this.setDataEmployee = setDataEmployee;

            var getLangSpecErrorMsg = function (resultmessageid, errorMsg) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var lang = AppData.getLanguageId();
                AppData.setErrorMsg(that.binding);
                Log.print(Log.l.trace, "calling PRC_GetLangText...");
                AppData.call("PRC_GetLangText", {
                    pTextID: resultmessageid,
                    pLanguageID: lang
                }, function (json) {
                    Log.print(Log.l.info, "call PRC_GetLangText: success! ");
                    errorMsg.data.error.message.value = json.d.results[0].ResultText;
                    AppData.setErrorMsg(that.binding, errorMsg);
                }, function (error) {
                    Log.print(Log.l.error, "call PRC_GetLangText: error");
                });
                Log.ret(Log.l.trace);
            }
            this.getLangSpecErrorMsg = getLangSpecErrorMsg;

            var getErrorMsgFromErrorStack = function (errorMsg) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                Log.print(Log.l.trace, "calling PRC_GetErrorStack...");
                AppData.call("PRC_GetErrorStack", {
                }, function (json) {
                    Log.print(Log.l.info, "call PRC_GetErrorStack: success! ");
                    AppBar.modified = false;
                    if (json && json.d && json.d.results && json.d.results.length > 0) {
                        Log.print(Log.l.info, "ResultCode=" + json.d.results[0].ResultCode);
                        errorMsg.data.error.code = json.d.results[0].ResultCode;
                        if (json.d.results[0].ResultMessageID > 0) {
                            Log.print(Log.l.info, "ResultMessageID=" + json.d.results[0].ResultMessageID);
                            errorMsg.data.error.message.value =
                                that.getLangSpecErrorMsg(json.d.results[0].ResultMessageID, errorMsg);
                        } else {
                            Log.print(Log.l.info, "ResultMessage=" + json.d.results[0].ResultMessage);
                            errorMsg.data.error.message.value = json.d.results[0].ResultMessage;
                        }
                        AppData.setErrorMsg(that.binding, errorMsg);
                    } else {
                        Log.print(Log.l.info, "PRC_GetErrorStack returned no data!");
                    }
                }, function (error) {
                    Log.print(Log.l.error, "call PRC_GetErrorStack: error");
                    AppBar.modified = false;
                });
                Log.ret(Log.l.trace);
            }
            this.getErrorMsgFromErrorStack = getErrorMsgFromErrorStack;

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

            var checkingLicence = function (recordId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = Employee.licenceBView.select(function (json) {
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
                }, function (errorResponse) {
                    Log.print(Log.l.error, "error selecting mailerzeilen");
                    AppData.setErrorMsg(that.binding, errorResponse);
                }, recordId);
                Log.ret(Log.l.trace);
                return ret;
            }
            this.checkingLicence = checkingLicence;

            var checkingReadonlyFlag = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                clickExport: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                    var master = Application.navigator.masterControl;
                    if (master && master.controller) {
                        master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderFirstname: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.binding.restriction.OrderAttribute = "Vorname";
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
                    that.binding.restriction.OrderAttribute = "Nachname";
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
                            that.binding.disableLoginFirstPart = false;
                            that.binding.disableDomain = true;
                            that.binding.disableLoginName = false;
                            that.binding.allowEditLogin = 1;
                        }
                        Log.ret(Log.l.trace);
                    });
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
                }
            };

            var loadData = function (recordId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                AppData.setErrorMsg(that.binding);
                if (!recordId) {
                    recordId = getRecordId();
                }
                var ret = new WinJS.Promise.as().then(function () {
                    if (recordId) {
                        //load of format relation record data
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
                    AppBar.notifyModified = true;
                    if (recordId) {
                        Log.print(Log.l.trace, "Data loaded");
                        that.resizeGenFragEvents();
                        var master = Application.navigator.masterControl;
                        if (master && master.controller) {
                            master.controller.scrollToRecordId(recordId);
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
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = getRecordId();
                var dataEmployee = that.binding.dataEmployee;
                if (!dataEmployee || !AppBar.modified || !recordId) {
                    Log.ret(Log.l.error, "not modified");
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
                if (dataEmployee.Login &&
                    (!dataEmployee.Password || !dataEmployee.Password2 ||
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
                Log.print(Log.l.trace, "calling update employeeView...");
                var ret = Employee.employeeView.update(function (response) {
                    // called asynchronously if ok
                    Log.print(Log.l.info, "update employeeData: success!");
                }, function (errorResponse) {
                    AppBar.busy = false;
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    Log.print(Log.l.error, "update employeeData: error!");
                    AppData.getErrorMsgFromErrorStack(errorResponse);
                    //AppData.setErrorMsg(that.binding, errorResponse);
                    if (typeof error === "function") {
                        error(errorResponse);
                    }
                }, recordId, dataEmployee).then(function () {
                    if (AppData.getRecordId("Mitarbeiter") === recordId) {
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
                            Log.print(Log.l.trace, "calling empRolesFragmentControl.controller.saveData...");
                            return empRolesFragmentControl.controller.saveData(function () {
                                Log.print(Log.l.trace, "empRolesFragmentControl.controller.saveData completed!");
                            }, function (errorResponse) {
                                AppBar.busy = false;
                                Log.print(Log.l.error, "empRolesFragmentControl.controller.saveData error!");
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                }).then(function () {
                    AppBar.modified = false;
                    AppBar.busy = false;
                    if (AppData.getRecordId("Mitarbeiter") === recordId) {
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
