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
                isEmpRolesVisible: AppHeader.controller.binding.userData.SiteAdmin, // || AppHeader.controller.binding.userData.HasLocalEvents,
                noLicence: null,
                allowEditLogin: null,
                noLicenceText: getResourceText("info.nolicenceemployee"),
                addEventFormFlag: "",
                eventId: null
            }, commandList]);

            var that = this;
            
            var prevMasterLoadPromise = null;
            var prevLogin = null;
            var prevPassword;
            var progress = null;
            var counter = null;
            var layout = null;
            this.events = null;

            var addEventFormfieldcombo = pageElement.querySelector("#addEventFormEventData");

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            this.dispose = function () {
                if (that.events) {
                    that.events = null;
                }
            }

            var resultConverter = function (item, index) {
                if (item.Login && item.Login.indexOf("@") > 0) {
                    var firstLoginPart = item.Login.substr(0, item.Login.indexOf("@"));
                    var secondLoginPart = item.Login.substr(item.Login.lastIndexOf("@"), item.Login.length - 1);
                    item.LogInNameBeforeAtSymbole = firstLoginPart;
                    item.LogInNameAfterAtSymbole = secondLoginPart;
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
           
            var getLangSpecErrorMsg = function (resultmessageid, errorMsg) {
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
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
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
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
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
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
                    // neues Flag UserIsActive -> wenn user bereits eingelogt ist dann sollte das Feld Login und Passwort static sein 
                    // wenn user den Ändern will dann klicke explizit auf das icon für Ändern user und bestätige die Alertbox 
                    // -> result.HatKontakte ist dirty Trick um festzustellen ob normale Admin oder nicht
                    that.binding.allowEditLogin = AppHeader.controller.binding.userData.SiteAdmin || !result.HatKontakte || !result.UserIsActive;
                    if (that.binding.allowEditLogin) {
                       
                    } else {
                        
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
                    if (loginFirstPart) {
                        loginFirstPart.disabled = false;
                    }
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
                clickAddEventData: function(event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    var newEmployeeId = null;
                    return AppData.call("PRC_CopyAppMitarbeiter", {
                        pMitarbeiterID: getRecordId(),
                        pNewVeranstaltungID: parseInt(that.binding.eventId)
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        if (json && json.d && json.d.results.length > 0) {
                            newEmployeeId = json.d.results[0] ? json.d.results[0].NewMitarbeiterID : null;
                            that.binding.addEventFormFlag = "";
                        } else {
                       
                        }
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    }).then(function () {
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding && newEmployeeId) {
                            master.controller.binding.employeeId = newEmployeeId;
                            return master.controller.loadData();
                        } else {
                            return WinJS.Promise.as();
                        }
                    }).then(function () {
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding && newEmployeeId) {
                            master.controller.binding.employeeId = newEmployeeId;
                            return master.controller.selectRecordId(master.controller.binding.employeeId);
                        } else {
                            return WinJS.Promise.as();
                        }
                    });
                },
                clickAddEvent: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    if (that.binding.addEventFormFlag === "") {
                        that.binding.addEventFormFlag = 1;
                    } else {
                        that.binding.addEventFormFlag = "";
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    that.saveData(function (response) {
                        AppBar.busy = true;
                        Log.print(Log.l.trace, "eployee saved");
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee");
                    }).then(function () {
                        //var newEmployee = getEmptyDefaultValue(GenDataEmployee.employeeView.defaultValue);
                        var newEmployee = copyByValue(GenDataEmployee.employeeView.defaultValue);
                        /* var restriction = {
                             OrderAttribute: ["Nachname"],
                             OrderDesc: false
                         };
                         AppData.setRestriction("Employee", restriction);*/
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
                                employee.Login = AppData.generalData.userName;
                                that.setDataEmployee(employee);
                                that.binding.dataEmployee.LogInNameBeforeAtSymbole = "";
                            }
                            //AppBar.modified = true;
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "error inserting employee");
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, newEmployee);
                    }).then(function () {
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding) {
                            master.controller.binding.employeeId = that.binding.dataEmployee.MitarbeiterVIEWID;
                            return master.controller.loadData();
                        } else {
                            return WinJS.Promise.as();
                        }
                    }).then(function() {
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding) {
                            master.controller.binding.employeeId = that.binding.dataEmployee.MitarbeiterVIEWID;
                            return master.controller.selectRecordId(master.controller.binding.employeeId);
                        } else {
                            return WinJS.Promise.as();
                        }
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
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
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
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
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
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
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
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
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
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
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
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    var confirmTitle = getResourceText("employee.changeUserLogin");
                    return confirm(confirmTitle, function (result) {
                        // called asynchronously if user-choice
                        if (result) {
                            
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
                            circleElement.style.backgroundColor = Colors.accentColor;
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
                clickAddEvent: function () {
                    return !that.events || !that.events.length;
                }
            };

            var resizeGenFragEvents = function () {
                var genFragEventsFragmentControl = null;
                var ret = WinJS.Promise.timeout(0).then(function () {
                    var genFragEventsHost = pageElement.querySelector("#genfrageventshost");
                    genFragEventsFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("genFragEvents"));
                    if (genFragEventsHost && genFragEventsHost.style &&
                        genFragEventsFragmentControl && genFragEventsFragmentControl._element) {
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
                    return WinJS.Promise.timeout(0);
                }).then(function () {
                    if (genFragEventsFragmentControl &&
                        typeof genFragEventsFragmentControl.updateLayout === "function") {
                        genFragEventsFragmentControl.updateLayout.call(genFragEventsFragmentControl, genFragEventsFragmentControl._element);
                    }
                });
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
                    if (recordId && AppBar.modified) {
                        Log.print(Log.l.trace, "is modified...");
                        var master = Application.navigator.masterControl;
                        if (master && master.controller) {
                            return master.controller.loadData(recordId);
                        } else {
                            return WinJS.Promise.as();
                        }
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        that.events = null;
                        return AppData.call("PRC_MAWeitereVeranstaltungen", {
                            pMitarbeiterID : recordId
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
                    Log.print(Log.l.trace, "Data loaded");
                    AppBar.notifyModified = true;
                    that.resizeGenFragEvents();
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            // save data
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var dataEmployee = that.binding.dataEmployee;
                if (dataEmployee && AppBar.modified && !AppBar.busy) {
                    if (dataEmployee.Login && typeof dataEmployee.Password === "string" && dataEmployee.Password.length < 5) {
                        Log.print(Log.l.error, "password must be min length 5");
                        alert(getResourceText("employee.alertPasswordShort"));
                        return WinJS.Promise.as();
                    }
                    if (!dataEmployee.Login || dataEmployee.Password2 && dataEmployee.Password && dataEmployee.Password2 === dataEmployee.Password) {
                        var recordId = getRecordId();
                        if (recordId) {
                            AppBar.busy = true;
                            ret = GenDataEmployee.employeeView.update(function (response) {
                                AppBar.busy = false;
                                // called asynchronously if ok
                                Log.print(Log.l.info, "employeeData update: success!");
                                if (AppData.getRecordId("Mitarbeiter") === dataEmployee.MitarbeiterVIEWID) {
                                    AppData._persistentStates.privacyPolicyFlag = false;
                                    if (AppHeader && AppHeader.controller && AppHeader.controller.binding.userData) {
                                        AppHeader.controller.binding.userData = {};
                                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                                        }
                                    }
                                    alert(getResourceText("employee.alertNewLoginPassword"), function(response) {
                                        // always call 
                                        Application.navigateById("login");
                                        complete(response);
                                    });
                                } else {
                                    var empRolesFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("empRoles"));
                                    if (empRolesFragmentControl && empRolesFragmentControl.controller) {
                                        empRolesFragmentControl.controller.saveData(function () {
                                            Log.print(Log.l.trace, "saveData completed...");
                                            if (AppData.getRecordId("Mitarbeiter") === recordId) {
                                                AppData.getUserData();
                                            }
                                            var master = Application.navigator.masterControl;
                                            if (master && master.controller && master.controller.binding) {
                                                master.controller.binding.employeeId =
                                                    that.binding.dataEmployee.MitarbeiterVIEWID;
                                                master.controller.loadData().then(function () {
                                                    //master.controller.loadData(master.controller.binding.employeeId).then(function () {
                                                    AppBar.modified = false;
                                                    complete(response);
                                                    master.controller.selectRecordId(master.controller.binding.employeeId);
                                                    //});
                                                });
                                            } else {
                                                AppBar.modified = false;
                                                complete(response);
                                            }
                                        }, function (errorResponse) {
                                            Log.print(Log.l.error, "saveData error...");
                                            AppData.setErrorMsg(that.binding, errorResponse);
                                        });
                                    } else {
                                        var master = Application.navigator.masterControl;
                                        if (master && master.controller && master.controller.binding) {
                                            master.controller.binding.employeeId = that.binding.dataEmployee.MitarbeiterVIEWID;
                                            master.controller.loadData().then(function () {
                                                //master.controller.loadData(master.controller.binding.employeeId).then(function () {
                                                AppBar.modified = false;
                                                complete(response);
                                                master.controller.selectRecordId(master.controller.binding.employeeId);
                                                //});
                                            });
                                        } else {
                                            AppBar.modified = false;
                                            complete(response);
                                        }
                                    }
                                }
                            }, function (errorResponse) {
                                AppBar.busy = false;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.getErrorMsgFromErrorStack(errorResponse);
                                //AppData.setErrorMsg(that.binding, errorResponse);
                                //error(errorResponse);
                                ;
                            }, recordId, dataEmployee);
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



