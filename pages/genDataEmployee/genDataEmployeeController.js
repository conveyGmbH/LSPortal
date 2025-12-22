// controller for page: info
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
            var restriction = AppData.getRestriction("Employee");
            Application.Controller.apply(this, [pageElement, {
                dataEmployee: getEmptyDefaultValue(GenDataEmployee.employeeView.defaultValue),
                restriction: (restriction && restriction.Vorname)  ? restriction : copyByValue(GenDataEmployee.employeeView.defaultRestriction),
                isEmpRolesVisible: AppHeader.controller.binding.userData.SiteAdmin || AppHeader.controller.binding.userData.HasLocalEvents,
                isEmpRolesCustomVisible: AppHeader.controller.binding.userData.HasLocalEvents,
                setRoleVisible: AppHeader.controller.binding.userData.SiteAdmin || AppHeader.controller.binding.userData.HasLocalEvents,
                setRoleCheckVisible: AppHeader.controller.binding.userData.SiteAdmin,
                noLicence: null,
                AnzAktiveLizenz: null,
                AnzMandantLizenz: null,
                userLocked: null,
                allowEditLogin: null,
                noLicenceText: getResourceText("info.nolicenceemployee"),
                addEventFormFlag: (AppHeader.controller.binding.userData.SiteAdmin || AppHeader.controller.binding.userData.HasLocalEvents),
                eventId: null,
                disableLoginName: false,
                disableLoginFirstPart: false,
                disableDomain: false,
                disablePassword: false
            }, commandList]);

            var that = this;

            var progress = null;
            var counter = null;
            var layout = null;
            this.events = null;

            var roles = pageElement.querySelector("#roles");
            var myDomain = pageElement.querySelector('#myDomain');

            that.loadDataDelayedPromise = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            this.dispose = function () {
                if (that.events) {
                    that.events = null;
                }
            }

            var loadDataDelayed = function () {
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
                that.resultConverter(newDataEmployee);
                that.binding.dataEmployee = newDataEmployee;
                that.checkingLicence(newDataEmployee);
                if ((AppHeader.controller.binding.userData.SiteAdmin ||
                    AppHeader.controller.binding.userData.HasLocalEvents) &&
                    !newDataEmployee.HasLocalEvents) {
                    that.binding.addEventFormFlag = 1;
                } else {
                    that.binding.addEventFormFlag = null;
                }
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                Log.ret(Log.l.trace);
            }
            this.setDataEmployee = setDataEmployee;

            var saveRestriction = function () {
                var restriction = copyByValue(that.binding.restriction);
                AppData.setRestriction("Employee", restriction);
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

            // wird über Liste geholt weil wg. remote-Abfrage nicht auch noch im eigenen employeeView
            var getHasTwoFactor = function() {
                var hasTwoFactor = null;
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
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
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                var master = Application.navigator.masterControl;
                if (master && master.controller && master.controller.binding) {
                    locked = master.controller.binding.locked;
                }
                Log.ret(Log.l.trace, locked);
                return locked;
            }
            this.getLocked = getLocked;

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

            var checkingLicence = function (result) {
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
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
                if (result && result.AnzAktiveLizenz) {
                    that.binding.AnzAktiveLizenz = result.AnzAktiveLizenz;
                } else {
                    that.binding.AnzAktiveLizenz = 0;
                }
                if (result && result.AnzMandantLizenz) {
                    that.binding.AnzMandantLizenz = result.AnzMandantLizenz;
                } else {
                    that.binding.AnzMandantLizenz = 0;
                }
                if (result && result.AnzInaktiveBenutzer) {
                    that.binding.AnzInaktiveBenutzer = result.AnzInaktiveBenutzer;
                } else {
                    that.binding.AnzInaktiveBenutzer = 0;
                }
                // neues Flag UserIsActive -> wenn user bereits eingelogt ist dann sollte das Feld Login und Passwort static sein 
                // wenn user den Ändern will dann klicke explizit auf das icon für Ändern user und bestätige die Alertbox 
                // -> result.HatKontakte ist dirty Trick um festzustellen ob normale Admin oder nicht
                //|| AppHeader.controller.binding.userData.HasLocalEvents 
                // show warning inactiveUser and license exceeded
                if (that.binding.AnzAktiveLizenz >= that.binding.AnzMandantLizenz && that.binding.AnzInaktiveBenutzer > 0) {
                    //alert(getResourceText("genDataEmployee.exceededLicence"));
                    that.binding.dataEmployee.errorLicenseExceeded = true;
                }
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
                Log.call(Log.l.trace, "GenDataEmployee.Controller.");
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
                        Log.print(Log.l.trace, "employee saved");
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
                                    if (!AppHeader.controller.binding.userData.SiteAdmin) {
                                        var userName = AppData.generalData.userName;
                                        if (userName && userName.indexOf("@") > 0) {
                                            that.binding.dataEmployee.LogInNameAfterAtSymbol = userName.substr(userName.lastIndexOf("@"));
                                        }
                                        that.binding.dataEmployee.LogInNameBeforeAtSymbol = "";
                                    }
                                    newEmployeeId = that.binding.dataEmployee.MitarbeiterVIEWID;
                                }
                            }, function (errorResponse) {
                                Log.print(Log.l.error, "error inserting employee");
                                AppBar.busy = false;
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, newEmployee).then(function () {
                                if (newEmployeeId) {
                                    return that.loadData(newEmployeeId);
                                } else {
                                    return WinJS.Promise.as();
                                }
                            }).then(function () {
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
                clickAddLicences: function (event) {
                    var myFairMandantId = AppData._userData && AppData._userData.FairMandantID;
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.", "reset myFairMandantId=" + myFairMandantId);
                    AppData.setRecordId("FairMandant", myFairMandantId);
                    Application.navigateById("clientManagement");
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
                        var index = value.indexOf("@");
                        // wenn gespeichert wird prüfen, wenn indexof dann prüfen auf lastindexof > indexofdann alertbox
                        if (value && index > 0) {
                            that.binding.dataEmployee.LogInNameBeforeAtSymbol = value.substr(0, index);
                            that.binding.dataEmployee.LogInNameAfterAtSymbol = value.substr(index);
                            if (myDomain) {
                                WinJS.Promise.timeout(50).then(function () {
                                    myDomain.focus();
                                });
                            }
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
                    that.binding.restriction.Vorname = [];
                    that.binding.restriction.Login = [];
                    that.binding.restriction.Nachname = [];
                    if (event.target.value) {
                        that.binding.restriction.Vorname = [event.target.value, null, null];
                        that.binding.restriction.Login = [null, event.target.value, null];
                        that.binding.restriction.Nachname = [null, null, event.target.value];
                        that.binding.restriction.bUseOr = false;
                        that.binding.restriction.bAndInEachRow = true;
                    }
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller &&
                        typeof master.controller.loadData === "function") {
                        that.loadDataDelayed();
                    }
                    Log.ret(Log.l.trace);
                },
                changeEventId: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    if (event.target.value) {
                        that.binding.restriction.VeranstaltungID = event.target.value;
                        // use Veranstaltung2 for event selection of multi-event administrators !== Veranstaltung (admin's own event!)
                        AppData.setRecordId("Veranstaltung2",
                            (typeof that.binding.restriction.VeranstaltungID === "string")
                            ? parseInt(that.binding.restriction.VeranstaltungID)
                            : that.binding.restriction.VeranstaltungID);

                        var fairMandantVeranstID = null;
                        var master = Application.navigator.masterControl;
                        var events = [];
                        if (master && master.controller && master.controller.events) {
                            events = master.controller.events;
                        }
                        for (var i = 0; i < events.length - 1; i++) {
                            var currentEvent = events.getAt(i);
                            if (AppData.getRecordId("Veranstaltung2") === currentEvent.VeranstaltungVIEWID) {
                                fairMandantVeranstID = currentEvent.FairMandantVeranstID;
                            }
                        }
                        AppData.setRecordId("VeranstaltungAnlage", fairMandantVeranstID);
                    } else {
                        delete that.binding.restriction.VeranstaltungID;
                        AppData.setRecordId("Veranstaltung2", 0);
                    }
                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    if (master && master.controller) {
                        master.controller.licenceWarningSelected = false;
                        master.controller.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderFirstname: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    that.binding.restriction.OrderAttribute = "SortVorname";
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
                    that.binding.restriction.OrderAttribute = "SortNachname";
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
                clickExportQrcode: function (event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    AppBar.busy = true;
                    //AppBar.triggerDisableHandlers();
                    WinJS.Promise.timeout(0).then(function () {
                        return that.exportPwdQrCodeEmployeePdf();
                    });
                    Log.ret(Log.l.trace);
                },
                clickDelete2fa: function (event) {
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    var confirmTitle = getResourceText("employee.questionDelete2fa");
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            Log.print(Log.l.trace, "clickDelete2fa: user choice OK");
                            AppData.call("PRC_DeleteTwoFactorUser", {
                                pUserLogin: that.binding.dataEmployee.Login
                            }, function (result) {
                                Log.print(Log.l.info, "call PRC_DeleteTwoFactorUser: success! ");
                                var master = Application.navigator.masterControl;
                                if (master && master.controller &&
                                    typeof master.controller.loadData === "function") {
                                    master.controller.loadData(getRecordId()).then(function () {
                                        AppBar.triggerDisableHandlers();
                                    });
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
                    Log.call(Log.l.trace, "GenDataEmployee.Controller.");
                    AppData.call("PRC_UnlockUser", {
                        pUserName: that.binding.dataEmployee.Login
                    }, function (result) {
                        Log.print(Log.l.info, "call PRC_UnlockUser: success! ");
                        var master = Application.navigator.masterControl;
                        if (master && master.controller &&
                            typeof master.controller.loadData === "function") {
                            master.controller.loadData(getRecordId()).then(function () {
                                AppBar.triggerDisableHandlers();
                            });
                        }
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "call PRC_UnlockUser: error");
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                    Log.ret(Log.l.trace);
                },
                clickReorder: function (event) {
                    Log.call(Log.l.trace, "SiteEvents.Controller.");
                    var eventId = AppData.getRecordId("Veranstaltung2");
                    AppData.setRecordId("VeranstaltungAnlage", eventId);
                    Application.navigateById("siteEventsBenNach", event);
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
                clickAddLicences: function() {
                    // FairmandantID 
                    var myFairMandantId = AppData._userData && AppData._userData.FairMandantID;
                    if (myFairMandantId && (AppHeader.controller.binding.userData.SiteAdmin ||
                        AppHeader.controller.binding.userData.HasLocalEvents)) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickNew: function () {
                    if (AppHeader.controller.binding.userData.IsMidiAdmin) {
                        return true;
                    }
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
                    // Löschen von Mitarbeiter mit Kontakten nicht erlaubt!
                    if (that.binding.dataEmployee && that.binding.dataEmployee.HatKontakte) {
                        return true;
                    }
                    //Stand 23.06 Warum wird nach !master.controller.binding.hasLocalevents geprüft? Die Anwendung wird explizit ausgeblendet für Admins die wohl nur eine Veranstaltung sehen können
                    if (AppHeader.controller.binding.userData.IsMidiAdmin) {
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
                    return getHasTwoFactor() || that.binding.allowEditLogin || that.binding.iconID === 5;
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
                clickDelete2fa: function() {
                    return AppBar.modified || !getHasTwoFactor() ||
                        that.binding.dataEmployee && that.binding.dataEmployee.MitarbeiterVIEWID === AppData.getRecordId("Mitarbeiter") ||
                        AppBar.busy;
                },
                clickUnlock: function () {
                    return AppBar.modified || !getLocked() ||
                        AppBar.busy;
                }, 
                clickReorder: function () {
                    if (AppHeader.controller.binding.userData.SiteAdmin) {
                        return false;
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
                if (!recordId) {
                    that.setDataEmployee(getEmptyDefaultValue(GenDataEmployee.employeeView.defaultValue));
                    Log.ret(Log.l.trace, "no record selected");
                    return WinJS.Promise.as();
                }
                var ret = new WinJS.Promise.as().then(function () {
                    if (roles && roles.winControl &&
                        (!roles.winControl.data || !roles.winControl.data.length)) {
                        function setRoles(results) {
                            if (!results) {
                                results = [];
                            }
                            var filteredResults = results.filter(function (item) {
                                return (!item.NoDefault);
                            });
                            roles.winControl.data = new WinJS.Binding.List(filteredResults);
                        }
                        if (GenDataEmployee.initAPUserRoleView.getResults().length) {
                            Log.print(Log.l.trace, "initAPUserRoleView: from cache!");
                            setRoles(GenDataEmployee.initAPUserRoleView.getResults());
                            return WinJS.Promise.as();
                        } else {
                            return GenDataEmployee.initAPUserRoleView.select(function (json) {
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "initAPUserRoleView: success!");
                                setRoles(json && json.d && json.d.results);
                            }, function (errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                            });
                        }
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    //now load all of record data in parallel
                    Log.print(Log.l.trace, "calling select employeeView...");
                    var employeePromise = GenDataEmployee.employeeView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "employeeView: success!");
                        if (json && json.d) {
                            // now always edit!
                            that.setDataEmployee(json.d);
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, recordId);
                    var empRolesPromise;
                    var empRolesFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("empRoles"));
                    if (empRolesFragmentControl && empRolesFragmentControl.controller) {
                        empRolesPromise = empRolesFragmentControl.controller.loadData(recordId);
                    } else {
                        var parentElementempRoles = pageElement.querySelector("#emproleshost");
                        if (parentElementempRoles) {
                            empRolesPromise = Application.loadFragmentById(parentElementempRoles, "empRoles", { employeeId: recordId });
                        } else {
                            empRolesPromise = WinJS.Promise.as();
                        }
                    }
                    var genFragEventsPromise;
                    var genFragEventsFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("genFragEvents"));
                    if (genFragEventsFragmentControl && genFragEventsFragmentControl.controller) {
                        genFragEventsPromise = genFragEventsFragmentControl.controller.loadData(recordId);
                    } else {
                        var parentElementGenFragEvents = pageElement.querySelector("#genfrageventshost");
                        if (parentElementGenFragEvents) {
                            genFragEventsPromise = Application.loadFragmentById(parentElementGenFragEvents, "genFragEvents", { employeeId: recordId });
                        } else {
                            genFragEventsPromise = WinJS.Promise.as();
                        }
                    }
                    var js = {
                        doc: employeePromise,
                        text: empRolesPromise,
                        layout: genFragEventsPromise
                    }
                    return WinJS.Promise.join(js);
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
                    AppBar.busy = false;
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
                    AppBar.busy = false;
                    alert(errorMessage);
                    if (typeof error === "function") {
                        error(errorMessage);
                    }
                    return WinJS.Promise.wrapError(errorMessage);
                }
                if (dataEmployee.INITAPUserRoleID && typeof dataEmployee.INITAPUserRoleID === "string") {
                    dataEmployee.INITAPUserRoleID = parseInt(dataEmployee.INITAPUserRoleID);
                }
                AppBar.busy = true;

                if (dataEmployee.Login && (dataEmployee.Login.lastIndexOf("@") > dataEmployee.Login.indexOf("@"))) {
                    errorMessage = getResourceText("genDataEmployee.alertatSymbol");
                    Log.print(Log.l.error, errorMessage);
                    AppBar.busy = false;
                    alert(errorMessage);
                    if (typeof error === "function") {
                        error(errorMessage);
                    }
                    return WinJS.Promise.wrapError(errorMessage);
                }
                var ret = new WinJS.Promise.as().then(function () {
                    if (err) {
                        return WinJS.Promise.as();
                    }
                    return AppData.call("PRC_SaveUserAccountData", {
                        pMitarbeiterID: dataEmployee.MitarbeiterVIEWID,
                        pFirstName: dataEmployee.Vorname,
                        pLastName: dataEmployee.Nachname,
                        pLogin: dataEmployee.Login,
                        pPassword: dataEmployee.Password,
                        pAPUserRoleID: dataEmployee.INITAPUserRoleID && typeof dataEmployee.INITAPUserRoleID === "string" ? parseInt(dataEmployee.INITAPUserRoleID) : dataEmployee.INITAPUserRoleID
                    }, function (json) {
                        // called asynchronously if ok
                        Log.print(Log.l.info, "employeeData PRC_SaveUserAccountData: success!");
                    }, function (errorResponse) {
                        err = errorResponse;
                        Log.print(Log.l.error, "call PRC_SaveUserAccountData error");
                        AppData.getErrorMsgFromErrorStack(errorResponse).then(function () {
                            AppData.setErrorMsg(that.binding, errorResponse);
                            if (typeof error === "function") {
                                error(errorResponse);
                            }
                        });
                    });
                }).then(function () {
                    return AppData.call("PRC_CheckMAChange", {
                        pMAID: dataEmployee.MitarbeiterVIEWID,
                        pNewAPUserRoleID: dataEmployee.INITAPUserRoleID,
                        pNewLoginName: dataEmployee.Login
                    }, function (json) {
                        Log.print(Log.l.info, "call PRC_CheckMAChange success! ");
                        if (json && json.d && json.d.results.length > 0) {
                            var result = json.d.results[0];
                            if (result && result.ResultCode && result.ResultCode && result.ResultCode === 1395 && result.ResultMessage) {
                                that.binding.dataEmployee.errorLicenseExceeded = true;
                                confirmModal(null, getResourceText("genDataEmployee.createInactiveUser"), getResourceText("genDataEmployee.chooseEventOk"), null, function (result) {
                                    if (result) {
                                        Log.print(Log.l.trace, "click confirmModal: user choice OK");
                                    }
                                });
                            }
                        }
                    }, function (errorResponse) {
                        err = errorResponse;
                        Log.print(Log.l.error, "call PRC_CheckMAChange error");
                        AppData.getErrorMsgFromErrorStack(errorResponse).then(function () {
                            AppData.setErrorMsg(that.binding, errorResponse);
                            if (typeof error === "function") {
                                error(errorResponse);
                            }
                        });
                    });
                }).then(function () {
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
                if (myDomain) {
                    myDomain.focus();
                }
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



