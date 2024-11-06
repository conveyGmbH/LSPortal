// controller for page: localevents
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/localevents/localeventsService.js" />
/// <reference path="~/www/lib/moment/scripts/moment-with-locales.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var namespaceName = "LocalEvents";

    WinJS.Namespace.define("LocalEvents", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "LocalEvents.Controller.");
            var listView = pageElement.querySelector("#localevents.listview");
            this.listView = listView;
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                veranstaltungId: 0,
                fairmandantId: 0,
                firstentry: 0,
                active: null,
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic,
                searchString: "",
                sortField: "VeranstaltungName",
                sortType: "A"
            }, commandList]);
            this.nextUrl = null;

            var that = this;

            // ListView control
            
            var progress = null;
            var counter = null;
            var layout = null;

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            this.dispose = function () {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
                if (that.localeventsdata) {
                    that.localeventstdata = null;
                }
                listView = null;
            }

            var background = function (index) {
                if (index % 2 === 0) {
                    return 1;
                } else {
                    return null;
                }
            };
            this.background = background;

            var loadNextUrl = function () {
                Log.call(Log.l.trace, "LocalEvents.Controller.");
                progress = listView.querySelector(".list-footer .progress");
                counter = listView.querySelector(".list-footer .counter");
                if (that.localeventsdata && that.nextUrl && listView) {
                    that.loading = true;
                    if (progress && progress.style) {
                        progress.style.display = "inline";
                    }
                    if (counter && counter.style) {
                        counter.style.display = "none";
                    }
                    AppData.setErrorMsg(that.binding);
                    Log.print(Log.l.trace, "calling select LocalEvents.VeranstaltungView...");
                    var nextUrl = that.nextUrl;
                    that.nextUrl = null;
                    LocalEvents.VeranstaltungView.selectNext(function (json) { //json is undefined
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "LocalEvents.VeranstaltungView: success!");
                        // startContact returns object already parsed from json file in response
                        if (json && json.d && json.d.results && that.localeventsdata) {
                            that.nextUrl = LocalEvents.VeranstaltungView.getNextUrl(json);
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, that.binding.count);
                                that.binding.count = that.localeventsdata.push(item);
                            });
                        }
                        if (progress && progress.style) {
                            progress.style.display = "none";
                        }
                        if (counter && counter.style) {
                            counter.style.display = "inline";
                        }
                        that.loading = false;
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        //Log.print(Log.l.error, "ContactList.contactView: error!");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        if (progress && progress.style) {
                            progress.style.display = "none";
                        }
                        if (counter && counter.style) {
                            counter.style.display = "inline";
                        }
                        that.loading = false;
                    },
                        null,
                        nextUrl);
                } else {
                    if (progress && progress.style) {
                        progress.style.display = "none";
                    }
                    if (counter && counter.style) {
                        counter.style.display = "inline";
                    }
                    that.loading = false;
                }
                Log.ret(Log.l.trace);
            }
            this.loadNextUrl = loadNextUrl;

            var addZero = function (i) {
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            }
            this.addZero = addZero;

            //Date convertion
            var getDateObject = function (dateData) {
                var ret;
                if (dateData) {
                    var interval = parseInt(that.binding.dayhourflag);
                    var dateString = dateData.replace("\/Date(", "").replace(")\/", "");
                    var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    if (interval === 1) {
                        ret = new Date(milliseconds).toLocaleDateString();
                    } else {
                        moment().locale("de");
                        ret = moment(milliseconds).format("DD.MM.YYYY HH:mm");//new Date(milliseconds).toLocaleTimeString().slice(0, -3);

                    }
                    //.toLocaleString('de-DE').substr(0, 10);
                } else {
                    ret = "";
                }
                return ret;
            };
            this.getDateObject = getDateObject;

            var selectRecordId = function (recordId) {
                Log.call(Log.l.trace, "LocalEvents.Controller.", "recordId=" + recordId);
                if (recordId && listView && listView.winControl && listView.winControl.selection) {
                    for (var i = 0; i < that.localeventsdata.length; i++) {
                        var localevents = that.localeventsdata.getAt(i);
                        if (localevents && typeof localevents === "object" &&
                            localevents.VeranstaltungVIEWID === recordId) {
                            listView.winControl.selection.set(i);
                            break;
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            this.selectRecordId = selectRecordId;

            var changeEvent = function () {
                Log.call(Log.l.trace, "LocalEvents.Controller.");
                AppData.setErrorMsg(that.binding);
                AppData.call("PRC_ChangeUserVeranstaltung", {
                    pNewVeranstaltungID: that.curRecId,
                    pLoginName: AppData._persistentStates.odata.login
                }, function (json) {
                    Log.print(Log.l.info, "call success! ");
                    AppData.prevLogin = AppData._persistentStates.odata.login;
                    AppData.prevPassword = AppData._persistentStates.odata.password;
                    Application.navigateById("login");
                }, function (error) {
                    Log.print(Log.l.error, "call error");
                });
                Log.ret(Log.l.trace);
            }
            this.changeEvent = changeEvent;

            var getDeleteEventData = function (eventID) {
                Log.call(Log.l.trace, "LocalEvents.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as()/*.then(function () {
                    return LocalEvents.VeranstaltungView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.info, "MAILERZEILENView select: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            that.deleteEventData = json.d.results[0];
                        }

                    }, function (errorResponse) {
                        Log.print(Log.l.error, "error selecting mailerzeilen");
                        AppData.setErrorMsg(that.binding, errorResponse);
                        }, { VeranstaltungVIEWID: eventID});
                })*/.then(function () {
                        // var curScope = that.deleteEventData;
                        var curScope = that.actualSelectedItem;
                        if (curScope) {
                            var confirmTitle = getResourceText("localevents.labelDelete") + ": " + curScope.Name +
                                "\r\n" + getResourceText("localevents.eventDelete");
                            confirm(confirmTitle, function (result) {
                                if (result) {
                                    AppBar.busy = true;
                                    AppData.setErrorMsg(that.binding);
                                    AppData.call("PRC_DeleteVeranstaltung", {
                                        pVeranstaltungID: eventID
                                    }, function (json) {
                                        Log.print(Log.l.info, "call success! ");
                                        AppBar.busy = false;
                                        that.loadData();
                                    }, function (error) {
                                        AppBar.busy = false;
                                        Log.print(Log.l.error, "call error");
                                    });
                                } else {
                                    Log.print(Log.l.trace, "clickDelete: event choice CANCEL");
                                }
                            });
                        }
                    });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.getDeleteEventData = getDeleteEventData;

            var loadDataDelayed = function (searchString) {
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

            var resultConverter = function (item, index) {
                item.index = index;
                if (!item.VeranstaltungName) {
                    item.Name = "";
                }
                if (!item.StartDatum) {
                    item.StartDatum = "";
                }
                if (!item.EndDatum) {
                    item.EndDatum = "";
                }
                if (!item.UsedLicences) {
                    item.UsedLicences = 0;
                }
                if (!item.AnzKontakte) {
                    item.AnzKontakte = 0;
                }
                item.nameInitial = item.VeranstaltungName.substr(0, 2);
                if (item.StartDatum) {
                item.StartDatum = that.getDateObject(item.StartDatum);
                }
                if (item.EndDatum) {
                item.EndDatum = that.getDateObject(item.EndDatum);
            }
            }
            this.resultConverter = resultConverter;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                changeSearchField: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (event && event.currentTarget) {
                        that.binding.searchString = event.currentTarget.value;
                        that.loadDataDelayed(that.binding.searchString);
                    }
                    Log.ret(Log.l.trace);
                },
                clickDelete: function (event) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    var recordId = that.curRecId;
                    if (recordId) {
                        that.getDeleteEventData(recordId);
                    }
                    Log.ret(Log.l.trace);
                },
                clickNew: function (event) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    Application.navigateById("localeventsCreate", event);
                    Log.ret(Log.l.trace);
                },
                clickOrderBy: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (event && event.currentTarget) {
                        if (event.currentTarget.id === LocalEvents._orderAttribute) {
                            if (event.currentTarget.id === "1") {
                                that.binding.sortField = "VeranstaltungName";
                                LocalEvents._orderAttribute = "VeranstaltungName";
                            }
                            if (event.currentTarget.id === "2") {
                                that.binding.sortField = "StartDatum";
                                LocalEvents._orderAttribute = "StartDatum";
                            }
                            if (event.currentTarget.id === "3") {
                                that.binding.sortField = "EndDatum";
                                LocalEvents._orderAttribute = "EndDatum";
                            }
                            if (event.currentTarget.id === "4") {
                                that.binding.sortField = "UsedLicences";
                                LocalEvents._orderAttribute = "UsedLicences";
                            }
                            if (event.currentTarget.id === "5") {
                                that.binding.sortField = "AnzKontakte";
                                LocalEvents._orderAttribute = "AnzKontakte";
                            }
                            LocalEvents._orderDesc = !LocalEvents._orderDesc;
                            that.binding.sortType = "D";
                        } else {
                            if (event.currentTarget.id === "1") {
                                that.binding.sortField = "VeranstaltungName";
                                LocalEvents._orderAttribute = "VeranstaltungName";
                            }
                            if (event.currentTarget.id === "2") {
                                that.binding.sortField = "StartDatum";
                                LocalEvents._orderAttribute = "StartDatum";
                            }
                            if (event.currentTarget.id === "3") {
                                that.binding.sortField = "EndDatum";
                                LocalEvents._orderAttribute = "EndDatum";
                            }
                            if (event.currentTarget.id === "4") {
                                that.binding.sortField = "UsedLicences";
                                LocalEvents._orderAttribute = "UsedLicences";
                            }
                            if (event.currentTarget.id === "5") {
                                that.binding.sortField = "AnzKontakte";
                                LocalEvents._orderAttribute = "AnzKontakte";
                            }
                            LocalEvents._orderAttribute = event.currentTarget.id;
                            LocalEvents._orderDesc = false;
                            that.binding.sortType = "A";
                        }
                        that.loadData();
                    }
                    Log.ret(Log.l.trace);
                },
                clickChange: function (event) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    that.changeEvent();
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    Application.showDetail();
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
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
                                layout = Application.LocalEventsLayout.LocalEventsLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        } else if (listView.winControl.loadingState === "complete") {
                            //set list-order column
                            var headerListFields = listView.querySelectorAll(".list-header-columns > div");
                            if (headerListFields) for (var i = 0; i < headerListFields.length; i++) {
                                if (headerListFields[i].id === LocalEvents._orderAttribute) {
                                    if (LocalEvents._orderDesc) {
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
                            Colors.loadSVGImageElements(listView, "action-image", 40, Colors.textColor);
                            Colors.loadSVGImageElements(listView, "action-image-flag", 40);
                            that.loadNextUrl();
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    if (listView && listView.winControl) {
                        var listControl = listView.winControl;
                        if (listControl.selection) {
                            var selectionCount = listControl.selection.count();
                            if (selectionCount === 1) {
                                // Only one item is selected, show the page
                                listControl.selection.getItems().done(function (items) {
                                    var item = items[0];
                                    that.binding.active = null;
                                    if (item.data.Aktiv) {
                                        that.binding.active = 1;
                                    }
                                    that.actualSelectedItem = item.data;
                                    if (item.data && item.data.VeranstaltungVIEWID) {
                                        var newRecId = item.data.VeranstaltungVIEWID;
                                        Log.print(Log.l.trace, "newRecId:" + newRecId + " curRecId:" + that.curRecId);
                                        if (newRecId !== 0 && newRecId !== that.curRecId) {
                                            if (that.curRecId) {
                                                that.prevRecId = that.curRecId;
                                            }
                                            that.curRecId = newRecId;
                                            AppBar.triggerDisableHandlers();
                                        }
                                    }
                                });
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                clickEdit: function (event) {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    if (that.curRecId) {
                        AppData.setRecordId("VeranstaltungEdit", that.curRecId);
                    }
                    Application.navigateById("event");
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible) {
                            var contentHeader = listView.querySelector(".content-header");
                            if (contentHeader) {
                                var halfCircle = contentHeader.querySelector(".half-circle");
                                if (halfCircle && halfCircle.style) {
                                    if (halfCircle.style.visibility === "hidden") {
                                        halfCircle.style.visibility = "";
                                        WinJS.UI.Animation.enterPage(halfCircle);
                                    }
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;
                        if (visible && that.localeventsdata && that.nextUrl) {
                            that.loading = true;
                            that.loadNextUrl();
                        } else {
                            if (progress && progress.style) {
                                progress.style.display = "none";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "inline";
                            }
                            that.loading = false;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                copyQuestionnaire: function () {
                    Log.call(Log.l.trace, "LocalEvents.Controller.");
                    var toVeranstaltungsid = AppData.getRecordId("Veranstaltung");
                    var ret = null;
                    var confirmTitle = getResourceText("localevents.confirmCopyQuestionnaire1") + "-" + that.binding.generalData.eventName + "-" +
                        "\r\n" + getResourceText("localevents.confirmCopyQuestionnaire2") + "-" + that.actualSelectedItem.Name + "- !";
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            AppBar.busy = true;
                            Log.print(Log.l.trace, "clickDelete: user choice OK");
                            ret = AppData.call("PRC_CopyFragebogen",
                                {
                                    pFromVeranstID: that.curRecId,
                                    pToVeranstID: toVeranstaltungsid
                                }, function (json) {
                                    Log.print(Log.l.info, "call success! ");
                                    AppBar.busy = false;
                                    //Application.navigateById("localevents", event);
                                }, function (errorResponse) {
                                    Log.print(Log.l.error, "call error");
                                    AppBar.busy = false;
                                    AppData.setErrorMsg(that.binding, errorResponse);
                                });
                        } else {
                            Log.print(Log.l.trace, "clickDelete: user choice CANCEL");
                        }
                    });
                    if (ret) {
                        WinJS.Promise.as().then(function () {
                            complete({});
                        });
                    }
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
                clickChangeUserState: function (event) {
                    Log.call(Log.l.trace, "MailingTemplate.Controller.");
                    Application.navigateById("userinfo", event);
                    Log.ret(Log.l.trace);
                },
                clickGotoPublish: function (event) {
                    Log.call(Log.l.trace, "BarcodeAdministration.Controller.");
                    Application.navigateById("publish", event);
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
                clickDelete: function () {
                    if (that.curRecId) {
                        if (that.curRecId !== AppData.getRecordId("Veranstaltung") && !that.binding.active && !AppBar.busy) {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                },
                clickNew: function () {
                    if (that.binding.fairmandantId) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickChange: function () {
                    if (that.curRecId && AppData.generalData.eventId !== that.curRecId) {
                        return false;
                    } else {
                        return true;
                    }
                },
                copyQuestionnaire: function () {
                    if (that.curRecId && AppData.generalData.eventId !== that.curRecId) {
                        return false;
                    } else {
                        return true;
                    }
                },
                clickEdit: function () {
                    if (that.curRecId) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
            }

            var loadData = function () {
                Log.call(Log.l.trace, "LocalEvents.Controller.");
                that.loading = true;
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    Log.call(Log.l.trace, namespaceName + ".Controller.");
                    AppData.setErrorMsg(that.binding);
                        AppData.setErrorMsg(that.binding);
                        AppData.call("PRC_GetPortalEvents", {
                            pSearchString: that.binding.searchString,
                            pSortField: that.binding.sortField,
                            pSortType: that.binding.sortType
                        }, function (json) {
                            Log.print(Log.l.info, "call PRC_GetPortalEvents success! ");
                            if (json && json.d && json.d.results && json.d.results.length > 0) {
                            var results = json.d.results;
                                if (results[0].ResultCode === 0) {
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            that.binding.count = results.length;
                            that.binding.fairmandantId = results[0].FairMandantID;
                            that.binding.firstentry = results[0].VeranstaltungVIEWID;

                            that.localeventsdata = new WinJS.Binding.List(results);

                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = that.localeventsdata.dataSource;
                            }
                                } else {
                                    that.binding.count = 0;
                                    that.nextUrl = null;
                                    that.localeventsdata = null;
                                    if (listView.winControl) {
                                        // add ListView dataSource
                                        listView.winControl.itemDataSource = null;
                                    }
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
                            Log.print(Log.l.trace, "Data loaded");
                        } else {
                            that.binding.count = 0;
                            that.nextUrl = null;
                            that.localeventsdata = null;
                            if (listView.winControl) {
                                // add ListView dataSource
                                listView.winControl.itemDataSource = null;
                            }
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

                            Log.ret(Log.l.trace);
                    }, function (errorResponse) {
                            Log.print(Log.l.error, "call PRC_GetPortalEvents error");
                            if (typeof error === "function") {
                                error(errorResponse);
                        }
                        });
                    Log.ret(Log.l.trace);
                });
                Log.ret(Log.l.trace);
                return ret;
            };
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
                nextUrl: null,
                loading: false,
                localeventsdata: null,
                deleteEventData: null
            })
    });
})();
