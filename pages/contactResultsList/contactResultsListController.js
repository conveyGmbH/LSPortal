﻿// controller for page: localevents
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/contactResultsList/contactResultsListService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var namespaceName = "ContactResultsList";

    WinJS.Namespace.define("ContactResultsList", {
        Controller: WinJS.Class.derive(Application.RecordsetController, function Controller(pageElement, commandList, isMaster) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            // ListView control
            var listView = pageElement.querySelector("#contactResultsList.listview");
            this.listView = listView;
            Application.RecordsetController.apply(this, [pageElement, {
                contactId: null,
                noctcount: 0,
                searchString: "",
                btnFlag: false
            }, commandList, isMaster, null, ContactResultsList.contactResultsView, listView]);

            var that = this;

            var layout = null;

            that.loadDataDelayedPromise = null;

            this.dispose = function () {
                ContactResultsList._prevJson = null;
                ContactResultsList._collator = null;
            }

            var getEventId = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                Log.ret(Log.l.trace, ContactResultsList._eventId);
                return ContactResultsList._eventId;
            }
            this.getEventId = getEventId;

            var setEventId = function (value) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "eventId=" + value);
                ContactResultsList._eventId = value;
                Log.ret(Log.l.trace);
            }
            this.setEventId = setEventId;

            var setTooltips = function() {
                var companyname = pageElement.querySelector("#Firmenname");
                var lastmodified = pageElement.querySelector("#ModifiedTS");
                var welcomemail = pageElement.querySelector("#WelcomeMailTS");
                var mail = pageElement.querySelector("#MailVersandTS");
                if (companyname && lastmodified) {
                    companyname.title = getResourceText("tooltip.companyname");
                    lastmodified.title = getResourceText("tooltip.lastmodified");
                    welcomemail.title = getResourceText("tooltip.welcomeemailversandtzeit");
                    mail.title = getResourceText("tooltip.headeremailversandtzeit");
                }
            }
            this.setTooltips = setTooltips;

            var loadDataDelayed = function(searchString) {
               if (that.loadDataDelayedPromise) {
                    that.loadDataDelayedPromise.cancel();
                    that.removeDisposablePromise(that.loadDataDelayedPromise);
                }
                that.loadDataDelayedPromise = WinJS.Promise.timeout(450).then(function () {
                    that.loadData(searchString);
                });
                that.addDisposablePromise(that.loadDataDelayedPromise);
            }
            this.loadDataDelayed = loadDataDelayed;

            var deleteData = function (complete, error) {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.setErrorMsg(that.binding);
                var recordId = that.curRecId;
                if (recordId) {
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_DeleteKontakt", {
                        pKontaktID: recordId
                    }, function (json) {
                        Log.print(Log.l.info, "call PRC_DeleteKontakt success! ");
                        if (typeof complete === "function") {
                            complete(json);
                        }
                    }, function (errorResponse) {
                        Log.print(Log.l.error, "call PRC_DeleteKontakt error");
                        if (typeof error === "function") {
                            error(errorResponse);
                        }
                    });
                } else {
                    var err = { status: 0, statusText: "no record selected" };
                    if (typeof error === "function") {
                        error(err);
                    }
                }
                Log.ret(Log.l.trace);
            };
            this.deleteData = deleteData;

            var resultConverter = function (item, index) {
                item.index = index;
                if (!item.Name) {
                    item.Name = "";
                }
                if (!item.Vorname) {
                    item.Vorname = "";
                }
                if (!item.Firmenname) {
                    item.Firmenname = "";
                }
                if (!item.EMail) {
                    item.EMail = "";
                }
                if (!item.Prio) {
                    item.Prio = "";
                }
                if (!item.Typ) {
                    item.Typ = "";
                }
                if (!item.Name && !item.Vorname && !item.Firmenname) {
                    item.Status = getResourceText("contactResultsCriteria.incomplete");
                } else if (!item.EMail) {
                    item.Status = getResourceText("contactResultsCriteria.partialcomplete");
                } else {
                    item.Status = getResourceText("contactResultsCriteria.complete");
                }
                if (item.Anzahl) {
                    that.binding.noctcount = item.Anzahl;
                }
                item.nameInitial = (item.Vorname && item.Name)
                    ? item.Vorname.substr(0, 1) + item.Name.substr(0, 1)
                    : (item.Vorname ? item.Vorname.substr(0, 2) : item.Name ? item.Name.substr(0, 2) : "");
                item.nameInitialBkgColor = Colors.getColorFromNameInitial(item.nameInitial);
                item.company = ((item.Firmenname ? (item.Firmenname + " ") : ""));
                item.fullName = ((item.Title ? (item.Title + " ") : "") +
                    (item.Vorname ? (item.Vorname + " ") : "") + (item.Name ? item.Name : ""));
                item.address = item.EMail;
                item.globalContactId = item.CreatorSiteID + "/" + item.CreatorRecID;
                item.mitarbeiterFullName = (item.Mitarbeiter_Vorname ? (item.Mitarbeiter_Vorname + " ") : "") +
                    (item.Mitarbeiter_Nachname ? item.Mitarbeiter_Nachname : "");
                if (item.SHOW_Barcode || item.IMPORT_CARDSCANID && !item.SHOW_Visitenkarte) {
                    item.svgSource = item.IMPORT_CARDSCANID ? "barcode-qr" : "barcode";
                } else if (!item.SHOW_Barcode && item.IMPORT_CARDSCANID && item.SHOW_Visitenkarte) {
                    item.svgSource = "";
                } else {
                    item.svgSource = "manuel_Portal";
                }
                item.OvwContentDOCCNT3 = "";
            }
            this.resultConverter = resultConverter;

            var handlePageEnable = function (contact) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + (contact && contact.KontaktVIEWID));
                if (AppData._persistentStates.hideQuestionnaire) {
                    NavigationBar.disablePage("contactResultsQuestion");
                } else if (contact && contact.SHOW_Zeilenantwort) {
                    NavigationBar.enablePage("contactResultsQuestion");
                } else {
                    NavigationBar.disablePage("contactResultsQuestion");
                }
                if (contact && contact.SHOW_KontaktNotiz) {
                    NavigationBar.enablePage("contactResultsAttach");
                } else {
                    NavigationBar.disablePage("contactResultsAttach");
                }
                Log.ret(Log.l.trace);
            };

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickDelete: function(event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var confirmText = getResourceText("contact.questionDelete");
                    var confirmTitle = getResourceText("tooltip.delete");
                    var confirmFirst = getResourceText("flyout.ok");
                    var confirmSecond = getResourceText("flyout.cancel");
                    //confirm(confirmTitle, function (result) {
                    confirmModal(confirmTitle, confirmText, confirmFirst, confirmSecond, function (result) {
                        if (result) {
                            Log.print(Log.l.trace, "clickDelete: user choice OK");
                            deleteData(function (response) {
                                // delete OK
                                that.loadData(that.binding.searchString);
                                AppBar.modified = false;
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
                clickEdit: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.selectionChanged().then(function () {
                        AppBar.triggerDisableHandlers();
                        var scope = that.scopeFromRecordId(that.curRecId);
                        if (scope) {
                            handlePageEnable(scope.item);
                        }
                        AppData.setRecordId("Kontakt", that.curRecId);
                        if (that.getEventId()) {
                            Application.navigateById("contact"); 
                        } else {
                            Application.navigateById("contact");
                        }
                    });
                },
                changeSearchField: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (event && event.currentTarget) {
                        that.binding.searchString = event.currentTarget.value;
                        that.loadDataDelayed(that.binding.searchString);
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderBy: function(event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (event && event.currentTarget) {
                        if (event.currentTarget.id === ContactResultsList._orderAttribute) {
                            ContactResultsList._orderDesc = !ContactResultsList._orderDesc;
                        } else {
                            ContactResultsList._orderAttribute = event.currentTarget.id;
                            ContactResultsList._orderDesc = false;
                        }
                        that.loadData(that.binding.searchString);
                    }
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
                onSelectionChanged: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.selectionChanged().then(function () {
                        AppData.setRecordId("Kontakt", that.curRecId);
                        that.binding.btnFlag = true;
                        AppBar.modified = true;
                    });
                },
                onDblClick: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (that.curRecId) {
                        AppBar.triggerDisableHandlers();
                        var scope = that.scopeFromRecordId(that.curRecId);
                        if (scope) {
                            handlePageEnable(scope.item);
                        }
                        Application.navigateById("contactResultsEdit");
                    } else {
                        Log.print(Log.l.trace, "No record selected!");
                    }
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    var i;
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.ContactResultsListLayout.ContactResultsListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "itemsLoaded") {
                            //set list-order column
                            var headerListFields = listView.querySelectorAll(".list-header-columns > div");
                            if (headerListFields) for (i = 0; i < headerListFields.length; i++) {
                                if (headerListFields[i].id === ContactResultsList._orderAttribute) {
                                    if (ContactResultsList._orderDesc) {
                                        WinJS.Utilities.removeClass(headerListFields[i], "order-asc");
                                        WinJS.Utilities.addClass(headerListFields[i], "order-desc");
                                    } else {
                                        WinJS.Utilities.addClass(headerListFields[i], "order-asc");
                                        WinJS.Utilities.removeClass(headerListFields[i], "order-desc");
                                    }
                                } else {
                                    WinJS.Utilities.removeClass(headerListFields[i], "order-asc");
                                    WinJS.Utilities.removeClass(headerListFields[i], "order-desc");
                                }
                            }
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image-right", 40, Colors.textColor, "name", null, {
                                "barcode-qr": { useStrokeColor: false }
                            });
                        } else if (listView.winControl.loadingState === "complete") {
                        }
                    }
                    that.loadingStateChanged(eventInfo);
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible && that.nextUrl) {
                            that.loadNext();
                        }
                    }
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
                clickEdit: function () {
                    if (that.binding.btnFlag === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickDelete: function () {
                    if (that.binding.btnFlag === true) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickGotoPublish: function () {
                    return true;
                }
            };

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "dblclick", this.eventHandlers.onDblClick.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
            }

            var master = Application.navigator.masterControl;
            if (master && master.controller && master.controller.binding && master.controller.binding.eventId) {
                that.setEventId(master.controller.binding.eventId);
            } else {
                that.setEventId(AppData.getRecordId("Veranstaltung"));
            }
            AppData.setRecordId("Kontakt", null);

            that.processAll().then(function() {
                return that.setTooltips();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData(that.binding.searchString);
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})(); 
