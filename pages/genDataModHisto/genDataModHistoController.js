// controller for page: GenDataModHisto
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/genDataModHisto/genDataModHistoService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;
    
    WinJS.Namespace.define("GenDataModHisto", {
        Controller: WinJS.Class.derive(Application.RecordsetController, function Controller(pageElement, commandList, isMaster) {
            // ListView control
            var listView = pageElement.querySelector("#genDataModHisto.listview");
            Log.call(Log.l.trace, "GenDataModHisto.Controller.");
            Application.RecordsetController.apply(this, [pageElement, {
            }, commandList, isMaster, GenDataModHisto.benutzerTable, GenDataModHisto.benutzerView, listView]);

            this.modHistoData = null;
            this.vaId = null;
          
            this.firstmodHistoDataIndex = 0;

            var that = this;

            var layout = null;

            var setVaId = function(vaid) {
                that.vaId = vaid;
            }
            this.setVaId = setVaId;

            var resultConverter = function (item, index) {
                item.index = index;
                if (item.RatingText === null) {
                    item.RatingText = "";
                }
            }
            this.resultConverter = resultConverter;
          
            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "GenDataModHisto.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done();
                    }
                    Log.ret(Log.l.trace);
                },
                clickShowEvents: function(event) {
                    Log.call(Log.l.trace, "GenDataModHisto.Controller.");
                    Application.navigateById("genDataModEventsHisto", event);
                    Log.ret(Log.l.trace);
                },
                onSelectionChanged: function (eventInfo) {
                    var prevRecId = that.curRecId;
                    Log.call(Log.l.trace, "GenDataModList.Controller.");
                    that.binding.vaId = null;
                    that.selectionChanged().then(function () {
                        AppBar.triggerDisableHandlers();
                        if (prevRecId !== that.curRecId) {
                            var curScope = that.scopeFromRecordId(that.curRecId);
                            if (curScope && curScope.item && curScope.item.BenutzerVIEWID) {
                                that.setVaId(curScope.item.VeranstaltungID);
                                AppData.setRecordId("IncidentUID", curScope.item.BenutzerVIEWID);
                                AppData.setRecordId("IncidentPID", curScope.item.PersonID);
                                AppData.setRecordId("IncidentVID", curScope.item.VeranstaltungID);
                                AppBar.modified = false;
                            }
                        }
                    });
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "GenDataModHisto.Controller.");
                    that.setFocusOnItemInvoked(eventInfo);
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "GenDataModHisto.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        if (listView.winControl.loadingState === "itemsLoading") {
                            if (!layout) {
                                layout = Application.GenDataModHistoLayout.GenDataModHistoLayout;
                                listView.winControl.layout = { type: layout };
                            }
                        }
                    }
                    that.loadingStateChanged(eventInfo);
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "GenDataModHisto.Controller.");
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
                    Log.call(Log.l.trace, "GenDataModHisto.Controller.");
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
                },
                clickShowEvents: function () {
                    if (!AppBar.busy && that.vaId) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }

            // register ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "keydown", function (e) {
                    if (!e.ctrlKey && !e.altKey) {
                        switch (e.keyCode) {
                        case WinJS.Utilities.Key.end:
                        case WinJS.Utilities.Key.home:
                        case WinJS.Utilities.Key.leftArrow:
                        case WinJS.Utilities.Key.rightArrow:
                        case WinJS.Utilities.Key.space:
                            e.stopImmediatePropagation();
                            break;
                        }
                    }
                }.bind(this), true);
                this.addRemovableEventListener(listView, "contextmenu", function (e) {
                    var targetTagName = e.target &&
                        e.target.tagName &&
                        e.target.tagName.toLowerCase();
                    if (targetTagName === "textarea" || targetTagName === "input") {
                        e.stopImmediatePropagation();
                    }
                }.bind(this), true);
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                this.addRemovableEventListener(listView, "selectionchanged", this.eventHandlers.onSelectionChanged.bind(this));
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
            }

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                that.loading = true;
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
            });
            Log.ret(Log.l.trace);
        }, {
            cursorPos: { x: 0, y: 0 },
            indexold: 0
        })
    });
})();




