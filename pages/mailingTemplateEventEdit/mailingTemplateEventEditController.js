// controller for page: mailingList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/mailingTemplateEventEdit/mailingTemplateEventEditService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("MailingTemplateEventEdit", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "MailingTemplateEvent.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                dataLayoutValue: getEmptyDefaultValue(MailingTemplateEventEdit.VAMailLayout.getRestriction),
                dataLayoutLang: 0
            }, commandList]);
            

            var that = this;
            var initSprache = pageElement.querySelector("#InitSprache"); 
            var mailType = pageElement.querySelector("#mailType"); 

            var getRecordId = function () {
                Log.call(Log.l.trace, "Contact.Controller.");
                var recordId = AppData.getRecordId("VAMail");
                Log.ret(Log.l.trace, recordId);
                return recordId;
            }
            this.getRecordId = getRecordId;

            var setLayoutData = function(layoutdata) {
                Log.call(Log.l.trace, "Contact.Controller.");
                if (layoutdata.Subject) {
                    that.binding.dataLayoutValue.Subject = layoutdata.Subject;
                } else {
                    that.binding.dataLayoutValue.Subject = "";
                }
                if (layoutdata.Mailtext) {
                    that.binding.dataLayoutValue.LayoutText = layoutdata.Mailtext;
                } else {
                    that.binding.dataLayoutValue.LayoutText = "";
                }
            }
            this.setLayoutData = setLayoutData;

            var selectData = function (complete, error) {
                Log.call(Log.l.trace, "Contact.Controller.");
                AppData.setErrorMsg(that.binding);
                var lang = parseInt(initSprache.value);
                var recordId = getRecordId();
                if (recordId) {
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_GetVAMailText", {
                        pVAMailLayoutID: recordId,
                        pLanguageSpecID: lang
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        that.setLayoutData(json.d.results[0]);
                        Log.call(Log.l.trace, "Contact.Controller.");
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                }
                Log.ret(Log.l.trace);
            };
            this.selectData = selectData;

            var insertData = function (complete, error) {
                Log.call(Log.l.trace, "Contact.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret;
                var recordId = getRecordId();
                if (recordId && initSprache.value !== "null") {
                    AppData.setErrorMsg(that.binding);
                    ret = AppData.call("PRC_SetVAMailText", {
                        pVAMailLayoutID: recordId,
                        pLanguageSpecID: parseInt(initSprache.value),
                        pSubject: that.binding.dataLayoutValue.Subject,
                        pMailText: that.binding.dataLayoutValue.LayoutText
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        complete(json.d.results[0]);
                        Log.call(Log.l.trace, "Contact.Controller.");
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                        error(error);
                    });
                } else {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete(recordId);
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            };
            this.insertData = insertData;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                selectionChange: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    that.selectData();
                    Log.ret(Log.l.trace);
                },
                clickSave: function(event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    that.insertData();
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                clickTopButton: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    var anchor = document.getElementById("menuButton");
                    var menu = document.getElementById("menu1").winControl;
                    var placement = "bottom";
                    menu.show(anchor, placement);
                    Log.ret(Log.l.trace);
                },
                clickLogoff: function (event) {
                    Log.call(Log.l.trace, "ContactResultList.Controller.");
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

            if (initSprache) {
                this.addRemovableEventListener(initSprache, "change", this.eventHandlers.selectionChange.bind(this));
            }
            
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
            
            var resultConverter = function (item, index) {
                item.index = index;

            }
            this.resultConverter = resultConverter;
            
            var loadData = function (restr) {
                Log.call(Log.l.trace, "MailingTypes.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!MailingTemplateEventEdit.initSpracheView.getResults().length) {
                        Log.print(Log.l.trace, "calling select initSpracheView...");
                        //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                        return MailingTemplateEventEdit.initSpracheView.select(function (json) {
                            Log.print(Log.l.trace, "initSpracheView: success!");
                            if (json && json.d && json.d.results) {
                                var results = json.d.results;
                                results = results.concat({ INITSpracheID: 0, TITLE: "DEFAULT" });
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initSprache && initSprache.winControl) {
                                    initSprache.winControl.data = new WinJS.Binding.List(results);
                                    initSprache.selectedIndex = 0;
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
                            var results = MailingTemplateEventEdit.initSpracheView.getResults();
                            initSprache.winControl.data = new WinJS.Binding.List(results);
                            initSprache.selectedIndex = 0;
                        }
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                        Log.print(Log.l.trace, "calling select initAnredeData...");
                        //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                        return MailingTemplateEventEdit.LangVAMailTypeView.select(function (json) {
                            Log.print(Log.l.trace, "initAnredeView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (mailType && mailType.winControl) {
                                    mailType.winControl.data = new WinJS.Binding.List(json.d.results);
                                    mailType.selectedIndex = 0;
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                            }, { LanguageSpecID: AppData.getLanguageId() });
                }).then(function () {
                    return WinJS.Promise.timeout(100);
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