// controller for page: clientManagementSummarise
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/lib/hammer/scripts/hammer.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/pages/clientManagementSummarise/clientManagementSummariseService.js" />
(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var namespaceName = "ClientManagementSummarise";

    WinJS.Namespace.define(namespaceName, {
        Controller: WinJS.Class.derive(Application.RecordsetController, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, namespaceName + ".Controller.");
            // ListView control
            var listView = pageElement.querySelector("#clientManagementSummarise.listview");
            this.listView = listView;
            Application.RecordsetController.apply(this, [pageElement, {
                Filter0: ClientManagementSummarise.Filter0,
                Filter1: ClientManagementSummarise.Filter1,
                Filter2: ClientManagementSummarise.Filter2,
                contactId: null,
                noctcount: 0,
                searchString: "",
                Mandantziel: "",
                Mandantquelle: "",
                MandantzielID: null,
                MandantquelleID: null,
            }, commandList, null, null, ClientManagementSummarise.fairMandantView, listView]);

            var that = this;

            var radios = pageElement.querySelectorAll('input[type="radio"]');

            var layout = null;
            
            this.dispose = function () {
                ClientManagementSummarise._prevJson = null;
                ClientManagementSummarise._collator = null;
            }
            
            var getRecordId = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                that.binding.recordID = AppData.getRecordId("FairMandant2");
                Log.ret(Log.l.trace, that.binding.recordID);
                return that.binding.recordID;
            }
            this.getRecordId = getRecordId;

            var getFilter = function() {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                for (var i = 0; i < radios.length; i++) {
                    if (radios[i].name === "Filter" && radios[i].checked) {
                        ClientManagementSummarise.Filter = radios[i].value;
                        break;
                    }
                }
                if (ClientManagementSummarise._Filter === "2") {
                    ClientManagementSummarise._FilterOption = "FAIRS";
                } else if (ClientManagementSummarise._Filter ==="1") {
                    ClientManagementSummarise._FilterOption = "CONTACTDATA";
                } else {
                    ClientManagementSummarise._FilterOption = "ALL";
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
                    if (!scope && recordId && that.nextUrl) {
                        that.loadNext().then(function () {
                            that.scrollToRecordId(recordId);
                        });
                    } else if (scope && scope.index >= 0) {
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
                            that.selectRecordId(recordId);
                        });
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.scrollToRecordId = scrollToRecordId;

            var getMandantzielData = function () {
                Log.call(Log.l.trace, namespaceName + ".Controller.");
                AppData.call("PRC_GetMandantList", {
                    pFairMandantVIEWID: that.getRecordId()
                }, function (json) {
                    Log.print(Log.l.info, "call success! ");
                    if (json.d.results[0].FairMandantID) {
                        that.binding.Mandantziel = json.d.results[0].Name;
                        that.binding.MandantzielID = json.d.results[0].FairMandantVIEWID;
                    } else {
                        Log.print(Log.l.trace, "No new FairMandantVIEWID found!");
                    }
                }, function (error) {
                    Log.print(Log.l.error, "call error");
                });
                Log.ret(Log.l.trace);
                
            }
            this.getMandantzielData = getMandantzielData;

            var resultConverter = function (item, index) {
                item.index = index;
                if (!item.Firmenname) { item.Firmenname = ""; }
                if (!item.EMail) { item.EMail = ""; }
                if (!item.Ansprechpartner) { item.Ansprechpartner = ""; }
                if (!item.Strasse) { item.Strasse = ""; }
                if (!item.Plz) { item.Plz = ""; }
                if (!item.Stadt) { item.Stadt = ""; }
                if (!item.LandName) { item.LandName  = ""; }
                if (!item.CostumerID) { item.CostumerID = ""; }
                if (!item.DUNSNumber) { item.DUNSNumber = ""; }
                if (!item.WebAdresse) { item.WebAdresse = ""; }
                if (!item.FairMandantID) { item.FairMandantID = ""; }
                item.nameInitial = item.Firmenname.substr(0, 2);
                item.nameInitialBkgColor = Colors.getColorFromNameInitial(item.nameInitial);
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

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickJoin: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    var recordId = that.binding.MandantquelleID;
                    var Mandantziel = that.binding.MandantzielID;
                    if (!recordId) {
                        Log.print(Log.l.error, "clickJoin: no record selected");
                    } else {
                        var confirmText = getResourceText("clientManagementSummarise.jointxt");
                        var confirmTitle = getResourceText("clientManagementSummarise.join");
                        var confirmFirst = getResourceText("flyout.ok");
                        var confirmSecond = getResourceText("flyout.cancel");
                        //confirm(confirmTitle, function (result) {
                        confirmModal(confirmTitle, confirmText, confirmFirst, confirmSecond, function (result) {
                            if (result) {
                                Log.print(Log.l.trace, "clickDelete: user choice OK");
                                AppData.call("PRC_JoinToMandant", {
                                    /* Ted 20240719: pTargetFairMandantID soll gleich der ID des "Master"-Datensatzes sein.
                                       Am besten hier direkt die gespeicherte Datensatz-ID verwenden... */
                                    pTargetFairMandantID: that.binding.MandantzielID,
                                    pFairMandantVeranstID: that.binding.MandantquelleID
                                }, function (json) {
                                    Log.print(Log.l.info, "call success! ");
                                    if (json && json.d && json.d.results.length > 0) {
                                        var results = json.d.results[0];
                                        if (results.ResultCode != 0) {
                                            Log.print(Log.l.error, "PRC_JoinToMandant returns error " +
                                                results.ResultCode + " / " + results.ResultMessage);
                                            AppData.setErrorMsg(that.binding, results.ResultMessage);
                                        }
                                        that.binding.Mandantquelle = "";
                                        that.binding.MandantquelleID = null;
                                        that.loadData();
                                    }
                                    AppBar.busy = false;
                                    AppBar.triggerDisableHandlers();
                                }, function (error) {
                                    Log.print(Log.l.error, "call error");
                                    AppBar.busy = false;
                                    AppBar.triggerDisableHandlers();
                                    AppData.setErrorMsg(that.binding, error);
                                    if (typeof error === "function") {
                                        error(error);
                                    }
                                });
                            } else {
                                Log.print(Log.l.trace, "clickJoin: user choice CANCEL");
                            }
                        });
                    }
                    Log.ret(Log.l.trace);
                },
                changeSearchField: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.getFilter();
                    if (event && event.currentTarget) {
                        that.binding.searchString = event.currentTarget.value;
                        that.loadData(that.binding.searchString);
                    }
                    Log.ret(Log.l.trace);
                },
                clickOrderBy: function(event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (event && event.currentTarget) {
                        if (event.currentTarget.id === ClientManagementSummarise._orderAttribute) {
                            ClientManagementSummarise._orderDesc = !ClientManagementSummarise._orderDesc;
                        } else {
                            ClientManagementSummarise._orderAttribute = event.currentTarget.id;
                            ClientManagementSummarise._orderDesc = false;
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
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    Application.showDetail();
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    that.selectionChanged().then(function () {
                        var scope = that.scopeFromRecordId(that.curRecId);
                        if (scope) {
                            if (scope.item.Name !== that.binding.Mandantziel) {
                                AppBar.busy = true;
                                that.binding.Mandantquelle = scope.item.Name;
                                that.binding.MandantquelleID = scope.item.FairMandantVeranstID;
                            } else {
                                AppBar.busy = true;
                                that.binding.Mandantquelle = "";
                                that.binding.MandantquelleID = null;
                            }
                        }
                         else {
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
                                layout = Application.ClientManagementSummariseLayout.ClientManagementSummariseLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "itemsLoaded") {
                            //set list-order column
                            var headerListFields = listView.querySelectorAll(".list-header-columns > div");
                            if (headerListFields) for (i = 0; i < headerListFields.length; i++) {
                                if (headerListFields[i].id === ClientManagementSummarise._orderAttribute) {
                                    if (ClientManagementSummarise._orderDesc) {
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
                            if (that.loading) {
                                var progress = listView.querySelector(".list-footer .progress");
                                var counter = listView.querySelector(".list-footer .counter");
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
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
            }
            
            that.processAll().then(function () {
                return that.getMandantzielData();
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData(that.binding.searchString);
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                //return that.setMandantZiel(); //that.scrollToRecordId(AppData.getRecordId("MandantID"));
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})(); 
