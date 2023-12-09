// controller for page: localevents
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/localevents/localeventsService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("LocalEvents", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "LocalEvents.Controller.");
            Application.Controller.apply(this, [pageElement, {
                count: 0,
                veranstaltungId: 0,
                fairmandantId: 0,
                firstentry: 0,
                active: null,
                leadsuccessBasic: !AppHeader.controller.binding.userData.SiteAdmin && AppData._persistentStates.leadsuccessBasic
            }, commandList]);
            this.nextUrl = null;

            var that = this;

            // ListView control
            var listView = pageElement.querySelector("#localevents.listview");
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

            var getDateObject = function (date) {
                Log.call(Log.l.trace, "ContactResultsEvents.Controller.");
                if (date === null) {
                    Log.call(Log.l.trace, "No Date!");
                } else {
                    var dateString = date.replace("\/Date(", "").replace(")\/", "");
                    var milliseconds = parseInt(dateString) - AppData.appSettings.odata.timeZoneAdjustment * 60000;
                    var time = new Date(milliseconds);
                    var formdate = ("0" + time.getDate()).slice(-2) + "." + ("0" + (time.getMonth() + 1)).slice(-2) + "." + time.getFullYear() + " " + that.addZero(time.getUTCHours()) + ":" + that.addZero(time.getMinutes());
                    Log.call(Log.l.trace, "ContactResultsEvents.Controller.");
                    return formdate;
                }
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

            var resultConverter = function (item, index) {
                item.index = index;
                item.Startdatum = that.getDateObject(item.Startdatum);
                item.Enddatum = that.getDateObject(item.Enddatum);
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
                progress = listView.querySelector(".list-footer .progress");
                counter = listView.querySelector(".list-footer .counter");
                if (progress && progress.style) {
                    progress.style.display = "inline";
                }
                if (counter && counter.style) {
                    counter.style.display = "none";
                }
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    return LocalEvents.VeranstaltungView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "LocalEvent: success!");
                        // employeeView returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length) {
                            that.nextUrl = LocalEvents.VeranstaltungView.getNextUrl(json);
                            var results = json.d.results;
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
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        if (progress && progress.style) {
                            progress.style.display = "none";
                        }
                        if (counter && counter.style) {
                            counter.style.display = "inline";
                        }
                        that.loading = false;
                    }, {

                        }
                    );
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