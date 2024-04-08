// controller for page: genDataUserInfo
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/genDataUserInfo/genDataUserInfoService.js" />


(function () {
    "use strict";

    WinJS.Namespace.define("GenDataUserInfo", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataBenutzer: GenDataUserInfo.benutzerView && getEmptyDefaultValue(GenDataUserInfo.benutzerView.defaultValue),
                InitAnredeItem: { InitAnredeID: 0, TITLE: "" },
                InitLandItem: { InitLandID: 0, TITLE: "" },
                photoData: "",
                newInfo2Flag: 0,
                visitorFlowFeature: AppData._persistentStates.showvisitorFlow === 1 ||
                    AppData._persistentStates.showvisitorFlow === 2
                    ? true
                    : false
            }, commandList]);
            
            var that = this;

            // show business card photo
            

            // toggle
            
            // select element
            var initAnrede = pageElement.querySelector("#InitAnrede");
            var initLand = pageElement.querySelector("#InitLand");
            var dropZone = pageElement.querySelector("#dropzone");
            
            // upload photo
            var loadUpload = function () {
                var recordId = that.getRecordId();
                Log.call(Log.l.trace, "GenDataUserInfo.Controller.", "recordId=" + recordId);
                var ret = null;
                var uploadMediaFragmentControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("uploadUserPhoto"));
                if (uploadMediaFragmentControl && uploadMediaFragmentControl.controller &&
                    typeof uploadMediaFragmentControl.controller.setDocId === "function") {
                    uploadMediaFragmentControl.controller.setDocId(recordId);
                } else {
                    var parentElement = pageElement.querySelector("#uploadMediahost");
                    if (parentElement) {
                        ret = Application.loadFragmentById(parentElement, "uploadUserPhoto", {
                            docId: recordId
                        });
                    }
                }
                Log.ret(Log.l.trace);
                return ret || WinJS.Promise.as();
            }
            this.loadUpload = loadUpload;

            var setDataBenutzer = function (newDataBenutzer) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                if (newDataBenutzer.Info1 === null) {
                    newDataBenutzer.Info1 = "";
                }
                if (newDataBenutzer.Info2 && !newDataBenutzer.Info2TSRead) {
                    that.binding.newInfo2Flag = 1;
                } else {
                    that.binding.newInfo2Flag = 0;
                }
                that.binding.dataBenutzer = newDataBenutzer;
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
            };
            this.setDataBenutzer = setDataBenutzer;

            var setInitLandItem = function (newInitLandItem) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.InitLandItem = newInitLandItem;
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                Log.ret(Log.l.trace);
            }
            this.setInitLandItem = setInitLandItem;

            var setInitAnredeItem = function (newInitAnredeItem) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.InitAnredeItem = newInitAnredeItem;
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                Log.ret(Log.l.trace);
            }
            this.setInitAnredeItem = setInitAnredeItem;

            var getRecordId = function () {
                var recordId = null;
                Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
                var master = Application.navigator.masterControl;
                if (master && master.controller && master.controller.binding) {
                    recordId = master.controller.binding.employeeId; 
                }
                Log.ret(Log.l.trace, recordId);
                return recordId;
            }
            this.getRecordId = getRecordId;

            var loadData = function () {
                var recordId = getRecordId();
                Log.call(Log.l.trace, "GenDataUserInfo.Controller.", "recordId=" + recordId);
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!AppData.initAnredeView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initAnredeView...");
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
                            Log.print(Log.l.error, "initAnredeView: error!");
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
                        Log.print(Log.l.trace, "calling select initLandView...");
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
                            Log.print(Log.l.error, "initLandView: error!");
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
                        Log.print(Log.l.trace, "calling select benutzerView...");
                        return GenDataUserInfo.benutzerView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "benutzerView: success!");
                            if (json && json.d) {
                                that.setDataBenutzer(json.d);
                            }
                        }, function (errorResponse) {
                            if (errorResponse.status === 404) {
                                // ignore NOT_FOUND error here!
                                that.setDataBenutzer(getEmptyDefaultValue(GenDataUserInfo.benutzerView.defaultValue));
                            } else {
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }
                        }, recordId);
                    } else {
                        that.setDataBenutzer(getEmptyDefaultValue(genDataUserInfo.benutzerView.defaultValue));
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (recordId) {
                        // todo: load image data and set src of img-element
                        Log.print(Log.l.trace, "calling select contactView...");
                        return GenDataUserInfo.userPhotoView.select(function (json) {
                            Log.print(Log.l.trace, "userPhotoView: success!");
                            if (json && json.d) {
                                that.binding.dataPhoto = json.d;
                                Log.print(Log.l.info, "DOC1MitarbeiterVIEWID=" + json.d.DOC1MitarbeiterVIEWID);
                                var docContent = json.d.DocContentDOCCNT1;
                                if (docContent) {
                                    var sub = docContent.search("\r\n\r\n");
                                    if (sub >= 0) {
                                        var newContent = docContent.substr(sub + 4);
                                        if (newContent && newContent !== "null") {
                                            if (!that.binding.photoData || that.binding.photoData !== newContent) {
                                                that.binding.photoData = newContent;
                                            }
                                        } else {
                                            that.binding.photoData = "";
                                        }
                                    } else {
                                        that.binding.photoData = "";
                                    }
                                } else {
                                    that.binding.photoData = "";
                                }
                            } else {
                                that.binding.photoData = "";
                            }
                        }, function (errorResponse) {
                            // ignore that
                            that.binding.photoData = "";
                        }, recordId);
                    } else {
                        that.binding.photoData = "";
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (!that.binding.photoData) {
                        loadUpload();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var saveData = function (complete, error) {
                var recordId = getRecordId();
                Log.call(Log.l.trace, "GenDataUserInfo.Controller.", "recordId=" + recordId);
                AppData.setErrorMsg(that.binding);
                var ret;
                var dataBenutzer = that.binding.dataBenutzer;
                if (dataBenutzer && AppBar.modified && recordId) {
                    ret = GenDataUserInfo.benutzerView.update(function (response) {
                            // called asynchronously if ok
                            // force reload of userData for Present flag
                            AppBar.modified = false;
                            AppData.getUserData();
                            complete(response);
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            error(errorResponse);
                        }, recordId, dataBenutzer);
                    
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        complete(dataBenutzer);
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.saveData = saveData;

            
            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
                    var newEmployeeId = null;
                    that.saveData(function (response) {
                        AppBar.busy = true;
                        Log.print(Log.l.trace, "eployee saved");
                        //var newEmployee = getEmptyDefaultValue(GenDataEmployee.employeeView.defaultValue);
                        var newEmployee = copyByValue(GenDataUserInfo.employeeView.defaultValue);
                        /* var restriction = {
                             OrderAttribute: ["Nachname"],
                             OrderDesc: false
                         };
                         AppData.setRestriction("Employee", restriction);*/
                        return GenDataUserInfo.employeeView.insert(function (json) {
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
                                        item.LogInNameAfterAtSymbol = userName.substr(item.Login.lastIndexOf("@"));
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
                    Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
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
                    Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "employee saved");
                        that.loadData();
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving employee");
                    });
                    Log.ret(Log.l.trace);
                },
                handleFileChoose: function (event) {
                    if (event && event.target) {
                        // FileList-Objekt des input-Elements auslesen, auf dem 
                        // das change-Event ausgelöst wurde (event.target)
                        var files = event.target.files;
                        for (var i = 0; i < files.length; i++) {
                            getFileData(files[i], files[i].name, files[i].type, files[i].size);
                        }
                    }
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
                    Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                changeLogin: function (event) {
                    Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
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
                    Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
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
                    Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
                    if (event.currentTarget && AppBar.notifyModified) {
                        that.binding.dataEmployee.Password = "";
                        that.binding.dataEmployee.Password2 = "";
                        that.binding.dataEmployee.Login = that.binding.dataEmployee.LogInNameBeforeAtSymbol + event.currentTarget.value;
                    }
                    Log.ret(Log.l.trace);
                },
                changePassword: function (event) {
                    Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
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
                    if (master && master.controller) {
                        master.controller.loadData();
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
                    Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
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
                    Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
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
                    Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
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
                        AppHeader.controller.binding.userData = {
                            VeranstaltungName: ""
                        };
                    }
                    Application.navigateById("login", event);
                    Log.ret(Log.l.trace);
                },
                clickChangeLogin: function (event) {
                    Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
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
                clickOk: function () {
                    // always enabled!
                    return false;
                },
                clickVcard: function () {
                    // always enabled!
                    return false;
                },
                clickPhoto: function () {
                    if (AppBar.busy) {
                        return true;
                    } else {
                        return false;
                    }
                }
            };

            var deletePhotoData = function (complete, error) {
                var recordId = getRecordId();
                Log.call(Log.l.trace, "GenDataUserInfo.Controller.");
                var ret = GenDataUserInfo.deleteRecord(function (json) {
                    Log.print(Log.l.trace, "GenDataUserInfo: delete success!");
                    if (typeof complete === "function") {
                        complete(json);
                    }
                }, function (errorResponse) {
                    Log.print(Log.l.error, "GenDataUserInfo: delete error!");
                    AppData.setErrorMsg(that.binding, errorResponse);
                    if (typeof error === "function") {
                        error(errorResponse);
                    }
                }, that.binding.docId);
                Log.ret(Log.l.trace);
                return ret;
           }
           that.deletePhotoData = deletePhotoData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
                return WinJS.Promise.as();
            });
            Log.ret(Log.l.trace);
        })
    });
})();

