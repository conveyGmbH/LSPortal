// controller for page: info
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/mailingTemplate/mailingTemplateService.js" />
/// <reference path="~/www/pages/siteEventsList/siteEventsListController.js" />
/// <reference path="~/www/fragments/empRoles/empRolesController.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("MailingTemplate", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "MailingTemplate.Controller.");
            Application.Controller.apply(this, [pageElement, {
                dataMailLayout: getEmptyDefaultValue(MailingTemplate.MailLayoutView.defaultValue),
                LanguageID : 0
            }, commandList]);

            var that = this;

            // select combo
            var initSprache = pageElement.querySelector("select[name=InitMailTemplateSprache]"); //querySelector('input[name="pwd"]');

            var setDataMailLayout = function (newDataMailLayout) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.dataMailLayout = newDataMailLayout;
                if (newDataMailLayout.LanguageSpecID) {
                    that.binding.LanguageID = newDataMailLayout.LanguageSpecID;
                }
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
            }
            this.setDataMailLayout = setDataMailLayout;
            
            var getRecordId = function () {
                Log.call(Log.l.trace, "MailingTemplate.Controller.");
                var recordId = that.binding.dataMailLayout && that.binding.dataMailLayout.MailLayoutVIEWID;
                Log.ret(Log.l.trace, recordId);
                return recordId;
            }
            this.getRecordId = getRecordId;

            /*var deleteData = function (complete, error) {
                Log.call(Log.l.trace, "Employee.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var recordId = getRecordId();
                if (recordId) {
                    AppBar.busy = true;
                    ret = MailingTypes.cr_Event_MailTypeView.deleteRecord(function (response) {
                        AppBar.busy = false;
                        // called asynchronously if ok
                        that.setDataEmployee(getEmptyDefaultValue(MailingTypes.cr_Event_MailTypeView.defaultValue));
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
            */

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "MailingTemplate.Controller.");
                    if (!Application.showMaster() && WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                /*clickNew: function (event) {
                    Log.call(Log.l.trace, "MailingTemplate.Controller.");
                    that.saveData(function (response) {
                        AppBar.busy = true;
                        Log.print(Log.l.trace, "MailingTemplate saved");
                       // var newEmployee = getEmptyDefaultValue(MailingTypes.cr_Event_MailTypeView.defaultValue);
                        MailingTypes.cr_Event_MailTypeView.insert(function (json) {
                            AppBar.busy = false;
                            // this callback will be called asynchronously
                            // when the response is available
                            Log.print(Log.l.info, "employeeView insert: success!");
                            // employeeView returns object already parsed from json file in response
                            if (json && json.d) {
                                that.setDataEmployee(json.d);
                                 //Mitarbeiter Liste neu laden und Selektion auf neue Zeile setzen 
                                var master = Application.navigator.masterControl;
                                if (master && master.controller && master.controller.binding) {
                                    master.controller.binding.employeeId = that.binding.dataEmployee.MitarbeiterVIEWID;
                                    master.controller.loadData().then(function () {
                                        master.controller.selectRecordId(that.binding.dataEmployee.MitarbeiterVIEWID);
                                    });
                                }
                            }
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "error inserting employee");
                            AppBar.busy = false;
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, newEmployee);
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving MailingTemplate");
                    });
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "MailingTemplate.Controller.");
                    var confirmTitle = getResourceText("employee.questionDelete");
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            Log.print(Log.l.trace, "clickDelete: user choice OK");
                            deleteData(function (response) {
                                 Mitarbeiter Liste neu laden und Selektion auf neue Zeile setzen 
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
                },*/
                clickOk: function (event) {
                    Log.call(Log.l.trace, "MailingTemplate.Controller.");
                    if (!that.binding.dataMailLayout.MailLayoutVIEWID) {
                        if (!that.binding.dataMailLayout.MailTypeID) {
                            that.binding.dataMailLayout.MailTypeID = AppData.getRecordId("MailType");
                        }
                        if (!that.binding.dataMailLayout.VeranstaltungTerminID) {
                            that.binding.dataMailLayout.VeranstaltungTerminID = AppData.getRecordId("VeranstaltungTermin");
                        }
                        if (!that.binding.dataMailLayout.LanguageSpecID) {
                            that.binding.dataMailLayout.LanguageSpecID = that.binding.LanguageID;
                        }
                        return MailingTemplate.MailLayoutView.insert(function (json) {
                                AppBar.busy = false;
                                AppBar.modified = false;
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.info, "record insert: success!");
                                // contactData returns object already parsed from json file in response
                                if (json && json.d) {
                                    //that.curRecId = that.tableView.getRecordId(json.d);
                                    //Log.print(Log.l.trace, "inserted recordId=" + that.curRecIdd);
                                    //AppData.setRecordId(that.tableView.relationName, that.curRecId);
                                    that.loadData(AppData.getRecordId("VeranstaltungTermin"),
                                        AppData.getRecordId("MailType"),
                                        that.binding.dataMailLayout.LanguageID);
                                }
                            },
                            function(errorResponse) {
                                Log.print(Log.l.error, "error inserting product");
                                AppBar.busy = false;
                                AppData.setErrorMsg(that.binding, errorResponse);
                            },
                            that.binding.dataMailLayout);
                    } else {
                        that.saveData(function (response) {
                            Log.print(Log.l.trace, "MailingTemplate saved");
                            if (typeof that.binding.LanguageID === "string") {
                                that.binding.LanguageID = parseInt(that.binding.LanguageID);
                            }
                            // that.loadData(AppData.getRecordId("VeranstaltungTermin"), AppData.getRecordId("MailType"), that.binding.dataMailLayout.LanguageID); //, parseInt(event.currentTarget.value)
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "error saving MailingTemplate");
                        });
                    }

                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "MailingTemplate.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "MailingTemplate.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "MailingTemplate.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "MailingTemplate.Controller.");
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
                changedLanguageMailTemplate: function (event) {
                        Log.call(Log.l.trace, "MailingTemplate.Controller.");
                        //AppBar.modified = true;
                        //AppData.setRecordId("MailType", event.currentTarget.value);
                        that.loadData(AppData.getRecordId("VeranstaltungTermin"), AppData.getRecordId("MailType"), parseInt(event.currentTarget.value)); //, parseInt(event.currentTarget.value)
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
               /* clickNew: function () {
                    if (that.binding.dataEmployee && that.binding.dataEmployee.CR_Event_MailTypeVIEWID && !AppBar.busy) {
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding &&
                            master.controller.binding.eventId) {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                },*/
                /*clickDelete: function () {
                    if (that.binding.dataEmployee && that.binding.dataEmployee.CR_Event_MailTypeVIEWID && !AppBar.busy &&
                        that.binding.dataEmployee.EventID === AppData.getRecordId("VeranstaltungTermin")) {
                        var master = Application.navigator.masterControl;
                        if (master && master.controller && master.controller.binding &&
                            master.controller.binding.eventId) {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                },*/
                clickOk: function () {
                    if ((that.binding.dataMailLayout.LanguageSpecID || that.binding.LanguageID) && that.binding.dataMailLayout.MailTextTemplate.length > 0)
                        return false;
                    else
                        return true;
                }
            };

            var loadData = function (eventId, mailTypeId, languageId) {
                Log.call(Log.l.trace, "MailingTemplate.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (AppBar.modified) {
                        /*return that.saveData(function () {
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
                        });*/
                        return WinJS.Promise.as();
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (!MailingTemplate.initSpracheView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initSpracheView...");
                        //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                        return MailingTemplate.initSpracheView.select(function (json) {
                            Log.print(Log.l.trace, "initSpracheView: success!");
                            if (json && json.d && json.d.results) {
                                var firstItem = [{LanguageID:0, TITLE:""}];
                                var results = firstItem.concat(json.d.results);

                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initSprache && initSprache.winControl) {
                                    initSprache.winControl.data = new WinJS.Binding.List(results);
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                    } else {
                        if (initSprache && initSprache.winControl &&
                            (!initSprache.winControl.data || !initSprache.winControl.data.length)) {
                            var firstItem = [{LanguageID: 0, TITLE: ""}];
                            var results = firstItem.concat(MailingTemplate.initSpracheView.getResults());
                            initSprache.winControl.data = new WinJS.Binding.List(results);
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (eventId && mailTypeId && languageId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select MailLayoutView_20571...");
                        return MailingTemplate.MailLayoutView_20571.select(function (json) {
                                AppData.setErrorMsg(that.binding);
                                Log.print(Log.l.trace, "MailLayoutView_20571: success!");
                                if (json && json.d && json.d.results.length > 0) {
                                    // now always edit!
                                    that.setDataMailLayout(json.d.results[0]);

                                } else {
                                    that.setDataMailLayout(getEmptyDefaultValue(MailingTemplate.MailLayoutView.defaultValue));
                                }
                            },
                            function(errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                            },
                            { MailTypeID: mailTypeId, VeranstaltungTerminID: eventId, LanguageSpecID: languageId });
                    } else {
                        initSprache.value = 0;
                        that.setDataMailLayout(getEmptyDefaultValue(MailingTemplate.MailLayoutView.defaultValue));
                        return WinJS.Promise.as();
                    }
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
                Log.call(Log.l.trace, "MailingTemplate.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                that.binding.dataMailLayout.LanguageID = parseInt(that.binding.dataMailLayout.LanguageID);
                var dataMailLayout = that.binding.dataMailLayout;
                if (dataMailLayout && AppBar.modified && !AppBar.busy) {
                    // provísorisch rein
                    var recordId = that.getRecordId();
                        if (recordId) {
                            AppBar.busy = true;
                            ret = MailingTemplate.MailLayoutView.update(function (response) {
                                AppBar.busy = false;
                                // called asynchronously if ok
                                Log.print(Log.l.info, "MailLayoutData update: success!");
                                AppBar.modified = false;
                                
                            }, function (errorResponse) {
                                AppBar.busy = false;
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                error(errorResponse);
                            }, recordId, dataMailLayout);
                        } else {
                            Log.print(Log.l.info, "not supported");
                            ret = WinJS.Promise.as();
                        }
                    ret = new WinJS.Promise.as().then(function () {
                        complete(dataMailLayout);
                    });
                } else if (AppBar.busy) {
                    ret = WinJS.Promise.timeout(100).then(function () {
                        return that.saveData(complete, error);
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        complete(dataMailLayout);
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData(AppData.getRecordId("VeranstaltungTermin"), AppData.getRecordId("MailType")); // MailType
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



