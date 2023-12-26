// controller for page: localevents
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

    WinJS.Namespace.define("ContactResultsList", {
        Controller: WinJS.Class.derive(Application.RecordsetController, function Controller(pageElement, commandList, isMaster) {
            Log.call(Log.l.trace, "ContactResultsList.Controller.");
            // ListView control
            var listView = pageElement.querySelector("#contactResultsList.listview");

            Application.RecordsetController.apply(this, [pageElement, {
                contactId: null,
                noctcount: 0,
                searchString: ""
            }, commandList, isMaster, null, ContactResultsList.contactResultsView, listView]);

            var that = this;

            var layout = null;

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                ContactResultsList._prevJson = null;
                ContactResultsList._collator = null;
            }

            var getEventId = function () {
                Log.print(Log.l.trace, "ContactResultsList.getEventId returned eventId=" + ContactResultsList._eventId);
                return ContactResultsList._eventId;
            }
            this.getEventId = getEventId;

            var setEventId = function (value) {
                Log.print(Log.l.trace, "ContactResultsList.setEventId eventId=" + value);
                ContactResultsList._eventId = value;
            }
            this.setEventId = setEventId;

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

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                changeSearchField: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    if (event && event.currentTarget) {
                        that.binding.searchString = event.currentTarget.value;
                        that.loadData(that.binding.searchString);
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderBy: function(event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
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
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    that.selectionChanged().then(function () {
                        AppBar.triggerDisableHandlers();
                        if (that.getEventId()) {
                            Application.navigateById("contactResultsEvents");
                        } else {
                            Application.navigateById("contactResultsEdit");
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    var i;
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.ContactResultsListLayout.ContactResultsListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            var listHeader = listView.querySelector(".list-header");
                            if (listHeader) {
                                listHeader.style.backgroundColor = Colors.backgroundColor;
                            }
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
                            //smallest List color change
                            var circleElements = listView.querySelectorAll('#nameInitialcircle');
                            if (circleElements) for (i = 0; i < circleElements.length; i++) {
                                circleElements[i].style.backgroundColor = Colors.navigationColor;
                            }
                            // load SVG images
                            Colors.loadSVGImageElements(listView, "action-image-right", 40, Colors.textColor, "name", null, {
                                "barcode-qr": { useStrokeColor: false }
                            });
                        }
                    }
                    that.loadingStateChanged(eventInfo);
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "ContactResultsList.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible && that.nextUrl) {
                            that.loadNext();
                        }
                    }
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

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
            }

            that.processAll().then(function () {
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
