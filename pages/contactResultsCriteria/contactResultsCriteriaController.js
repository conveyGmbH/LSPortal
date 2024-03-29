﻿// controller for page: localevents
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/contactResultsCriteria/contactResultsCriteriaService.js" />

(function () {
    "use strict";

    var namespaceName = "ContactResultsCriteria";

    WinJS.Namespace.define("ContactResultsCriteria", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                dataContact: null,
                dataContactCriteria: null
            }, commandList]);

            var that = this;

            var initPrio = pageElement.querySelector("#InitPrio");
            var initTyp = pageElement.querySelector("#InitTyp");

            var getRecordId = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var recordId = AppData.getRecordId("Kontakt");
                Log.ret(Log.l.trace, recordId);
                return recordId;
            }
            this.getRecordId = getRecordId;

            var resultConverter = function (item, index) {
                item.fullName = "";
                if (item.Anrede) {
                    item.fullName += item.Anrede + " ";
                }
                if (item.Vorname) {
                    item.fullName += item.Vorname + " ";
                }
                if (item.Name) {
                    item.fullName += item.Name;
                }
            }
            this.resultConverter = resultConverter;

            var setDataContact = function (data) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                that.resultConverter(data);
                that.binding.dataContact = data;
            }
            this.setDataContact = setDataContact;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.saveData(function (response) {
                        // called asynchronously if ok
                        that.loadData();
                    }, function (errorResponse) {
                        // error already displayed
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
                clickGotoPublish: function () {
                    return true;
                }
            };

            // save data
            var saveData = function (complete, error) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var dataContactCriteria = that.binding.dataContactCriteria;
                if (dataContactCriteria.INKontaktPrioID) {
                    dataContactCriteria.INKontaktPrioID = parseInt(dataContactCriteria.INKontaktPrioID);
                }
                if (dataContactCriteria.INKontaktTypID) {
                    dataContactCriteria.INKontaktTypID = parseInt(dataContactCriteria.INKontaktTypID);
                }
                if (dataContactCriteria && AppBar.modified && !AppBar.busy) {
                    var recordId = getRecordId();
                    AppBar.busy = true;
                    ret = ContactResultsCriteria.kontaktKriterienView.update(function (response) {
                        AppBar.busy = false;
                        // called asynchronously if ok
                        Log.print(Log.l.info, "ContactResultsCriteria update: success!");
                        AppBar.modified = false;
                        if (typeof complete === "function") {
                            complete(response);
                        }
                    }, function (errorResponse) {
                        AppBar.busy = false;
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (typeof error === "function") {
                            error(errorResponse);
                        }
                    }, recordId, dataContactCriteria);
                } else if (AppBar.busy) {
                    ret = WinJS.Promise.timeout(100).then(function () {
                        return that.saveData(complete, error);
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete(dataContact);//dataContact
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            var loadData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (initPrio &&
                        initPrio.winControl &&
                        (!initPrio.winControl.data || !initPrio.winControl.data.length)) {
                        Log.print(Log.l.trace, "calling select langINKontaktPrioView...");
                        return ContactResultsCriteria.langINKontaktPrioView.select(function (json) {
                            Log.print(Log.l.trace, "select langINKontaktPrioView: success!");
                            if (json && json.d && json.d.results) {
                                var results = json.d.results;
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initPrio && initPrio.winControl) {
                                    initPrio.winControl.data = new WinJS.Binding.List(results);
                                }
                                initPrio.selectedIndex = 0;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            Log.print(Log.l.error, "select langINKontaktPrioView: error!");
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, { LanguageSpecID: AppData.getLanguageId() });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (initTyp &&
                        initTyp.winControl &&
                        (!initTyp.winControl.data || !initTyp.winControl.data.length)) {
                        Log.print(Log.l.trace, "calling select langINKontaktTypView... recordId=" + recordId);
                        return ContactResultsCriteria.langINKontaktTypView.select(function (json) {
                            Log.print(Log.l.trace, "select langINKontaktTypView: success!");
                            if (json && json.d && json.d.results) {
                                var results = json.d.results;
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initTyp && initTyp.winControl) {
                                    initTyp.winControl.data = new WinJS.Binding.List(results);
                                }
                                initTyp.selectedIndex = 0;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            Log.print(Log.l.error, "select langINKontaktTypView: error!");
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, { LanguageSpecID: AppData.getLanguageId() });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    var recordId = getRecordId();
                    if (recordId) {
                        Log.print(Log.l.trace, "calling select contactView...");
                        return ContactResultsCriteria.contactView.select(function(json) {
                            Log.print(Log.l.trace, "select contactView: success!");
                            if (json && json.d) {
                                // now always edit!
                                var result = json.d;
                                that.setDataContact(result);
                            }
                        },
                        function(errorResponse) {
                            Log.print(Log.l.error, "select contactView: error!");
                            AppData.setErrorMsg(that.binding, errorResponse);
                        },
                        recordId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    var recordId = getRecordId();
                    if (recordId) {
                        Log.print(Log.l.trace, "calling select kontaktKriterienView... recordId=" + recordId);
                        return ContactResultsCriteria.kontaktKriterienView.select(function (json) {
                            Log.print(Log.l.trace, "kontaktKriterienView: success!");
                            if (json && json.d) {
                                // now always edit!
                                var result = json.d;
                                that.binding.dataContactCriteria = result;
                            }
                        }, function (errorResponse) {
                            Log.print(Log.l.error, "kontaktKriterienView: error!");
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, recordId);
                    } else {
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

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        }, {
        })
    });
})();