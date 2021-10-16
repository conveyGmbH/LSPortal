// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/esStaffAdministration/esStaffAdministrationService.js" />
/// <reference path="~/www/pages/esStaffAdministrationList/esStaffAdministrationListController.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("EsStaffAdministration", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataEmployee: getEmptyDefaultValue(EsStaffAdministration.employeeView.defaultValue),
                restriction: getEmptyDefaultValue(EsStaffAdministration.employeeView.defaultRestriction),
                isEmpRolesVisible: AppHeader.controller.binding.userData.SiteAdmin || AppHeader.controller.binding.userData.HasLocalEvents,
                noLicence: null,
                noLicenceText: getResourceText("info.nolicenceemployee"),
                hideStaffInfo: false,
                ArticleWarning: false,
                ArticleTypeID: 0
            }, commandList]);

            var that = this;

            var initAnrede = pageElement.querySelector("#InitAnrede");
            var titlecombo = pageElement.querySelector("#titlecombo");
            var esArticle = pageElement.querySelector("#esArticle");

            var titlecategorys = [{TITLE : " "}, { TITLE: "Dr." }, { TITLE: "Prof." }, { TITLE: "Prof. Dr." }];

            var domain = pageElement.querySelector("#domain");
            var prevMasterLoadPromise = null;
            var prevLogin = null;
            var prevPassword;

            if (titlecombo && titlecombo.winControl) {
                titlecombo.winControl.data = new WinJS.Binding.List(titlecategorys);
            }

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
                AppBar.triggerDisableHandlers();
            }
            this.setDataEmployee = setDataEmployee;

            var getLangSpecErrorMsg = function (resultmessageid, errorMsg) {
                Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
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

            var saveRestriction = function () {
                if (that.binding.restriction.Names && that.binding.restriction.Names.length > 0) {
                    that.binding.restriction.Aktiv = ["X", "X", "X"];
                } else {
                    that.binding.restriction.Aktiv = ["X", "X", "X"];
                }
                that.binding.restriction.bAndInEachRow = true;
                that.binding.restriction.bUseOr = false;
                Log.print("restriction number:" + that.binding.restriction.countCombobox + ", restriction: " + that.binding.restriction);
                AppData.setRestriction("MitarbeiterVIEW_20609", that.binding.restriction);
            }
            this.saveRestriction = saveRestriction;

            var getRecordId = function () {
                Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
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
                Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = getRecordId();
                if (recordId) {
                    AppBar.busy = true;
                    AppData.call("PRC_DeleteMA",
                        {
                            pMitarbeiterID: recordId
                        },
                        function(json) {
                            Log.print(Log.l.info, "call success! ");
                            AppBar.busy = false;
                            complete(json);
                        },
                        function (errorResponse) {
                            Log.print(Log.l.error, "call error");
                            AppBar.busy = false;
                            error(errorResponse);
                        });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                }
                Log.ret(Log.l.trace);
            };
            this.deleteData = deleteData;

            var checkingLicence = function() {
                Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return EsStaffAdministration.licenceBView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.info, "licenceBView select: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            that.binding.noLicence = json.d.results[0].NichtLizenzierteApp;
                        }

                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error selecting mailerzeilen");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        }, { Login: that.binding.dataEmployee.Login });
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.checkingLicence = checkingLicence;

            var checkingReadonlyFlag = function() {
                Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                if (domain && (AppHeader.controller.binding.userData.SiteAdmin || !AppHeader.controller.binding.userData.HasLocalEvents)) {
                    domain.disabled = false;
                } else {
                    domain.disabled = true;
                }
                Log.ret(Log.l.trace);
            }
            this.checkingReadonlyFlag = checkingReadonlyFlag;

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

            var exportContactPdf = function () {
                Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var recordId = getRecordId();
                if (recordId) {
                    AppBar.busy = true;
                    ret = EsStaffAdministration.pdfView.select(function (json) {
                        Log.print(Log.l.trace, "exportKontaktDataView: success!");
                        if (json && json.d && json.d.results.length > 0) {
                            var results = json.d.results[0];
                            var pdfDataraw = results.DocContentDOCCNT1;
                            var sub = pdfDataraw.search("\r\n\r\n");
                            var pdfDataBase64 = pdfDataraw.substr(sub + 4);
                            var pdfData = that.base64ToBlob(pdfDataBase64, "pdf");
                            var pdfName = results.szOriFileNameDOC1;
                            saveAs(pdfData, pdfName);
                            AppBar.busy = false;
                        }
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (typeof error === "function") {
                            error(errorResponse);
                        }
                        }, { MitarbeiterID: recordId });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.exportContactPdf = exportContactPdf;

            var checkIfTicket = function() {
                Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                if (that.binding.dataEmployee.HasTicket) {
                    var inputdis = pageElement.querySelectorAll("input[type=text]");
                    for (var i = 0; i < inputdis.length; i++) {
                        inputdis[i].disabled = true;
                    }
                    var selectdis = pageElement.querySelectorAll("select");
                    for (var j = 0; j < selectdis.length; j++) {
                        selectdis[j].disabled = true;
                    }
                    pageElement.querySelector("input[type=email]").disabled = true;
                } else {
                    var inputen = pageElement.querySelectorAll("input[type=text]");
                    for (var i = 0; i < inputen.length; i++) {
                        inputen[i].disabled = false;
                    }
                    var selecten = pageElement.querySelectorAll("select");
                    for (var j = 0; j < selecten.length; j++) {
                        selecten[j].disabled = false;
                    }
                    pageElement.querySelector("input[type=email]").disabled = false;
                }
            }
            this.checkIfTicket = checkIfTicket;
            
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Mailing.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var dataEmployee = that.binding.dataEmployee;
                if (dataEmployee && AppBar.modified && !AppBar.busy) {
                    AppBar.busy = true;
                    var recordId = getRecordId();
                    if (recordId) {
                        ret = WinJS.Promise.as().then(function () {
                            AppBar.busy = false;
                            AppBar.modified = false;
                            AppData.call("PRC_UpdateMA", {
                                pMitarbeiterID: that.binding.dataEmployee.MitarbeiterVIEWID,
                                pCompanyName: that.binding.dataEmployee.Firma,
                                pFirstName: that.binding.dataEmployee.Vorname,
                                pLastName: that.binding.dataEmployee.Nachname,
                                pLogin: null,
                                pPassword: null,
                                pEMail: that.binding.dataEmployee.EMail,
                                pAcadTitle: that.binding.dataEmployee.AkadTitel,
                                pSalutationID: parseInt(that.binding.dataEmployee.AnredeID)
                            }, function (json) {
                                Log.print(Log.l.info, "call success! ");
                                var master = Application.navigator.masterControl;
                                if (master && master.controller && master.controller.binding && typeof master.controller.selectRecordId !== "undefined") {
                                    master.controller.binding.employeeId = that.binding.dataEmployee.MitarbeiterVIEWID;
                                    master.controller.loadData().then(function () {
                                        Log.print(Log.l.info, "master.controller.loadData: success!");
                                        master.controller.selectRecordId(that.binding.dataEmployee.MitarbeiterVIEWID);
                                    });
                                }
                            }, function (error) {
                                Log.print(Log.l.info, "call error! ");
                            });
                        });
                    } else {
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
            };
            this.saveData = saveData;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                    if (that.binding.hideStaffInfo) {
                        that.binding.hideStaffInfo = false;
                        AppBar.triggerDisableHandlers();
                    } else {
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    var id = AppData.getRecordId("Veranstaltung");
                    Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_CreateMA", {
                        pVeranstaltungID: id
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding) {
                            master.controller.binding.employeeId = json.d.results[0];
                            master.controller.loadData().then(function () {
                                master.controller.selectRecordId(master.controller.binding.employeeId);
                            });
                        }
                    }, function (error) {
                        Log.print(Log.l.error, "call error");

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
                                    var prevSelIdx = master.controller.binding.selIdx;
                                    master.controller.loadData().then(function () {
                                        Log.print(Log.l.info, "master.controller.loadData: success!");
                                        master.controller.setSelIndex(prevSelIdx);
                                    });
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
                    Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                    AppData.setErrorMsg(that.binding);
                    WinJS.Promise.as().then(function () {
                        return AppData.call("PRC_UpdateMA", {
                        pMitarbeiterID: that.binding.dataEmployee.MitarbeiterVIEWID,
                        pCompanyName: that.binding.dataEmployee.Firma,
                        pFirstName: that.binding.dataEmployee.Vorname,
                        pLastName: that.binding.dataEmployee.Nachname,
                        pLogin: null,
                        pPassword: null,
                        pEMail: that.binding.dataEmployee.EMail,
                        pAcadTitle: that.binding.dataEmployee.AkadTitel,
                        pSalutationID: parseInt(that.binding.dataEmployee.AnredeID)
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding && typeof master.controller.selectRecordId !== "undefined") {
                            master.controller.binding.employeeId = that.binding.dataEmployee.MitarbeiterVIEWID;
                            master.controller.loadData().then(function () {
                                Log.print(Log.l.info, "master.controller.loadData: success!");
                                master.controller.selectRecordId(that.binding.dataEmployee.MitarbeiterVIEWID);
                            });
                        }
                    }, function (error) {
                        Log.print(Log.l.info, "call error! ");
                    });
                    }).then(function () {
                        if (that.binding.hideStaffInfo) {
                            return AppData.call("PRC_OrderTicket", {
                                pMitarbeiterID: that.binding.dataEmployee.MitarbeiterVIEWID,
                                pArticleTypeID: parseInt(that.binding.dataEmployee.ArticleTypeID)
                            }, function (json) {
                                Log.print(Log.l.info, "call success! ");
                                var master = Application.navigator.masterControl;
                                if (master && master.controller && master.controller.binding) {
                                    master.controller.binding.employeeId =
                                        that.binding.dataEmployee.MitarbeiterVIEWID;
                                    master.controller.loadData().then(function () {
                                        master.controller.selectRecordId(master.controller.binding.employeeId);
                                    });
                                }
                                if (that.binding.hideStaffInfo) {
                                    that.binding.hideStaffInfo = false;
                                }
                            }, function (error) {
                                Log.print(Log.l.error, "call error");
                            });
                        } else {
                            return WinJS.Promise.as();
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                clickPreOrderTicket: function (event) {
                    Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                    AppBar.modified = true;
                    AppData.setErrorMsg(that.binding);
                    if (!that.binding.dataEmployee.HasTicket) {
                        if (that.binding.hideStaffInfo) {
                            that.binding.hideStaffInfo = false;
                        } else {
                            that.binding.hideStaffInfo = true;
                        }
                    } else {
                        that.binding.hideStaffInfo = !that.binding.dataEmployee.HasTicket;
                    }
                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);
                },
                clickExport: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    that.exportContactPdf();
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                changeLogin: function (event) {
                    Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        pageElement.querySelector("#password").value = "";
                        pageElement.querySelector("#password2").value = "";
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
                    Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        pageElement.querySelector("#password2").value = "";
                    }
                    Log.ret(Log.l.trace);
                },
                changeSearchField: function (event) {
                    Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
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
                    Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                    that.binding.restriction.OrderAttribute = "Vorname";
                    //that.binding.restriction.OrderDesc = !that.binding.restriction.OrderDesc;
                    AppData.setRestriction("MitarbeiterVIEW_20609", that.binding.restriction);
                    if (event.target.textContent === getResourceText("esStaffAdministration.firstNameDesc")) {
                        event.target.textContent = getResourceText("esStaffAdministration.firstNameAsc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = false;
                    } else {
                        event.target.textContent = getResourceText("esStaffAdministration.firstNameDesc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = true;
                    }

                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    master.controller.loadData();
                    Log.ret(Log.l.trace);
                },
                clickOrderLastname: function (event) {
                    Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                    var master = Application.navigator.masterControl;
                    that.binding.restriction.OrderAttribute = "Nachname";
                    //that.binding.restriction.OrderDesc = !that.binding.restriction.OrderDesc;
                    AppData.setRestriction("MitarbeiterVIEW_20609", that.binding.restriction);
                    if (event.target.textContent === getResourceText("esStaffAdministration.nameDesc")) {
                        event.target.textContent = getResourceText("esStaffAdministration.nameAsc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = false;
                    } else {
                        event.target.textContent = getResourceText("esStaffAdministration.nameDesc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = true;
                    }

                    that.saveRestriction();
                    master.controller.loadData();
                    Log.ret(Log.l.trace);
                },
                clickOrderCompany: function (event) {
                    Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                    var master = Application.navigator.masterControl;
                    that.binding.restriction.OrderAttribute = "Firma";
                    //that.binding.restriction.OrderDesc = !that.binding.restriction.OrderDesc;
                    AppData.setRestriction("MitarbeiterVIEW_20609", that.binding.restriction);
                    if (event.target.textContent === getResourceText("esStaffAdministration.companyDesc")) {
                        event.target.textContent = getResourceText("esStaffAdministration.companyAsc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = false;
                    } else {
                        event.target.textContent = getResourceText("esStaffAdministration.companyDesc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = true;
                    }

                    that.saveRestriction();
                    master.controller.loadData();
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
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
                changedArticle: function(event) {
                    Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                    AppBar.modified = true;
                    AppData.setErrorMsg(that.binding);
                    var target = event.currentTarget || event.target;
                    var value = parseInt(target.value);
                    if (value > 0) {
                        that.binding.ArticleWarning = true;
                    } else {
                        that.binding.ArticleWarning = false;
                    }
                    
                    that.binding.dataEmployee.ArticleTypeID = value;
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
                clickNew: function() {
                    return that.binding.hideStaffInfo;
                    //return false;
                },
                clickDelete: function() {
                    if (that.binding.dataEmployee && that.binding.dataEmployee.MitarbeiterVIEWID && !AppBar.busy &&
                        that.binding.dataEmployee.MitarbeiterVIEWID !== AppData.getRecordId("Mitarbeiter") &&
                        that.binding.dataEmployee.IsDeletable != null) {
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
                    if (that.binding.dataEmployee.MitarbeiterVIEWID && !that.binding.dataEmployee.HasTicket && AppBar.modified) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickPreOrderTicket: function() {
                    if (that.binding.dataEmployee.HasTicket === "1" || ((that.binding.dataEmployee.Vorname === null || that.binding.dataEmployee.Vorname.length === 0) || (that.binding.dataEmployee.Nachname === null || that.binding.dataEmployee.Nachname.length === 0) || (that.binding.dataEmployee.AnredeID === null|| parseInt(that.binding.dataEmployee.AnredeID) === 0))) {
                        return true;
                    } else {
                        if (that.binding.dataEmployee.MitarbeiterVIEWID) {
                        return false;
                        } else {
                            return true;
                        }
                    }
                },
                clickExport: function() {
                    if (that.binding.dataEmployee.HasTicket && that.binding.dataEmployee.MitarbeiterVIEWID) {
                       return false;
                    } else {
                       return true;
                    }
                }
            };

            var loadData = function (recordId) {
                Log.call(Log.l.trace, "Employee.Controller.");
                AppData.setErrorMsg(that.binding);
                /*var id = AppData.getRecordId("MitarbeiterVIEW_20609");
                if (id) {
                    recordId = id;
                }*/
                var ret = new WinJS.Promise.as().then(function () {
                    if (!AppData.initAnredeView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initAnredeData...");
                        //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                        return AppData.initAnredeView.select(function (json) {
                            Log.print(Log.l.trace, "initAnredeView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initAnrede && initAnrede.winControl) {
                                    initAnrede.winControl.data = new WinJS.Binding.List(json.d.results);
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initAnrede && initAnrede.winControl &&
                            (!initAnrede.winControl.data || !initAnrede.winControl.data.length)) {
                            initAnrede.winControl.data = new WinJS.Binding.List(AppData.initAnredeView.getResults());
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    /*if (AppBar.modified) {
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
                    }*/
                }).then(function () {
                    if (recordId) { 
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select employeeView...");
                        return EsStaffAdministration.employeeView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "employeeView: success!");
                            if (json && json.d) {
                                // now always edit!
                                that.setDataEmployee(json.d);
                                that.checkIfTicket();
                                if (that.binding.dataEmployee.Login) {
                                    Log.print(Log.l.trace, "Checking for licence!");
                                    //that.checkingLicence();
                                    //that.checkingReadonlyFlag();
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
                        return AppData.call("PRC_ESGetArticleList",
                            {
                                pVeranstaltungID: AppData.getRecordId("Veranstaltung"),
                                pLanguageSpecID: AppData.getLanguageId(),
                                pArticleMode: 'Ticket'
                            },
                            function(json) {
                                Log.print(Log.l.info, "call success! ");
                                that.articleList = new WinJS.Binding.List([{ArticleTypeID: 0, ArticleText: ""}]);
                                if (json && json.d.results.length > 0) {
                                    var results = json.d.results;
                                    //that.setDataEvent(json.d);
                                    results.forEach(function (item, index) {
                                        //that.resultConverter(item, index);
                                        that.articleList.push(item);
                                    });
                                    //that.binding.dataEmployee.ArticleTypeID = 0;

                                    //that.binding.hideStaffInfo = !that.binding.dataEmployee.HasTicket;
                                } else {
                                    //that.binding.hideStaffInfo = !that.binding.dataEmployee.HasTicket;
                                }
                                esArticle.winControl.data = that.articleList;
                                esArticle.selectedIndex = "0";
                            },
                            function(error) {
                                Log.print(Log.l.error, "call error");

                            });
                    } else {
                        return WinJS.Promise.as();
                    }
                })/*.then(function () {
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
                    AppBar.notifyModified = true;
                    return WinJS.Promise.as();
                })*/;
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;
            
            that.processAll().then(function() {
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



