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
                dataLayoutLang: 0,
                dataLayoutActive: getEmptyDefaultValue(MailingTemplateEventEdit.VAMailLayout.getLayoutActive)
            }, commandList]);


            var that = this;
            var initSprache = pageElement.querySelector("#InitSprache");
            var mailType = pageElement.querySelector("#mailType");
            var layoutActiveToggle = pageElement.querySelector("#layoutActiveToggle");

            var getRecordId = function () {
                Log.call(Log.l.trace, "Contact.Controller.");
                var recordId = AppData.getRecordId("VAMail");
                Log.ret(Log.l.trace, recordId);
                return recordId;
            }
            this.getRecordId = getRecordId;

            var setLayoutData = function (layoutdata) {
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

            var setPrevData = function () {
                Log.call(Log.l.trace, "Contact.Controller.");
                var lang = parseInt(initSprache.value);
                if (lang !== "null") {
                    Log.call(Log.l.trace, "Contact.Controller.");

                }
            }
            this.setPrevData = setPrevData;

            var selectData = function () {
                Log.call(Log.l.trace, "Contact.Controller.");
                AppData.setErrorMsg(that.binding);
                var lang = parseInt(initSprache.value);
                var recordId = getRecordId(); // get VAMailLayoutID
                if (recordId) {
                    AppData.setErrorMsg(that.binding);
                    return AppData.call("PRC_GetVAMailText", {
                        pVAMailLayoutID: recordId,
                        pLanguageSpecID: lang
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        that.layoutData = json.d.results[0].VAMailTextID;
                        //return that.loadData();
                        Log.ret(Log.l.trace);
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    error(err);
                    return WinJS.Promise.as();
                }
            };
            this.selectData = selectData;

            var setToggleData = function (event) {
                Log.call(Log.l.trace, "Products.Controller.");
                var stat = event.currentTarget.winControl.checked;
                if (stat === false) {
                    that.binding.dataLayoutActive.IsActive = null;
                }
                if (stat === true) {
                    that.binding.dataLayoutActive.IsActive = parseInt(1);
                }
                Log.ret(Log.l.trace);
            }
            this.setToggleData = setToggleData;

            var saveToggleData = function () {
                Log.call(Log.l.trace, "Products.Controller.");
                var ret = null;
                Log.call(Log.l.trace, "Product.Controller.");
                AppData.setErrorMsg(that.binding);
                var layoutActiveData = that.binding.dataLayoutActive;
                var recordId = getRecordId();
                if (recordId) {
                    Log.print(Log.l.trace, "save changes of recordId:" + recordId);
                    ret = MailingTemplateEventEdit.VAMailLayout.update(function (response) {
                        Log.print(Log.l.info, "Products.Controller. update: success!");
                        // called asynchronously if ok
                        AppBar.modified = false;
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, recordId, layoutActiveData);
                }
                if (!ret) {
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete({});
                        }
                    });
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveToggleData = saveToggleData;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Products.Controller.");
                var ret = null;
                Log.call(Log.l.trace, "Product.Controller.");
                AppData.setErrorMsg(that.binding);
                var layoutUpdateData = that.binding.dataLayoutValue;
                if (layoutUpdateData.Subject === "" && layoutUpdateData.MailText === "") {
                    Log.print(Log.l.trace, "layoutUpdateData.Subject and layoutUpdateData.MailText empty!");
                    ret = new WinJS.Promise.as().then(function () {
                        if (typeof complete === "function") {
                            complete({});
                        }
                    });
                } else {
                    var recordId = that.binding.dataLayoutValue.VAMailTextVIEWID;
                    if (recordId && layoutUpdateData.LanguageSpecID) {
                        Log.print(Log.l.trace, "save changes of recordId:" + recordId);
                        ret = MailingTemplateEventEdit.VAMailTextView.update(function (response) {
                            Log.print(Log.l.info, "Products.Controller. update: success!");
                            // called asynchronously if ok
                            AppBar.modified = false;
                            if (typeof complete === "function") {
                                complete(response);
                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                            if (typeof error === "function") {
                                error(errorResponse);
                            }
                        }, recordId, layoutUpdateData);
                    }
                    if (!ret) {
                        ret = new WinJS.Promise.as().then(function () {
                            if (typeof complete === "function") {
                                complete({});
                            }
                        });
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            }
            this.saveData = saveData;

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
                    that.loadData();
                    Log.ret(Log.l.trace);
                },
                onLayoutActiveToggle: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    AppBar.modified = true;
                    that.setToggleData(event);
                    that.saveToggleData();
                    Log.ret(Log.l.trace);
                },
                setPrevData: function (parameters) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "layout saved");
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving layout");
                    });
                    Log.ret(Log.l.trace);
                },
                clickSave: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    that.saveData(function (response) {
                        Log.print(Log.l.trace, "layout saved");
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error saving layout");
                    });
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
                this.addRemovableEventListener(initSprache, "click", this.eventHandlers.setPrevData.bind(this));
            }
            if (layoutActiveToggle) {
                this.addRemovableEventListener(layoutActiveToggle, "click", this.eventHandlers.onLayoutActiveToggle.bind(this));
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
                                // Now, we call WinJS.Binding.List to get the bindable list
                                if (initSprache && initSprache.winControl) {
                                    initSprache.winControl.data = new WinJS.Binding.List(results);
                                    for (var i = 0; i < results.length; i++) {
                                        if (results[i].LanguageID === 1031) {
                                            initSprache.selectedIndex = i;
                                        }
                                    }
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
                            for (var i = 0; i < results.length; i++) {
                                if (results[i].LanguageID === 1031) {
                                    initSprache.selectedIndex = i;
                                }
                            }
                        }
                        return WinJS.Promise.as();
                    }
                })/*.then(function () {
                    Log.print(Log.l.trace, "calling select LangVAMailTypeView...");
                    return MailingTemplateEventEdit.LangVAMailTypeView.select(function (json) {
                        Log.print(Log.l.trace, "LangVAMailTypeView: success!");
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
                })*/.then(function () {
                    return that.selectData();
                }).then(function () {
                    if (that.layoutData) {
                        Log.print(Log.l.trace, "calling select VAMailTextView...");
                        //@nedra:25.09.2015: load the list of INITAnrede for Combobox
                        return MailingTemplateEventEdit.VAMailTextView.select(function(json) {
                                Log.print(Log.l.trace, "initAnredeView: success!");
                                if (json && json.d && json.d.results) {
                                    // Now, we call WinJS.Binding.List to get the bindable list
                                    that.binding.dataLayoutValue = json.d.results[0];
                                }
                            }, function(errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                            }, { VAMailTextVIEWID: that.layoutData, LanguageSpecID: parseInt(initSprache.value) });
                    }
                }).then(function () {
                    Log.print(Log.l.trace, "calling select VAMailLayout...");
                    var layoutid = getRecordId();
                    return MailingTemplateEventEdit.VAMailLayout.select(function (json) {
                        Log.print(Log.l.trace, "VAMailLayout: success!");
                        if (json && json.d && json.d.results) {
                            // Now, we call WinJS.Binding.List to get the bindable list
                            that.binding.dataLayoutActive = json.d.results[0];
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, { VAMailLayoutVIEWID: layoutid });
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
            preId: 0,
            layoutData: 0
        })
    });
})();