// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/lib/base64js/scripts/base64js.min.js" />
/// <reference path="~/www/pages/esVoucherUsers/esVoucherUsersService.js" />
/// <reference path="~/www/pages/esVoucherUsersList/esVoucherUsersListController.js" />
/// <reference path="~/www/pages/esVoucherUsers/exportXlsx.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("EsVoucherUsers", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataContact: getEmptyDefaultValue(EsVoucherUsers.voucherView.defaultValue),
                restriction: getEmptyDefaultValue(EsVoucherUsers.voucherView.defaultRestriction),
                restrictionExport: getEmptyDefaultValue(EsVoucherUsers.voucherUsersAllView.defaultRestriction),
                isEmpRolesVisible: AppHeader.controller.binding.userData.SiteAdmin || AppHeader.controller.binding.userData.HasLocalEvents,
                noLicence: null,
                noLicenceText: getResourceText("info.nolicenceemployee"),
                checkInDate: "",
                editDate: ""
            }, commandList]);

            var that = this;

            var initAnrede = pageElement.querySelector("#InitAnrede");
            var initLand = pageElement.querySelector("#InitLand");
            var titlecombo = pageElement.querySelector("#titlecombo");

            var titlecategorys = [{TITLE : " "}, { TITLE: "Dr." }, { TITLE: "Prof." }, { TITLE: "Prof. Dr." }];

            var domain = pageElement.querySelector("#domain");
            var prevMasterLoadPromise = null;
            var prevLogin = null;
            var prevPassword;

            

            if (titlecombo && titlecombo.winControl) {
                titlecombo.winControl.data = new WinJS.Binding.List(titlecategorys);
            }
            
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

            var setDataContact = function (newDataContact) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.editDate = that.getDateObject(newDataContact.Erfassungsdatum);
                that.binding.checkInDate = that.getDateObject(newDataContact.CheckInDate);
                that.binding.dataContact = newDataContact;
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
            }
            this.setDataContact = setDataContact;

            var getLangSpecErrorMsg = function (resultmessageid, errorMsg) {
                Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
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
                Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
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
                AppData.setRestriction("MitarbeiterVIEW_20611", that.binding.restriction);
            }
            this.saveRestriction = saveRestriction;

            var getRecordId = function () {
                Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
                var recordId = that.binding.dataContact && that.binding.dataContact.KontaktVIEWID;
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
            
            var checkingLicence = function() {
                Log.call(Log.l.trace, "EsStaffAdministration.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return EsVoucherUsers.licenceBView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.info, "licenceBView select: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            that.binding.noLicence = json.d.results[0].NichtLizenzierteApp;
                        }

                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error selecting mailerzeilen");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        }, { Login: that.binding.dataContact.Login });
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
                Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var recordId = getRecordId();
                if (recordId) {
                    AppBar.busy = true;
                    ret = EsVoucherUsers.pdfView.select(function (json) {
                        Log.print(Log.l.trace, "exportKontaktDataView: success!");
                        if (json && json.d) {
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

            var disableFields = function() {
                Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
                    var inputdis = pageElement.querySelectorAll("input[type=text]");
                    for (var i = 0; i < inputdis.length; i++) {
                        inputdis[i].disabled = true;
                    }
                    var selectdis = pageElement.querySelectorAll("select");
                    for (var j = 0; j < selectdis.length; j++) {
                        selectdis[j].disabled = true;
                    } 
                    var selectarea = pageElement.querySelectorAll("textarea");
                    for (var a = 0; a < selectarea.length; a++) {
                        if (a === 1) {

                        } else {
                            selectarea[a].disabled = true;
                        }
                    
                    }
            }
            this.disableFields = disableFields;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var dataContact = that.binding.dataContact;
                if (dataContact && AppBar.modified && !AppBar.busy) {
                    AppBar.busy = true;
                    var recordId = getRecordId();
                    if (recordId) {
                        ret = WinJS.Promise.as().then(function () {
                            EsVoucherUsers.voucherView.update(function (response) {
                                AppBar.busy = false;
                                // called asynchronously if ok
                                Log.print(Log.l.info, "dataContact update: success!");
                                AppBar.modified = false;
                                var master = Application.navigator.masterControl;
                                if (master && master.controller) {
                                    master.controller.loadData().then(function () {
                                        master.controller.selectRecordId(getRecordId());
                                    });
                                }
                                if (typeof complete === "function") {
                                    complete(dataContact);
                                }
                            }, function (errorResponse) {
                                AppBar.busy = false;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (typeof error === "function") {
                                    error(errorResponse);
                                }
                                }, recordId, dataContact);
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
                            complete(dataContact);
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.saveData = saveData;

            var exportData = function () {
                Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
                var dbViewTitle = null;
                that.binding.restrictionExport.VeranstaltungID = AppData.getRecordId("Veranstaltung");
                that.binding.restrictionExport.LanguageSpecID = AppData.getLanguageId();
                var dbView = EsVoucherUsers.voucherUsersAllView;
                var fileName = getResourceText("EsVoucherUsers.excelexportall");
                if (dbView) {
                    var exporter = ExportXlsx.exporter;
                    if (!exporter) {
                        exporter = new ExportXlsx.ExporterClass();
                    }
                    //exporter.showProgress(0);
                    WinJS.Promise.timeout(50).then(function () {
                        exporter.saveXlsxFromView(dbView, fileName, function (result) {
                            AppBar.busy = false;
                            AppBar.triggerDisableHandlers();
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                            AppBar.busy = false;
                            AppBar.triggerDisableHandlers();
                            }, that.binding.restrictionExport, dbViewTitle);
                    });
                } else {
                    AppBar.busy = false;
                    AppBar.triggerDisableHandlers();
                }
                Log.ret(Log.l.trace);
            }
            that.exportData = exportData;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickExportAllVoucherUsers: function(parameters) {
                    Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
                    AppBar.busy = true;
                    AppBar.triggerDisableHandlers();
                    WinJS.Promise.timeout(0).then(function () {
                        that.exportData();
                    });
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
                    that.saveData();
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                changeLogin: function (event) {
                    Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        pageElement.querySelector("#password").value = "";
                        pageElement.querySelector("#password2").value = "";
                    }
                    if (event.currentTarget.id === "loginFirstPart") {
                        if (event.currentTarget.value && event.currentTarget.value.indexOf("@") > 0) {
                            that.binding.dataContact.LogInNameBeforeAtSymbole = event.currentTarget.value.substr(0, event.currentTarget.value.indexOf("@"));
                        } else {
                            that.binding.dataContact.LogInNameBeforeAtSymbole = event.currentTarget.value;
                        }
                        that.binding.dataContact.Login = that.binding.dataContact.LogInNameBeforeAtSymbole + that.binding.dataContact.LogInNameAfterAtSymbole;
                    }
                    if (event.currentTarget.id === "domain") {
                        that.binding.dataContact.Login = that.binding.dataContact.LogInNameBeforeAtSymbole + event.currentTarget.value;
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
                    Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
                    that.binding.restriction.OrderAttribute = "Vorname";
                    //that.binding.restriction.OrderDesc = !that.binding.restriction.OrderDesc;
                    AppData.setRestriction("KontaktVIEW_20611", that.binding.restriction);
                    if (event.target.textContent === getResourceText("esVoucherUsersList.firstNameDesc")) {
                        event.target.textContent = getResourceText("esVoucherUsersList.firstNameAsc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = false;
                    } else {
                        event.target.textContent = getResourceText("esVoucherUsersList.firstNameDesc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = true;
                    }

                    that.saveRestriction();
                    var master = Application.navigator.masterControl;
                    master.controller.loadData();
                    Log.ret(Log.l.trace);
                },
                clickOrderLastname: function (event) {
                    Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
                    var master = Application.navigator.masterControl;
                    that.binding.restriction.OrderAttribute = "Name";
                    //that.binding.restriction.OrderDesc = !that.binding.restriction.OrderDesc;
                    AppData.setRestriction("KontaktVIEW_20611", that.binding.restriction);
                    if (event.target.textContent === getResourceText("esVoucherUsersList.nameDesc")) {
                        event.target.textContent = getResourceText("esVoucherUsersList.nameAsc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = false;
                    } else {
                        event.target.textContent = getResourceText("esVoucherUsersList.nameDesc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = true;
                    }

                    that.saveRestriction();
                    master.controller.loadData();
                    Log.ret(Log.l.trace);
                },
                clickOrderCompany: function (event) {
                    Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
                    var master = Application.navigator.masterControl;
                    that.binding.restriction.OrderAttribute = "Firmenname";
                    //that.binding.restriction.OrderDesc = !that.binding.restriction.OrderDesc;
                    AppData.setRestriction("KontaktVIEW_20611", that.binding.restriction);
                    if (event.target.textContent === getResourceText("esVoucherUsersList.companyDesc")) {
                        event.target.textContent = getResourceText("esVoucherUsersList.companyAsc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = false;
                    } else {
                        event.target.textContent = getResourceText("esVoucherUsersList.companyDesc");
                        that.binding.restriction.btn_textContent = event.target.textContent;
                        that.binding.restriction.OrderDesc = true;
                    }

                    that.saveRestriction();
                    master.controller.loadData();
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "EsVoucherUsers.Controller.");
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
                clickBack: function() {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickOk: function () {
                    if (that.binding.dataContact.KontaktVIEWID && !that.binding.dataContact.HasTicket){
                        return false;
                    } else {
                        return true;
                    }
                },
                clickOrderTicket: function() {
                    if (that.binding.dataContact.HasTicket) {
                        return true;
                    } else {
                        return false;
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
                        Log.print(Log.l.trace, "calling select voucherView...");
                        return EsVoucherUsers.voucherView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "employeeView: success!");
                            if (json && json.d) {
                                // now always edit!
                                that.setDataContact(json.d);
                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, recordId);
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
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.disableFields();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



