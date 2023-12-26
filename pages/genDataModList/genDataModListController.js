// controller for page: GenDataModList
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/genDataModList/genDataModListService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("GenDataModList", {
        Controller: WinJS.Class.derive(Application.RecordsetController, function Controller(pageElement, commandList, isMaster) {
            Log.call(Log.l.trace, "GenDataModList.Controller.");

            // ListView control
            var listView = pageElement.querySelector("#genDataModList.listview");

            Application.RecordsetController.apply(this, [pageElement, {
                personAddressId: 0,
                personId: 0,
                addressId: 0,
                personCategoryId: 0
            }, commandList, isMaster, null, GenDataModList.personAdresseView, listView]);

            var that = this;

            var layout = null;

            var resultConverter = function (item, index) {
                item.index = index;
                item.nameInitial = (item.PersonFirstName && item.PersonLastName)
                    ? item.PersonFirstName.substr(0, 1) + item.PersonLastName.substr(0, 1)
                    : (item.PersonFirstName ? item.PersonFirstName.substr(0, 2) : item.PersonLastName ? item.PersonLastName.substr(0, 2) : "");

            }
            this.resultConverter = resultConverter;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "GenDataModList.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    var prevRecId = that.curRecId;
                    Log.call(Log.l.trace, "GenDataModList.Controller.");
                    that.selectionChanged().then(function () {
                        if (prevRecId !== that.curRecId) {
                            var curScope = that.scopeFromRecordId(that.curRecId);
                            if (curScope && curScope.item) {
                                that.binding.personAddressId = curScope.item.PersonAdresseVIEWID;
                                that.binding.addressId = curScope.item.AdresseID;
                                that.binding.personId = curScope.item.PersonID;
                                that.binding.personCategoryId = curScope.item.INITPersonKategorieID;
                            }
                            AppBar.scope.loadData();
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "GenDataModList.Controller.");
                    Application.showDetail();
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "GenDataModList.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.GenDataModListLayout.GenDataModListLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        }
                    }
                    that.loadingStateChanged(eventInfo);
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "GenDataModList.Controller.");
                    if (eventInfo && eventInfo.detail && listView) {
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
                    Log.call(Log.l.trace, "GenDataModList.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible && that.nextUrl) {
                            that.loadNext();
                        }
                    }
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
                }
            }

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
            }

            // save data
            var saveData = function (complete, error) {
                var ret = null;
                Log.call(Log.l.trace, "GenDataModList.Controller.");
                var curPageId = Application.getPageId(nav.location);
                if (curPageId === "genDataModDetails" && AppBar.scope &&
                    typeof AppBar.scope.saveData === "function") {
                    ret = AppBar.scope.saveData(complete, error);
                }
                Log.ret(Log.l.trace);
                return ret || WinJS.Promise.as();
            }
            this.saveData = saveData;


            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
                if (!that.curRecId && that.records && that.records.length > 0) {
                    var listControl = listView.winControl;
                    if (listControl && listControl.selection) {
                        listControl.selection.set(0);
                    }
                }
            });
            Log.ret(Log.l.trace);
        })
    });
})();




