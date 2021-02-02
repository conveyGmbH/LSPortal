// controller for page: eventResourceAdministration
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/eventResourceAdministration/eventResourceAdministrationService.js" />
/// <reference path="~/www/lib/jstz/scripts/jstz.js" />

(function () {
    "use strict";
    WinJS.Namespace.define("EventResourceAdministration", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
            Application.Controller.apply(this, [pageElement, {
                eventResource: {
                    LabelTitle: "",
                    LabelDescription: "",
                    LabelMainTitle: "",
                    LabelSubTitle: "",
                    LabelSummary: "",
                    LabelBody: ""
                },
                eventUsageId: 0,
                eventId: 0,
                overView: { Email: "" }
            }, commandList]);

            this.eventTextUsageControl = null;
            this.eventResources = new WinJS.Binding.List([]);

            var that = this;

            var listLangMandantDokumentList = pageElement.querySelector("#listLangMandantDokumentList.listview");

            var resultConverter = function(item, index) {
                if (!item.NameTitle) {
                    item.NameTitle = "";
                }
                if (!item.NameDescription) {
                    item.NameDescription = "";
                }
                if (!item.NameMainTitle) {
                    item.NameMainTitle = "";
                }
                if (!item.NameSubTitle) {
                    item.NameSubTitle = "";
                }
                if (!item.NameSummary) {
                    item.NameSummary = "";
                }
                if (!item.NameBody) {
                    item.NameBody = "";
                }
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                AppData.setErrorMsg(that.binding);
                var restriction = {
                    LanguageSpecID: AppData.getLanguageId()
                };
                var ret = new WinJS.Promise.as().then(function () {
                    that.eventTextUsageControl = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("eventTextUsage"));
                    if (!that.eventTextUsageControl) {
                        var parentElement = pageElement.querySelector("#eventTextUsagehost");
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, "eventTextUsage", {});
                        } else {
                            return WinJS.Promise.as();
                        }
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (that.binding.eventUsageId && that.binding.eventUsageId <= 2 ||
                        that.binding.eventUsageId > 2 && that.binding.eventId) {
                        restriction.DokVerwendungID = that.binding.eventUsageId;
                        if (that.binding.eventUsageId > 2) {
                            restriction.VeranstaltungID = that.binding.eventId;
                        }
                        return EventResourceAdministration.LangMandantDokumentView.select(function (json) {
                            Log.print(Log.l.trace, "appInfoSpecView: success!");
                            if (json && json.d && json.d.results && json.d.results.length > 0) {
                                var results = json.d.results;
                                that.eventResources.length = 0;
                                results.forEach(function(item, index) {
                                    that.resultConverter(item, index);
                                    that.eventResources.push(item);
                                });
                                Log.print(Log.l.trace, "Data loaded");
                            } else {
                                that.eventResources.length = 0;
                            }
                            if (listLangMandantDokumentList && listLangMandantDokumentList.winControl) {
                                listLangMandantDokumentList.winControl.itemDataSource = that.eventResources.dataSource;
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, restriction); 
                    } else {
                        that.eventResources.length = 0;
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "EventResourceAdministration.Controller.");
                var ret = null;
                AppData.setErrorMsg(that.binding);
                // standard call via modify
                var recordId = that.prevRecId;
                if (!recordId) {
                    // called via canUnload
                    recordId = that.curRecId;
                }
                that.prevRecId = 0;
                if (recordId) {
                    var curScope = that.scopeFromRecordId(recordId);
                    if (curScope && curScope.item) {
                        var newRecord = that.getFieldEntries(curScope.index, curScope.item);
                        if (that.mergeRecord(curScope.item, newRecord) || AppBar.modified) {
                            Log.print(Log.l.trace, "save changes of recordId:" + recordId);
                            ret = EventResourceAdministration.LangMandantDokumentView.update(function (response) {
                                Log.print(Log.l.info, "questionListView update: success!");
                                if (that.eventResources) {
                                    that.resultConverter(curScope.item, curScope.index);
                                    that.eventResources.setAt(curScope.index, curScope.item);
                                }
                                //AppData.getUserData();
                                AppBar.modified = false;
                                // called asynchronously if ok
                                if (typeof complete === "function") {
                                    complete(response);
                                }
                            }, function (errorResponse) {
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (typeof error === "function") {
                                    error(errorResponse);
                                }
                            }, recordId, curScope.item);
                        } else {
                            Log.print(Log.l.trace, "no changes in recordId:" + recordId);
                        }
                    }
                }
                if (!ret) {
                    ret = new WinJS.Promise.as().then(function () {
                complete({});
                    });
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            };
            this.saveData = saveData;

            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Contact.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Info.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    } else {
                        Application.navigateById(Application.startPageId, event);
                    }
                    Log.ret(Log.l.trace);
                },
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "Info.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "Info.Controller.");
                    Application.navigateById("publish", event);
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
                /*clickOpenEdit: function (event) {
                    Log.call(Log.l.trace, "Account.Controller.");
                    //nameheader 
                    //namebottom
                    var namebottom = pageElement.querySelector("#namebottom");
                    if (event.currentTarget.id === "nameheader" && namebottom) {
                        if (namebottom.style.display === "") {
                            namebottom.style.display = "none";
                        } else {
                            namebottom.style.display = "";
                        }
                    }
                    Log.ret(Log.l.trace);
                },*/
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "QuestionList.Controller.");
                    if (eventInfo && eventInfo.target) {
                        var comboInputFocus = eventInfo.target.querySelector(".win-dropdown:focus");
                        if (comboInputFocus) {
                            eventInfo.preventDefault();
                        } else {
                            // set focus into textarea if current mouse cursor is inside of element position
                            var setFocusOnElement = function (element) {
                                WinJS.Promise.timeout(0).then(function () {
                                    // set focus async!
                                    element.focus();
                                });
                            };
                            var textInputs = eventInfo.target.querySelectorAll(".win-textbox");
                            if (textInputs && textInputs.length > 0) {
                                for (var i = 0; i < textInputs.length; i++) {
                                    var textInput = textInputs[i];
                                    var position = WinJS.Utilities.getPosition(textInput);
                                    if (position) {
                                        var left = position.left;
                                        var top = position.top;
                                        var width = position.width;
                                        var height = position.height;
                                        if (that.cursorPos.x >= left && that.cursorPos.x <= left + width &&
                                            that.cursorPos.y >= top && that.cursorPos.y <= top + height) {
                                            setFocusOnElement(textInput);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                }
            }

            this.disableHandlers = {
                clickOk: function () {
                    // always enabled!
                    return false;
                }
            }
            if (listLangMandantDokumentList) {
                this.addRemovableEventListener(listLangMandantDokumentList, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
            }
            AppData.setErrorMsg(this.binding);

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                AppBar.notifyModified = true;
                Log.print(Log.l.trace, "Binding wireup page complete");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



