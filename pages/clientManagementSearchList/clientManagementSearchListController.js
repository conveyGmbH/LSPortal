// controller for page: localevents
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/clientManagementSearchList/clientManagementSearchListService.js" />
(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var namespaceName = "clientManagementSearchList";

    WinJS.Namespace.define("ClientManagementSearchList", {
        Controller: WinJS.Class.derive(Application.RecordsetController, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            // ListView control
            var listView = pageElement.querySelector("#clientManagementSearchList.listview");
            this.listView = listView;
            Application.RecordsetController.apply(this, [pageElement, {
                Filter0: ClientManagementSearchList.Filter0,
                Filter1: ClientManagementSearchList.Filter1,
                Filter2: ClientManagementSearchList.Filter2,
                contactId: null,
                noctcount: 0,
                searchString: ""
            }, commandList, null, null, ClientManagementSearchList.fairMandantView, listView]);

            var that = this;

            var radios = pageElement.querySelectorAll('input[type="radio"]');

            var layout = null;

            this.dispose = function () {
                ClientManagementSearchList._prevJson = null;
                ClientManagementSearchList._collator = null;
            }

            var getFilter = function() {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                for (var i = 0; i < radios.length; i++) {
                    if (radios[i].name === "Filter" && radios[i].checked) {
                        ClientManagementSearchList.Filter = radios[i].value;
                        break;
                    }
                }
                if (ClientManagementSearchList._Filter === "2") {
                    ClientManagementSearchList._FilterOption = "FAIRS";
                } else if (ClientManagementSearchList._Filter ==="1") {
                    ClientManagementSearchList._FilterOption = "CONTACTDATA";
                } else {
                    ClientManagementSearchList._FilterOption = "ALL";
                }
            }
            this.getFilter = getFilter;

            var scrollToRecordId = function (recordId) {
                Log.call(Log.l.trace, namespaceName + ".Controller.", "recordId=" + recordId);
                if (that.binding.loading ||
                    listView && listView.winControl && listView.winControl.loadingState !== "complete") {
                    WinJS.Promise.timeout(50).then(function () {
                        that.scrollToRecordId(recordId);
                    });
                } else if (listView && listView.winControl) {
                    var scope = that.scopeFromRecordId(recordId);
                    if (!scope && recordId) {
                        that.loadNext();
                        that.scrollToRecordId(recordId);
                    }
                    if (scope && scope.index >= 0) {
                        listView && listView.winControl.ensureVisible(scope.index);
                        WinJS.Promise.timeout(50).then(function() {
                            var indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                            var elementOfFirstVisible = listView.winControl.elementFromIndex(indexOfFirstVisible);
                            var element = listView.winControl.elementFromIndex(scope.index);
                            var height = listView.clientHeight;
                            if (element && elementOfFirstVisible) {
                                var offsetDiff = element.offsetTop - elementOfFirstVisible.offsetTop;
                                if (offsetDiff > height - element.clientHeight) {
                                    listView.winControl.scrollPosition += offsetDiff - (height - element.clientHeight);
                                } else if (offsetDiff < 0) {
                                    listView.winControl.indexOfFirstVisible = scope.index;
                                }
                            }
                            that.selectRecordId(AppData.getRecordId("FairMandant"));
                        });
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.scrollToRecordId = scrollToRecordId;

            var resultConverter = function (item, index) {
                item.index = index;
                if (!item.Firmenname) { item.Firmenname = ""; }
                if (!item.EMail) { item.EMail = ""; }
                if (!item.Ansprechpartner) { item.Ansprechpartner = ""; }
                if (!item.Strasse) { item.Strasse = ""; }
                if (!item.Plz) { item.Plz = ""; }
                if (!item.Stadt) { item.Stadt = ""; }
                if (!item.LandName) { item.LandName  = ""; }
                if (!item.CustomerID) { item.CustomerID = ""; }
                if (!item.DUNSNumber) { item.DUNSNumber = ""; }
                if (!item.WebAdresse) { item.WebAdresse = ""; }
                if (!item.FairMandantID) { item.FairMandantID = ""; }
            }
            this.resultConverter = resultConverter;

            var newMandant = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var ret = AppData.setErrorMsg(that.binding);
                AppData.call("PRC_CreateFairMandant", {
                    pLandID: 0,
                    pNumLicenses: 0,
                    pINITFairManTypID: 2
                }, function (json) {
                    Log.print(Log.l.info, "call PRC_CreateFairMandant success! ");
                    AppBar.busy = false;
                    AppData.setRecordId("FairMandant", json.d.results[0].FairMandantID);
                    if (json.d.results[0].FairMandantID) {
                        Application.navigateById("clientManagement");
                    } else {
                        Log.print(Log.l.trace, "No new MandantID found!");
                    }
                }, function (errorResponse) {
                    Log.print(Log.l.error, "call PRC_CreateFairMandant error");
                    AppBar.busy = false;
                    AppData.setErrorMsg(that.binding, errorResponse);
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.newMandant = newMandant;

            var storedSearchString = function() {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                var searchString = AppData.getRecordId("FairMandantSearch");
                var searchStringId = AppData.getRecordId("FairMandant");
                that.curRecId = searchStringId;
                if (searchString) {
                    that.binding.searchString = searchString;
                    that.scopeFromRecordId(that.curRecId);
                    that.selectionChanged();
                }
                Log.ret(Log.l.trace);
            }
            this.storedSearchString = storedSearchString;
            
            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.newMandant();
                    Log.ret(Log.l.trace);
                },
                clickChangeToLSMain: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    AppData.setErrorMsg(that.binding);
                    AppData.call("PRC_ChangeToMain", {
                    }, function (json) {
                        Log.print(Log.l.info, "call success! ");
                        AppData.prevLogin = AppData._persistentStates.odata.login;
                        AppData.prevPassword = AppData._persistentStates.odata.password;
                        Application.navigateById("login");
                    }, function (error) {
                        Log.print(Log.l.error, "call error");
                    });
                    Log.ret(Log.l.trace);
                },
                changeSearchField: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.getFilter();
                    if (event && event.currentTarget) {
                        that.binding.searchString = event.currentTarget.value;
                        AppData.setRecordId("FairMandantSearch", that.binding.searchString);
                        that.loadData(that.binding.searchString);
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderBy: function(event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (event && event.currentTarget) {
                        if (event.currentTarget.id === ClientManagementSearchList._orderAttribute) {
                            ClientManagementSearchList._orderDesc = !ClientManagementSearchList._orderDesc;
                        } else {
                            ClientManagementSearchList._orderAttribute = event.currentTarget.id;
                            ClientManagementSearchList._orderDesc = false;
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
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.selectionChanged().then(function () {
                        var scope = that.scopeFromRecordId(that.curRecId);
                        if (scope) {
                            AppData.setRecordId("FairMandant", that.curRecId);
                        }
                        if (that.curRecId) {
                            Application.navigateById("clientManagement");
                        } else {
                            Log.print(Log.l.trace, "No MandantID found!");
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.navigateById("publish", event);
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    var i;
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.ClientManagementSearchListLayout.ClientManagementSearchListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            //set list-order column
                            var headerListFields = listView.querySelectorAll(".list-header-columns > div");
                            if (headerListFields) for (i = 0; i < headerListFields.length; i++) {
                                if (headerListFields[i].id === ClientManagementSearchList._orderAttribute) {
                                    if (ClientManagementSearchList._orderDesc) {
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
                clickGotoPublish: function () {
                    return true;
                }
            };

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "dblclick", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
            }

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.storedSearchString();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData(that.binding.searchString);
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.scrollToRecordId(AppData.getRecordId("FairMandant"));
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();
