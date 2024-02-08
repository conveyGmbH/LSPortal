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
    var namespaceName = "EsStaffAdministration";

    WinJS.Namespace.define("EsStaffAdministration", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                prevLogin = newDataEmployee.Login;
                prevPassword = newDataEmployee.Password;
                that.resultConverter(newDataEmployee);
                that.binding.dataEmployee = newDataEmployee;
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
            }
            this.setDataEmployee = setDataEmployee;

            var getLangSpecErrorMsg = function (resultmessageid, errorMsg) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var lang = AppData.getLanguageId();
                AppData.setErrorMsg(that.binding);
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

            var cancelMaTicket = function (reasonstring) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var recordId = that.binding.dataEmployee && that.binding.dataEmployee.MitarbeiterVIEWID;
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_ESCancelMATicket", {
                    pMitarbeiterID: recordId,
                    pTicketCode: null,
                    pReasonString: reasonstring
                }, function (json) {
                    Log.print(Log.l.info, "call PRC_ESCancelMATicket: success! ");
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        master.controller.loadData(recordId);
                    }
                    that.loadData(recordId);
                    alert(getResourceText("esStaffAdministration.ticketcancelconfirm"));
                }, function (error) {
                    Log.print(Log.l.error, "call PRC_ESCancelMATicket: error");

                });
                Log.ret(Log.l.trace);
            }
            this.cancelMaTicket = cancelMaTicket;

            var sendPdfWalletMail = function (mailtype) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var recordId = that.binding.dataEmployee && that.binding.dataEmployee.MitarbeiterVIEWID;
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_ESSendTicketMail", {
                    pMitarbeiterID: recordId,
                    pMailType: mailtype
                }, function (json) {
                    Log.print(Log.l.info, "call PRC_ESSendTicketMail: success! ");
                    var master = Application.navigator.masterControl;
                    if (master && master.controller && master.controller.binding) {
                        master.controller.loadData(recordId);
                    }
                }, function (error) {
                    Log.print(Log.l.error, "call PRC_ESSendTicketMail: error");

                });
                Log.ret(Log.l.trace);
            }
            this.sendPdfWalletMail = sendPdfWalletMail;

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
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = getRecordId();
                if (recordId) {
                    AppBar.busy = true;
                    AppData.call("PRC_DeleteMA",
                        {
                            pMitarbeiterID: recordId
                        },
                        function(json) {
                            Log.print(Log.l.info, "call PRC_DeleteMA: success! ");
                            AppBar.busy = false;
                            complete(json);
                        },
                        function (errorResponse) {
                            Log.print(Log.l.error, "call PRC_DeleteMA: error");
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
                Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                        Log.print(Log.l.error, "error selecting licenceBView");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        }, { Login: that.binding.dataEmployee.Login });
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.checkingLicence = checkingLicence;

            var checkingReadonlyFlag = function() {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var recordId = getRecordId();
                if (recordId) {
                    AppBar.busy = true;
                    ret = EsStaffAdministration.pdfView.select(function (json) {
                        Log.print(Log.l.trace, "select pdfView: success!");
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
                    }, {
                         MitarbeiterID: recordId
                    });
                } else {
                    ret = WinJS.Promise.as();
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.exportContactPdf = exportContactPdf;

            var checkIfTicket = function() {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                Log.ret(Log.l.trace);
            }
            this.checkIfTicket = checkIfTicket;
            
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                                Log.print(Log.l.info, "call PRC_UpdateMA: success! ");
                                if (typeof complete === "function") {
                                    complete(dataEmployee);
                                } else {
                                    var master = Application.navigator.masterControl;
                                    if (master && master.controller && master.controller.binding && typeof master.controller.selectRecordId !== "undefined") {
                                        master.controller.binding.employeeId = that.binding.dataEmployee.MitarbeiterVIEWID;
                                        master.controller.loadData().then(function () {
                                            Log.print(Log.l.info, "master.controller.loadData: success!");
                                            master.controller.selectRecordId(that.binding.dataEmployee.MitarbeiterVIEWID);
                                        });
                                    }
                                }
                            }, function (errorResponse) {
                                Log.print(Log.l.info, "call PRC_UpdateMA: error! ");
                                if (typeof error === "function") {
                                    error(errorResponse);
                                }
                            });
                        });
                    } else {
                        ret = new WinJS.Promise.as().then(function () {
                            if (typeof complete === "function") {
                                complete(dataEmployee);
                            }
                        });
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
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                clickDeleteTicket: function() {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var deleteTicketString = prompt(getResourceText("esStaffAdministration.ticketStornoTitle"), "");
                    if (deleteTicketString === null || deleteTicketString === undefined) {
                        Log.print(Log.l.info, "No delete done!");
                        alert(getResourceText("esStaffAdministration.ticketcancelabort"));
                    } else if (deleteTicketString === "") {
                        Log.print(Log.l.info, "Kein Grund angegben!");
                        alert(getResourceText("esStaffAdministration.ticketcancelstringempty"));
                    } else {
                        that.cancelMaTicket(deleteTicketString);
                    }
                    Log.ret(Log.l.trace);
                },
                clickSendPDF: function() {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.sendPdfWalletMail("PDF");
                    Log.ret(Log.l.trace);
                },
                clickSendWallet: function () {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.sendPdfWalletMail("WALLET");
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    var veranstaltungId = AppData.getRecordId("Veranstaltung");
                    Log.call(Log.l.trace, namespaceName + ".Controller.", "eventId=" + veranstaltungId);
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_CreateMA", {
                        pVeranstaltungID: veranstaltungId
                    }, function (json) {
                        Log.print(Log.l.info, "call PRC_CreateMA: success! ");
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding) {
                            master.controller.binding.employeeId = json.d.results[0];
                            master.controller.loadData().then(function () {
                                master.controller.selectRecordId(master.controller.binding.employeeId);
                            });
                        }
                    }, function (error) {
                        Log.print(Log.l.error, "call PRC_CreateMA: error");

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
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    AppData.setErrorMsg(that.binding);
                    WinJS.Promise.as().then(function () {
                        return that.saveData();
                    }).then(function () {
                        if (that.binding.hideStaffInfo) {
                            return AppData.call("PRC_OrderTicket", {
                                pMitarbeiterID: that.binding.dataEmployee.MitarbeiterVIEWID,
                                pArticleTypeID: parseInt(that.binding.dataEmployee.ArticleTypeID)
                            }, function (json) {
                                Log.print(Log.l.info, "call PRC_OrderTicket: success! ");
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
                                Log.print(Log.l.error, "call PRC_OrderTicket: error");
                            });
                        } else {
                            return WinJS.Promise.as();
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                clickPreOrderTicket: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.exportContactPdf();
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
                    if (AppBar.notifyModified) {
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
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                        AppHeader.controller.binding.userData = {};
                        if (!AppHeader.controller.binding.userData.VeranstaltungName) {
                            AppHeader.controller.binding.userData.VeranstaltungName = "";
                        }
                    }
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                },
                changedArticle: function(event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
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
                clickDeleteTicket: function () {
                    if (that.binding.dataEmployee.MitarbeiterVIEWID && that.binding.dataEmployee.HasTicket && that.binding.dataEmployee.CancelEnabled) {
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
                            return false;
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
                clickSendPDF: function () {
                    if (that.binding.dataEmployee.MitarbeiterVIEWID && that.binding.dataEmployee.HasTicket !== null) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickSendWallet: function () {
                    if (that.binding.dataEmployee.MitarbeiterVIEWID && that.binding.dataEmployee.HasTicket !== null) {
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
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
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
                    if (recordId) { 
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select employeeView...recordId=" + recordId);
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
                        Log.print(Log.l.trace, "calling PRC_ESGetArticleList...recordId=" + recordId);
                        return AppData.call("PRC_ESGetArticleList", {
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
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;
            
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData(getRecordId());
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();



