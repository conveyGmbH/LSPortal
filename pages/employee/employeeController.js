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
    WinJS.Namespace.define("Employee", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Employee.Controller.");
            Application.Controller.apply(this, [pageElement, {
                actualEventID: 0,
                dataEmployee: getEmptyDefaultValue(Employee.employeeView.defaultValue),
                restriction: getEmptyDefaultValue(Employee.employeeView.defaultRestriction),
                isEmpRolesVisible: AppHeader.controller.binding.userData.SiteAdmin, // || AppHeader.controller.binding.userData.HasLocalEvents,
                isVeranstaltungComboboxVisible: false,
                eventname: AppData._userData.VeranstaltungName,
                noLicence: null,
                userStatus: null,
                allowEditLogin: null,
                noLicenceText: getResourceText("info.nolicenceemployee")
            }, commandList]);

            var that = this;

            var loginName = pageElement.querySelector("#loginName");
            var domain = pageElement.querySelector("#domain");
            var loginFirstPart = pageElement.querySelector("#loginFirstPart");
            var veranstaltungCombobox = pageElement.querySelector("#VeranstaltungCombobox");

            var prevMasterLoadPromise = null;
            var prevLogin = null;
            var prevPassword;

            var setDataEmployee = function (newDataEmployee) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                prevLogin = newDataEmployee.Login;
                that.binding.dataEmployee = newDataEmployee;
                if (newDataEmployee.Login && newDataEmployee.Login.indexOf("@") > 0) {
                    var firstLoginPart = newDataEmployee.Login.substr(0, newDataEmployee.Login.indexOf("@"));
                    var secondLoginPart = newDataEmployee.Login.substr(newDataEmployee.Login.lastIndexOf("@"), newDataEmployee.Login.length - 1);
                    that.binding.dataEmployee.LogInNameBeforeAtSymbole = firstLoginPart;
                    that.binding.dataEmployee.LogInNameAfterAtSymbole = secondLoginPart;
                }
                prevPassword = newDataEmployee.Password;
                that.binding.dataEmployee.Password2 = newDataEmployee.Password;
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
            }
            this.setDataEmployee = setDataEmployee;

            var getLangSpecErrorMsg = function (resultmessageid, errorMsg) {
                Log.call(Log.l.trace, "Employee.Controller.");
                var lang = AppData.getLanguageId();
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_GetLangText", {
                    pTextID: resultmessageid,
                    pLanguageID: lang
                }, function (json) {
                    Log.print(Log.l.info, "call success! ");
                    errorMsg.data.error.message.value = json.d.results[0].ResultText;
                    AppData.setErrorMsg(that.binding, errorMsg);
                }, function (error) {
                    Log.print(Log.l.error, "call error");

                });
                Log.ret(Log.l.trace);
            }
            this.getLangSpecErrorMsg = getLangSpecErrorMsg;

            var getErrorMsgFromErrorStack = function (errorMsg) {
                Log.call(Log.l.trace, "Employee.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_GetErrorStack", {
                }, function (json) {
                    Log.print(Log.l.info, "call success! ");
                    AppBar.modified = false;
                    if (json.d.results[0].ResultMessageID > 0) {
                        errorMsg.data.error.code = json.d.results[0].ResultCode;
                        errorMsg.data.error.message.value = that.getLangSpecErrorMsg(json.d.results[0].ResultMessageID, errorMsg);
                        Log.print(Log.l.info, "call success! ");
                    } else {
                        errorMsg.data.error.message.value = json.d.results[0].ResultMessage;
                        errorMsg.data.error.code = json.d.results[0].ResultCode;
                        AppData.setErrorMsg(that.binding, errorMsg);
                        Log.print(Log.l.info, "call success! ");
                    }
                }, function (error) {
                    Log.print(Log.l.error, "call error");
                    AppBar.modified = false;

                });
                Log.ret(Log.l.trace);
            }
            this.getErrorMsgFromErrorStack = getErrorMsgFromErrorStack;

            var copyMitarbeiter = function () {
                Log.call(Log.l.trace, "Employee.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_CopyAppMitarbeiter", {
                    pMitarbeiterID: that.binding.dataEmployee.MitarbeiterVIEWID,
                    pNewVeranstaltungID: parseInt(that.binding.actualEventID)
                }, function (json) {
                    Log.print(Log.l.info, "call success! ");
                    AppBar.modified = false;
                    if (json.d.results[0]) {
                        if (json.d.results[0].ResultCode === 0) {
                            that.binding.isVeranstaltungComboboxVisible = false;
                        } else {
                            that.binding.userStatus = json.d.results[0].ResultMessage;
                        }
                    }
                }, function (error) {
                    Log.print(Log.l.error, "call error");
                    AppBar.modified = false;

                });
                Log.ret(Log.l.trace);
            }
            this.copyMitarbeiter = copyMitarbeiter;

            var saveRestriction = function () {
                if (that.binding.restriction.Names && that.binding.restriction.Names.length > 0) {
                    that.binding.restriction.Aktiv = ["X", "X", "X"];
                } else {
                    that.binding.restriction.Aktiv = ["X", "X", "X"];
                }
                that.binding.restriction.bAndInEachRow = true;
                that.binding.restriction.bUseOr = false;
                Log.print("restriction number:" + that.binding.restriction.countCombobox + ", restriction: " + that.binding.restriction);
                AppData.setRestriction("Employee", that.binding.restriction);
            }
            this.saveRestriction = saveRestriction;

            var getRecordId = function () {
                Log.call(Log.l.trace, "Employee.Controller.");
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
                Log.call(Log.l.trace, "Employee.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
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
                    error(err);
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.deleteData = deleteData;

            var checkingLicence = function (recordId) {
                Log.call(Log.l.trace, "Employee.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return Employee.licenceBView.select(function (json) {
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
                        that.binding.allowEditLogin = AppHeader.controller.binding.userData.SiteAdmin;
                        if (that.binding.allowEditLogin) {
                            if (loginFirstPart) {
                                loginFirstPart.disabled = false;
                            }
                            if (domain) {
                                domain.disabled = false;
                            }
                            if (loginName) {
                                loginName.disabled = false;
                            }
                        } else {
                            if (loginFirstPart) {
                                loginFirstPart.disabled = true;
                            }
                            if (domain) {
                                domain.disabled = true;
                            }
                            if (loginName) {
                                loginName.disabled = true;
                            }
                        }
                        AppBar.triggerDisableHandlers();
                        return WinJS.Promise.as();
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error selecting mailerzeilen");
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, recordId);
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.checkingLicence = checkingLicence;

            var checkingReadonlyFlag = function () {
                Log.call(Log.l.trace, "Employee.Controller.");
                if (AppHeader.controller.binding.userData.SiteAdmin) {
                    if (loginFirstPart) {
                        loginFirstPart.disabled = false;
                    }
                    if (domain) {
                        domain.disabled = false;
                    }
                    if (loginName) {
                        loginName.disabled = false;
                    }
                } else {
                    if (loginFirstPart) {
                        loginFirstPart.disabled = false;
                    }
                    if (domain) {
                        domain.disabled = true;
                    }
                    if (loginName) {
                        loginName.disabled = false;
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.checkingReadonlyFlag = checkingReadonlyFlag;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    that.saveData(function (response) {
                        AppBar.busy = true;
                        Log.print(Log.l.trace, "eployee saved");
                        //var newEmployee = getEmptyDefaultValue(Employee.employeeView.defaultValue);
                        var newEmployee = copyByValue(Employee.employeeView.defaultValue);
                        /* var restriction = {
                             OrderAttribute: ["Nachname"],
                             OrderDesc: false
                         };
                         AppData.setRestriction("Employee", restriction);*/
                        return Employee.employeeView.insert(function (json) {
                            AppBar.busy = false;
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.info, "employeeView insert: success!");
                            // employeeView returns object already parsed from json file in response
                            var employee = null;
                            that.binding.noLicence = null;
                            that.binding.allowEditLogin = null;
                            if (json && json.d) {
                                employee = json.d;
                                employee.Login = AppData.generalData.userName;
                                that.setDataEmployee(employee);
                                that.binding.dataEmployee.LogInNameBeforeAtSymbole = "";
                            }
                            var master = Application.navigator.masterControl;
                            if (master && master.controller && master.controller.binding && employee && employee.MitarbeiterVIEWID) {
                                AppData.setRecordId("MitarbeiterVIEW_20471", employee.MitarbeiterVIEWID);
                                master.controller.binding.employeeId = employee.MitarbeiterVIEWID;
                                master.controller.loadData(employee.MitarbeiterVIEWID);
                            }
                            //AppBar.modified = true;
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "error inserting employee");
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, newEmployee)/*.then(function () {
                            var master = Application.navigator.masterControl;
                            if (master && master.controller && master.controller.binding) {
                                master.controller.binding.employeeId = that.binding.dataEmployee.MitarbeiterVIEWID;
                                master.controller.loadData().then(function () {
                                    //master.controller.loadData(master.controller.binding.employeeId).then(function () {
                                    master.controller.selectRecordId(master.controller.binding.employeeId);
                                    //});
                                });
                            }
                        })*/;
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee");
                    });
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    var confirmTitle = getResourceText("employee.questionDelete");
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            Log.print(Log.l.trace, "clickDelete: user choice OK");
                            deleteData(function (response) {
                                /* Mitarbeiter Liste neu laden und Selektion auf neue Zeile setzen */
                                var master = Application.navigator.masterControl;
                                if (master && master.controller && master.controller.binding) {
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
                    Log.call(Log.l.trace, "Employee.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "employee saved");
                        /*var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding && typeof master.controller.selectRecordId !== "undefined") {
                            master.controller.binding.employeeId = that.binding.dataEmployee.MitarbeiterVIEWID;
                            master.controller.loadData(master.controller.binding.employeeId).then(function () {
                                Log.print(Log.l.info, "master.controller.loadData: success!");
                                master.controller.selectRecordId(that.binding.dataEmployee.MitarbeiterVIEWID);
                            });
                        }*/
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
                    Log.call(Log.l.trace, "Employee.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                changeLogin: function (event) {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        pageElement.querySelector("#password").value = "";
                        pageElement.querySelector("#password2").value = "";
                        that.binding.dataEmployee.Password = "";
                        that.binding.dataEmployee.Password2 = "";
                    }
                    if (event.currentTarget.id === "loginFirstPart") {
                        if (event.currentTarget.value && event.currentTarget.value.indexOf("@") > 0) {
                            that.binding.dataEmployee.LogInNameBeforeAtSymbole = event.currentTarget.value.substr(0, event.currentTarget.value.indexOf("@"));
                        } else {
                            that.binding.dataEmployee.LogInNameBeforeAtSymbole = event.currentTarget.value;
                        }
                        that.binding.dataEmployee.Login = that.binding.dataEmployee.LogInNameBeforeAtSymbole + that.binding.dataEmployee.LogInNameAfterAtSymbole;
                    }
                    if (event.currentTarget.id === "domain") {
                        that.binding.dataEmployee.Login = that.binding.dataEmployee.LogInNameBeforeAtSymbole + event.currentTarget.value;
                    }
                    Log.ret(Log.l.trace);
                },
                changePassword: function (event) {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        pageElement.querySelector("#password2").value = "";
                        that.binding.dataEmployee.Password2 = "";
                    }
                    Log.ret(Log.l.trace);
                },
                changeSearchField: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
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
                    if (master && master.controller && master.controller.binding) {
                        if (prevMasterLoadPromise &&
                            typeof prevMasterLoadPromise.cancel === "function") {
                            prevMasterLoadPromise.cancel();
                        }
                        //master.controller.binding.contactId = that.binding.dataContact.KontaktVIEWID;
                        prevMasterLoadPromise = master.controller.loadData().then(function () {
                            prevMasterLoadPromise = null;
                            if (master && master.controller && that.binding.employeeId) {
                                master.controller.selectRecordId(that.binding.employeeId);
                            }
                        });
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderFirstname: function (event) {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    that.binding.restriction.OrderAttribute = "Vorname";
                    //that.binding.restriction.OrderDesc = !that.binding.restriction.OrderDesc;
                    AppData.setRestriction("Employee", that.binding.restriction);

                    if (event.target.textContent === getResourceText("employee.firstNameDesc")) {
                        event.target.textContent = getResourceText("employee.firstNameAsc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = false;
                    } else {
                        event.target.textContent = getResourceText("employee.firstNameDesc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = true;
                    }

                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    master.controller.loadData();
                    Log.ret(Log.l.trace);
                },
                clickOrderLastname: function (event) {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    var master = Application.navigator.masterControl;
                    that.binding.restriction.OrderAttribute = "Nachname";
                    //that.binding.restriction.OrderDesc = !that.binding.restriction.OrderDesc;
                    AppData.setRestriction("Employee", that.binding.restriction);
                    if (event.target.textContent === getResourceText("employee.nameDesc")) {
                        event.target.textContent = getResourceText("employee.nameAsc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = false;
                    } else {
                        event.target.textContent = getResourceText("employee.nameDesc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = true;
                    }

                    that.saveRestriction();
                    master.controller.loadData();
                    Log.ret(Log.l.trace);
                },
                clickOrderLicence: function (event) {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    var master = Application.navigator.masterControl;
                    that.binding.restriction.OrderAttribute = "NichtLizenzierteApp";
                    //that.binding.restriction.OrderDesc = !that.binding.restriction.OrderDesc;
                    AppData.setRestriction("Employee", that.binding.restriction);
                    if (event.target.textContent === getResourceText("employee.licenceDesc")) {
                        event.target.textContent = getResourceText("employee.licenceAsc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = false;
                    } else {
                        event.target.textContent = getResourceText("employee.licenceDesc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = true;
                    }

                    that.saveRestriction();
                    master.controller.loadData();
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
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                },
                clickChangeLogin: function (event) {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    var confirmTitle = getResourceText("employee.changeUserLogin");
                    return confirm(confirmTitle, function (result) {
                        // called asynchronously if user-choice
                        if (result) {
                            if (loginFirstPart) {
                                loginFirstPart.disabled = false;
                            }
                            if (domain) {
                                domain.disabled = true;
                            }
                            if (loginName) {
                                loginName.disabled = false;
                            }
                            that.binding.allowEditLogin = 1;
                        }
                        Log.ret(Log.l.trace);
                    });
                }, clickCopyMitarbeiter: function () {
                    Log.call(Log.l.trace, "Employee.Controller.");
                    if (that.binding.isVeranstaltungComboboxVisible)
                        that.copyMitarbeiter();
                    that.binding.isVeranstaltungComboboxVisible = true;
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
                clickCopyMitarbeiter: function () {
                    return !AppHeader.controller.binding.userData.SiteAdmin && !that.binding.isVeranstaltungComboboxVisible;
                }
            };

            var loadData = function (recordId) {
                Log.call(Log.l.trace, "Employee.Controller.");
                AppData.setErrorMsg(that.binding);
                var id = AppData.getRecordId("MitarbeiterVIEW_20471");
                if (id) {
                    recordId = id;
                }
                var ret = new WinJS.Promise.as().then(function () {
                    if (AppBar.modified) {
                        Log.print(Log.l.trace, "saveData completed...");
                        var master = Application.navigator.masterControl;
                        if (master && master.controller) {
                            master.controller.loadData(recordId);
                        }
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select employeeView...");
                        return Employee.employeeView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "employeeView: success!");
                            if (json && json.d) {
                                // now always edit!
                                that.setDataEmployee(json.d);
                                if (that.binding.dataEmployee.Login) {
                                    Log.print(Log.l.trace, "Checking for licence!");
                                    AppBar.busy = false;
                                }
                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, recordId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        that.checkingLicence(recordId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
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
                }).then(function () {
                    that.eventList = new WinJS.Binding.List([Employee.VeranstaltungView.defaultValue]);
                    veranstaltungCombobox.winControl.data = new WinJS.Binding.List();
                    Log.print(Log.l.trace, "calling select eventView...");
                    return Employee.VeranstaltungView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "Events: success!");
                        // employeeView returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 1) {
                            that.nextUrl = Employee.VeranstaltungView.getNextUrl(json);
                            var results = json.d.results.filter(function (item, index) {
                                return (item && item.VeranstaltungVIEWID !== AppData.getRecordId("Veranstaltung")); /*&& item.INITAktenstatusID !== 2 && item.INITGwGStatusID !== 21*/
                            });
                            that.binding.isVeranstaltungComboboxVisible = that.binding.isVeranstaltungComboboxVisible  && (results && results.length > 1 ? true : false);
                            results.forEach(function (item, index) {
                                that.eventList.push(item);
                            });
                            Log.print(Log.l.trace, "Data loaded");
                            if (veranstaltungCombobox && veranstaltungCombobox.winControl) {
                                veranstaltungCombobox.winControl.data = that.eventList;
                            }
                            veranstaltungCombobox.selectedIndex = 0;
                        }
                        return WinJS.Promise.as();
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        that.loading = false;
                    }, {

                        });
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
                var dataEmployee = that.binding.dataEmployee;
                if (dataEmployee && AppBar.modified && !AppBar.busy) {
                    if (typeof dataEmployee.Password === "string" && dataEmployee.Password.length < 5) {
                        Log.print(Log.l.error, "password must be min length 5");
                        alert(getResourceText("employee.alertPasswordShort"));
                        return WinJS.Promise.as();
                    }
                    if (dataEmployee.Password2 && dataEmployee.Password && dataEmployee.Password2 === dataEmployee.Password) {
                        var recordId = getRecordId();
                        if (recordId) {
                            AppBar.busy = true;
                            ret = Employee.employeeView.update(function (response) {
                                AppBar.busy = false;
                                // called asynchronously if ok
                                Log.print(Log.l.info, "employeeData update: success!");
                                var recordid = AppData.getRecordId("Mitarbeiter");
                                if (recordid === dataEmployee.MitarbeiterVIEWID) {
                                    AppData._persistentStates.privacyPolicyFlag = false;
                                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                                        AppHeader.controller.binding.userData = {};
                                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                                        }
                                    }
                                    alert(getResourceText("employee.alertNewLoginPassword"), function (response) {
                                        // always call 
                                        Application.navigateById("login");
                                        complete(response);
                                    });
                                }
                                var empRolesFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("empRoles"));
                                if (empRolesFragmentControl && empRolesFragmentControl.controller) {
                                    empRolesFragmentControl.controller.saveData(function () {
                                        Log.print(Log.l.trace, "saveData completed...");
                                        if (AppData.getRecordId("Mitarbeiter") === recordId) {
                                            AppData.getUserData();
                                        }
                                        loadData(recordId).then(function () {
                                            AppBar.modified = false;
                                            that.copyMitarbeiter();
                                            complete(response);
                                        });
                                    }, function (errorResponse) {
                                        Log.print(Log.l.error, "saveData error...");
                                        AppData.setErrorMsg(that.binding, errorResponse);
                                    });
                                } else {
                                    loadData(recordId).then(function () {
                                        complete(response);
                                    });
                                }
                            }, function (errorResponse) {
                                AppBar.busy = false;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.getErrorMsgFromErrorStack(errorResponse);
                                //AppData.setErrorMsg(that.binding, errorResponse);
                                //error(errorResponse);
                                ;
                            }, recordId, dataEmployee)/*.then(function () {
                                var recordid = AppData.getRecordId("Mitarbeiter");
                                if (recordid === dataEmployee.MitarbeiterVIEWID)
                                    if (AppData._persistentStates.odata.login !== that.binding.dataEmployee.Login || AppData._persistentStates.odata.password !== that.binding.dataEmployee.Password) {
                                        AppData._persistentStates.privacyPolicyFlag = false;
                                        if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                                            AppHeader.controller.binding.userData = {};
                                            if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                                                AppHeader.controller.binding.userData.VeranstaltungName = "";
                                            }
                                        }
                                    }
                            })*/;
                        } else {
                            Log.print(Log.l.info, "not supported");
                            ret = WinJS.Promise.as();
                        }
                    } else {
                        Log.print(Log.l.error, "incorrect password confirmation");
                        alert(getResourceText("employee.alertPassword"));
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



